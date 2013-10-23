/**
 * Professor
 * 
 * Default password is null.
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
    
    email	: 'STRING',


    password	: 'STRING',


    passwordResetToken	: 'STRING'


    // password_reset_timestamp	: 'DATETIME'
  }

};
