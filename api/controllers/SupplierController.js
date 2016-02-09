/**
 * SupplierController
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
   * (specific to SupplierController)
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
         Supplier.findOne(id).done(function(err, result){
            if(result)
            {
               res.locals.currentId = result.id;
              
               SupplierType.find().sort('name').done(function(err, types){ 
                
                 res.view('supplier/edit', { 
                  supplier : result, 
                  types : types, 
                  states : HTMLHelper.stateList(), 
                  countries : HTMLHelper.countryList(), 
                  timezones : HTMLHelper.timezoneList() 
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
  
      SupplierType.find().sort('name').done(function(err, types){
      
        res.view('supplier/new', { 
          states : HTMLHelper.stateList(), 
          types : types, 
          countries : HTMLHelper.countryList(), 
          timezones : HTMLHelper.timezoneList() 
        })
        
      });
  

   },
  'list' : function(req, res) {
  
      var offset = parseInt(req.query.offset || 0);
      var limit  = parseInt(req.query.limit  || 25);
      var currentPage = parseInt(req.query.page || 1);
      var sort   = req.query.sort || 'suppliers.name';
      var dir    = req.query.dir  || 'asc';
      var atts   = Object.keys(sails.models.supplier.attributes).map(function(item){ return 'suppliers.'+item });
      var cond   = Search.getFilter(req, 'supplier');
      
      switch(dir)
      {
         case 'asc': case 'desc':
         break;
         
         default:
            dir = 'asc';
         break;
      }
      
      if(-1 == _.indexOf(atts, sort)) {
         sort = 'suppliers.id';
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
   
      async.waterfall([
         function(next) {
            
            Supplier.find(cond).exec(function(err, results){
               next(null, results);
            });         
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               Supplier.find(cond).sort(sort).limit(limit).skip(offset).exec(function(err, results){                
                  
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
            res.view('supplier/list', { suppliers : results, pagination : info });
         }
      );
  }

  
};
