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
      required: true,
      alpha: true
    },

    last_names: {
      type: 'STRING',
      required: true,
      alpha: true
    },

    role: {
      type: 'STRING',
      defaultsTo: 'professor',
      in: ['admin', 'professor'],
      required: true,
      alpha: true
    },

    SSN4: {
      type: 'STRING',
      required: true,
      minLength: 4,
      maxLength: 4,
      numeric: true
    },

    locale: {
      type: 'STRING',
      defaultsTo: 'en',
      in: ['en', 'es'],
      alpha: true
    },

    toJSON: function () {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
  },

  ROLES: ['admin', 'professor', 'dumper']

};
