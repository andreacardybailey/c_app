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
   tableName : 'samples',
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
   beforeValidation : function(values, next) {
      if(_.isArray(values.smell)) {      
         values.smell = values.smell.join(',');    
      }
      next();
   },
   afterCreate : function(values, next) {
   
      Sample.uploadImages(values, function(){
         next();
      });  
   },
   afterUpdate : function(values, next) {

      Sample.uploadImages(values, function(){
         next();
      }); 
   },
   uploadImages : function(values, next) {
   
      var asyncs = [];
   
      if(!_.isEmpty(values.image) && values.image.match(/uploads/))
      {
         var pub = path.join(__dirname, '/../../.tmp/public')
         ,file = pub + values.image
         ,ext  = path.extname(values.image).toLowerCase()
         ,loc = 'v1/samples/'+values.id+'/profile'+ext;
         
          asyncs.push(function(next){          
            Amazon.uploadFile(file, loc, function(err){   
              next(err);
            });
          });
        
         // If images, create additional sizes               
         if(ext.match(/(jpe?g|gif|png)$/i)) {
         
           // create async upload function for small image
           asyncs.push(function(next) {
              
              var url  = [ 'v1/samples/', values.id, '/profile_small', ext].join('');
               
              Image.resize(file, 'profile_small' + ext, 'fit', '400x400', function(err, dest){
                Amazon.uploadFile(dest, url, function(err){                  
                   fs.unlink(dest, function(err){                           
                      next(null);
                   });
                }); 
              });
           });
           
           // create async upload function for preview image
           asyncs.push(function(next) {
              
              var url  = [ 'v1/samples/', values.id, '/profile_preview', ext].join('');
              
              Image.resize(file, 'profile_preview' + ext, 'fit', '200x200', function(err, dest){
                Amazon.uploadFile(dest, url, function(err){                  
                   fs.unlink(dest, function(err){                           
                      next(null);
                   });
                }); 
              });
           });
         }    
         
        // delete original file
        asyncs.push(function(next){
          fs.unlink(file, function(err){ 
            next(null);
          });
        });
        
        async.waterfall(asyncs, function(err) {
        
          Sample.findOne(values.id).done(function(err, sample){
            sample.image = loc;
            sample.save(function(err){
              next(err);
            });
          });
        });
      }    
      else
      {
         next();
      }     
   },
   
   attributes: {
      id : {
         type : 'integer'
      },
      supplier_id : {
         type : 'integer',
         required : true
      },
      facility_id : {
         type : 'integer',
         required : true
      },
      supplier_test_id : {
         type : 'integer',
         number : true,
         required : true
      },
      status : {
         type : 'string',
         in : [ 'ACCEPTED' ,'DECLINED' ],
         defaultsTo : 'ACCEPTED'
      },
      code : {
         type : 'string',
         maxLength : 255
      },
      name : {
         type : 'string',
         maxLength : 125,
         required : true
      },
      species : {
         type : 'string',
         in : [ 'INDICA','SATIVA','HYBRID','RUDERALIS' ],
         defaultsTo : 'INDICA' 
      },
      type : {
         type : 'string',
         in : [ 'FLOWER','CONCENTRATE' ],
         defaultsTo : 'FLOWER' 
      },
      seed_types : { 
        type : 'string'
      },
      concentrate : {
         type : 'string',
         in : [ null, 'HASH','KIEF', 'OIL','BUTTER','TINCTURE' ],
         defaultsTo : null 
      },
      extraction : {
         type : 'string',
         in : [ null, 'BUTANE','NAPTHA', 'ISOPROPLE', 'CO2', 'PROPANE' ],
         defaultsTo : null 
      },
      environment : {
         type : 'string',
         in : [ 'INDOOR','OUTDOOR' ],
         defaultsTo : 'INDOOR'
      },
      indica : {
         type : 'float',
         decimal : true,
         defaultsTo : 0
      },
      sativa : {
         type : 'float',
         decimal : true,
         defaultsTo : 0
      },
      hybrid : {
         type : 'boolean',
         defaultsTo : false
      },
      size : {
         type : 'float',
         defaultsTo : 0
      },
      smell: {
         type : 'string'
      },
      yield : {
         type : 'integer',
         defaultsTo : 0
      },
      grow_medium : {
         type : 'string',
         in : [ 'SOIL', 'HYDRO', 'AERO', 'SOILESS','UNKNOWN'],
         defaultsTo : 'UNKNOWN'
      },
      notes : {
         type : 'text'
      },
      pest_resistance : {
         type : 'string',
         in : [ null, 'LOW','AVERAGE','HIGH' ],
         defaultsTo : null
      },
      mildew_resistance : {
         type : 'string',
         in : [ null, 'LOW','AVERAGE','HIGH'],
         defaultsTo : null
      },
      sex : {
         type : 'string',
         in : [null, 'M', 'F' ],
         defaultsTo : null
      },
      maturation : {
         type : 'integer',
         maxLength :6,
         number : true
      },
      image : {
         type : 'string',
         maxLength : 255
      },
      created : {
         type : 'datetime'
      },
      updated : {
         type : 'datetime'
      },
      smellsLike : function(smell) {
         
         var contains = false;
      
         if(this.smell) {            
            contains = this.smell.indexOf(smell) > -1;         
         }
         return contains;      
      }
   },
   searchFields : {
    'ID' : 'samples.id',
    'Name' : 'samples.name',
    'Supplier' : 'suppliers.name',
    'Facility' : 'facilities.name',
    'Type'     : {
      field  : 'samples.type',
      lookup : [ 'FLOWER' ,'CONCENTRATE' ]
    },
    'Created'  : {
      field : 'samples.created',
      format : 'date'
    }   
   },
   
   findWithRequest : function(options, next) {

      var defaults = { request : null };
      var where = [];
      var params = [];
      
      _.extend(defaults, options);  
       
      if(defaults.request) 
      {
         where.push(' samples.supplier_test_id = ?');
         params.push(defaults.request);
      }
       
      var query = 'SELECT \
         samples.*, \
         GROUP_CONCAT(sample_tests.id) as `test_ids`, \
         GROUP_CONCAT(schemas.name) as `schema_names`, \
         GROUP_CONCAT(sample_tests.status) as `test_statuses` \
         FROM samples \
         LEFT JOIN sample_tests ON sample_tests.sample_id = samples.id \
         LEFT JOIN `schemas` ON schemas.id = sample_tests.schema_id';
         
      if(where.length > 0 ){
      
         query += ' WHERE ' + where.join(' AND ');      
      }
   
      query += ' GROUP BY samples.id';
      query += ' ORDER BY samples.created DESC, sample_tests.created DESC';  
         
      Sample.query(query, params, function(err, results){      
         next(err, results);
      });  
   
   },
   findWithNames : function(options, next) {
   
      var defaults = { offset : null , limit : null, sort : 'samples.id', facility : null, request : null };
      var where = [];
      var params = [];
      
       _.extend(defaults, options);   

      var query = 'SELECT \
         samples.*, \
         suppliers.name as `supplier_name`, \
         supplier_tests.created as `supplier_test` ,\
         facilities.name as `facility_name` \
         FROM samples \
         INNER JOIN suppliers ON suppliers.id = samples.supplier_id \
         INNER JOIN facilities ON samples.facility_id = facilities.id \
         LEFT JOIN supplier_tests ON supplier_tests.id = samples.supplier_test_id ';
         
      if(defaults.facility) 
      {
         where.push(' samples.facility_id = ?');
         params.push(defaults.facility);
      }
      
      if(defaults.request) 
      {
         where.push(' samples.supplier_test_id = ?');
         params.push(defaults.request);
      }
      
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
      
      
      query += ' ORDER BY ' + defaults.sort;
         
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      console.log(query);
      
      Sample.query(query, params, function(err, results){      
         next(err, results);
      });   
   }

};
