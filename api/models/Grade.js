/**
 * Grade
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'uprrp_ges_grades',

  attributes: {

    course_id	: {
      type: 'INTEGER',
      required: true
    },

    student_id	: {
      type: 'INTEGER',
      required: true
    },

    grade	: {
      type: 'STRING',
      in: ['A', 'B', 'C', 'D', 'F']
    }
  }

};
