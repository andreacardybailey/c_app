/**
 * SampleOriginController
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
   * (specific to SampleOriginController)
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
         SampleOrigin.findOne(id).done(function(err, result){
         
            if(result)
            {            
               async.waterfall([
                  function(next) {
                     Sample.findWithNames({}, function(err, samples){
                        next(null, samples);
                     });
                  },
                  function(samples, next) {
                     HTMLHelper.optionList(Strain, 'id', 'name', { selected : result.strain_id, sort : 'name'  }, function(strain_parent_ops){
                        next(null, samples, strain_parent_ops);
                     });                    
                  }
               ],
               function(err, samples, strain_parent_ops){
                  res.view('sampleorigin/edit', { 
                     sampleorigin : result, 
                     samples : samples, 
                     sample_parent_option_list : strain_parent_ops 
                  });             
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
            Sample.findWithNames({}, function(err, samples){
               next(null, samples);
            });               
         },
         function(samples, next) {
            HTMLHelper.optionList(Strain, 'id', 'name', { sort : 'name'  }, function(strain_parent_ops){
               next(null, samples, strain_parent_ops);
            });                    
         }
      ],
      function(err, samples, strain_parent_ops){     
         res.view('sampleorigin/new', { samples : samples, sample_parent_option_list : strain_parent_ops });             
      });
   },
  'list' : function(req, res) {
  
      var offset = parseInt(req.query.offset || 0);
      var limit  = parseInt(req.query.limit  || 25);
      var currentPage = parseInt(req.query.page || 1);
      var cond   = Search.getFilter(req, 'sampleorigin');
      
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
            
            SampleOrigin.findWithNames({ sample : req.query.sample, where : cond.where }, function(err, results){
               next(null, results);
            });         
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               SampleOrigin.findWithNames({limit: limit, offset: offset, sample : req.query.sample, where : cond.where },function(err, results){                
                  
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
            res.view('sampleorigin/list', { origins : results, pagination : info });
         }
      );
  }

  
};
