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
    res.view({token: req.param('token')});
  },


  /**
   * Action blueprints:
   *    `/passwor/change`
   */
   change: function (req, res) {
    if (req.param('password')) {
      Professor.findOneByPasswordResetToken(req.param('token')).done(function (err, prof) {
        if (prof) {
          require('bcrypt').genSalt(10, function (err, salt) {
            require('bcrypt').hash(req.param('password'), salt, function (err, hash) {
              prof.password = hash;
              prof.findOneByPasswordResetToken = '';
              prof.save(function (err) {
                if (err) {
                  console.log(require('util').inspect(err));
                } else {
                  // Redirect to login screen.
                  res.redirect('/');
                }
              });
            });
          });
        } else {
          // Trying to change password of an account you do not own.
          // Redirect to login screen
          res.redirect('/');
        }
      });
    } else {
      req.session.flash = {
        err: [{result: false, message: 'Can\'t change to an empty password!'}]
      }
      res.redirect('/password/new?token=' + req.param('token'));
    }
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to PasswordResetController)
   */
  _config: {}

  
};
