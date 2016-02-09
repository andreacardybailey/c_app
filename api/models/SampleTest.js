/**
 * Facility
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
 
var path  = require('path')
   ,fs = require('fs')
   ,statuses = ['INITIATED','IN PROGRESS','READY FOR REVIEW', 'ON HOLD','CANCELLED','ACCEPTED','EXPIRED'];

module.exports = {

   adapter : 'mysql-default',
   migrate : 'safe',
   tableName : 'sample_tests',
   autoCreatedAt : false,
   autoUpdatedAt : false,
   
   beforeCreate : function(values, next) {
   
      if(values.date == null)
      {
         values.date = new Date();
      }
   
      values.created = new Date();   
      
     
     
      // store schema revision with new test
      Schema.findLatestRevision(values.schema_id, function(err, revision){   
         
          values.schema_revision = revision;

          // establish progress based on certain fields
          var progress = 25;          
          var results = JSON.parse(values.results);
          
          SampleTest.progressFields.forEach(function(field){
            
             var val = null;
          
             try{
                val = eval('(' + field + ')'); 
             }catch(e) {
                val = null;
             }                      
            
            if(val != null && val != '' && val != 'null') {
              progress += 5;
            }          
          });    
          
          values.progress = progress;   
         
         next();
      });
      
   },
   
   afterCreate : function(values, next) {

      async.waterfall([
      
         function(next) {
         
            CannabidataConfig.updateFromSampleTest(values, function(err){
               next(err);
            })     
         },
         function(next) {
            SampleTest.uploadImages(values, function(){
               next(null);
            }); 
         }
      
      ], function(err) {
         next();
      });
   },
   
   beforeUpdate : function(values, next) {
   
   
      // establish progress based on certain fields
      var progress = 25;      
      var results = typeof values.results == 'string' ? JSON.parse(values.results) : values.results;
      
      SampleTest.progressFields.forEach(function(field){
        
         var val = null;
      
         try{
            val = eval('(' + field + ')'); 
         }catch(e) {
            val = null;
         }                  
        
        if(val != null && val != '' && val != 'null') {
          progress += 5;
        }          
      });    
      
      values.progress = progress;  
      
      next();  
   },
   
   afterUpdate : function(values, next) {
   

      SampleTest.uploadImages(values, function(){
      
        // trigger progress update
        SupplierTest.findOne({id : values.supplier_test_id }).done(function(err, request){
        
          request.save(function(err){                
            next();
          });
          
        });
      });   
    
   },
   beforeValidation : function(values, next) {

      next();
   },
   uploadImages: function(values, next) {
   
      var pub = path.join(__dirname, '/../../.tmp/public');
      var uploads = [];
      var asyncs  = [];
      var data    = values.results;
      
      // gather image uploads
      for(var collection in data) {
      
         for(var key in data[collection]) {
         
            if(String(data[collection][key]).match(/image\:/i)) 
            {
               uploads.push({ collection : collection, key : key});
            }
         }
      }

      if(uploads.length == 0)
      {
         next();
      } 
      else
      {             
         console.log(uploads);
      
         for(var i = 0;i < uploads.length; i++)
         {     
            var element = uploads[i];
            
            // scope this shit
            (function(element){
            
              var name = element.key
              ,collection = element.collection
              ,val  = data[collection][name]
              ,loc  = val.replace(/^image:/,'')
              ,img  = pub + loc
              ,ext  = path.extname(loc).toLowerCase();
            
               // create async upload function for image
               asyncs.push(function(next) {
                  
                  var base = name.toLowerCase();
                  var url  = [ 'v1/tests/', values.id, '/', collection, '/', base, ext].join('');
                  
                  // send file to S3 bucket
                  Amazon.uploadFile(img, url, function(err){ 
                        
                    // reset value to URL
                    data[collection][name] = url;                      
                    next(null);                   
                  }); 
               });
               
               // If images, create additional sizes               
               if(ext.match(/(jpe?g|gif|png)$/i)) {
               
                 // create async upload function for small image
                 asyncs.push(function(next) {
                    
                    var base = name.toLowerCase() + '_small' + ext;
                    var url  = [ 'v1/tests/', values.id, '/', collection, '/', base].join('');
                    
                    Image.resize(img, base, 'fit', '400x400', function(err,dest){
                    
                      // send file to S3 bucket
                      Amazon.uploadFile(dest, url, function(err){ 
                       
                         fs.unlink(dest, function(err){                           
                            next(null);
                         });
                      }); 
                    });
                 });
                 
                 // create async upload function for preview image
                 asyncs.push(function(next) {
                    
                    var base = name.toLowerCase() + '_preview' + ext
                    var url  = [ 'v1/tests/', values.id, '/', collection, '/', base].join('');
                    
                    Image.resize(img, base, 'fit', '200x200', function(err, dest){
                    
                      // send file to S3 bucket
                      Amazon.uploadFile(dest, url, function(err){ 
                       
                         fs.unlink(dest, function(err){                           
                            next(null);
                         });
                      }); 
                    });
                 });
               }    
               
               // delete original file
               asyncs.push(function(next){
                  fs.unlink(img, function(err){ 
                    next(null);
                  });
                });               
                          
            })(element);
         }
     
         // call async upload
         async.waterfall(asyncs, function(err) {
           
            // finally save the new data
            SampleTest.findOne(values.id).done(function(err, test){
            
               test.results = data;
               
               test.save(function(err){
                  next();
               });
            });  
         }); 
      }
   },
   
   attributes: {
   	id : {
   	  type : 'integer'
   	},
   	date : {
   	  type : 'date',
   	  required : true,
   	  date : true
   	},
   	status : {
   	  type : 'string',
   	  in : statuses,
   	  defaultsTo : 'INITIATED'
   	},
   	facility_id : {
   	  type : 'integer',
   	  required : true,
   	  number : true
   	},
   	schema_id : {
   	  type : 'integer',
   	  required : true,
   	  number : true   	
   	},
   	schema_revision : {
   	  type : 'integer'
   	},
   	technician_id : {
   	  type : 'integer',
   	  required : true,
   	  number : true   	
   	},
   	supplier_id : {
   	  type : 'integer',
   	  required : true,
   	  number : true   	
   	},
   	supplier_test_id : {
   	  type : 'integer',
   	  required : true,
   	  number : true   	
   	},
   	sample_id : {
   	  type : 'integer',
   	  required : true,
   	  number : true   	
   	},
   	uic : {
   	  type : 'string'
   	},
   	progress : {
   	  type : 'decimal',
   	  defaultsTo : 25
   	},
   	results : {
   	  type : 'json'
   	},
   	created : {
   	  type : 'datetime'
   	}   
   },
   searchFields : {
      'ID'       : 'sample_tests.id',
      'Supplier' : 'suppliers.name',
      'Sample'   : 'samples.name',
      'Sample ID' : 'sample_tests.sample_id',
      'Status'   : {
        field : 'sample_tests.status',
        lookup :  statuses
      },
      'Created'     : {
        field : 'sample_tests.created',
        format  : 'date'
      }
   },
   progressFields : [
      'results.environment.sample_weight',
      'results.environment.load_size',
      'results.environment.expected_range',
      'results.environment.lab_temperature',
      'results.environment.lab_humidity',
      'results.environment.decarb_lane',
      'results.environment.plate_image',
      'results.results.cbd',
      'results.results.cbn',
      'results.results.thc',
      'results.results.thcv',
      'results.results.thca',
      'results.results.cbda',
      'results.results.cbg',
      'results.results.cbc'      
  ],
   findWithNames : function(options, next){
   
      var defaults = { offset : null , limit : null , sort : 'sample_tests.date DESC', facility : null, where : {} };
      var where = [];
      var params = [];
      
      _.extend(defaults, options);
   
      var query = "SELECT \
         sample_tests.*, \
         suppliers.name as supplier_name, \
         suppliers.city as city, \
         samples.name as sample_name \
      FROM sample_tests \
      INNER JOIN suppliers ON suppliers.id = sample_tests.supplier_id \
      INNER JOIN samples ON samples.id = sample_tests.sample_id ";
      
      if(defaults.facility){
        where.push(' sample_tests.facility_id = ?');
        params.push(defaults.facility);
      }
      
      if(defaults.where){
      
        for(var field in defaults.where){
        
          var operator = Object.keys(defaults.where[field])[0];
          var value = defaults.where[field][operator];
        
          if(operator == 'contains'){
          
            where.push(' '+ field + " LIKE '%" + value.replace(/\%/g,'%%').replace(/\'/g,"\\'") + "%' ");
            
          } else {
          
            where.push(' '+ field + ' ' + operator + "?");
            params.push( value );
          }
        }
      }
      
      if(where.length > 0){
        query += ' WHERE ' + where.join(' AND ');
      }
      
      query += ' ORDER BY ' + defaults.sort
      
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      console.log(query);
      
      SampleTest.query(query, params, function(err, results){      
         next(err, results);
      });
   },
   findWithFullData : function(options, next) {

      var defaults = { offset : null , limit : null , id : null, sort : 'sample_tests.id ASC'};
      var where = [];
      
      // if options is an id
      if(_.isNumber(parseInt(options))) {
      
         _.extend(defaults, {id : options});
      }
      else {      
         _.extend(defaults, options);
      }
   
      var query = "SELECT \
         sample_tests.*, \
         suppliers.id as supplier_id, \
         suppliers.name as supplier_name, \
         suppliers.city as supplier_city, \
         suppliers.state as supplier_state, \
         suppliers.country as supplier_country, \
         suppliers.logo as supplier_logo, \
         samples.name as sample_name, \
         samples.type as sample_type, \
         samples.concentrate as sample_concentrate, \
         samples.extraction as sample_extraction, \
         samples.species as sample_species, \
         samples.environment as sample_environment, \
         samples.indica as sample_indica, \
         samples.sativa as sample_sativa, \
         samples.grow_medium as sample_grow_medium, \
         samples.image as sample_image, \
         samples.smell as sample_smell, \
         samples.size as sample_size, \
         samples.yield as sample_yield, \
         samples.sex as sample_sex, \
         samples.pest_resistance as sample_pest_resistance, \
         samples.mildew_resistance as sample_mildew_resistance, \
         samples.maturation as sample_maturation, \
         facilities.name as facility_name \
      FROM sample_tests \
      INNER JOIN suppliers ON suppliers.id = sample_tests.supplier_id \
      INNER JOIN facilities ON facilities.id = sample_tests.facility_id \
      INNER JOIN samples ON samples.id = sample_tests.sample_id ";
      
      if(defaults.id) {
         where.push(' sample_tests.id = ' + defaults.id );      
      }
      
      if(where.length > 0) {
         query += ' WHERE ' + where.join(' AND ');
      }
      
      query += ' ORDER BY ' + defaults.sort;
      
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      SampleTest.query(query, [], function(err, results){      
         next(err, results);
      });   
   
   },
   findOpenTests : function(options, next){
   
      var defaults = { offset : null , limit : null , facility : null, sort : 'sample_tests.date DESC'};
      var where = [];
      
      _.extend(defaults, options);
   
      var query = "SELECT \
         sample_tests.*, \
         suppliers.name as supplier_name, \
         suppliers.city as city, \
         samples.name as sample_name \
      FROM sample_tests \
      INNER JOIN suppliers ON suppliers.id = sample_tests.supplier_id \
      INNER JOIN samples ON samples.id = sample_tests.sample_id ";
      
      if(_.isNumber(defaults.faciity)) {
         where.push('sample_tests.facility_id = '+defaults.facility);      
      }
      
      where.push("sample_tests.status IN ('INITIATED','IN PROGRESS')");
      where.push("sample_tests.progress < 100");      

      query += ' WHERE '+where.join(' AND ');

      query += ' ORDER BY ' + defaults.sort
      
      if(options.limit != null && options.offset != null)
      {
         query += ' LIMIT '+options.offset+','+options.limit;
      } 
      else if(options.limit != null && options.offset == null)
      {
         query += ' LIMIT '+options.offset;
      }
      
      SampleTest.query(query, [], function(err, results){      
         next(err, results);
      });
   },
   buildShareDocument : function(test, next) {
      
      var findResultValue = function(domain) {
      
         var val = null;
      
         try{
            val = eval('(' + domain + ')'); 
         
         }catch(e) {
            val = 0.00;
         }
         
         if(val == null) val = '';
         
         return val;
      }
      
      var images = path.join(APPLICATION_PATH, 'assets','images');       
      var defaultLogo = path.join(images, 'cannatest.png')  
      
      // find location
      var location = test.supplier_city;
      
      if(!location) {
        location = test.supplier_state;
      }
      
      if(!location) {
        location = test.supplier_country
      }
      
      if(!location) {
        location = 'Not Specified';
      }

      var inputData =  {
         THCV : findResultValue('test.results.results.thcv'),
         THC  : findResultValue('test.results.results.thc'),
         CBD  : findResultValue('test.results.results.cbd'),
         CBG  : findResultValue('test.results.results.cbg'),
         CBC  : findResultValue('test.results.results.cbc'),
         CBN  : findResultValue('test.results.results.cbn'),
         THCA  : findResultValue('test.results.results.thca'),
         CBDA  : findResultValue('test.results.results.cbda'),
         PLATE : findResultValue('test.results.environment.plate_image').replace(/(\.gif|\.png|\.jpg)/, '_small$1'),
         SAMPLE : test.sample_image.replace(/(\.gif|\.png|\.jpg)/, '_small$1'),
         NAME : test.sample_name,
         TYPE : HTMLHelper.ucfirst(test.sample_type),
         ENV  : HTMLHelper.ucfirst(test.sample_environment),
         SUPPLIER : test.exposeSupplier ? test.supplier_name : 'CAN-' + test.supplier_id,
         LOGO : test.exposeSupplier ? test.supplier_logo : defaultLogo,
         UIC : test.uic,
         SMELL : test.sample_smell ? test.sample_smell.split(/,/)[0] : 'Unknown',
         LOCATION : location,
         LAB : test.facility_name,
         GROW : HTMLHelper.ucfirst(test.sample_grow_medium),
         VEGGED : test.sample_maturation,
         DATE : Globalize.format(test.date, 'yyyy-MM-dd')
      };
   
      async.waterfall([
      
         function(next) {
            
            if(inputData.LOGO && String(inputData.LOGO).match(/^\/\//)) {
            
              var remoteFile = test.supplier_logo.replace(sails.config.imageBase, '');
              var localFile = path.join(UPLOAD_PATH, test.sample_id + '_' + path.basename(test.supplier_logo));
              
              Amazon.getFile(remoteFile, localFile, function(err){
              
                if(err){                
                  next(err);                
                } else {                
                  next(null, localFile);                
                }
                
              });            
            } else {
              next(null, inputData.LOGO);            
            }
        
         },
      
         function(supplierLogo, next){
         
            AssetBuilder.generate('chart', null, inputData, {}, function(buffer, pngPath){
               next(null, supplierLogo, pngPath);
            });
         },
         
         function(supplierLogo, chartImage, next) {
            AssetBuilder.generate('qrcode', null, null, { encodeURL : 'http://app01.canna-test.com/sample/2' }, function(qrPath) {
               next(null, supplierLogo, chartImage, qrPath)
            });
         },
         function(supplierLogo, chartImage, qrPath, next) {
                         
            if(inputData.SAMPLE && inputData.SAMPLE != '') {
               
               var sampleImage = path.join(UPLOAD_PATH, test.sample_id + '_' + path.basename(inputData.SAMPLE));
               
               Amazon.getFile(inputData.SAMPLE, sampleImage, function(err){
               
                  if(err){
                  
                     next(err, supplierLogo, chartImage, qrPath, null);
                     
                  } else {
               
                     var resultName = (new Date()).getTime() + path.basename(sampleImage.replace(/\.gif|\.png/i,'.jpg'));
                  
                     Image.resizeAsJPG(sampleImage, resultName, 'fill', '366x275', function( err, resultPath ){
                     
                        next(err, supplierLogo, chartImage, qrPath, resultPath);
                     
                     });  
                  }                
               });   
               
            } else {
            
               next(null, supplierLogo, chartImage, qrPath, null);
            } 
         },    
         function(supplierLogo, chartImage, qrPath, samplePath, next) {
                         
            if(inputData.PLATE && inputData.PLATE != '') {
               
               var plateImage = path.join(UPLOAD_PATH, test.id + '_' + path.basename(inputData.PLATE));
               
               Amazon.getFile(inputData.PLATE, plateImage, function(err){
               
                  if(err){
                  
                     next(err, supplierLogo, chartImage, qrPath, samplePath, null);
                     
                  } else {
               
                     var resultName = (new Date()).getTime() + path.basename(plateImage.replace(/\.gif|\.png/i,'.jpg'));
                  
                     Image.resizeAsJPG(plateImage, resultName, 'fill', '186x346', function( err, resultPath ){
                     
                        next(err, supplierLogo, chartImage, qrPath, samplePath, resultPath);
                     
                     });  
                  }                
               });   
               
            } else {
            
               next(null, supplierLogo, chartImage, qrPath, samplePath, null);
            } 
         },         
         function(supplierLogo, chartImage, qrcodeImage, sampleImage, plateImage, next){
            
            var images = path.join(APPLICATION_PATH, 'assets','images'); 
            
            var options = { 
               chartPath : chartImage, 
               qrPath : qrcodeImage,
               supplierLogo : path.join(images, 'cannatest.png')            
            };
            
            if(supplierLogo) {
              options.supplierLogo = supplierLogo;
            }
            
            if(sampleImage) {
               options.samplePath = sampleImage;
            }
            
            if(plateImage) {
               options.platePath = plateImage;
            }
         
            AssetBuilder.generate('pdf', 'letter', inputData, options, function(pdfBuffer){
               next(null, supplierLogo, chartImage, qrcodeImage, sampleImage, plateImage, pdfBuffer)
            });    
         }
      
      ],function(err, supplierLogo, chartImage, qrcodeImage, sampleImage, plateImage, pdfBuffer) {
      
         if(err) {
            console.log(err);
         }
      
         fs.unlink(chartImage, function(err){
         
            fs.unlink(qrcodeImage, function(err){
            
               if(sampleImage) {      
                        
                  fs.unlink(sampleImage, function(err){            
                     next(pdfBuffer);
                  });  
                  
               } else {
                  next(pdfBuffer);
               }             
            });            
         });
      }); 
    
   }
};
