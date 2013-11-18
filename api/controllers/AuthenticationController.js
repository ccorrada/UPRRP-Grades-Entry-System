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
    res.locals.flash = _.clone(req.session.flash) || [];
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
    req.session.flash = []; // Clear flash messages.
  },


  /**
   * Action blueprints:
   *    `/authentication/create`
   */
   signup: function (req, res) {

    req.session.flash = [];

    var current_email = req.param('email');

    Q(User.findOneByEmail(current_email))
    .then(function (user) {
      if (!user)
        throw new Error('invalidCredentials');
      user.passwordResetToken = require('crypto').randomBytes(20).toString('hex');
      user.save(function (err) {
        Mailer.sendActivationEmail(user.email, user.passwordResetToken, res, function () {});
        req.session.flash.push(FlashMessages.requestPasswordResetLink);
        res.redirect('/');
      });
    }).fail(function (err) {
      req.session.flash.push(FlashMessages[err.message]);
      res.redirect('/');  
    });
  },


  /**
   * Action blueprints:
   *    `/authentication/destroy`
   */
   destroy: function (req, res) {
    
    req.session.destroy();

    // req.session.flash = [];

    // req.session.flash.push(FlashMessages.successfulLogout);

    res.redirect('/');
  },

  login: function (req, res) {

    req.session.flash = [];

    var current_email = req.param('email');
    var current_password = req.param('password');

    Q(User.findOneByEmail(current_email))
    .then(function (user) {
      if (!user || !current_password)
        throw new Error('invalidCredentials');
      require('bcrypt').compare(current_password, user.password, function (err, result) {
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
      });
    }).fail(function (err) {
      req.session.flash.push(FlashMessages[err.message]);
      res.redirect('/');
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthenticationController)
   */
  _config: {}

  
};
