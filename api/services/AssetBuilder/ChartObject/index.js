var d3    = require('d3')
   ,path  = require('path')
   ,jsdom = require('jsdom')
   ,fs    = require('fs')
   ,svg2png = require('svg2png')
   ,FunnelChart = require('./FunnelChart');
   
   
var ChartObject = function(outputFormat, inputData, inputOptions) {

   this.outputFormat = outputFormat; 
   this.inputOptions = inputOptions;
   this.inputData = inputData;

}

ChartObject.prototype.build = function(next) {

   var self  = this;

   jsdom.env(
     "<html><body></body></html>",
     [ ],
     
     function (err, window) {
     
         window.d3 = d3;
         
         window.d3.select("body").html('');
         
         var colors = {
            CBD : '#dd6b00', 
            CBN : '#d8889c', 
            THC : '#9C2112',
            THCV: '#E04800',
            CBG : '#E89D12',
            CBC : '#D15F7B' 
         };
         
         var sorted = [];
         var cols = Object.keys(colors);
         
         /*
         for(var key in colors) {
            sorted.push([ 
               key, 
               parseFloat(self.inputData[key] || 0), 
               colors[key] 
            ]);
         }*/
         
         
         // we need to sort data largest to smallest         
         for(var key in self.inputData) {
         
            if( cols.indexOf(key) > -1) {
               sorted.push([ 
                  key, 
                  self.inputData[key] ? parseFloat(self.inputData[key]) : 0, 
                  colors[key] 
               ]);
            }
         }
         
         // if we want to sort by values
         sorted.sort(function(a,b) { return b[1] - a[1] });

         var chart = new FunnelChart(sorted, 550, 346, 1/2);
         
         chart.draw(window, 'body', function(svgXml){
         
            svgXml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + svgXml;
               
            // we can send back SVG or PNG
            if(self.outputFormat && self.outputFormat == 'png')
            {
               var tmpPath = UPLOAD_PATH;
               var tmpName = (new Date()).getTime();
               var svgFile = path.join(tmpPath, tmpName + '.svg');
               var pngFile = path.join(tmpPath, tmpName + '.png');
               
               // write SVG data to temp file
               fs.writeFile(svgFile, svgXml, function(err) {
   
                  // run SVG to PNG Converter - this is crazy biz!
                  svg2png(svgFile, pngFile, function (err) {
                  
                     // remove SVG file
                     fs.unlink(svgFile, function(err){                     
                        fs.readFile(pngFile, 'utf8', function (err, data) {
                           next(data, pngFile)
                        });
                     });
                  });
               
               });
            }
            else
            {            
               next(svgXml); 
            }
         
         });
      }
   );
}

module.exports = ChartObject;