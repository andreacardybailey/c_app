/**
 * SchemaController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SchemaController)
   */
  _config: {},
  
  'edit' : function(req, res) {
      var id  = req.param('id');
      
      if(req.session.user.hasPermission('schemas.create'))
      {      
         if(!id)
         {
            res.send('Entry cannot be found');
         }
         else
         {            
            Schema.findOne(id).done(function(err, result){
            
               if(result)
               {            
                  async.waterfall([
                     function(next) {
                        HTMLHelper.optionList(TestProcess, 'id', 'name', { selected : result.process_id, sort : 'id'  }, function(schema_process_ops){
                           next(null, schema_process_ops);
                        });  
                     },
                     function(schema_process_ops, next) {
                        HTMLHelper.optionList(SchemaType, 'id', 'name', { selected : result.type_id, sort : 'id'  }, function(schema_type_ops){
                           next(null, schema_type_ops, schema_process_ops);
                        });  
                     },
                     function(schema_type_ops, schema_process_ops, next) {
                        HTMLHelper.optionList(SchemaSubtype, 'id', 'name', { selected : result.subtype_id, sort : 'name'  }, function(schema_subtype_ops){
                           next(null, schema_subtype_ops, schema_type_ops, schema_process_ops);
                        });  
                     },
                  ],
                  function(err, schema_subtype_ops, schema_type_ops, schema_process_ops){
                  
                     res.view('schema/edit', { 
                        schema : result, 
                        type_option_list : schema_type_ops, 
                        subtype_option_list : schema_subtype_ops,
                        process_option_list : schema_process_ops 
                     });             
                  });
               }
               else
               {
                  res.send('Entry cannot be found');
               }
            }); 
         }
      }
      else
      {
         res.forbidden("You don't have access to this resource");
      }
  },
  'new' : function(req, res){
  
      if(req.session.user.hasPermission('schemas.create')) {
     
         async.waterfall([
            function(next) {
               HTMLHelper.optionList(TestProcess, 'id', 'name', { sort : 'id'  }, function(schema_process_ops){
                  next(null, schema_process_ops);
               });  
            },
            function( schema_process_ops, next) {
               HTMLHelper.optionList(SchemaType, 'id', 'name', { sort : 'id'  }, function(schema_type_ops){
                  next(null, schema_type_ops, schema_process_ops);
               });  
            },
            function(schema_type_ops, schema_process_ops, next) {
               HTMLHelper.optionList(SchemaSubtype, 'id', 'name', { sort : 'name'  }, function(schema_subtype_ops){
                  next(null, schema_subtype_ops, schema_type_ops, schema_process_ops);
               });  
            },
         ],
         function(err, schema_subtype_ops, schema_type_ops, schema_process_ops){
         
            res.view('schema/new', { 
               type_option_list : schema_type_ops, 
               subtype_option_list : schema_subtype_ops,
               process_option_list : schema_process_ops 
            });             
         });
      } else 
      {
         res.forbidden("You don't have access to this resource");
      }
   },
  'list' : function(req, res) {
  
      var offset = parseInt(req.query.offset || 0);
      var limit  = parseInt(req.query.limit  || 25);
      var currentPage = parseInt(req.query.page || 1);
      var cond   = Search.getFilter(req, 'schema');
      
      offset = (currentPage * limit) - limit;
      
      var info = {
         results: {
             from: 0,
             to: 0,
             total: 0
         },
         pages: {
             current: 0,
             prev: null,
             next: null,
             total: 0
         }
      };
   
      async.waterfall([
         function(next) {
            
            Schema.findWithFullName({ where : cond.where }, function(err, results){
               next(null, results);
            });         
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               Schema.findWithFullName({limit: limit, offset: offset, where : cond.where},function(err, results){                
                  
                  if (limit) {      
                     info = Pagination.getPagination(resultsTotal, offset, limit);
                  }
                  
                  next(null, results, info);        
               });
            }
            else
            {
               next(null, results, info);
            }         
         }],
         function(err, results, info){
            res.view('schema/list', { schemas : results, pagination : info });
         }
      );
  }

  
};
