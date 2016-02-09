/**
 * Facility
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
 
var path = require('path'),
 fs = require('fs');

module.exports = {

   adapter : 'mysql-default',
   migrate : 'safe',
   tableName : 'suppliers',
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
   afterCreate : function(values, next) {
   
      Supplier.uploadImages(values, function(){
         next();
      });  
   },
   afterUpdate : function(values, next) {

      Supplier.uploadImages(values, function(){
         next();
      }); 
   },
   
   attributes: {
   	id : {
   	  type : 'integer'
   	},
   	facility_id : {
   	  type: 'integer'
   	},
   	name : {
   	  type : 'string',
   	  required : true,
   	  maxLength : 125
   	},
   	types : {
   	  type : 'string',
   	  maxLength : 125
   	},
   	city : {
   	  type : 'string',
   	  maxLength : 75
   	},
   	state : {
   	  type : 'string',
   	  maxLength : 75
   	},
   	zipcode : {
   	  type : 'string',
   	  maxLength : 10
   	},
   	country : {
   	  type : 'string',
   	  maxLength : 75
   	},
   	timezone : {
   	  type : 'string',
   	  maxLength : 75,
   	  defaultsTo : 'GMT'
   	},
   	logo : {
   	  type : 'string',
   	  maxLength : 255
   	},
   	active : {
   	  type : 'boolean',
   	  defaultsTo : 1
   	},
   	created : {
   	  type : 'datetime'
   	},
   	updated : {
   	  type : 'datetime'
   	}
   },
   searchFields : {
    'ID'      : 'suppliers.id',
    'Name'    : 'suppliers.name',
    'City'    : 'suppliers.city',
    'State'   : 'suppliers.state',
    'Active'  : {
      field : 'suppliers.active',
      lookup : [ 'TRUE', 'FALSE' ]
    },
    'Created' : {
      field : 'suppliers.created',
      type  : 'date'
    }   
   },
   uploadImages : function(values, next) {
   
      if(!_.isEmpty(values.logo) && values.logo.match(/uploads/))
      {
         var pub = path.join(__dirname, '/../../.tmp/public')
         ,file   = pub + values.logo
         ,ext    = path.extname(values.logo).toLowerCase()
         ,loc    = 'v1/suppliers/'+values.id+'/logo'+ext;
         
         Amazon.uploadFile(file, loc, function(err){   
            if(!err)
            {      
               Supplier.findOne(values.id).done(function(err, supplier){
                  supplier.logo = sails.config.imageBase + loc;
                  supplier.save(function(err){
                     fs.unlink(file, function(err){
                        next();
                     });
                  });
               });
            }
            else
            {
               next(err);
            }
         });
      }    
      else
      {
         next();
      }     
   },
   findWithRequests : function(options, next) {
      
      _.extend({}, options);
   
      var query = "SELECT DISTINCT \
         suppliers.id, \
         suppliers.name, \
         suppliers.city \
         FROM suppliers \
         INNER JOIN supplier_tests ON supplier_tests.supplier_id = suppliers.id \
         WHERE suppliers.active = 1 ";
         
         if(options.facilityId)
         {
            query += 'AND suppliers.facility_id = '+options.facilityId;
         }
         
         query += ' ORDER BY suppliers.name';
         
      Supplier.query(query, [], function(err, results){      
         next(err, results);
      });   
   }
};
