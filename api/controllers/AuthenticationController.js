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

module.exports = {  
  
  /**
   * Action blueprints:
   *    `/authentication/new`
   */
   new: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    res.view();
    req.session.flash = []; // Clear flash messages.
  },


  /**
   * Action blueprints:
   *    `/authentication/create`
   */
   signup: function (req, res) {

    req.session.flash = [];

    var current_email = req.param('email');
    
    if (current_email) {
      // Email provided.
      // Since email was provided send an email with a reset password link.
      // The link in the email is a get request to /reset-password/HASH. The HASH is comprised of [email]:[timestamp]
      // Insert a hash string into this.passwordResetToken and the current time into this.password_reset_timestamp.

      // Check if this is the first time this User tries to sign-up.
      // If it is not then overwrite its passwordResetToken and timestamp then resend email.
      // Otherwise, create User with default values, new password reset token and timestamp then send email.

      User.findOneByEmail(current_email).done(function (err, user) {
        if (user) {
          user.passwordResetToken = require('crypto').randomBytes(20).toString('hex');
          user.save(function (err) {
            if (err) {
              console.log(require('util').inspect(err, false, null));
            } else {
              Mailer.sendActivationEmail(user.email, user.passwordResetToken, function () {});
              req.session.flash.push(FlashMessages.requestActivationLink);
              res.redirect('/');
            }
          });
        } else {
          req.session.flash.push(FlashMessages.invalidCredentials);
          res.redirect('/');
        }
      });
    } else {
      // No email entered.
      req.session.flash.push(FlashMessages.noEmailEntered);
      res.redirect('/');
    }

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

    if (current_email && current_password) {
      User.findOneByEmail(current_email).done(function (err, user) {
        if (user) {
          // Found a user with that email.
          require('bcrypt').compare(current_password, user.password, function (err, result) {
            if (result) {
              // Password match
              // Create session.
              req.session.authenticated = true;
              req.session.user = user;
              // Redirect to course selection screen.
              if (user.role === 'admin') {
                res.redirect('/admin/index');
              } else {
                res.redirect('/courses');
              }
            } else {
              // Invalid credentials.
              req.session.flash.push(FlashMessages.invalidCredentials);
              res.redirect('/');
            }
          });
        } else {
          // Invalid credentials.
          req.session.flash.push(FlashMessages.invalidCredentials);
          res.redirect('/');
        }
      });
    } else {
      // Invalid credentials.
      req.session.flash.push(FlashMessages.invalidCredentials);
      res.redirect('/');
    }

  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthenticationController)
   */
  _config: {}

  
};
