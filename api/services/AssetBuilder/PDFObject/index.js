var pdf   = require('pdfkit')
   ,path  = require('path')
   ,d3    = require('d3')
   ,fs    = require('fs');
    
var PDFObject = function(outputSize, inputData, inputOptions) {

   this.inputOptions = inputOptions;
   this.outputSize = outputSize; // not used just yet
   this.inputData = inputData;
}

PDFObject.prototype.build = function(next) {

   var self   = this;
   var fonts  = path.join(APPLICATION_PATH, 'assets','styles','fonts');
   var images = path.join(APPLICATION_PATH, 'assets','images');

   var FONT_NORMAL = path.join(fonts,'lato-regular-webfont.ttf');
   var FONT_BOLD   = path.join(fonts,'lato-bold-webfont.ttf');
   
   var defaults = {
      chartPath  : path.join(images, 'svg.png'),
      samplePath : path.join(images, 'sample.jpg'),
      platePath  : path.join(images, 'plate.png'),
      qrPath     : path.join(images, 'qrcode.png'),
      cannatest  : path.join(images, 'cannatest.png'),
      cannabidata : path.join(images, 'cannabidata.png'),
      logo : path.join(images, 'delta.png')
   };
   
   self.inputOptions = _.extend(defaults, self.inputOptions);

   var doc = new pdf({ info : {
         'Title' : 'Cannabidata Test Results',
         'Author' : 'Cannabidata'
      },
      margins : { top : 10, left: 10, bottom: 10, right : 10 },
      size : 'letter' 
   });
   
   
   // header bar
   doc.roundedRect(10, 10, 592, 90, 4)
      .fill('#E79D2E')
      .stroke();
      
   // watermark
   // doc.image(path.join(APPLICATION_PATH, 'assets', 'images', 'watermark.png'), 160, 0, { width: 250, height: 150 });
      
   // sample name and type
   doc.fontSize(24).font(FONT_BOLD)
      .fillColor('#FFFFFF')
      .text(self.inputData.NAME + ' ' || '', 30, 40, { lineBreak : false })
      .font(FONT_NORMAL)
      .text('- ' + (self.inputData.TYPE || ''))
      .stroke();
      
   // logo image
   doc.image(self.inputOptions.logo, 395, 34, { width: 187, height: 38 });

      
   // sample image
   doc.image(self.inputOptions.samplePath, 10, 110, { width: 140, height: 140 })
      .roundedRect(10, 110, 140, 140, 4 )
      .lineWidth(4)
      .fillColor('transparent')
      .strokeColor('#FFFFFF')
      .stroke();

      
   // plate image
   doc.image(self.inputOptions.platePath, 10, 260, { width: 140, height: 380 })
      .roundedRect(10, 260, 140, 450, 4 )
      .lineWidth(4)
      .fillColor('transparent')
      .strokeColor('#FFFFFF')
      .stroke();
      
      
   // qr image
   // doc.image(self.inputOptions.qrPath, 290, 383, { width: 160, height: 160 });
   
   // chart image
   doc.image(self.inputOptions.chartPath, 168, 262, { width: 420, height: 375 });

   var headers = {
      CBD : { color : '#dd6b00' }, 
      CBN : { color : '#d8889c' }, 
      THC : { color : '#9C2112' },
      THCV: { color : '#E04800' },
      CBG : { color : '#E89D12' },
      CBC : { color : '#D15F7B' }
   };

   var width = 440 / Object.keys(headers).length;
   var marginRight = 3;
   
   var i = 0;
   
   // build table-like view for headers and data
   for(var name in headers) {
   
      // find position left based on starting left
      // and calculated width
      var left = (161 + (i * width)); 
   
      // thead
      doc.roundedRect(left, 110, width - marginRight, 25, 3)
         .lineWidth(1)
         .fillAndStroke(headers[name].color, '#FFFFFF')
         .stroke();
         
      // tcell
      doc.strokeColor('#FFFFFF')
         .lineWidth(1)
         .roundedRect(left + 1 , 137, width - marginRight - 1, 25, 3)
         .fillAndStroke('#FFFFFF', headers[name].color)
         .stroke();
         
      // thead text
      doc.fontSize(12)
         .fillColor('#FFFFFF')
         .font(FONT_NORMAL)
         .text(name, left, 115, { width : width - marginRight, align: 'center' })
         .stroke(); 
         
      // tcell text
      doc.fontSize(12)
         .fillColor('#666666')
         .font(FONT_NORMAL)
         .text((self.inputData[name] ? self.inputData[name].toFixed(1) : '0.00') + '%', left, 142, { width : width - marginRight, align: 'center' })
         .stroke();         
      
      i++;
   
   }
   
   var metaTop = 180;
   var lineHeight = 18;
   
   // meta data
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#666666')
      .text('Date Tested : ', 160, metaTop, { align: 'left', lineBreak : false })
      .font(FONT_NORMAL)
      .text(' ' + (self.inputData.DATE || 'Unknown'));
   
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#666666')
      .text('Supplier : ', 160, metaTop + (1 * lineHeight), { align: 'left', lineBreak : false })
      .font(FONT_NORMAL)
      .text(' ' + (self.inputData.SUPPLIER || 'Unknown'));
      
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#666666')
      .text('Location : ', 160, metaTop + (2 * lineHeight), { align: 'left', lineBreak : false })
      .font(FONT_NORMAL)
      .text(' ' + (self.inputData.LOCATION || 'Unknown'))
      .stroke();
      
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#666666')
      .text('Lab : ', 160, metaTop + (3 * lineHeight), { align: 'left', lineBreak : false })
      .font(FONT_NORMAL)
      .text(' ' + (self.inputData.LAB || 'Unknown'))
      .stroke();
      
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#666666')
      .text('Environment : ', 430, metaTop, { align: 'right', lineBreak : false })
      .font(FONT_NORMAL)
      .text(' '+(self.inputData.ENV || 'Unknown'))
      .stroke();
      
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#666666')
      .text('Grow Medium : ', 430, metaTop + (1 * lineHeight), { align: 'right', lineBreak : false })
      .font(FONT_NORMAL)
      .text(' '+(self.inputData.GROW || 'Unknown'))
      .stroke();
      
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#666666')
      .text('Days Flowered : ', 430, metaTop + (2 * lineHeight), { align: 'right', lineBreak : false })
      .font(FONT_NORMAL)
      .text(' '+(self.inputData.VEGGED || 'Unknown'))
      .stroke();
      
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#666666')
      .text('Smell/Aroma : ', 430, metaTop + (3 * lineHeight), { align: 'right', lineBreak : false })
      .font(FONT_NORMAL)
      .text(' '+(self.inputData.SMELL || 'Unknown'))
      .stroke();
      
   // cannatest image
   doc.image(self.inputOptions.cannatest, 130, 685, { width: 174, height: 50 });
      
   // cannabidata image
   doc.image(self.inputOptions.cannabidata, 320, 682, { width: 200, height: 50 });          
      
      
   doc.fontSize(12).font(FONT_NORMAL)
      .fillColor('#666666')
      .text('© '+(new Date()).getFullYear()+' Cannatest, LLC. All rights reserved', 10, 735, { width: 602, align: 'center', lineBreak : false })
      .stroke();
      
      
   doc.output(function(buffer) {   
      next(buffer, null);      
   });
}

module.exports = PDFObject;
