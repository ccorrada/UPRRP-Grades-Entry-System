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
    res.view();
  },

  userIndex: function (req, res) {
    User.find().done(function (err, users) {
      res.view({users: users});
    });
  },


  /**
   * Action blueprints:
   *    `/admin/new`
   */
   userNew: function (req, res) {
    res.locals.user = _.clone(req.session.user);
    res.view();
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
          req.flash('success', FlashMessages.successfullyAddedUser);
          res.redirect('/admin/index');
        }
    ).fail( function (err) {
      if (err.detail && err.detail.match(/\([a-z]*\)/)[0].replace(/\(/, '').replace(/\)/, '') === 'email')
        req.flash('danger', FlashMessages.emailAlreadyExists);
      if (err.ValidationError) {
        if (err.ValidationError.email)
          req.flash('danger', FlashMessages.noEmailEntered);
        if (err.ValidationError.role)
          req.flash('danger', FlashMessages.invalidRoleSelected);
        if (err.ValidationError.first_names || err.ValidationError.last_names)
          req.flash('danger', FlashMessages.invalidNames);
        if (err.ValidationError.SSN4)
          req.flash('danger', FlashMessages.invalidSSN4);
      }

      res.redirect('/admin/user/new');
    });
  },


  /**
   * Action blueprints:
   *    `/admin/edit/:id`
   */
  userEdit: function (req, res) {
    User.findOne(req.param('id')).then(
      function (user){
        //Capture if user is undefined
        if (!user) {return res.send('Sorry, cant find that', 404);}
        return res.view({user: user});
    },function (err) {
        res.send('Sorry, cant find that', 404);
    });
  },

  /**
   * Action blueprints:
   *    `/admin/save/:id`
   */
   userSave: function (req, res) {

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
        req.flash('success', FlashMessages.successfullySavedUser);
        res.redirect('/admin/users');
      });
    }).fail(function (err) {
      req.flash('danger', FlashMessages[err.message]);
      res.redirect('/admin/user/edit/' + req.param('id'));
    });
  },

  courseIndex: function (req, res) {
    Course.find()
    .then(function (courses) {
      res.view({courses: courses});
    }, function (err) {
      console.log(err);
    });
  },

  courseNew: function (req, res) {
    res.view({course: {}});
  },

  courseEdit: function (req, res) {
    Course.findOne(req.param('id'), function (err, course) {
      User.findOne(course.user_id, function (err, user) {
        // Find all grades in that course.
        var course_id_param = require('validator').sanitize(req.param('id')).escape();
        var query = 'SELECT g.id AS grade_id, s.student_number, g.grade AS value, g.incomplete AS incomplete FROM uprrp_ges_students AS s, uprrp_ges_grades AS g, uprrp_ges_courses AS c WHERE s.id = g.student_id AND g.course_id = c.id AND c.id = ' +
                    course_id_param + ';';
        Grade.query(query, null, function (err, results) {
          // console.log(require('util').inspect(err || results, false, null));
          if (err) {
            // No results
            console.log(err);
          } else {
            // Results
            course.professorEmail = user.email;

            var data = {
              course: course,
              grades: results.rows,
              controllerAction: 'edit',
              gradeType: course.gradeType
            };

            res.view(data);
          }
        });
      });
    });
  },

  courseSave: function (req, res) {

    var studentGrades = Utils.parseGradesFromForm(req.body)
      , gradeType = null
      , courseId = Utils.sanitizeInput(req.param('courseId'))
      , userId = null;

    Q(User.findOne().where({email: req.param('professorEmail')})).then(function (user) {
      if (!user) throw new Error('noEmailEntered'); // Is this the correct error?
      else userId = user.id;

      return Course.findOne().where({id: courseId});
    }).then(function (course) {
      courseGradeType = course.gradeType;

      return Grade.find().where({course_id: courseId}).where({grade: {'!':'w'}});
    }).then(function (grades) {
      var gradesAreFinePromise = Q.defer();

      for (var i = 0; i < grades.length; i++) {
        if (studentGrades.hasOwnProperty(grades[i].id) && Grade.GRADE_TYPES[courseGradeType].indexOf(studentGrades[grades[i].id].value) !== -1) {}
        else
          gradesAreFinePromise.reject(new Error('atleastOneInvalidGrade'));
      }

      gradesAreFinePromise.resolve(true);

      return gradesAreFinePromise.promise;
    }).then(function (gradesAreFine) {
      return Course.findOne().where({id: courseId});
    }).then(function (course) {
      var savePromise = Q.defer();

      // Save the course.
      course.user_id = userId;
      course.section = req.param('section');
      course.session = req.param('session');
      course.course_code = req.param('course_code');
      course.validate(function (err) {
        if (err) {
          console.log(err);
          if (err.ValidationError.course_code)
            savePromise.reject(new Error('noCourseCode'));
          if (err.ValidationError.session)
            savePromise.reject(new Error('noSession'));
          if (err.ValidationError.section)
            savePromise.reject(new Error('noSection'));
        } else {
          course.save(function (err) {});
          require('async').forEachOf(studentGrades, function (value, key, callback) {
            Grade.update({id: key}, {grade: value.value, incomplete: value.incomplete}).done(function (err, g) {});
            callback();
          }, function (err) {
            if (err) savePromise.reject();
            else savePromise.resolve(true);
          });
        }
      });

      return savePromise.promise;
    }).then(function (courseAndGradeAreSaved) {
      req.flash('success', FlashMessages.successfullySavedCourse);
      res.redirect('/admin/courses');
    }).fail(function (err) {
      console.log(err);

      req.flash('danger', FlashMessages[err.message]);
      res.redirect('/admin/course/edit/' + courseId);
    });
  },

  courseCreate: function (req, res) {

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
        req.flash('success', FlashMessages.successfulCourseCreation);
        res.redirect('/admin/courses');
      });
    }).fail(function (err) {
      if (err.message)
        req.flash('danger', FlashMessages[err.message]);
      else {
        if (err.ValidationError.course_code)
          req.flash('danger', FlashMessages['noCourseCode']);
        if (err.ValidationError.session)
          req.flash('danger', FlashMessages['noSession']);
        if (err.ValidationError.section)
          req.flash('danger', FlashMessages['noSection']);
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
