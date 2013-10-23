// Flash messages come from here.

module.exports = {
  invalidCredentials: function () {
    return {
      err: [{result: false, message: 'Invalid credentials.'}]
    }
  },

  emptyPasswordChange: function() {
    return {
      err: [{result: false, message: 'Can\'t change to an empty password!'}]
    }
  }
}