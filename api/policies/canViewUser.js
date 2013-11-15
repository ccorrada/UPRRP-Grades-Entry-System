module.exports = function (req, res, ok) {
  User.findOne(req.param('id'), function (err, user) {
    if (err) {
      console.log(err);
    } else if (user.length !== 0) {
      if (parseInt(req.param('id')) === user.id)
        ok();
      else
        return res.send('I\'m sorry, but I cannot let you do that.', 403);
    }
  });
}