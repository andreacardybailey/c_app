/**
 * UploadController
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
 
var path = require('path')
,fs = require('fs')
,async = require('async');
 
module.exports = {    
  
  create : function(req, res) {
  
      var name = req.param('name');
      var file = {};
      var dir = path.join(__dirname, '/../../.tmp/public/uploads');
      var accept = [ /jp(e)?g/, /gif/, /png/ ];
      var valid = false;
      
      for(var upload in req.files)
      {   
         file.name = path.basename(req.files[upload].path);
         file.size = req.files[upload].size,
         file.type = req.files[upload].headers['content-type'];
         file.path = '/uploads/'+file.name;
         file.img  = '<img src="'+file.path+'"/>';
         file.process = req.param('process');         
      }
      
      // validate file types
      accept.forEach(function(expr){         
         if(String(file.type).match(expr)) {
            valid = true;
         }
      });
      
      if(!valid)
      {
         var err = 'Invalid file type uploaded.';
         return res.send('<script>parent.App.uploads.processes.'+file.process+'.error('+JSON.stringify(err)+');</script>'); 
      }
       
      // waterfall to move uploaded file  
      async.waterfall([
         function(next) 
         {
            if(false == fs.existsSync(dir))
            {
               fs.mkdir(dir, 0777, function(err){
                  next(err);
               });
            }
            else
            {
               next(null);
            }            
         },
         
         function(next)
         {
            var newPath = dir +'/' + file.name;
         
            // move file into public temp folder
            fs.rename(req.files[upload].path, newPath, function (err, data) {
            
               Image.resize(newPath, file.name.replace(/\./, '_small.'), 'fit', '400x400', function (err, dest){  
                  
                   file.name = path.basename(dest);  
                   file.preview = '/uploads/'+file.name;
                                                
                   next(err, file);                  
               });
            });             
         }         
      
      ], function(err, file){
      
         if(err)
         {
            return res.send('<script>parent.App.uploads.processes.'+file.process+'.error('+JSON.stringify(err)+');</script>'); 
         }
         else
         {
            // send file data
            return res.send('<script>parent.App.uploads.processes.'+file.process+'.success('+JSON.stringify(file)+');</script>'); 
         }                 
      });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UploadController)
   */
  _config: { blueprints: { actions: false } }

  
};
