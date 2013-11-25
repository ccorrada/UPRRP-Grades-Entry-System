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

var Q = require('q');

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
      SSN4: parseInt(req.param('SSN4'),10)
    }).then(
        function (user) {
          req.session.flash.push(FlashMessages.successfullyAddedUser);
          res.redirect('/admin/index');
        }
    ).fail( function (err) {
      if (err.detail && err.detail.match(/\([a-z]*\)/)[0].replace(/\(/, '').replace(/\)/, '') === 'email')
        req.session.flash.push(FlashMessages.emailAlreadyExists);
      if (err.ValidationError) {
        console.log('got here');
        if (err.ValidationError.email)
          req.session.flash.push(FlashMessages.noEmailEntered);
        if (err.ValidationError.role)
          req.session.flash.push(FlashMessages.invalidRoleSelected);
        if (err.ValidationError.first_names || err.ValidationError.last_names)
          req.session.flash.push(FlashMessages.invalidNames);
        if (err.ValidationError.SSN4)
          req.session.flash.push(FlashMessages.invalidSSN4);
      }

      res.redirect('/admin/user/new');
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

    Q(User.findOne(req.param('id')))
    .then(function (user) {
      user.email = req.param('email');
      user.role = req.param('role');
      user.first_names = req.param('first_names');
      user.last_names = req.param('last_names');
      user.SSN4 = parseInt(req.param('SSN4'));
      user.save(function (err) {
        if (err) {
          if (err.ValidationError.first_names || err.ValidationError.last_names)
            throw new Error('invalidNames');
          if (err.ValidationError.SSN4)
            throw new Error('invalidSSN4');
          if (err.ValidationError.email)
            throw new Error('noEmailEntered');
        }
        req.session.flash.push(FlashMessages.successfullySavedUser);
        res.redirect('/admin/users');
      });
    }).fail(function (err) {
      req.session.flash.push(FlashMessages[err.message]);
      res.redirect('/admin/user/edit/' + req.param('id'));
    });
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
                    course_id_param + ';';
        Grade.query(query, null, function (err, results) {
          // console.log(require('util').inspect(err || results, false, null));
          if (err) {
            // No results
            console.log(err);
          } else {
            // Results
            res.locals.flash = _.clone(req.session.flash) || [];
            course.professorEmail = user.email;
            res.view({course: course, grades: results.rows, controllerAction: 'edit'});
            req.session.flash = []; // Clear flash messages.
          }
        });
      });
    });
  },

  courseSave: function (req, res) {

    // To unshittify this method, leverage the Q library better: 
    // http://stackoverflow.com/questions/20184760/how-can-i-trigger-a-single-error-handler-with-nested-promises

    Q(Course.findOne(req.param('id'))).then(function (course) {

      var gradeDeferred = Q.defer();
      var tempBody = [];

      User.findOneByEmail(req.param('professorEmail'), function (err, user) {
        if (!user) {
          gradeDeferred.reject(new Error('noEmailEntered')); // Is this the correct error we want to return here?
        }

        for (var key in req.body) {
          if (req.body.hasOwnProperty(key) && key !== 'save_draft' && key !== 'save_final' && key !== '_csrf' && key !== 'course_code' && key !== 'section' && key !== 'session' && key !== 'professorEmail' && key !== 'id') {
            var gradeValueClean = require('validator').sanitize(req.body[key]).escape();
            var gradeIdClean = require('validator').sanitize(key).escape();

            tempBody.push({gradeValue: gradeValueClean, gradeId: gradeIdClean});
          }
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
            gradeDeferred.resolve(true);
          } else {
            // At least 1 grade is invalid. Reject promise.
            gradeDeferred.reject(err);
          }
        });
        
        return gradeDeferred.promise.then(function (gradesAreFine) {
          var courseDeferred = Q.defer();

          course.user_id = user.id;
          course.section = req.param('section');
          course.session = req.param('session');
          course.course_code = req.param('course_code');
          course.validate(function (err) {
            if (err) {
              if (err.ValidationError.course_code)
                courseDeferred.reject(new Error('noCourseCode'));
              if (err.ValidationError.session)
                courseDeferred.reject(new Error('noSession'));
              if (err.ValidationError.section)
                courseDeferred.reject(new Error('noSection'));
            } else {
              courseDeferred.resolve(true);
            }
          });

          return courseDeferred.promise.then(function (courseIsFine) {
            // Grades and Course are valid. Save everything!
            course.save(function (err) {});
            require('async').each(tempBody, function (item, callback) {
              Grade.update({id: item.gradeId}, {grade: item.gradeValue}).done(function (err, grades) {
                if (err) callback(err);
                else callback();
              });
            }, function (err) {
              req.session.flash.push(FlashMessages.successfullySavedCourse);
              res.redirect('/admin/courses');
            });
          });
        }).fail(function (err) {
          // How to avoid this extra handler?
          // How to have nested promises propagate their errors to just one .fail() handler?
          // Am I doing this wrong? Fuck it. Ship it.
          req.session.flash.push(FlashMessages[err.message]);
          res.redirect('/admin/course/edit/' + req.param('id'));
        });
      });
    }).fail(function (err) {
      // I think this can never get called... lol.
      console.log('Error!');
      console.log(err);
      // req.session.flash.push(FlashMessages[err.message]);
      // res.redirect('/admin/course/edit/' + req.param('id'));
    });
  },

  courseCreate: function (req, res) {
    req.session.flash = [];

    var options = {
      email: req.param('professorEmail'), 
      role: 'professor'
    };

    Q(User.findOne(options))
    .then(function (user) {
      if (!user)
        throw new Error('noProfessorWithEmail');
      return Course.create({
        user_id: user.id,
        section: req.param('section'),
        session: req.param('session'),
        course_code: req.param('course_code')
      }).then(function (user) {
        req.session.flash.push(FlashMessages.successfulCourseCreation);
        res.redirect('/admin/courses');
      });
    }).fail(function (err) {
      if (err.message)
        req.session.flash.push(FlashMessages[err.message]);
      else {
        if (err.ValidationError.course_code)
          req.session.flash.push(FlashMessages['noCourseCode']);
        if (err.ValidationError.session)
          req.session.flash.push(FlashMessages['noSession']);
        if (err.ValidationError.section)
          req.session.flash.push(FlashMessages['noSection']);
      }
      res.redirect('/admin/course/new');
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
