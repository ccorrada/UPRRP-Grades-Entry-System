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

module.exports = {
    
  
  /**
   * Action blueprints:
   *    `/user/show`
   */
   show: function (req, res) {

    User.findOne(req.param('id'), function (err, user) {
      if (!err) {
        if (user.length === 0) {
          req.session.flash.push(FlashMessages.userDoesNotExist);
        } 
        res.locals.flash = _.clone(req.session.flash) || [];
        res.view({user: user});
        req.session.flash = []; // Clear flash messages.
      }
    });
  },

  save: function (req, res) {
    console.log('data:', req.params.all());
    User.findOne(req.param('id'), function (err, user) {
      user.locale = req.param('locale');
      user.save(function (err) {
        req.session.flash.push(FlashMessages.localeSaved);
        res.redirect('/user/' + req.param('id'));
      });
    });
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
