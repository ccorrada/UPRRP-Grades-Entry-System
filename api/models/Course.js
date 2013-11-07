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
      required: true
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
      required: true
    },

    section	: {
      type: 'STRING',
      required: true
    }
  }

};
