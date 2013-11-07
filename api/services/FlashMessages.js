// Flash messages come from here.

var buildFlash = function (flash_result, flash_message) {
  return {result: flash_result, message: flash_message}
}

module.exports = {
  invalidCredentials: buildFlash(false, 'Invalid credentials.'),

  emptyPasswordChange: buildFlash(false, 'Can\'t change to an empty password!'),

  successfulLogout: buildFlash(true, 'You have been logged out.'),

  noEmailEntered: buildFlash(false, 'No email entered.'),

  successfulPasswordChange: buildFlash(true, 'Nice password change!'),

  requestActivationLink: buildFlash(true, 'You should recieve an activation email soon!'),

  invalidActivationToken: buildFlash(false, 'Invalid activation token!'),

  successfullyAddedUser: buildFlash(true, 'Added new user.'),

  invalidRoleSelected: buildFlash(false, 'Invalid role selected.'),

  invalidNames: buildFlash(false, 'Invalid first or last names.'),

  invalidSSN4: buildFlash(false, 'Invalid SSN4.')
}