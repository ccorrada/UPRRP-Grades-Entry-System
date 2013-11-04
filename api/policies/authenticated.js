/**
 * Allow any authenticated user.
 */
module.exports = function (req, res, ok) {

  // User is allowed, proceed to controller
  if (req.session.authenticated) {
    return ok();
  }

  // User is not allowed
  else {
    return res.send("I'm sorry, but I cannot let you do that.", 403);
  }
};