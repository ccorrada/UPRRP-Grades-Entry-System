module.exports = function (req, res, next) {
  res.setLocale(req.session.locale || sails.config.i18n.defaultLocale);

  next();
}