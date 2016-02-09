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
   tableName : 'technicians',
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
       
      var keep = []; 
       
      if(_.has(values, 'permissions') && _.isArray(values.permissions))
      {      
         values.permissions.forEach(function(permission, index){
            if(permission) {
               keep.push(permission);
            }
         });         
  
         values.permissions = _.uniq(keep).join(',');   
      } 
      next();
   },
   
   attributes: {
   	id : {
   	  type : 'integer'
   	},
   	user_id : {
   	  type : 'integer'
   	}, 
   	badge : {
   	  type : 'string',
   	},
   	active : {
   	  type : 'boolean',
   	  defaultsTo : true
   	},
   	permissions : {
   	  type : 'text'
   	},
   	created : {
   	  type : 'datetime'
   	},
   	updated : {
   	  type : 'datetime'
   	},
      hasPermission : function(permission)
      {
         return String(this.permissions).indexOf(permission) > -1;   
      }    
   },
   searchFields : {
    'ID' : 'technicians.id',
    'Facility' : 'facilities.name',
    'Badge' : 'technicians.badge',
    'User' : 'CONCAT(users.firstname, \' \', users.lastname)',
    'Created'  : {
      field  : 'technicians.created',
      format : 'date'
    }   
   },
   findWithNames : function(options, next) {
      
      var defaults = { offset : null , limit : null, sort : 'technicians.id asc', facility : null };
      var where = [];
      var params = [];
      
      _.extend(defaults, options);   

      var query = "SELECT \
         technicians.*, \
         CONCAT(users.firstname,' ', users.lastname) as full_name, \
         facilities.name as `facility_name` \
         FROM technicians \
         INNER JOIN users on users.id = technicians.user_id \
         INNER JOIN facilities ON facilities.id = users.facility_id";
         
      if(defaults.facility) {
        where.push(' users.facility_id = ?');
        params.push(defaults.facility);
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
      
      where.push(' technicians.active = 1 AND users.active = 1');
      
      if(where.length > 0){
        query += ' WHERE '+ where.join(' AND ');
      }
      
      query += ' ORDER BY '+defaults.sort;
         
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      Technician.query(query, params, function(err, results){
         next(err, results);
      }); 
   
   }

};
