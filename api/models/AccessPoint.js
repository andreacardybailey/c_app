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
   tableName : 'access_points',
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
      facility_id : {
         type : 'integer'
      },   
      name : {
         type: 'string',
         maxLength : 125,
         required : true
      },
      address : {
         type : 'string',
         maxLength : 125
      },
      city : {
         type : 'string',
         maxLength : 75
      },
      state : {
         type : 'string',
         maxLength : 2
      },
      zipcode : {
         type : 'string',
         maxLength : 10
      },
      lat : {
         type : 'string',
         decimal : true
      },
      lng : {
         type : 'string',
         decimal : true
      },
      hours : {
         type : 'text'         
      },
      phone : {
         type : 'string',
         maxLength : 20
      },
      logo : { 
         type : 'string',
         maxLength : 255
      },
      created : {
         type : 'datetime'
      },
      updated : {
         type : 'datetime'
      }    
   },
   searchFields : {
    'ID' : 'access_points.id',
    'Name' : 'access_points.name',
    'City' : 'access_points.city',
    'State'  :'acces_points.state',
    'Created'  : {
      field : 'access_points.created',
      format : 'date'
    }
   }

};
