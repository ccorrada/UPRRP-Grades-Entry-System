// Flash messages come from here.

var buildFlash = function (flash_result, flash_message) {
  return {result: flash_result, message: flash_message}
}

module.exports = {
  invalidCredentials: buildFlash(false, 'invalidCredentials'),

  emptyPasswordChange: buildFlash(false, 'emptyPasswordChange'),

  successfulLogout: buildFlash(true, 'successfulLogout'),

  noEmailEntered: buildFlash(false, 'noEmailEntered'),

  successfulPasswordChange: buildFlash(true, 'successfulPasswordChange'),

  requestPasswordResetLink: buildFlash(true, 'requestPasswordResetLink'),

  invalidPasswordResetToken: buildFlash(false, 'invalidPasswordResetToken'),

  successfullyAddedUser: buildFlash(true, 'successfullyAddedUser'),

  invalidRoleSelected: buildFlash(false, 'invalidRoleSelected'),

  invalidNames: buildFlash(false, 'invalidNames'),

  invalidSSN4: buildFlash(false, 'invalidSSN4'),

  successfulDraftSave: buildFlash(true, 'successfulDraftSave'),

  successfulFinalSave: buildFlash(true, 'successfulFinalSave'),

  noProfessorWithEmail: buildFlash(false, 'noProfessorWithEmail'),

  successfulCourseCreation: buildFlash(true, 'successfulCourseCreation'),

  localeSaved: buildFlash(true, 'localeSaved'),

  userDoesNotExist: buildFlash(false, 'userDoesNotExist'),

  successfullySavedCourse: buildFlash(true, 'successfullySavedCourse'),

  successfullySavedUser: buildFlash(true, 'successfullySavedUser'),

  noCourseCode: buildFlash(false, 'noCourseCode'),

  noSession: buildFlash(false, 'noSession'),

  noSection: buildFlash(false, 'noSection'),

  emailAlreadyExists: buildFlash(false, 'emailAlreadyExists'),

  atleastOneInvalidGrade: buildFlash(false, 'atleastOneInvalidGrade')
}