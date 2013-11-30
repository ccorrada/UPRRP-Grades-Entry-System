module.exports = function (req, res, ok) {
  User.findOne().where({id: req.param('id')}).then(function (user) {
    if (user) {
      if (parseInt(req.param('id')) === user.id)
        ok();
    } else {
      return res.send('I\'m sorry, but I cannot let you do that.', 403);
    }
  }).fail(function (err) {
    console.log(err);
    res.redirect('/');
  });
}