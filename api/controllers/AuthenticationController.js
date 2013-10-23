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
    res.view();
  },


  /**
   * Action blueprints:
   *    `/authentication/create`
   */
   signup: function (req, res) {

    var current_email = req.param('email');
    
    if (current_email) {
      // Email provided.
      // Since email was provided send an email with a reset password link.
      // The link in the email is a get request to /reset-password/HASH. The HASH is comprised of [email]:[timestamp]
      // Insert a hash string into this.passwordResetToken and the current time into this.password_reset_timestamp.

      // Check if this is the first time this Professor tries to sign-up.
      // If it is not then overwrite its passwordResetToken and timestamp then resend email.
      // Otherwise, create Professor with default values, new password reset token and timestamp then send email.

      Professor.findOneByEmail(current_email).done(function (err, prof) {
        if (prof) {
          prof.passwordResetToken = require('crypto').randomBytes(20).toString('hex');
          prof.password_reset_timestamp = new Date(); // ms since epoch
          prof.save(function (err) {
            if (err) {
              console.log(require('util').inspect(err));
            } else {
              // Send email now.
              Mailer.sendActivationEmail(prof.email, prof.passwordResetToken);

              res.send({result: true});
            }
          });
        } else {
          require('bcrypt').genSalt(10, function (err, salt) {
            require('bcrypt').hash(require('crypto').randomBytes(20).toString('hex'), salt, function (err, hash) {
              Professor.create({
                email: current_email,
                password: hash,
                passwordResetToken: require('crypto').randomBytes(20).toString('hex'),
                password_reset_timestamp: new Date()
              }).done(function (err, prof) {
                if (err) {
                  console.log(require('util').inspect(err));
                } else {
                  // Send email now.
                  Mailer.sendActivationEmail(prof.email, prof.passwordResetToken);

                  res.send({result: true});
                }
              });
            });
          });
        }
      });
    } else {
      // No email entered.
      req.session.flash = {
        err: [{result: false, message: 'No email entered.'}]
      }
      res.redirect('/authentication/new');
    }

  },


  /**
   * Action blueprints:
   *    `/authentication/destroy`
   */
   destroy: function (req, res) {
    
    req.session.destroy();

    req.session.flash = {
      err: [{message: 'You have been logged out.'}]
    }

    res.redirect('/authenticate/new');
  },

  login: function (req, res) {

    var current_email = req.param('email');
    var current_password = req.param('password');

    if (current_email && current_password) {
      Professor.findOneByEmail(current_email).done(function (err, prof) {
        if (prof) {
          // Found a prof with that email.
          require('bcrypt').compare(current_password, prof.password, function (err, result) {
            if (result) {
              // Password match
              // Create session.
              req.session.authenticated = true;
              req.session.prof = prof;
              // Redirect to course selection screen.
            } else {
              // Invalid credentials.
              req.session.flash = FlashMessages.invalidCredentials();
              res.redirect('/');
            }
          });
        } else {
          // Invalid credentials.
          req.session.flash = FlashMessages.invalidCredentials();
          res.redirect('/');
        }
      });
    } else {
      // Invalid credentials.
      req.session.flash = FlashMessages.invalidCredentials();
      res.redirect('/');
    }

  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthenticationController)
   */
  _config: {}

  
};