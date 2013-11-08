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
      role: req.param('role'),
      first_names: req.param('first_names'),
      last_names: req.param('last_names'),
      SSN4: parseInt(req.param('SSN4')) // Can there be SSN4s with leading zeroes?
    }).done(function (err, user) {
      if (err) {
        console.log(require('util').inspect(err, false, null));
        if (err.ValidationError.email)
          req.session.flash.push(FlashMessages.noEmailEntered);
        if (err.ValidationError.role)
          req.session.flash.push(FlashMessages.invalidRoleSelected);
        if (err.ValidationError.first_names || err.ValidationError.last_names)
          req.session.flash.push(FlashMessages.invalidNames);
        if (err.ValidationError.SSN4)
          req.session.flash.push(FlashMessages.invalidSSN4);

        res.redirect('/admin/new');
      } else {
        req.session.flash.push(FlashMessages.successfullyAddedUser);
        res.redirect('/admin/index');
      }
    });
  },


  /**
   * Action blueprints:
   *    `/admin/edit/:id`
   */
   edit: function (req, res) {
    res.locals.flash = _.clone(req.session.flash) || [];
    User.findOne(req.param('id'))
    .then(
      function (user){
        return res.view({user: user});
    },function (err) {
        res.send('Sorry, cant find that', 404);
    });
    req.session.flash = []; // Clear flash messages.
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
