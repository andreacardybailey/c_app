/**
 * SampleController
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
   * (specific to SampleController)
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
         Sample.findOne(id).done(function(err, result){
         
            if(result)
            {
            
               async.waterfall([
                  function(next) {
                  
                     Supplier.findWithRequests({},function(err, suppliers){
                        next(null, suppliers)
                     });  
                     
                  },
                  function(suppliers, next) {
                    SeedType.find().done(function(err, seeds){
                        next(null, seeds, suppliers);
                    });
                  },
                  function(seeds, suppliers, next) {
                  
                     SupplierTest.find().where({ supplier_id : result.supplier_id }).exec(function(err, requests){
                        next(null, seeds, suppliers, requests);                     
                     });                  
                  }
               ],
               function(err, seeds, suppliers, requests, samples) {
               
                  if(result.smell) {
                     
                     result.smell = result.smell.split(',');
                  }
                  else
                  {
                     result.smell = [];
                  }
               
                  res.locals.currentId = result.id;
               
                  res.view('sample/edit', { 
                     sample : result, 
                     seeds : seeds,
                     suppliers: suppliers, 
                     requests : requests
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
  
  'new' : function(req, res) {
  
      if(req.session.user.hasPermission('tests.create'))
      {
         var d = new Date();
         
         if(req.query.request) {
         
            async.waterfall([
               function(next) {
                  SupplierTest.findOne(req.query.request).done(function(err, request){
                     next(null, request);                  
                  });               
               },
               function(request, next) {
               
                  var options = {};
                  
                  if(request && request.supplier_id){
                    options.id = request.supplier_id;
                  }                 
                  
                  Supplier.find(options).done(function(err, suppliers){
                     next(null, suppliers, request);
                  });
               },
               function(suppliers, request, next) {
               
                  var options = {};               
               
                  SeedType.find(options).done(function(err, seeds){
                      next(null, seeds, suppliers, request);
                  });
               },
               function(seeds, suppliers, request, next) {
                  SupplierTest.find(req.query.request).done(function(err, requests){
                     next(null, seeds, requests, suppliers, request);
                  });
               }            
            ],
            function(err, seeds, requests, suppliers, request){

               res.view('sample/new', { 
                  seeds  : seeds,
                  suppliers : suppliers,
                  requests : requests
               });             
            });         
         }
         else
         {         
            async.waterfall([
            
               function(next) {
               
                  Supplier.findWithRequests({}, function(err, suppliers){
                     next(null, suppliers)
                  });         
               },
               function(suppliers, next) {
               
                  SeedType.find().done(function(err, seeds){
                      next(null, seeds, suppliers);
                  });
               }],
               function(err, seeds, suppliers) {
      
                  res.view('sample/new', { 
                     seeds: seeds,
                     suppliers : suppliers
                  });
               }
            );
         }
      }
      else
      {
         res.forbidden("You don't have access to this resource");
      }
  },
  'list' : function(req, res) {
  
      var offset = parseInt(req.query.offset || 0);
      var limit  = parseInt(req.query.limit  || 25);
      var currentPage = parseInt(req.query.page || 1);
      var sort   = req.query.sort || 'created';
      var dir    = req.query.dir  || 'desc';
      var atts   = Object.keys(sails.models.sample.attributes).map(function(item){ return 'samples.'+item });
      var cond   = Search.getFilter(req, 'sample');
      
      atts.push('suppliers.name');
      atts.push('samples.name');
      atts.push('facilities.name');
      
      switch(dir)
      {
         case 'asc': case 'desc':
         break;
         
         default:
            dir = 'asc';
         break;
      }
      
      if(-1 == _.indexOf(atts, sort)) {
         sort = 'samples.id';
      }
      
      sort = sort + ' ' + dir;
      
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
      
      var facility = null;
      var request  = null;
      
      if(false == req.session.user.hasPermission('facilities.create'))
      {
         facility = req.session.user.facility_id      
      }      
      
      if(req.query.request && _.isNumber(parseInt(req.query.request))) {
         
         request = req.query.request;
      }
      
      async.waterfall([
         function(next) {
            
            Sample.findWithNames({ facility : facility, request: request, where : cond.where }, function(err, results){
               next(null, results);
            });         
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               Sample.findWithNames({offset : offset, limit : limit, sort : sort, facility: facility, request: request, where : cond.where }, function(err, results){                
                  
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
            res.view('sample/list', { samples : results, pagination : info });
         }
      );
   }
};
