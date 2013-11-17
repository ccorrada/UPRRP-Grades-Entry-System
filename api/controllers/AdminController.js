/**
 * AdminController
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


  /**
   * Action blueprints:
   *    `/admin/index`
   *    `/admin`
   */
  index: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    res.view();
    req.session.flash = []; // Clear flash messages.
  },

  userIndex: function (req, res) {
    User.find().done(function (err, users) {
      res.locals.flash = _.clone(req.session.flash) || [];
      res.view({users: users});
      req.session.flash = []; // Clear flash messages.
    });
  },


  /**
   * Action blueprints:
   *    `/admin/new`
   */
   userNew: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    res.locals.user = _.clone(req.session.user);
    res.view();
    req.session.flash = []; // Clear flash messages.
  },


  /**
   * Action blueprints:
   *    `/admin/create`
   */
   userCreate: function (req, res) {
    User.create({
      email: req.param('email'),
      role: req.param('role'),
      first_names: req.param('first_names'),
      last_names: req.param('last_names'),
      SSN4: parseInt(req.param('SSN4'))
    }).done(function (err, user) {
      if (err) {
        console.log(require('util').inspect(err, false, null));
        if (err.ValidationError.email)
          req.session.flash.push(FlashMessages.noEmailEntered);
        if (err.ValidationError.role)
          req.session.flash.push(FlashMessages.invalidRoleSelected);
        if (err.ValidationError.first_names || err.ValidationError.last_names)
          req.session.flash.push(FlashMessages.invalidNames);
        if (err.ValidationError.SSN4)
          req.session.flash.push(FlashMessages.invalidSSN4);

        res.redirect('/admin/new');
      } else {
        req.session.flash.push(FlashMessages.successfullyAddedUser);
        res.redirect('/admin/index');
      }
    });
  },


  /**
   * Action blueprints:
   *    `/admin/edit/:id`
   */
  userEdit: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    User.findOne(req.param('id'))
    .then(
      function (user){
        //Capture if user is undefined
        if (!user) {return res.send('Sorry, cant find that', 404);}
        return res.view({user: user});
    },function (err) {
        res.send('Sorry, cant find that', 404);
    });
    req.session.flash = []; // Clear flash messages.
  },

  /**
   * Action blueprints:
   *    `/admin/save/:id`
   */
   userSave: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    User.findOne(req.param('id'))
    .then(
      function (user){
        user.email = req.param('email'),
        user.role = req.param('role'),
        user.first_names = req.param('first_names'),
        user.last_names = req.param('last_names'),
        user.SSN4 = parseInt(req.param('SSN4'))
        user.save(function (err){
          if (err) {console.log(err);}
        });
        req.session.flash.push(FlashMessages.successfullySavedUser);
        res.redirect('/admin/users');
      },
      function (err){
        console.log(err);
        console.log(require('util').inspect(err, false, null));
        res.send("Wrong values", 500);
      });
    req.session.flsah = [];
  },

  courseIndex: function (req, res) {
    Course.find()
    .then(function (courses) {
      res.locals.flash = _.clone(req.session.flash) || [];
      res.view({courses: courses});
      req.session.flash = []; // Clear flash messages.
    }, function (err) {
      console.log(err);
    });
  },

  courseNew: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    res.view({course: {}});
    req.session.flash = []; // Clear flash messages.
  },

  courseEdit: function (req, res) {
    Course.findOne(req.param('id'), function (err, course) {
      User.findOne(course.user_id, function (err, user) {
        // Find all grades in that course.
        var course_id_param = require('validator').sanitize(req.param('id')).escape();
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
            course.professorEmail = user.email
            res.view({course: course, grades: results.rows, controllerAction: 'edit'});
            req.session.flash = []; // Clear flash messages.
          }
        });
      });
    });
  },

  courseSave: function (req, res) {
    Course.findOne(req.param('id'))
    .then(function (course) {
      User.findOne({email: req.param('professorEmail')})
      .done(function (err, user) {
        console.log(user)
        if (user) {
          var body_array = [];

          // Need to convert req.body into an array because caolan/async has not merged async.each for objects.
          for (var key in req.body) {
            if (req.body.hasOwnProperty(key) && key !== 'save_draft' && key !== 'save_final' && key !== '_csrf' && key !== 'course_code' && key !== 'section' && key !== 'session' && key !== 'professorEmail' && key !== 'id') {
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

              course.user_id = user.id;
              course.section = req.param('section');
              course.session = req.param('session');
              course.course_code = req.param('course_code');
              course.save(function (err) {
                if (err) 
                  console.log(err);
              });
              req.session.flash.push(FlashMessages.successfullySavedCourse);
              res.redirect('/admin/courses');
            }
          });
        }
      });
    }).fail(function (err) {
      console.log(err);
    });
  },

  courseCreate: function (req, res) {
    req.session.flash = [];
    // Dont' understand promises yet.

    // User.findOne({email: req.param('professorEmail'), role: 'professor'})
    // .then(function (user) {
    //   if (user) {
    //     return Course.create({
    //       user_id: user.id,
    //       section: req.param('section'),
    //       session: req.param('session'),
    //       course_code: req.param('course_code')
    //     });
    //   } else {
    //     // At this point `user` is undefined which means that no professor was found so I want to throw an error.
    //     // Right now the following statement does throw the error, but it crashes the server.
    //     throw new Error('That professor does not exist.');
    //     // I want to be able to handle the error in the .fail() or something similar in the promise chain.
    //   }
    // }).then(function (createSuccess) {
    //   console.log('Fulfillment: ', createSuccess);
    // }, function (err) {
    //   console.log('Error: ', err);
    // });

    User.findOne({email: req.param('professorEmail'), role: 'professor'}, function (err, user) {
      if (user) {
        Course.create({
          user_id: user.id,
          section: req.param('section'),
          session: req.param('session'),
          course_code: req.param('course_code')
        }, function (err, user) {
          if (err) console.log(err);
          req.session.flash.push(FlashMessages.successfulCourseCreation);
          res.redirect('/admin/courses');
        });
      } else {
        req.session.flash.push(FlashMessages.noProfessorWithEmail);
        res.redirect('/admin/course/new');
      }
    });
  },

  /**
   * Action blueprints:
   *    `/admin/destroy`
   */
   destroy: function (req, res) {

  },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AdminController)
   */
  _config: {}


};
