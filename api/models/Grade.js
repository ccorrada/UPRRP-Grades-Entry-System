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
      in: ['a', 'b', 'c', 'd', 'f', 'x', 'ps', 'pn', 'pb', 'p', 'np', 'w']
    },

    incomplete: {
      type: 'BOOLEAN',
      defaultsTo: false,
      required: true
    }
  },

  GRADE_TYPES: [
    ['a', 'b', 'c', 'd', 'f', 'x'],
    ['ps', 'pn', 'pb', 'p', 'np'],
    ['p', 'np']
  ],

  beforeCreate: function (values, next) {
    Grade.find()
    .where({student_id: values.student_id, course_id: values.course_id})
    .then(function (grades) {
      if (grades.length > 1) {
        // Grade is not unique
        return next(new Error('Grade is not unique!'));
      } else {
        next();
      }
    }).fail(function (err) {
      return next(err);
    });
  }

};
