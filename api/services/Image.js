var exec = require('child_process').exec
,spawn = require('child_process').spawn
,path = require('path')
,fs = require('fs');

exports.resize = function(src, name, mode, size, next) {

   var modes = {
      'fit'  : ">",
      'fill'  :"!"
   };

   var guid = String(new Date().getTime())
   ,folder  = path.dirname(src)
   ,mode    = modes[mode] || modes.fit
   ,name    = name || path.basename(src)
   ,dest    = path.join(folder, name)
   ,args     = [  'convert', src, '-colorspace', 'RGB', '-resize', size + mode, dest ];   
   
   var proc = spawn('/usr/bin/gm', args);
   
    proc.stderr.on('data', function (data) {
      if (/^execvp\(\)/.test(data)) {
        // we get here if 'convert' command was not found or could
        // not be executed
        console.log( 'ERROR: failed to start: ' + data );
      } else {
        console.log( 'ERROR: stderr '+ data );
      }
    });
   
   proc.on('close', function(code){
   
      //console.log('stdout: ' + stdout);
      //console.log('stderr: ' + stderr);
      
      next(null, dest);
   
   });
}

exports.identify = function(path, next) {

  var format = '{"size" :"%wx%h", "scenes" : %n, "format" : "%m", "channels" : "%[channels]"}';
  
  var cmd = [ '/usr/bin/gm', 'identify', '-format \''+format+',\'',  path ];
  
  var identify  = exec(cmd.join(' '), function(err, stdout, stderr) {
    
    // console.log('stdout: ' + stdout);
    // console.log('stderr: ' + stderr);    
    
    if(err) throw(err);
    
    // normalize results by removing last comma and trailing spaces
    var str = '[' + stdout.replace(/\s+$/,'').replace(/\,$/,'') + ']';

    // our results can be more than one entry if the object
    // has many scenes (animate GIF, PDF), so just get the first entry
    var details = JSON.parse(str).shift();
    
    var data = {
      file        : path || null,
      type        : details.format || null,
      size        : details.size || null,
      scenes      : details.scenes > 1,
      transparent : details.channels == 'rgba'    
    }
    
    next(err, data);
  
  });

}



exports.pdfToJPG = function(buffer, next) {

   var guid = String(new Date().getTime())
   ,src  = path.join('/tmp', guid) + '.pdf'
   ,dest = path.join('/tmp', guid) + '.jpg'
   ,args  = [ 'convert', '-density', '200', src, dest ];
   

  fs.writeFile(src, buffer, function(err){

    var proc = spawn('/usr/bin/gm', args);
    
    proc.stderr.on('data', function (data) {
      if (/^execvp\(\)/.test(data)) {
        // we get here if 'convert' command was not found or could
        // not be executed
        console.log( 'ERROR: failed to start: ' + data );
      } else {
        console.log( 'ERROR: stderr '+ data  );
      }
    });
   
     proc.on('close', function(code){   

        fs.readFile(dest, function(err, data){
        
          fs.unlink(src, function(err){
            fs.unlink(dest, function(err){
              next(err, data);
            });
          });
          
        });
     });   
   });
};

exports.resizeAsJPG = function(src, name, mode, size, next) {

   var modes = {
      'fit'  : ">",
      'fill'  :"!"
   };

   var guid = String(new Date().getTime())
   ,folder  = path.dirname(src)
   ,mode    = modes[mode] || modes.fit
   ,name    = name || path.basename(src)
   ,dest    = path.join(folder, name)
   ,args    = [ 'convert', src, '-colorspace', 'RGB', '-resize', size + mode, 'JPG:' +  dest ];
   
   console.log('RESIZE TO: ' + dest);
   
   var proc = spawn('/usr/bin/gm', args);
   
    proc.stderr.on('data', function (data) {
      if (/^execvp\(\)/.test(data)) {
        // we get here if 'convert' command was not found or could
        // not be executed
        console.log( 'ERROR: failed to start: ' + data );
      } else {
        console.log( 'ERROR: stderr '+ data  );
      }
    });
   
   proc.on('close', function(code){  
   
      console.log('RESIZED IMAGE: ' + dest);

      next(null, dest);    
   });

};