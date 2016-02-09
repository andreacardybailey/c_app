/**
 * Config
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

   adapter : 'mysql-default',
   migrate : 'safe',
   tableName : 'config',
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
   	facility_id : {
   	  type : 'integer'
   	},
   	key : {
   	  type : 'string'
   	}, 
   	value : {
   	  type : 'string',
   	}
   },
   buildPersistentConfig : function(facility_id, next) {
   
      var configItems = sails.config.persistConfig || {};
      var configCreates = [];
      
      for(var key in configItems) {
      
         (function(key){
            
            configCreates.push(function(nextUpdate) {
               
               CannabidataConfig.create({ key : key, value : '', facility_id : facility_id }).done(function(err, config){
                  nextUpdate(err);
               });
               
            });
         
         })(key);      
      }
      
      async.waterfall(configCreates, function(err){
         next(err);      
      });      
   },
   updateFromSampleTest : function(values, next){
 
      var configUpdates = [];

      async.waterfall([
      
         function(next) {
         
            // find current schema
            Schema.findOne(values.schema_id).done(function(err, schema) {
            
               var data = schema.data;

               // traverse collections
               for(var coll in data) {
               
                  // traverse data elements
                  for(var key in data[coll]) {
                  
                     // if elements has default as "eval:", we will use it
                     if(data[coll][key].defaultsTo && String(data[coll][key].defaultsTo).match(/^eval:/)) {
                     
                        // the item key stored in the db is in the brakcets ['something.else']
                        var item = String(data[coll][key].defaultsTo).match(/\[\'(.*)\'\]/)[1];
                        
                        // verify our current values actually have this element
                        if(values.results[coll] && values.results[coll][key]) {
                        
                           // create lambda closure and function to update the config item
                           (function(item, coll, key){
                           
                              configUpdates.push(function(nextUpdate) {
                              
                                 CannabidataConfig.findOne().where({ key : item, facility_id : values.facility_id }).done(function(err, config) {
                                    
                                    if(config) {
                                    
                                       config.value = values.results[coll][key];
                                       config.save(function(err){
                                          nextUpdate(null);
                                       });
                                    }
                                    else
                                    {
                                       nextUpdate(null); 
                                    }
                                 });    
                              });    
                              
                           })(item, coll, key);                
                        }
                     }                  
                  }
               } 
               next(null, configUpdates);              
            });
         },
         function(configUpdates, next) {
         
            if(configUpdates.length) {
            
               // perform all necessary config updates
               async.waterfall(configUpdates, function(err) {
                  next(null);
               });            
            }
            else
            {
               next(null);
            }         
         }
      ],function(err) {
         next(err);
      });   
   
   }
};
