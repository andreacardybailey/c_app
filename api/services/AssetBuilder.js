var PDFObject = require('./AssetBuilder/PDFObject2')
   ,ChartObject = require('./AssetBuilder/ChartObject')
   ,QRObject = require('./AssetBuilder/QRObject');

exports.generate = function(outputAsset, outputSize, inputData, inputOptions, next) {

   var outputAsset = String(outputAsset).toUpperCase();
   var outputSize  = String(outputSize).toUpperCase();

   switch(outputAsset) {
   
      case 'PDF':
         var doc = new PDFObject(outputSize, inputData, inputOptions);
      break;
      
      case 'CHART':
         var doc = new ChartObject('png', inputData, inputOptions);
      break;
      
      case 'QRCODE' : 
          var doc = new QRObject(null, inputOptions);
      break;
   }
   
   doc.build(function(buffer, filePath){   
      next(buffer, filePath);   
   });

}