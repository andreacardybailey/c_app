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
   tableName : 'strain_origins',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   attributes: {
   	id : {
   	  type : 'integer'
   	},
   	strain_id : {
   	  type : 'integer',
   	  number : true,
   	  required : true
   	},
   	strain_parent_id : {
   	  type : 'integer',
   	  number : true,
   	  required : true
   	},
   	paternity : {
   	  type: 'string',
   	  in : ['MOTHER', 'FATHER' ],
   	  required : true
   	}    
   },
   searchFields : {
    'ID' : 'strain_origins.id',
    'Strain' : 's1.name',
    'Parent' : 's2.name',
    'Paternity' : {
      field : 'sample_origins.paternity',
      lookup : [ 'MOTHER', 'FATHER' ]
    }
   },
   findWithNames : function(options, next) {
   
      var defaults = { offset : null , limit : null };
      var where = [];
      var params = [];
      
      _.defaults(defaults, options);   

      var query = 'SELECT \
         strain_origins.*, \
         s1.name as `strain_name`, \
         s2.name as `strain_parent_name` \
         FROM strain_origins \
         INNER JOIN strains as s1 ON s1.id = strain_origins.strain_id \
         INNER JOIN strains as s2 ON s2.id = strain_origins.strain_parent_id ';
         
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
        query += ' WHERE ' + where.join(' AND ');      
      }
    
      query += ' ORDER BY strain_name DESC';
         
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      StrainOrigin.query(query, params, function(err, results){      
         next(err, results);
      });   
   }

};
