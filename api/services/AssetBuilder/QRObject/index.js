var qrcode = require('qr').Encoder,
   path = require('path'),
   exec = require('child_process').exec;

var QRObject = function(outputSize, inputOptions) {

   this.inputOptions = inputOptions || {};
   this.outputSize = outputSize || {}; // not used just yet
   
}

QRObject.prototype.build = function(next) {

   var self     = this;
   var tmpName  = 'qr' + ((new Date()).getTime()) + '.png';
   var pngPath  = path.join(UPLOAD_PATH, tmpName);
   var defaults = { encodeURL : '' };
   var options  = _.extend(defaults, self.inputOptions);
   var encoder  = new qrcode();
   
   encoder.on('end', function(){
   
      // need to convert to 24-bit to work with PDF   
      var cmd = [ '/usr/bin/gm', 'convert', pngPath, '-colorspace RGB', 'png24:' + pngPath ];
   
      var clean = exec(cmd.join(' '), function(err, stdout, stderr) {
      
         //console.log('stdout: ' + stdout);
         //console.log('stderr: ' + stderr);
         
         next(pngPath);
      
      });
   });   
      
   encoder.encode(options.encodeURL, pngPath, { level : 'M', foreground_color : '#e04810', background_color : '#FFFFFF', dot_size : 5 });

}

module.exports = QRObject;