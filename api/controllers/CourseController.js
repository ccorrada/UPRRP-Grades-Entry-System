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

module.exports = {
    
  index: function (req, res) {

    // Find all courses by prof_id and list them.
    Course.find({user_id: req.session.user.id})
    .then(function (prof_courses) {
      res.locals.flash = _.clone(req.session.flash) || [];
      if (req.session.user) {
        res.locals.user_id = _.clone(req.session.user.id);
        res.locals.user_name = _.clone(req.session.user.first_names + ' ' + req.session.user.last_names);
      }
      res.view({courses: prof_courses});
      req.session.flash = []; // Clear flash messages.
      // console.log(require('util').inspect(prof_courses, null, false));
    }).fail(function (err) {
      console.log(require('util').inspect(err, null, false));
    });
  },

  show: function (req, res) {
    // Find all grades in that course.
    var course_id_param = require('validator').sanitize(req.param('course_id')).escape();
    var query = 'SELECT g.id AS grade_id, s.student_number, g.grade AS value FROM uprrp_ges_students AS s, uprrp_ges_grades AS g, uprrp_ges_courses AS c WHERE s.id = g.student_id AND g.course_id = c.id AND c.id = ' + 
                course_id_param + ';' 
    Grade.query(query, null, function (err, results) {
      // console.log(require('util').inspect(err || results, false, null));
      if (err) {
        // No results
        console.log(err);
      } else {
        // Results
        res.locals.flash = _.clone(req.session.flash) || [];
        if (req.session.user) {
          res.locals.user_id = _.clone(req.session.user.id);
          res.locals.user_name = _.clone(req.session.user.first_names + ' ' + req.session.user.last_names);
        }
        res.view({grades: results.rows, course_id: course_id_param});
        req.session.flash = []; // Clear flash messages.
      }
    });

  },

  save: function (req, res) {
    // console.log(require('util').inspect(req.body, false, null));

    var body_array = [];

    // Need to convert req.body into an array because caolan/async has not merged async.each for objects.
    for (var key in req.body) {
      if (req.body.hasOwnProperty(key) && key !== 'save_draft' && key !== 'save_final' && key !== '_csrf') {
        // console.log('Key: ' + key + ' Value: ' + req.body[key]);

        // Is it even necessary to sanitize req.body?
        var grade_value_clean = require('validator').sanitize(req.body[key]).escape();
        var grade_id_clean = require('validator').sanitize(key).escape();
        body_array.push({grade_value: grade_value_clean, grade_id: grade_id_clean});
      }
    }
    require('async').each(body_array, function (item, callback) {
      // console.log(require('util').inspect(item, false, null));
      var query = 'UPDATE uprrp_ges_grades AS g SET grade = \'' + item.grade_value + '\' WHERE g.id = ' + item.grade_id + ';';
      Grade.query(query, null, function (err, results) {/* console.log(err || results ) */});
      callback();
    }, function (err) {
      if (err) {
        console.log(err);
      } else {
        // Successfully updated grades.

        // If a draft was saved:
        // Add the draft saved success flash message.
        // If save was final:
        // Add the final saved success flash message.
        // Send email with report.
        // Send back to course list.
        if (req.body.hasOwnProperty('save_draft')) 
          req.session.flash.push(FlashMessages.successfulDraftSave);
        if (req.body.hasOwnProperty('save_final')) {
          req.session.flash.push(FlashMessages.successfulFinalSave);
          Course.findOne(parseInt(req.url.split('/')[2]), function (err, course) {
            course.done = true;
            course.save(function (err) {});
            Mailer.sendProgressReportEmail({
              email: req.session.user.email,
              res: res
            }, function () {});
          });
        }
        res.redirect('/courses');
      }
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GradingController)
   */
  _config: {}

  
};
