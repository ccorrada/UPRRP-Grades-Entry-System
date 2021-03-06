/**
 * Course
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'uprrp_ges_courses',

  attributes: {

    course_code	: {
      type: 'STRING',
      required: true,
      alphanumeric: true
    },

    user_id	: {
      type: 'INTEGER',
      required: true
    },

    done	: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    already_dumped	: {
      type: 'BOOLEAN',
      defaultsTo: false
    },

    session	: {
      type: 'STRING',
      required: true,
      alphanumeric: true
    },

    section	: {
      type: 'STRING',
      required: true,
      alphanumeric: true
    },

    dumped_timestamp: {
      type: 'DATETIME'
    },

    gradeType: {
      type: 'INTEGER',
      required: true,
      in: [0, 1],
      defaultsTo: 0 // Dev. Remove later.
    },

    departmentId: {
      type: 'integer',
      required: true,
      defaultsTo: 1 // Dev. Remove later.
    },

    title: {
      type: 'string',
      required: true,
      alphanumeric: true
    },

    toJSON: function () {
      var obj = this.toObject();
      delete obj.done;
      delete obj.already_dumped;
      return obj;
    }
  },

  beforeCreate: function (values, next) {
    Course.find()
    .where({section: values.section, session: values.session, course_code: values.course_code})
    .then(function (courses) {
      if (courses.length > 1) {
        // Course is not unique
        return next(new Error('Course is not unique!'));
      } else {
        next();
      }
    }).fail(function (err) {
      return next(err);
    });
  }

};
