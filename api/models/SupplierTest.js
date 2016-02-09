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
   tableName : 'supplier_tests',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   beforeCreate : function(values, next) {
      values.created = new Date();   
      next();
   },  
   
   beforeUpdate : function(values, next) {
   
      if(values.status != 'COMPLETED' && values.status != 'CANCELLED') {
     
        Sample.findWithRequest({request : values.id }, function(err, samples){
  
          var total = 0;
          var completed = 0;
          
          samples.forEach(function(sample){
          
            var statuses = sample.test_statuses;          
            statuses = statuses ? statuses.split(',') : [ 'IN PROGRESS' ];
            
            total += statuses.length;
            
            console.log(statuses);
            
            statuses.forEach(function(status){
              if(status == 'ACCEPTED' || status == 'CANCELLED' || status == 'EXPIRED') {
                completed++;
              }
            });        
          }); 
          
          var progress = Math.ceil((completed / total) * 100);
          progress = progress > 100 ? 100 : progress.toFixed(0);
          
          values.progress = progress;        
          
          next();

        });
      
      } else {
      
        values.progress = 100;
        next();
      }   
   },
   
   attributes: {
   	id : {
   	  type : 'integer'
   	},
   	supplier_id : {
   	  type : 'integer',
   	  number : true,
   	  required : true
   	},
   	facility_id : {
   	  type : 'integer',
   	  number : true,
   	  required : true
   	},
   	technician_id : {
   	  type : 'integer',
   	  number : true,
   	  required : true
   	},
   	status : {
   	  type : 'string',
   	  in : [ 'RECEIVED','COMPLETE', 'CANCELLED' ],
   	  defaultsTo : 'RECEIVED'
   	},
   	progress : {
   	  type  : 'decimal',
   	  defaultsTo : 0
   	},
   	created : {
   	  type : 'datetime'
   	}
   },
   searchFields : {
    'ID' : 'supplier_tests.id',
    'Supplier' : 'suppliers.name',
    'Sample' : 'samples.name',
    'Status'   : {
      field  : 'supplier_tests.status',
      lookup : [ 'RECEIVED','COMPLETE', 'CANCELLED' ]
    },
    'Received'  : {
      field  : 'supplier_tests.created',
      format : 'date'
    }   
   },
   findWithSupplierNames : function(options, next) {
   
      var defaults = { offset : null , limit : null, facility : null, sort : 'created desc' };
      var where = [];
      var params = [];
      
      _.extend(defaults, options);   

      var query = 'SELECT \
         supplier_tests.*, \
         suppliers.name as supplier_name \
         FROM supplier_tests \
         INNER JOIN suppliers ON supplier_tests.supplier_id = suppliers.id \
         LEFT JOIN samples ON samples.supplier_test_id = supplier_tests.id';
         
      if(_.isNumber(defaults.facility)) {
         where.push('supplier_tests.facility_id = '+defaults.facility);
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
      
      where.push("supplier_tests.status != 'CANCELLED'");
      
      query += ' WHERE ' + where.join(' AND ');
         
      query += ' ORDER BY '+defaults.sort;
         
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      SupplierTest.query(query, params, function(err, results){      
         next(err, results);
      });   
   },
   findOpenRequests : function(options, next) {
   
      var defaults = { offset : null , limit : null, facility : null, sort : 'created desc' };
      var where = [];
      
      _.extend(defaults, options);   

      var query = 'SELECT \
         supplier_tests.*, \
         suppliers.name as supplier_name \
         FROM supplier_tests \
         INNER JOIN suppliers ON supplier_tests.supplier_id = suppliers.id';
         
      if(_.isNumber(defaults.facility)) {
         where.push('supplier_tests.facility_id = '+defaults.facility);
      }         
      
      where.push("supplier_tests.status = 'RECEIVED'");
      where.push("supplier_tests.progress < 100");
      
      query += ' WHERE ' + where.join(' AND ');
         
      query += ' ORDER BY '+defaults.sort;
      
      console.log(query);
         
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      SupplierTest.query(query, [], function(err, results){      
         next(err, results);
      });   
   },
};
