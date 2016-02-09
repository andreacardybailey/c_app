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
   tableName : 'sample_origins',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   attributes: {
      id : {
         type : 'integer'
      },
      sample_id : {
         type : 'integer',
         defaultsTo : null
      },
      strain_id : {
         type : 'integer',
         defaultsTo : null  
      },
      paternity : {
         type : 'string',
         in : [ 'MOTHER', 'FATHER'],
         required : true
      }
   },
   searchFields : {
    'ID' : 'sample_origins.id',
    'Sample' : 'samples.name',
    'Parent' : 'strains.name',
    'Paternity' : {
      field : 'sample_origins.paternity',
      lookup : [ 'MOTHER', 'FATHER' ]
    }
   },
   findWithNames : function(options, next) {
   
      var defaults = { offset : null , limit : null, sample : null };
      var where = [];
      var params = [];
      
      _.extend(defaults, options);   

      var query = 'SELECT \
         sample_origins.*, \
         samples.name as `sample_name`,\
         strains.name as `strain_parent_name` \
         FROM sample_origins \
         INNER JOIN samples ON samples.id = sample_origins.sample_id \
         INNER JOIN strains ON strains.id = sample_origins.strain_id ';
         
      if(defaults.sample){
        where.push(' samples.id = ?');
        params.push(defaults.sample);
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
        query += ' WHERE ' + where.join(' AND ');
      }
      
      query += ' ORDER BY samples.name DESC';
         
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
