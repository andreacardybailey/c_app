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
   tableName : 'test_processes',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   attributes: {
   	id : {
   	  type : 'integer'
   	},
   	name : {
   	  type : 'string',
   	  required : true,
   	  maxLength : 125
   	}
    
   }

};
