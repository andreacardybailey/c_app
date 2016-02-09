/**
 * AuthController
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
   * Action blueprints:
   *    `/auth/login`
   */
   login: function (req, res) {
   
      var userEmail = req.param('email');
      var userPass  = req.param('password');
   
      if(userEmail && userPass)
      {
         User.authenticate(userEmail, userPass, function(err, user){
         
            if(!user)
            {
               res.view('home/login', { layout : 'login', message : err });
            }
            else
            {            
               req.session.authenticated = true;
               req.session.user = user;
               
               var r = req.param('r');               
               var loc = (!r || typeof(r) == 'undefined' || r == 'undefined') ? '/' : r;
               
               res.redirect(loc);
            }
         });  
          
      }
      else
      {
         return res.redirect('/');
      }
  },


  /**
   * Action blueprints:
   *    `/auth/logout`
   */
   logout: function (req, res) {
    
    req.session.authenticated = false;
    
    delete(req.session.user);
    
    return res.redirect('/');
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthController)
   */
  _config: {}

  
};
