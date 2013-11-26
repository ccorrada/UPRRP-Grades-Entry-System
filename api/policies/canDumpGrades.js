module.exports = function (req, res, ok) {
  if (req.session.user.role === 'dumper' || req.session.user.role === 'admin') {
    return ok();
  } else {
    return res.send('I\'m sorry, but I cannot let you do that.', 403);
  }
};