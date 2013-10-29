// Flash messages come from here.

module.exports = {
  invalidCredentials: function () {
    return {result: false, message: 'Invalid credentials.'}
  },

  emptyPasswordChange: function () {
    return {result: false, message: 'Can\'t change to an empty password!'}
  },

  successfulLogout: function () {
    return {result: true, message: 'You have been logged out.'}
  },

  noEmailEntered: function () {
    return {result: false, message: 'No email entered.'}
  }, 

  successfulPasswordChange: function () {
    return {result: true, message: 'Nice password change!'}
  },

  requestActivationLink: function () {
    return {result: true, message: 'You should recieve an activation email soon!'}
  }
}