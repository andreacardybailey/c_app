/**
 * Schema
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
 
// bring in local config for table name hack
var config = require('../../config/local.js');

module.exports = {

   adapter : 'mysql-default',
   migrate : 'safe',
   tableName : config.adapters['mysql-default'].database + '.schemas', // Waterline ORM doesn't like schemas as a table name
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   beforeCreate : function(values, next) {
      values.created = new Date();   
      next();
   },
   beforeUpdate : function(values, next) {
      values.updated = new Date(); 
      
      console.log(JSON.stringify(values));
      next();
   },
   
   attributes: {
      id : {
         type : 'integer'
      },
      name : {
         type : 'string',
         maxLength : 125,
         defaultsTo : null
      },
      type_id : {
         type : 'integer',
         number : true,
         required : true      
      },
      subtype_id : {
         type : 'integer',
         number : 'true',
         required : true
      },
      process_id : {
         type : 'integer',
         number : true,
         required : true
      },
      data : {
         type : 'json'
      },
      instructions : {
         type : 'text'
      },
      created : {
         type :'datetime'
      },
      updated : {
         type : 'datetime'
      },
      toJSON : function() {
         var obj = this.toObject();
         var data = obj.data;
         
         for(var coll in data) {
            for(var key in  data[coll]) {
               var element = data[coll][key];
               
               // html escape help info as it gets injected into HTML page
               if(element.help) {
                  element.help = _.escape(element.help);
               }
               
               // system variable
               if(element.defaultsTo && String(element.defaultsTo).match(/^eval:/))
               {
                  try{
                     element.defaultsTo = eval('(sails.'+element.defaultsTo.replace(/^eval:/,'')+')');
                  } catch(e) {
                     element.defaultsTo = '';
                  }
               }            
            }
         }
         return obj;
      }
      
   },
   searchFields : {
    'ID'      : 'schemas.id',
    'Name'    : 'schemas.name',
    'Created' : 'schemas.created'   
   },
   findWithFullName : function(options, next){

      var defaults = { offset : null , limit : null };
      var where = [];
      var params = [];
      
      _.extend(defaults, options);

      var query = "SELECT \
         `schemas`.*,\
         MAX(schema_revisions.revision) as `latest_revision`, \
         IFNULL(`schemas`.name, CONCAT(schema_types.name, ' / ', schema_subtypes.name, ' / ', test_processes.name)) as full_name \
      FROM `schemas` \
         INNER JOIN schema_revisions ON schema_revisions.schema_id = schemas.id \
         INNER JOIN schema_types ON schema_types.id = schemas.type_id \
         INNER JOIN schema_subtypes ON schema_subtypes.id = `schemas`.subtype_id \
         INNER JOIN test_processes ON test_processes.id = `schemas`.process_id ";
         
      if(defaults.where){
      
        for(var field in defaults.where){
        
          var operator = Object.keys(defaults.where[field])[0];
          var value = defaults.where[field][operator];
        
          if(operator == 'contains'){
          
            where.push(' '+ field + " LIKE '%" + value.replace(/\%/g,'%%').replace(/\'/g,"\\'") + "%' ");
            
          } else {
          
            where.push(' '+ field + ' ' + operator + "'?'");
            params.push( value );
          }
        }
      }
      
      if(where.length > 0 ){
      
         query += ' WHERE ' + where.join(' AND ');      
      }
      
      query += " GROUP BY schemas.id, schemas.type_id, schemas.subtype_id, schemas.process_id \
        ORDER BY `schemas`.type_id";
            
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      Schema.query(query, params, function(err, results){
         next(err, results);
      });
   },
   findLatestRevision : function(schema_id, next) {
   
      var query = 'SELECT MAX(revision) as `revision` FROM schema_revisions WHERE schema_id = ? ORDER BY revision DESC';
      
      Schema.query(query, [ schema_id ] , function(err, results) {
         next(err, results[0].revision);
      });  
   }
};
