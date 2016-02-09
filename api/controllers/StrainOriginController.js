/**
 * StrainOriginController
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
   * (specific to StrainOriginController)
   */
  _config: {},
  
  'edit' : function(req, res) {
      var id  = req.param('id');
      
      if(!id)
      {
         res.send('Entry cannot be found');
      }
      else
      {            
         StrainOrigin.findOne(id).done(function(err, result){
         
            if(result)
            {            
               async.waterfall([
                  function(next) {
                     HTMLHelper.optionList(Strain, 'id', 'name', { selected : result.strain_id, sort : 'name'  }, function(strain_ops){
                        next(null, strain_ops);
                     });                  
                  },
                  function(strain_ops, next) {
                     HTMLHelper.optionList(Strain, 'id', 'name', { selected : result.strain_parent_id, sort : 'name'  }, function(strain_parent_ops){
                        next(null, strain_ops, strain_parent_ops);
                     });                    
                  }
               ],
               function(err, strain_ops, strain_parent_ops){
                  res.view('strainorigin/edit', { strainorigin : result, strain_option_list : strain_ops, strain_parent_option_list : strain_parent_ops });             
               });
            }
            else
            {
               res.send('Entry cannot be found');
            }
         }); 
      }
  },
  'new' : function(req, res){
  
      async.waterfall([
         function(next) {
            HTMLHelper.optionList(Strain, 'id', 'name', { sort : 'name'  }, function(strain_ops){
               next(null, strain_ops);
            });                  
         },
         function(strain_ops, next) {
            HTMLHelper.optionList(Strain, 'id', 'name', { sort : 'name'  }, function(strain_parent_ops){
               next(null, strain_ops, strain_parent_ops);
            });                    
         }
      ],
      function(err, strain_ops, strain_parent_ops){     
         res.view('strainorigin/new', { strain_option_list : strain_ops, strain_parent_option_list : strain_parent_ops });             
      });
   },
  'list' : function(req, res) {
  
      var offset = parseInt(req.query.offset || 0);
      var limit  = parseInt(req.query.limit  || 25);
      var currentPage = parseInt(req.query.page || 1);
      var cond   = Search.getFilter(req, 'strainorigin');
      
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
      console.log(cond);
   
      async.waterfall([
         function(next) {
            
            StrainOrigin.findWithNames({ where : cond.where }, function(err, results){
               next(null, results);
            });         
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               StrainOrigin.findWithNames({limit: limit, offset: offset, where : cond.where },function(err, results){                
                  
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
            res.view('strainorigin/list', { origins : results, pagination : info });
         }
      );
  }

  
};
