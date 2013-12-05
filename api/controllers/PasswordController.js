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

var Q = require('q');

module.exports = {
    
  
  /**
   * Action blueprints:
   *    `/password/new`
   */
   new: function (req, res) {
    res.view({token: req.param('token')});
  },


  /**
   * Action blueprints:
   *    `/passwor/change`
   */
   change: function (req, res) {

    var options = {
      token: req.param('token') 
    };

    Q(User.findOneByPasswordResetToken(options.token)).then(function (user) {
      if (!user)
        throw new Error('invalidPasswordResetToken');
      if (!req.param('password'))
        throw new Error('emptyPasswordChange');

      require('bcrypt').genSalt(10, function (err1, salt) {
        require('bcrypt').hash(req.param('password'), salt, function (err2, hash) {
          user.password = hash;
          user.passwordResetToken = '';
          user.save(function (err) {
            req.flash('success', FlashMessages.successfulPasswordChange);
            res.redirect('/');
          });
        });
      });
    }).fail(function (err) {
      req.flash('danger', FlashMessages[err.message]);
      res.redirect('/password/?token=' + options.token);
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to PasswordResetController)
   */
  _config: {}

  
};
