module.exports = function (req, res, ok) {
  if (req.session.user.role === 'professor') {
    return ok();
  } else {
    return res.send('I\'m sorry, but I cannot let you do that.', 403);
  }
};