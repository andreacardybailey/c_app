/**
 * Supplier Types
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

   adapter : 'mysql-default',
   migrate : 'safe',
   tableName : 'supplier_types',
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
 
      name : {
         type: 'string',
         maxLength : 125,
         required : true
      },
      created : {
         type : 'datetime'
      }

   }
};
