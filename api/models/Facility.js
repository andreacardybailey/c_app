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
   tableName : 'facilities',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   beforeCreate : function(values, next) {
      values.created = new Date();   
      next();
   },
   beforeUpdate : function(values, next) {
      values.updated = new Date(); 
      next();
   },
   
   attributes: {
      id : { 
         type : 'integer'
      },
      name : {
         type : 'string',
         maxLength : 75,
         required : true
      },
      address : {
         type : 'string',
         maxLength : 75
      },
      address_cont : {
         type : 'string',
         maxLength : 75
      },
      city : {
         type : 'string',
         maxLength : 75
      },
      state : {
         type : 'string',
         maxLength : 2
      },
      region : {
         type : 'string'
      },
      district : {
         type : 'string'
      },
      zipcode : {
         type : 'string',
         maxLength : 10
      },
      timezone : {
         type : 'string',
         maxLength : 75,
         defaultsTo : 'GMT'
      },
      created : {
         type : 'datetime'
      },
      updated : {
         type : 'datetime'
      }   
   },
   searchFields : {
    'ID' : 'facilities.id',
    'Name' : 'facilities.name',
    'City' : 'facilities.city',
    'State' : 'facilities.state',
    'Created' : {
      field : 'facilities.created',
      format: 'date'
    }
   
   }

};
