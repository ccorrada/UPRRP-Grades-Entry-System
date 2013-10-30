/**
 * PasswordResetController
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
   *    `/password/new`
   */
   new: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    res.view({token: req.param('token')});
    req.session.flash = []; // Clear flash messages.
  },


  /**
   * Action blueprints:
   *    `/passwor/change`
   */
   change: function (req, res) {
    req.session.flash = [];
    if (req.param('password') && req.param('token')) {
      Professor.findOneByPasswordResetToken(req.param('token')).done(function (err, prof) {
        if (prof) {
          require('bcrypt').genSalt(10, function (err, salt) {
            require('bcrypt').hash(req.param('password'), salt, function (err, hash) {
              prof.password = hash;
              prof.passwordResetToken = '';
              prof.save(function (err) {
                if (err) {
                } else {
                  // Redirect to login screen.
                  req.session.flash.push(FlashMessages.successfulPasswordChange());
                  res.redirect('/');
                }
              });
            });
          });
        } else {
          // Trying to change password of an account you do not own.
          // Redirect to login screen
          req.session.flash.push(FlashMessages.invalidActivationToken());
          res.redirect('/');
        }
      });
    } else {
      req.session.flash.push(FlashMessages.emptyPasswordChange());
      res.redirect('/password/new?token=' + req.param('token'));
    }
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to PasswordResetController)
   */
  _config: {}

  
};
