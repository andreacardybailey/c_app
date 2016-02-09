/**
 * Facility
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
 
var regions = [ 'Unknown', 'Africa', 'Asia', 'Central America', 'Eastern Europe', 'European Union', 'Middle East', 'North America', 'Oceania', 'South America', 'Caribbean' ];

module.exports = {

   adapter : 'mysql-default',
   migrate : 'safe',
   tableName : 'strains',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   beforeCreate : function(values, next) {
      values.created = new Date();   
      next();
   },
   
   attributes: {
      id : {
         type : 'integer'
      },
      region : {
         type : 'string',
         maxLength : 75,
         in : regions
      },
      name : {
         type : 'string',
         maxLength : 125,
         required : true
      },
      test_id : {
         type : 'integer',
         defaultsTo : null
      },
      notes : {
         type : 'text'
      },
      created : {
         type : 'datetime'
      }
   },
   searchFields : {
    'ID' : 'strains.id',
    'Name' : 'strains.name',
    'Region' : {
      field : 'strains.region',
      lookup : regions
    },
    'Created' : {
      field : 'strains.created',
      format : 'date'
    }   
   }

};
