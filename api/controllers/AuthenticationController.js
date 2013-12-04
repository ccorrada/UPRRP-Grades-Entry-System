/**
 * AuthenticationController
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
   *    `/authentication/new`
   */
   new: function (req, res) {
    if (req.session.user) {
      res.locals.user_id = _.clone(req.session.user.id);
      res.locals.user_name = _.clone(req.session.user.first_names + ' ' + req.session.user.last_names);
    }
    if (req.session.authenticated) {
      if (req.session.user.role === 'admin') {
        res.redirect('/admin/index');
      } else if (req.session.user.role === 'professor') {
        res.redirect('/courses');
      }
    } else {
      res.view();
    }
  },


  /**
   * Action blueprints:
   *    `/authentication/create`
   */
   signup: function (req, res) {

    var current_email = req.param('email');

    Q(User.findOneByEmail(current_email))
    .then(function (user) {
      if (!user)
        throw new Error('invalidCredentials');
      user.passwordResetToken = require('crypto').randomBytes(20).toString('hex');
      user.save(function (err) {
        Mailer.sendActivationEmail(user.email, user.passwordResetToken, res, function () {});
        req.flash('success', FlashMessages.requestPasswordResetLink);
        res.redirect('/');
      });
    }).fail(function (err) {
      req.flash('danger', FlashMessages[err.message]);
      res.redirect('/');  
    });
  },


  /**
   * Action blueprints:
   *    `/authentication/destroy`
   */
   destroy: function (req, res) {
    
    req.session.destroy();

    res.redirect('/');
  },

  login: function (req, res) {

    var current_email = req.param('email');
    var current_password = req.param('password');
    var authPromise = Q.defer();

    Q(User.findOneByEmail(current_email)).then(function (user) {
      if (!user || !current_password)
        throw new Error('invalidCredentials');
      require('bcrypt').compare(current_password, user.password, function (err, result) {
        if (result) {
          // Password match
          // Create session.
          req.session.authenticated = true;
          req.session.user = user;
          req.session.locale = user.locale;
          // Redirect to course selection screen.
          if (user.role === 'admin') {
            res.redirect('/admin/index');
          } else {
            res.redirect('/courses');
          }
        } else {
          authPromise.reject(new Error('invalidCredentials'));
        }
      });

      return authPromise.promise;
    }).fail(function (err) {
      req.flash('danger', FlashMessages[err.message]);
      res.redirect('/');
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthenticationController)
   */
  _config: {}

  
};
