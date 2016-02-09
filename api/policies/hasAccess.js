/**
 * hasAccess
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function hasAccess(req, res, next) {

   var controller = req.target.controller;
   var id = req.param('id') || req.body.id;
   
   req.session.user = new User._model(req.session.user);
   
   var superAdmin = req.session.user.hasPermission('facilities.create');
   
   if(id){
   
      switch(controller){
      
         case 'accesspoint':
         
            if(req.session.user.hasPermission('access_points.create')) {
               AccessPoint.findOne(id).done(function(err, result){
               
                  if(!result) return res.render('404');
               
                  if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                     return res.forbidden("You don't have access to this resource");
                  } else {
                     return next();
                  }
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }        
         break;
         
         case 'facility':
         
            if(false == req.session.user.hasPermission('facilities.create')) {
               return res.forbidden("You don't have access to this resource");
            } else {
               return next();
            }    
         break;
         
         case 'sample':
         
            if(req.session.user.hasPermission('requests.create')) {
               Sample.findOne(id).done(function(err, result){
                  if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                     return res.forbidden("You don't have access to this resource");
                  } else {
                     return next();
                  }
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }         
         break;
         
         case 'sampleorigin':
         
            if(req.session.user.hasPermission('tests.create')) {
               SampleOrigin.findOne(id).done(function(err, result){
                  Sample.findOne(result.sample_id).done(function(err, result){
                     if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                        return res.forbidden("You don't have access to this resource");
                     } else {
                        return next();
                     }
                  });
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }         
         break;
         
         case 'sampletest':
         
            if(req.session.user.hasPermission('tests.create')) {
               SampleTest.findOne(id).done(function(err, result){
                  if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                     return res.forbidden("You don't have access to this resource");
                  } else {
                     return next();
                  }
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }         
         break;
         
         case 'schema':
         
            if(false == req.session.user.hasPermission('schemas.create')) {
               return res.forbidden("You don't have access to this resource");
            } else {
               return next();
            }         
         break;
         
         case 'strain':
         
            if(false == req.session.user.hasPermission('strains.create') && !superAdmin) {
               return res.forbidden("You don't have access to this resource");
            } else {
               return next();
            }         
         break;
         
         case 'strainorigin':
         
            if(false == req.session.user.hasPermission('strains.create') && !superAdmin) {
               return res.forbidden("You don't have access to this resource");
            } else {
               return next();
            }              
         break;
         
         case 'supplier':
         
            if(req.session.user.hasPermission('suppliers.create')) {
               Supplier.findOne(id).done(function(err, result){
               
                  if(!result) return res.view('404');
               
                  if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                     return res.forbidden("You don't have access to this resource");
                  } else {
                     return next();
                  }
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }         
         break;
         
         case 'suppliercontact':
         
            if(req.session.user.hasPermission('suppliers.create')) {
               SupplierContact.findOne(id).done(function(err, result){
                
                  if(!result) return res.view('404');
               
                  Supplier.findOne(result.supplier_id).done(function(err, result){ 
                  
                     if(!result) return res.view('404');
                  
                     if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                        return res.forbidden("You don't have access to this resource");
                     } else {
                        return next();
                     }
                  });
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }         
         break;
         
         case 'suppliertest':
         
            if(req.session.user.hasPermission('requests.create')) {
               SupplierTest.findOne(id).done(function(err, result){
               
                  if(!result) return res.view('404');
               
                  if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                     return res.forbidden("You don't have access to this resource");
                  } else {
                     return next();
                  }
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }         
         break;
         
         case 'technician':
         
            if(req.session.user.hasPermission('users.create')) {
               Technician.findOne(id).done(function(err, result){
                  
                  if(!result) return res.view('404');
               
                  User.findOne(result.user_id).done(function(err, result){
                    
                     if(!result) return res.view('404');
                  
                     if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                        return res.forbidden("You don't have access to this resource");
                     } else {
                        return next();
                     }
                  });
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }         
         break;
         
         case 'user':
         
            if(req.session.user.id == id){
               return next();
            }
         
            if(req.session.user.hasPermission('users.create')) {
               User.findOne(id).done(function(err, result){
               
                  if(!result) return res.view('404');
               
                  if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                     return res.forbidden("You don't have access to this resource");
                  } else {
                  
                     return next();
                  }
               });
            } else {
               return res.forbidden("You don't have access to this resource");
            }         
         break;
         
         default:
         
          return next();
          
         break;
      
      }
   
   } else {
      return next();
   }

};