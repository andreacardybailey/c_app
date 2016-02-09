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
   tableName : 'users',
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
   
      User.uploadImages(values, function(){
         next();
      });  
   },
   afterUpdate : function(values, next) {

      User.uploadImages(values, function(){
         next();
      }); 
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
      
      if(_.has(values, 'password') && 
         _.has(values, 'repassword') && 
         false == _.isEqual(values.repassword, values.password)
         ) 
      {
         return next('Passwords do not match.');
      }      
      
      if(!_.isEmpty(values.repassword) && !_.isEmpty(values.password))
      {      
         if(values.password.replace(/^\s+|\s+$/g,'') != '')
         {
            values.password = Security.hash(values.password);
         }
      }
      else
      {
         delete(values.repassword);
         delete(values.password);
      }
      next();
   },
   uploadImages : function(values, next) {
   
      if(!_.isEmpty(values.avatar) && values.avatar.match(/uploads/))
      {
         var pub = path.join(__dirname, '/../../.tmp/public')
         ,file   = pub + values.avatar
         ,ext    = path.extname(values.avatar).toLowerCase()
         ,loc    = 'v1/users/'+values.id+'/avatar'+ext;
         
         Amazon.uploadFile(file, loc, function(err){   
            if(!err)
            {      
               User.findOne(values.id).done(function(err, user){
                  user.avatar = sails.config.imageBase + loc;
                  user.save(function(err){
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
   
   attributes: {
      id  :{
         type : 'integer'
      },
      facility_id : {
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
         email : true,
         required : true
      },
      password : {
         type : 'string'
      },
      company : {
         type : 'string'
      },
      city : {
         type : 'string'
      },
      locale : {
        type : 'string',
        defaultsTo : 'en'
      },
      avatar : {
         type : 'string',
         maxLength : 255
      },
      active : {
         type : 'boolean',
         defaultsTo : true
      },
      roles : {
         type : 'string',
         maxLength : 255
      },
      access_token : {
         type : 'string'
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
    'ID' : 'users.id',
    'First Name': 'users.firstname',
    'Last Name' : 'users.lastname',
    'E-mail' : 'users.email',
    'Active' : {
      field : 'users.active',
      lookup : {
        1 : 'YES',
        0 : 'NO'
      }
    },
    'Created' : {
      field : 'users.created',
      format: 'date'
    }   
   },
   findWithNames :  function(options, next){
   
      var where = [];
      var params = [];

      var query = "SELECT \
         users.*, \
         CONCAT(users.firstname,' ', users.lastname) as full_name \
         FROM users ";
      
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
      
      query += ' ORDER BY lastname';
      
      console.log(query);
         
      User.query(query, params, function(err, results){
         next(err, results);
      });  
   },
   authenticate : function(criteria, password, next) {
   
      var criteria = criteria.toLowerCase();
   
      var query = 'SELECT \
         users.*, \
         technicians.id as technician_id, \
         badge, \
         facilities.name as `facility_name`, \
         facilities.city as `facility_city`, \
         facilities.state as `facility_state`, \
         technicians.permissions as tech_permissions \
         FROM users \
         INNER JOIN facilities ON facilities.id = users.facility_id \
         LEFT JOIN technicians ON technicians.user_id= users.id \
         WHERE \
            users.active = 1 AND \
            (technicians.active = 1 or technicians.active IS NULL) AND \
            (LOWER(users.email) = ? OR LOWER(technicians.badge) = ?) \
         LIMIT 1'

      User.query(query, [criteria, criteria], function(err, results) {
      
         if(results.length) {
            
            var _user = results[0];
            
            User.findOne(_user.id).done(function(err, user){
            
               user = _.extend(user, _user);
            
               if(Security.matches(password, user.password))
               {
                  if(user.tech_permissions)
                  {
                     if(!_.isEmpty(user.tech_permissions))
                     {
                        user.permissions += ',' + user.tech_permissions;
                     }
                  }
               
                  next(null, user);
               }
               else
               {
                  next('Password does not match.', null);
               }
            
            });
         }
         else
         {
            next('User cannot be found or is not active.', null);
         }
      });
   },
   isNotTechnician : function(options, next){
   
      var where = [];
      var params = [];
   
      var query = 'SELECT \
         users.* \
         FROM users \
         LEFT JOIN technicians ON technicians.user_id = users.id ';
         
      if(options.facility){
        where.push(' users.facility_id = ?');
        params.push(options.facility);
      }
      
      if(options.where){
      
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
      
      where.push('technicians.user_id IS NULL');
      
      if(where.length > 0){
        query += ' WHERE '+ where.join(' AND ');
      }
         
      User.query(query, params, function(err, results){
         next(err, results);
      });
   }
   

};
