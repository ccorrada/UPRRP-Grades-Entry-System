// Allow access to admin page

module.exports = function (req, res, ok) {
  if (req.session.admin) {
    return ok();
  } else {
    return res.send('I\'m sorry, but I cannot let you do that.', 403);
  }
};