/**
 * Student
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'uprrp_ges_students',

  attributes: {

    student_number	: {
      type: 'INTEGER',
      required: true,
      minLength: 9,
      maxLength: 9,
      unique: true
    },

    firstNames: {
      type: 'STRING',
      required: true,
      alpha: true
    },

    lastNames: {
      type: 'STRING',
      reuired: true,
      alpha: true
    }
  }

};
