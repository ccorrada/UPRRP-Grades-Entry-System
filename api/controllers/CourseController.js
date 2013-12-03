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
    Q(Course.find(options)).then(function (user_courses) {
      res.locals.user_id = _.clone(req.session.user.id);
      res.locals.user_name = _.clone(req.session.user.first_names + ' ' + req.session.user.last_names);
      res.view({courses: user_courses});
    }).fail(function (err) {
      console.log(require('util').inspect(err, null, false));
    });
  },

  show: function (req, res) {
    // Find all grades in that course.
    var course_id_param = require('validator').sanitize(req.param('course_id')).escape();
    var query = 'SELECT g.id AS grade_id, s.student_number, s."firstNames", s."lastNames", g.grade AS value, g.incomplete AS incomplete, c."gradeType" AS "gradeType" FROM uprrp_ges_students AS s, uprrp_ges_grades AS g, uprrp_ges_courses AS c WHERE s.id = g.student_id AND g.course_id = c.id AND c.id = ' + 
                course_id_param + ';';
    Grade.query(query, null, function (err, results) {
      // console.log(require('util').inspect(err || results, false, null));
      if (err) {
        // No results.
      } else {
        // Results
        if (req.session.user) {
          res.locals.user_id = _.clone(req.session.user.id);
          res.locals.user_name = _.clone(req.session.user.first_names + ' ' + req.session.user.last_names);
        }

        Course.findOne(course_id_param).done(function (err, course) {
          var data = {
            grades: results.rows,
            courseId: course_id_param,
            gradeType: results.rows[0] ? results.rows[0].gradeType : null,
            course: course
          };

          res.view(data);
        });
      }
    });

  },

  save: function (req, res) {

    var allStudentsHaveGrades = true
      , allGradesBelongTocourse = true
      , saveFinal = false
      , studentGrades = Utils.parseGradesFromForm(req.body)
      , courseId = Utils.sanitizeInput(req.param('courseId'))
      , courseGradeType = null;

    if (req.body.hasOwnProperty('save_final')) saveFinal = true;

    Q(Grade.count().where({course_id: courseId}).where({grade: {'!': 'w'}})).then(function (activeGradeCount) {
      // We do not count W grades because the form does not send blank grades or grades with W.
      // If activeGradecount !== the number of grades we got the from form then it means that not all students were set
      // a grade.
      if (saveFinal && activeGradeCount !== Object.getOwnPropertyNames(studentGrades).length)
        throw new Error('allStudentsMustHaveAGrade');

      return Course.findOne().where({id: courseId});
    }).then(function (course) {
      var filterAuditWithdrawalGrades = Q.defer();

      courseGradeType = course.gradeType;

      Grade.query("SELECT * FROM uprrp_ges_grades WHERE NOT grade = 'au' AND NOT grade = 'w';", function (err, results) {
        if (err) filterAuditWithdrawalGrades.reject(err);
        else filterAuditWithdrawalGrades.resolve(results.rows);
      });

      return filterAuditWithdrawalGrades.promise;
    }).then(function (grades) { 

      var gradesAreFinePromise = Q.defer();

      for (var i = 0; i < grades.length; i++) {
        if (studentGrades.hasOwnProperty(grades[i].id) && Grade.GRADE_TYPES[courseGradeType].indexOf(studentGrades[grades[i].id].value) !== -1 && !(['a', 'ps'].indexOf(studentGrades[grades[i].id].value) !== -1 && studentGrades[grades[i].id].incomplete)) {}
        else
          gradesAreFinePromise.reject(new Error('atleastOneInvalidGrade'));
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
      if (saveFinal) req.flash('success', FlashMessages.successfulFinalSave);
      else req.flash('success', FlashMessages.successfulDraftSave);

      res.redirect('/courses');
    }).fail(function (err) {
      console.log(err);

      req.flash('danger', FlashMessages[err.message]);
      res.redirect('/course/' + courseId);
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GradingController)
   */
  _config: {}

  
};
