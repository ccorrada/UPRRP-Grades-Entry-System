/**
 * GradingController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

 var Q = require('q');

module.exports = {
    
  index: function (req, res) {

    var options = {
      user_id: req.session.user.id
    }

    // Find all courses by prof_id and list them.
    Q(Course.find(options))
    .then(function (user_courses) {
      res.locals.flash = _.clone(req.session.flash) || [];
      res.locals.user_id = _.clone(req.session.user.id);
      res.locals.user_name = _.clone(req.session.user.first_names + ' ' + req.session.user.last_names);
      res.view({courses: user_courses});
      req.session.flash = [];
    }).fail(function (err) {
      console.log(require('util').inspect(err, null, false));
    });
  },

  show: function (req, res) {
    // Find all grades in that course.
    var course_id_param = require('validator').sanitize(req.param('course_id')).escape();
    var query = 'SELECT g.id AS grade_id, s.student_number, g.grade AS value, g.incomplete AS incomplete, c."gradeType" AS "gradeType" FROM uprrp_ges_students AS s, uprrp_ges_grades AS g, uprrp_ges_courses AS c WHERE s.id = g.student_id AND g.course_id = c.id AND c.id = ' + 
                course_id_param + ';';
    Grade.query(query, null, function (err, results) {
      // console.log(require('util').inspect(err || results, false, null));
      if (err) {
        // No results. Really? Empty results does not return an error. This ain't Rails bro. Fix this. - crzrcn
        console.log(err);
      } else {
        // Results
        res.locals.flash = _.clone(req.session.flash) || [];
        if (req.session.user) {
          res.locals.user_id = _.clone(req.session.user.id);
          res.locals.user_name = _.clone(req.session.user.first_names + ' ' + req.session.user.last_names);
        }

        Course.findOne(course_id_param).done(function (err, course) {
          var data = {
            grades: results.rows,
            courseId: course_id_param,
            gradeType: results.rows[0].gradeType,
            course: course
          };

          res.view(data);
          req.session.flash = []; // Clear flash messages.
        });
      }
    });

  },

  save: function (req, res) {

    var sanitizeInput = function (input) {
      return require('validator').sanitize(input).escape();
    };

    var allStudentsHaveGrades = true
      , allGradesBelongTocourse = true
      , saveFinal = false
      , studentGrades = {}
      , courseId = sanitizeInput(req.param('courseId'))
      , courseGradeType = null;

    // The server receives grades in an object with the format of {gradeId: gradeValue} values. 
    // Where gradeId is a number or a numeric string.
    for (var key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        if (key === 'save_final') saveFinal = true;
        else if (new RegExp(/^[0-9]+$/).exec(key) !== null) {
          var tempGrade = {};
          tempGrade.id = key;
          tempGrade.value = sanitizeInput(req.body[key]).toLowerCase();
          tempGrade.incomplete = req.body[key + ':inc'] === 'on' ? true : false;

          studentGrades[key] = tempGrade;
        }
      }
    }

    Q(Grade.count().where({course_id: courseId}).where({grade: {'!': 'w'}})).then(function (activeGradeCount) {
      // We do not count W grades because the form does not send blank grades or grades with W.
      // If activeGradecount !== the number of grades we got the from form then it means that not all students were set
      // a grade.
      if (saveFinal && activeGradeCount !== Object.getOwnPropertyNames(studentGrades).length)
        throw new Error('allStudentsMustHaveAGrade');

      return Course.findOne().where({id: courseId});
    }).then(function (course) {
      // Get course's gradeType
      courseGradeType = course.gradeType;

      return Grade.find().where({course_id: courseId}).where({grade: {'!': 'w'}});
    }).then(function (grades) { 

      var gradesAreFinePromise = Q.defer();

      if (saveFinal) {
        for (var i = 0; i < grades.length; i++) {
          if (studentGrades.hasOwnProperty(grades[i].id) && Grade.GRADE_TYPES[courseGradeType].indexOf(studentGrades[grades[i].id].value) !== -1) {}
          else
            gradesAreFinePromise.reject(new Error('atleastOneInvalidGrade'));
        }
      }

      gradesAreFinePromise.resolve(true);

      return gradesAreFinePromise.promise;
    }).then(function (gradesAreFine) {
      var savePromise = Q.defer();
      // Save studentGrades.
      require('async').forEachOf(studentGrades, function (value, key, callback) {
        Grade.update({id: key}, {grade: value.value, incomplete: value.incomplete}).done(function (err, g) {});
        callback();
      }, function (err) {
        if (err) savePromise.reject();
        else {
          if (saveFinal) {
            Course.update({id: courseId}, {done: true}).done(function (err, course) {
              if (err) savePromise.reject();
              else {
                savePromise.resolve(true);
                Mailer.sendProgressReportEmail({
                  email: req.session.user.email,
                  res: res
                }, function () {});
              }
            });
          } else {
            savePromise.resolve(true);
          }
        }
      });

      return savePromise.promise;
    }).then(function (gradesAreSaved) {
      if (saveFinal) req.session.flash.push(FlashMessages.successfulFinalSave);
      else req.session.flash.push(FlashMessages.successfulDraftSave);

      res.redirect('/courses');
    }).fail(function (err) {
      console.log(err);

      req.session.flash.push(FlashMessages[err.message]);
      res.redirect('/course/' + courseId);
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GradingController)
   */
  _config: {}

  
};
