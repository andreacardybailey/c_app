/**
 * FacilityController
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
   * (specific to FacilityController)
   */
  _config: {},
  
  'edit' : function(req, res) {
      var id  = req.param('id');
      
      if(req.session.user.hasPermission('facilities.create'))
      {      
         if(!id)
         {
            res.send('Entry cannot be found');
         }
         else
         {            
            Facility.findOne(id).done(function(err, result){
               if(result)
               {
                  res.locals.currentId = result.id;
               
                  res.view('facility/edit', { 
                     facility : result,  
                     states : HTMLHelper.stateList(), 
                     timezones : HTMLHelper.timezoneList('US') 
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
  'new' : function(req, res) {
  
      if(req.session.user.hasPermission('facilities.create'))
      {     
         res.view('facility/new', { states : HTMLHelper.stateList(), timezones : HTMLHelper.timezoneList('US') });  
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
      var sort   = req.query.sort || 'id';
      var dir    = req.query.dir  || 'asc';
      var atts   = Object.keys(sails.models.facility.attributes).map(function(item){ return 'facilities.'+item });
      var cond   = Search.getFilter(req, 'facility');
      
      switch(dir)
      {
         case 'asc': case 'desc':
         break;
         
         default:
            dir = 'asc';
         break;
      }
      
      if(-1 == _.indexOf(atts, sort)) {
         sort = 'facilities.id';
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
            
            Facility.find(cond).exec(function(err, results){
               next(null, results);
            });  
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               Facility.find(cond).limit(limit).sort(sort).skip(offset).exec(function(err, results){               
                  
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
            res.view('facility/list', { facilities : results, pagination : info });
         }
      );
  }

  
};
