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

module.exports = {
    
  
  /**
   * Action blueprints:
   *    `/admin/index`
   *    `/admin`
   */
   index: function (req, res) {
    User.find().done(function (err, users) {
      res.locals.flash = _.clone(req.session.flash) || [];
      res.view({users: users});
      req.session.flash = []; // Clear flash messages.
    });
  },


  /**
   * Action blueprints:
   *    `/admin/new`
   */
   new: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    res.view();
    req.session.flash = []; // Clear flash messages.
  },


  /**
   * Action blueprints:
   *    `/admin/create`
   */
   create: function (req, res) {
    User.create({
      email: req.param('email'),
      admin: req.param('admin') === 'on' ? true : false
    }).done(function (err, user) {
      if (err) {
        console.log(require('util').inspect(err, false, null));
        if (err.ValidationError.email)
          req.session.flash.push(FlashMessages.noEmailEntered());
        res.redirect('/admin/new');
      } else {
        req.session.flash.push(FlashMessages.successfullyAddedUser());
        res.redirect('/admin/index');
      }
    });
  },


  /**
   * Action blueprints:
   *    `/admin/edit`
   */
   edit: function (req, res) {

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
