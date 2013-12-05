// Allow access to admin page

module.exports = function (req, res, ok) {
  if (req.session.user.role === 'admin' || req.session.user.role === 'dumper' ) {
    return ok();
  } else {
    return res.send('I\'m sorry, but I cannot let you do that.', 403);
  }
};