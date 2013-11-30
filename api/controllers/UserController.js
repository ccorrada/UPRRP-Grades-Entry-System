/**
 * UserController
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
   *    `/user/show`
   */
   show: function (req, res) {

    var options = {
      id: req.param('id')
    };

    Q(User.findOne(options)).then(function (user) {
      res.view({user: user});
    }).fail(function (err) {
      console.log(err);
    });
  },

  save: function (req, res) {
    var options = {
      id: req.param('id')
    };

    Q(User.findOne(options)).then(function (user) {
      user.locale = req.param('locale');
      user.save(function (err) {
        if (!err) {
          req.session.locale = user.locale;
          req.flash('success', FlashMessages.localeSaved);
          res.redirect('/user/' + options.id);
        } else {
          console.log(err);
        }
      });
    }).fail(function (err) {
      console.log(err);
    });
  },

  report: function (req, res) {
    User.findOne(req.param('userId')).then(function (user) {
      Mailer.sendCourseReport({
        to: user.email,
        text: req.body.message
      }, function () {});
    }).fail(function (err) {
      console.log(err);
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
