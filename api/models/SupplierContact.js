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
   tableName : 'supplier_contacts',
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
   	supplier_id : {
   	  type : 'integer',
   	  number : true,
   	  required : true
   	},
   	firstname : {
   	  type : 'string',
   	  maxLength : 75,
   	  required : true
   	},
   	lastname : {
   	  type : 'string',
   	  maxLength : 75,
   	  required : true
   	},
   	email : {
   	  type : 'string',
   	  maxLength : 125,
   	  required : true,
   	  email : true
   	},
   	phone : {
   	  type : 'string',
   	  maxLength : 20
   	},
   	created : {
   	  type : 'datetime'
   	},
   	updated : {
   	  type : 'datetime'
   	}    
   },
   searchFields : {
    'ID'       : 'supplier_contacts.id',
    'Supplier' : 'suppliers.name',
    'Name'     : "CONCAT(supplier_contacts.firstname,' ', supplier_contacts.lastname) as `name`",
    'E-mail'   : 'supplier_contacts.email',
    'Created'  : {
      field : 'supplier_contact.created',
      format : 'date'
    }
   },
   findWithNames : function(options, next){
   
      var defaults = { offset : null , limit : null, sort :'id', supplier : null };
      var where = [];
      var params = [];
      
      _.extend(defaults, options);
   
      var query = "SELECT \
         supplier_contacts.id, \
         suppliers.name as `supplier_name`, \
         CONCAT(supplier_contacts.firstname, ' ', supplier_contacts.lastname) as `contact_name`, \
         supplier_contacts.email, \
         supplier_contacts.phone, \
         supplier_contacts.created \
         FROM supplier_contacts \
         INNER JOIN suppliers ON suppliers.id = supplier_contacts.supplier_id ";
         
      if(defaults.supplier){
        where.push(' supplier_contacts.supplier_id = ?');
        params.push(defaults.supplier);
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
      
      if(where.length > 0){
        query +=' WHERE ' + where.join(' AND ');
      }
       
      query += '  ORDER BY '+ defaults.sort;
      
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      SupplierContact.query(query, params, function(err, results){      
         next(err, results);
      });
   }
};
