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
   tableName : 'sample_test_revisions',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   attributes: {
      sample_test_id : {
         type : 'integer',
         number : true,
         required : true
      },
      status : {
         type : 'string',
         in : [ 'INITIATED','IN PROGRESS','ON HOLD','CANCELLED','ACCEPTED','EXPIRED' ],
         required : true         
      },
      data : {
         type : 'json'
      },
      revision : {
         type : 'integer'
      }
    
   }

};
