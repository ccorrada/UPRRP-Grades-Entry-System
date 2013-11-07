/**
 * User
 * 
 * Default password is null.
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'uprrp_ges_users',

  attributes: {
    
    email	: {
      type: 'EMAIL',
      required: true,
      unique: true
    },

    password	: {
      type: 'STRING',
      required: true,
      minLength: 8,
      defaultsTo: require('bcrypt').hashSync(require('crypto').randomBytes(20).toString('hex'), require('bcrypt').genSaltSync(10))
    },

    passwordResetToken	: {
      type: 'STRING'
    },

    first_names: {
      type: 'STRING',
      required: true
    },

    last_names: {
      type: 'STRING',
      required: true
    },

    role: {
      type: 'STRING',
      defaultsTo: 'professor',
      in: ['admin', 'professor'],
      required: true
    },

    SSN4: {
      type: 'INT',
      required: true,
      minLength: 4,
      maxLength: 4
    }
  }

};
