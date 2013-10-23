// Flash messages come from here.

module.exports = {
  invalidCredentials: function () {
    return {
      err: [{result: false, message: 'Invalid credentials.'}]
    }
  }
}