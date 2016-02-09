var AWS = require('aws-sdk'),
   path = require('path'),
   fs = require('fs');

exports.uploadFile = function(file, path, next) {

   fs.readFile(file, function (err, data) {
   
      AWS.config.update( sails.config.aws );
      
      var s3 = new AWS.S3({ params : { Bucket: 'img.cannatest.com' }});
      
      s3.client.putObject({
         Key: path,
         ContentType : Amazon.getContentType(file),
         Body: data,
         ACL: 'public-read'
      },function(err, data){
         next(err);
      });             
   });
}


exports.getFile = function(path, file, next){

  AWS.config.update( sails.config.aws );
  
  var s3 = new AWS.S3({ params : { Bucket: 'img.cannatest.com' }});  
  var params = {Key: path};
    
  s3.headObject(params, function(err, data){
  
    fs.exists(file, function(exists) {
    
      if(exists) {
        fs.unlinkSync(file);
      }
  
      if(!err) {  
      
        var stream = require('fs').createWriteStream(file);
        
        console.log('GETTING FILE: '+  path);
        
        stream.on('finish', function(){
        
          console.log('FILE WRITTEN: ' +file);
          
          next();
        });
  
        s3.client.getObject(params).createReadStream().on('end', function(){
  
          console.log('GOT FILE: ' +file);
  
        }).pipe(stream);
  
      } else { 
        next('Resource not found');
      }
    });
  });

};


exports.getContentType = function(file)
{
   var ext = path.extname(file).toLowerCase().substr(1);
   
   var type;

   switch(ext)
   {
      case 'png':
         type = 'image/png';
      break;
      
      case 'gif':
         type = 'image/gif';
      break;   
      
      case 'jpg':            
      case 'jpeg':
         type = 'image/jpeg';
      break;
   }
   
   return type;

}