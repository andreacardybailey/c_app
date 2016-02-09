/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function isAuthenticated(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller  
  
  if (req.session.authenticated && typeof req.session.user != 'undefined') {

      // bring back user model      
      req.session.user = new User._model(req.session.user);
      
      // load config
      if(false == sails.config.hasOwnProperty('cannabidata'))
      {      
         sails.config.cannabidata = {};
      
         // find config for facility_id
         CannabidataConfig.find().where({facility_id : req.session.user.facility_id }).done(function(err, results){      
            
            // no config in there, we need to build it based on config.persistConfig
            if(results.length == 0) {
            
               // builds config based on config/local.js persistConfig
               CannabidataConfig.buildPersistentConfig(req.session.user.facility_id, function() {
               
                  // assign to global namespace
                  for(var key in sails.config.persistConfig){
                     sails.config.cannabidata[key] = '';
                  }
               
                  next();
               });
            }
            else
            {  
               // config exists, add to global namespace
               results.forEach(function(result){
                  sails.config.cannabidata[result.key] = result.value;
               });   
               
               return next();
            }
         });
      }
      else
      {      
         return next();
      }
  }
  else
  {    
  
     // User is not allowed
     // (default res.forbidden() behavior can be overridden in `config/403.js`)
     return res.redirect('/login?r='+encodeURIComponent(req.path));
   }
};
