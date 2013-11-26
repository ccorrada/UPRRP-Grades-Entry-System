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

        var data = {
          grades: results.rows,
          courseId: course_id_param,
          gradeType: results.rows[0].gradeType
        };

        res.view(data);
        req.session.flash = []; // Clear flash messages.
      }
    });

  },

  save: function (req, res) {

    // To unshittify this method, leverage the Q library better: 
    // http://stackoverflow.com/questions/20184760/how-can-i-trigger-a-single-error-handler-with-nested-promises

    var tempBody = [];

    Q(Course.findOne(req.param('courseId'))).then(function (course) {

      var gradeDeferred = Q.defer();

      for (var key in req.body) {
        if (req.body.hasOwnProperty(key) && key !== 'save_draft' && key !== 'save_final' && key !== '_csrf' && key !== 'courseId' && key.indexOf(':inc') === -1 ) {
          var gradeValueClean = require('validator').sanitize(req.body[key]).escape();
          var gradeIdClean = require('validator').sanitize(key).escape();
          var gradeIncompleteClean = require('validator').sanitize(req.body[key + ':inc']).escape();
          var gradeIncompleteCleanValue = gradeIncompleteClean === 'on' ? true : false;

          tempBody.push({gradeValue: gradeValueClean, gradeId: gradeIdClean, gradeIncomplete: gradeIncompleteCleanValue});
        }
      }

      if (req.body.hasOwnProperty('save_final')) {
        Grade.query("SELECT * FROM uprrp_ges_grades WHERE course_id = " + require('validator').sanitize(req.param('courseId')).escape() + " AND grade != 'W';", function (err, grades) {
          if (grades.rows.length !== tempBody.length)
            gradeDeferred.reject(new Error('allStudentsMustHaveAGrade'));
        });
      }

      require('async').each(tempBody, function (item, callback) {
        Grade.findOne({id: item.gradeId, course_id: course.id}, function (err, grade) {
          if (course.id !== grade.course_id) {
            callback(new Error('atleastOneInvalidGrade')); // This grade does not belong to the given course.
          } else if (course.gradeType === 0) {
            if (['A', 'B', 'C', 'D', 'F', 'X'].indexOf(item.gradeValue) === -1)
              callback(new Error('atleastOneInvalidGrade'));
            else
              callback();
          } else if (course.gradeType === 1) {
            if (['PS', 'PN', 'PB', 'P', 'NP'].indexOf(item.gradeValue) === -1)
              callback(new Error('atleastOneInvalidGrade'));
            else
              callback();
          } else if (course.gradeType === 2) {
            if (['P', 'NP'].indexOf(item.gradeValue) === -1)
              callback(new Error('atleastOneInvalidGrade'));
            else
              callback();
          } else {
            callback();
          }
        });
      }, function (err) {
        if (!err) {
          // Grades are fine. Resolve promise.
          console.log('Resolved grade promise.')
          gradeDeferred.resolve(true);
        } else {
          // At least 1 grade is invalid. Reject promise.
          console.log('Rejected grade promise.')
          gradeDeferred.reject(err);
        }
      });

      return gradeDeferred.promise;
    }).then(function (gradesAreFine) {
      // Save grades.
      require('async').each(tempBody, function (item, callback) {
        Grade.update({id: item.gradeId}, {grade: item.gradeValue, incomplete: item.gradeIncomplete}).done(function (err, grades) {
          if (err) callback(err);
          else callback();
        });
      }, function (err) {
        // All grades updated.
        if (req.body.hasOwnProperty('save_draft')) 
          req.session.flash.push(FlashMessages.successfulDraftSave);
        if (req.body.hasOwnProperty('save_final')) {
          req.session.flash.push(FlashMessages.successfulFinalSave);
          Course.findOne(req.param('courseId'), function (err, course) {
            course.done = true;
            course.save(function (err) {});
            Mailer.sendProgressReportEmail({
              email: req.session.user.email,
              res: res
            }, function () {});
          });
        }
        res.redirect('/courses');
      });
    }).fail(function (err) {
      // Don't save grades.
      console.log(err);
      req.session.flash.push(FlashMessages[err.message]);
      res.redirect('/course/' + req.param('courseId'));
    });



    // var body_array = [];

    // // Need to convert req.body into an array because caolan/async has not merged async.each for objects.
    // for (var key in req.body) {
    //   if (req.body.hasOwnProperty(key) && key !== 'save_draft' && key !== 'save_final' && key !== '_csrf') {
    //     // console.log('Key: ' + key + ' Value: ' + req.body[key]);

    //     var grade_value_clean = require('validator').sanitize(req.body[key]).escape();
    //     var grade_id_clean = require('validator').sanitize(key).escape();
    //     body_array.push({grade_value: grade_value_clean, grade_id: grade_id_clean});
    //   }
    // }
    // require('async').each(body_array, function (item, callback) {
    //   // console.log(require('util').inspect(item, false, null));
    //   var query = 'UPDATE uprrp_ges_grades AS g SET grade = \'' + item.grade_value + '\' WHERE g.id = ' + item.grade_id + ';';
    //   Grade.query(query, null, function (err, results) {/* console.log(err || results ) */});
    //   callback();
    // }, function (err) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     // Successfully updated grades.

    //     // If a draft was saved:
    //     // Add the draft saved success flash message.
    //     // If save was final:
    //     // Add the final saved success flash message.
    //     // Send email with report.
    //     // Send back to course list.
        
    //   }
    // });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GradingController)
   */
  _config: {}

  
};
