/**
 * Facility
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

   adapter : 'mysql-default',
   migrate : 'safe',
   tableName : 'schema_revisions',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   attributes: {
   	schema_id : {
   	  type : 'integer',
   	  number : true,
   	  required : true
   	},
   	revision : {
   	  type : 'integer',
   	  maxLength : 10
   	},
   	data : {
   	  type : 'json'
   	}
   }

};
