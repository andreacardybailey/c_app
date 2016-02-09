var pdf   = require('pdfkit')
   ,path  = require('path')
   ,d3    = require('d3')
   ,fs    = require('fs');
    
var PDFObject2 = function(outputSize, inputData, inputOptions) {

   this.inputOptions = inputOptions;
   this.outputSize = outputSize; // not used just yet
   this.inputData = inputData;
}

PDFObject2.prototype.build = function(next) {

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
      supplierLogo : path.join(images, 'cannatest.png')
   };
   
   self.inputOptions = _.extend(defaults, self.inputOptions);

   var doc = new pdf({ info : {
         'Title' : 'Cannabidata Test Results',
         'Author' : 'Cannabidata'
      },
      margins : { top : 10, left: 10, bottom: 10, right : 10 },
      size : 'letter'   
    });
    
    
    doc.compress = false;    
      
   // sample name and type
   doc.fontSize(30).font(FONT_NORMAL)
      .fillColor('#003e52')
      .text(self.inputData.NAME + ' ' || '', 20, 20, { lineBreak : false })
      .font(FONT_NORMAL)
      .stroke();
      
    // type
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#999999')
      .text('TYPE : ', 20, 65, { lineBreak : false })
      .fillColor('#003e52')
      .text(' ' + (self.inputData.TYPE || '').toUpperCase())
      .stroke();
      
    // date
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#999999')
      .text('DATE TESTED : ', 160, 65, { lineBreak : false })
      .fillColor('#003e52')
      .text(' ' + (self.inputData.DATE || 'Unknown'))
      .stroke();
      
    // UIC
   doc.fontSize(12).font(FONT_BOLD)
      .fillColor('#999999')
      .text('UIC : ', 350, 65, { lineBreak : false })
      .fillColor('#003e52')
      .text(' ' + (self.inputData.UIC || 'Not Supplied'))
      .stroke();
      
   // line
   doc.moveTo(20, 100)
      .lineTo(592, 100)
      .lineWidth(1)
      .strokeColor('#999999')
      .fillColor('#999999')
      .stroke();
      
      
   // sample image
   doc.image(self.inputOptions.samplePath, 20, 190, { width: 275, height: 206 })
      .roundedRect(20, 190, 275, 206, 4 )
      .lineWidth(4)
      .fillColor('transparent')
      .strokeColor('#FFFFFF')
      .stroke();


   // plate image
   doc.image(self.inputOptions.platePath, 20, 410, { width: 140, height: 260 })
      .roundedRect(20, 410, 140, 260, 4 )
      .lineWidth(4)
      .fillColor('transparent')
      .strokeColor('#FFFFFF')
      .stroke();
      
      
   // qr image
   // doc.image(self.inputOptions.qrPath, 290, 383, { width: 160, height: 160 });
   
   // chart image
   doc.image(self.inputOptions.chartPath, 180, 410, { width: 412, height: 260 });

   var headers = {
      CBD : { color : '#dd6b00' }, 
      CBN : { color : '#d8889c' }, 
      THC : { color : '#9C2112' },
      THCV: { color : '#E04800' },
      THCA: { color : '#aa2f22' },
      CBDA: { color : '#BC5C50' },
      CBG : { color : '#E89D12' },
      CBC : { color : '#D15F7B' }
   };

   var width = 575 / Object.keys(headers).length;
   var marginRight = 3;
   
   var i = 0;
   
   // build table-like view for headers and data
   for(var name in headers) {
   
      // find position left based on starting left
      // and calculated width
      var left = (20 + (i * width)); 
   
      // thead
      doc.roundedRect(left, 120, width - marginRight, 25, 3)
         .lineWidth(1)
         .fillAndStroke(headers[name].color, '#FFFFFF')
         .stroke();
         
      // tcell
      doc.strokeColor('#FFFFFF')
         .lineWidth(1)
         .roundedRect(left + 1 , 147, width - marginRight - 1, 25, 3)
         .fillAndStroke('#FFFFFF', headers[name].color)
         .stroke();
         
      // thead text
      doc.fontSize(12)
         .fillColor('#FFFFFF')
         .font(FONT_NORMAL)
         .text(name, left, 125, { width : width - marginRight, align: 'center' })
         .stroke(); 
         
      // tcell text
      doc.fontSize(12)
         .fillColor('#666666')
         .font(FONT_NORMAL)
         .text((self.inputData[name] ? self.inputData[name].toFixed(1) : '0.00') + '%', left, 152, { width : width - marginRight, align: 'center' })
         .stroke();         
      
      i++;
   
   }
   
   var metaTop = 195;
   var lineHeight = 24;
   
   // meta data
  
   doc.fontSize(10).font(FONT_BOLD)
      .fillColor('#999999')
      .text('SUPPLIER', 320, metaTop + (0 * lineHeight), { align: 'left', width: 131 })
      .stroke()      
      .fillColor('#003e52')
      .text(' ' + (self.inputData.SUPPLIER || 'Unknown').toUpperCase(), 451, metaTop + (0 * lineHeight), { align: 'left', width :131})
      .stroke();
      
   // seprator line
   doc.moveTo(320, 208)
      .fillColor('#999999')
      .strokeColor('#999999')
      .lineTo(592, 208)
      .lineWidth(1)
      .stroke();
      
   //--
   
   doc.fontSize(10).font(FONT_BOLD)
      .fillColor('#999999')
      .text('LOCATION', 320, metaTop + (1 * lineHeight), { align: 'left', width: 131 })
      .stroke()      
      .fillColor('#003e52')
      .text(' ' + (self.inputData.LOCATION || 'Unknown').toUpperCase(), 451, metaTop + (1 * lineHeight), { align: 'left', width :131})
      .stroke();
      
   // seprator line
   doc.moveTo(320, metaTop + (2 * lineHeight) - 8)
      .fillColor('#999999')
      .strokeColor('#999999')
      .lineTo(592, metaTop + (2 * lineHeight) - 8)
      .lineWidth(1)
      .stroke();
      
   //--
   
   doc.fontSize(10).font(FONT_BOLD)
      .fillColor('#999999')
      .text('LAB', 320, metaTop + (2 * lineHeight), { align: 'left', width: 131 })
      .stroke()      
      .fillColor('#003e52')
      .text(' ' + (self.inputData.LAB || 'Unknown').toUpperCase(), 451, metaTop + (2 * lineHeight), { align: 'left', width :131})
      .stroke();
      
   // seprator line
   doc.moveTo(320, metaTop + (3 * lineHeight) - 8)
      .fillColor('#999999')
      .strokeColor('#999999')
      .lineTo(592, metaTop + (3 * lineHeight) - 8)
      .lineWidth(1)
      .stroke();
      
   //--
   
   doc.fontSize(10).font(FONT_BOLD)
      .fillColor('#999999')
      .text('ENVIRONMENT', 320, metaTop + (3 * lineHeight), { align: 'left', width: 131 })
      .stroke()      
      .fillColor('#003e52')
      .text(' ' + (self.inputData.ENV || 'Unknown').toUpperCase(), 451, metaTop + (3 * lineHeight), { align: 'left', width :131})
      .stroke();
      
   // seprator line
   doc.moveTo(320, metaTop + (4 * lineHeight) - 8)
      .fillColor('#999999')
      .strokeColor('#999999')
      .lineTo(592, metaTop + (4 * lineHeight) - 8)
      .lineWidth(1)
      .stroke();
      
   //--
   
   
   doc.fontSize(10).font(FONT_BOLD)
      .fillColor('#999999')
      .text('GROW MEDIUM', 320, metaTop + (4 * lineHeight), { align: 'left', width: 131 })
      .stroke()      
      .fillColor('#003e52')
      .text(' ' + String(self.inputData.GROW || 'Unknown').toUpperCase(), 451, metaTop + (4 * lineHeight), { align: 'left', width :131})
      .stroke();
      
   // seprator line
   doc.moveTo(320, metaTop + (5 * lineHeight) - 8)
      .fillColor('#999999')
      .strokeColor('#999999')
      .lineTo(592, metaTop + (5 * lineHeight) - 8)
      .lineWidth(1)
      .stroke();
      
   //--
   
   doc.fontSize(10).font(FONT_BOLD)
      .fillColor('#999999')
      .text('DAYS FLOWERED', 320, metaTop + (5 * lineHeight), { align: 'left', width: 131 })
      .stroke()      
      .fillColor('#003e52')
      .text(' ' + String(self.inputData.VEGGED || 'Unknown').toUpperCase(), 451, metaTop + (5 * lineHeight), { align: 'left', width :131})
      .stroke();
      
   // seprator line
   doc.moveTo(320, metaTop + (6 * lineHeight) - 8)
      .fillColor('#999999')
      .strokeColor('#999999')
      .lineTo(592, metaTop + (6 * lineHeight) - 8)
      .lineWidth(1)
      .stroke();
      
   //--
   
   doc.fontSize(10).font(FONT_BOLD)
      .fillColor('#999999')
      .text('SMELL', 320, metaTop + (6 * lineHeight), { align: 'left', width: 131 })
      .stroke()      
      .fillColor('#003e52')
      .text(' ' + String(self.inputData.SMELL || 'Unknown').toUpperCase(), 451, metaTop + (6 * lineHeight), { align: 'left', width :131})
      .stroke();
      
   // seprator line
   doc.moveTo(320, metaTop + (7 * lineHeight) - 8)
      .fillColor('#999999')
      .strokeColor('#999999')
      .lineTo(592, metaTop + (7 * lineHeight) - 8)
      .lineWidth(1)
      .stroke();
      
   //--
   
   // seprator line
   doc.moveTo(20, 690)
      .fillColor('#999999')
      .strokeColor('#999999')
      .lineTo(592, 685)
      .lineWidth(1)
      .stroke();
      
      
   // cannatest image
   doc.image(self.inputOptions.cannatest, 472, 695, { width: 121, height: 35 });
      
   // cannabidata image
   doc.image(self.inputOptions.cannabidata, 20, 697, { width: 120, height: 30 });          
      
      
   doc.fontSize(12).font(FONT_NORMAL)
      .fillColor('#999999')
      .text('© '+(new Date()).getFullYear()+' Cannatest, LLC. All rights reserved', 10, 735, { width: 602, align: 'center', lineBreak : false })
      .stroke();
      

   // logo image
   
   if(!self.inputOptions.supplierLogo){   
      self.inputOptions.supplierLogo = path.join(images, 'cannatest.png');
    }
    
    Image.identify(self.inputOptions.supplierLogo, function(err, data){    
    
      var wm = 150;
      var hm = 38;
      var nh = 38;
      var nw = 150;
      var lt = 432;
      
      if(!err && data.size && data.size != '') {
      
        var dims = data.size.split('x')
        ,w = parseInt(dims[0])
        ,h = parseInt(dims[1])
        ,scale = 1;
        
        if(w > wm) {
          scale = wm / w;  
        }
        
        if(h > hm) {
          scale = hm / h;
        }
        
        nw = w * scale;
        nh = h * scale;
        
        if(nw < w) {
          lt = lt + (wm - nw);
        }
      
      } else {
        self.inputOptions.supplierLogo = path.join(images, 'cannatest.png');
      }
      
      doc.image(self.inputOptions.supplierLogo, lt, 24, { width: nw, height: nh });
      
      doc.output(function(buffer) {   
        next(buffer, null);      
      });
    
  });
   

   
   
   /*
   var exec = require('child_process').exec;
   
   var src  = '/tmp/'+(new Date()).getTime() + 'S.pdf'; 
   var dest = '/tmp/'+(new Date()).getTime() + 'D.pdf';   
      
   doc.write(src, function(err) {   
   
      var cmd = [ '/usr/bin/ps2pdf', '-dPDFSETTINGS=/prepress', src, dest ];
   
      //var cmd = [ '/usr/bin/qpdf', '--min-version=1.4', '--qdf', src, dest ];
   
      exec(cmd.join(' '), function(err, stdout, stderr) {
        
        fs.readFile(dest, function(err, data) {
        
          next(data, null);
        
        });
      });
   });*/
    
   
}

module.exports = PDFObject2;
