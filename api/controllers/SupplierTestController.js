/**
 * SupplierTestController
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
   * (specific to SupplierTestController)
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
         SupplierTest.findOne(id).done(function(err, result){
            if(result)
            {
               HTMLHelper.optionList(Supplier, 'id', ['name','city'], { selected : result.supplier_id, sort : 'name', where : { active : true }  }, function(supplier_ops){
                  
                  res.locals.currentId = result.id;
                  
                  Sample.findWithRequest({ request : result.id }, function(err, samples){
                  
                    res.view('request/edit', { request : result, supplier_option_list : supplier_ops, samples : samples  });
                  
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
  
      HTMLHelper.optionList(Supplier, 'id', ['name','city'], { sort : 'name', where : { active : true }  }, function(supplier_ops){
         
         var d = new Date();
         
         res.view('request/new',  { 
            supplier_option_list : supplier_ops, 
            now : [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-') 
         });
      });
  },
  'list' : function(req, res) {
  
      var offset = parseInt(req.query.offset || 0);
      var limit  = parseInt(req.query.limit  || 25);
      var currentPage = parseInt(req.query.page || 1);
      var sort   = req.query.sort || 'created';
      var dir    = req.query.dir  || 'desc';
      var atts   = Object.keys(sails.models.suppliertest.attributes).map(function(item){ return 'supplier_tests.'+item });
      var cond   = Search.getFilter(req, 'suppliertest');
      
      // add extra columns in query
      atts.push('suppliers.name');
      atts.push('samples.name');
      
      switch(dir)
      {
         case 'asc': case 'desc':
         break;
         
         default:
            dir = 'asc';
         break;
      }
      
      // reset if co
      if(-1 == _.indexOf(atts, sort)) {
         sort = 'supplier_tests.id';
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

      // restrict to logged in facility unless has permission
      var facility = null;
   
      if(false == req.session.user.hasPermission('facilities.create'))
      {
         facility = req.session.user.facility_id;
      }
   
      async.waterfall([
         function(next) {
            
            SupplierTest.findWithSupplierNames({ facility : facility, where : cond.where }, function(err, results){
               next(null, results);
            });         
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               SupplierTest.findWithSupplierNames( { limit : limit, offset : offset, facility : facility, sort : sort, where : cond.where}, function(err, results){                
                  
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
            res.view('request/list', { requests : results, pagination : info });
         }
      );
  }

  
};
