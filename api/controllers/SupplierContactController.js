/**
 * SupplierContactController
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
   * (specific to SupplierContactController)
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
         SupplierContact.findOne(id).done(function(err, result){
            if(result)
            {
               HTMLHelper.optionList(Supplier, 'id', 'name', { selected : result.supplier_id, sort : 'name', where : { active : true }  }, function(supplier_ops){
               
                  res.view('contact/edit', { contact : result,  supplier_option_list : supplier_ops });
               
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
   
      HTMLHelper.optionList(Supplier, 'id', 'name', { selected : req.query.supplier, sort : 'name', where : { active : true }  }, function(supplier_ops){
         res.view('contact/new', { supplier_option_list : supplier_ops })
      });
  
      
   },
  'list' : function(req, res) {
  
      var offset = parseInt(req.query.offset || 0);
      var limit  = parseInt(req.query.limit  || 25);
      var currentPage = parseInt(req.query.page || 1);
      var sort   = req.query.sort || 'id';
      var dir    = req.query.dir  || 'asc';
      var atts   = Object.keys(sails.models.accesspoint.attributes).map(function(item){ return 'access_points.'+item });
      var cond   = Search.getFilter(req, 'suppliercontact');
      
      atts.push('suppliers.name');
      
      switch(dir)
      {
         case 'asc': case 'desc':
         break;
         
         default:
            dir = 'asc';
         break;
      }
      
      if(-1 == _.indexOf(atts, sort)) {
         sort = 'supplier_contacts.id';
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
            
            SupplierContact.findWithNames({ supplier : req.query.supplier }, function(err, results){
               next(null, results);
            });  
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               SupplierContact.findWithNames({ limit : limit, offset : offset, sort: sort, supplier : req.query.supplier }, function(err, results){               
                  
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
            res.view('contact/list', { contacts : results, pagination : info });
         }
      );
  }

  
};
