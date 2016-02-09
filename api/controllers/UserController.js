/**
 * UserController
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
   * (specific to UserController)
   */
  _config: {},
  
  'profile' : function(req, res) {
      var id  = req.session.user.id;
      
      if(!id)
      {
         res.send('Entry cannot be found');
      }
      else
      {            
         User.findOne(id).done(function(err, result){
            if(result)
            {
               var ops = '';
               
               res.locals.currentId = result.id;
               
               HTMLHelper.optionList(Facility, 'id', 'name', { sort : 'name', selected: result.facility_id }, function(ops){
                  res.view('user/profile', { user: result, facility_option_list : ops });  
               });
            }
            else
            {
               res.send('Entry cannot be found');
            }
         }); 
      }
  },
  'edit' : function(req, res) {
      var id  = req.param('id');
      
      if(!id)
      {
         res.send('Entry cannot be found');
      }
      else
      {            
         User.findOne(id).done(function(err, result){
            if(result)
            {
               var ops = '';
               
               res.locals.currentId = result.id;
               
               HTMLHelper.optionList(Facility, 'id', 'name', { sort : 'name', selected: result.facility_id }, function(ops){
                  res.view('user/edit', { user: result, facility_option_list : ops });  
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
  
      if(req.session.user.hasPermission('users.create'))
      {     
         var ops = '';
         
         HTMLHelper.optionList(Facility, 'id', 'name', { selected : req.query.facility || null, sort : 'name' }, function(ops){
            res.view('user/new', { facility_option_list : ops });  
         });   
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
      var atts   = Object.keys(sails.models.user.attributes).map(function(item){ return 'users.'+item });
      var cond   = Search.getFilter(req, 'user');
      
      console.log(cond);
      
      switch(dir)
      {
         case 'asc': case 'desc':
         break;
         
         default:
            dir = 'asc';
         break;
      }
      
      if(-1 == _.indexOf(atts, sort)) {
         sort = 'users.id';
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
      var scope = User.find();
      
      if(false == req.session.user.hasPermission('facilities.create'))
      {
         scope.where({ facility_id : req.session.user.facility_id });
      }

      scope.where(cond.where);
   
      async.waterfall([
         function(next) {
            
            scope.exec(function(err, results){
               next(null, results);
            });  
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               scope.limit(limit).skip(offset).sort(sort).exec(function(err, results){               
                  
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
            res.view('user/list', { users : results, pagination : info });
         }
      );
  }

  
};
