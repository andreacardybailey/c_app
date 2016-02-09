/**
 * SampleTestController
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

var elasticemail = require('elasticemail');

module.exports = {
    

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SampleTestController)
   */
  _config: {},
  
  'edit' : function(req, res) {
  
      if(false == req.session.user.hasPermission('tests.create'))
      {
         return res.forbidden("You don't have access to this resource");        
      }
  
      var id  = req.param('id');
      
      if(!id)
      {
         res.send('Entry cannot be found');
      }
      else
      {   

         SampleTest.findOne(id).done(function(err, result){
            if(result)
            {
            
               async.waterfall([
                  function(next) {
                  
                     var options = {};
                  
                     if(false == req.session.user.hasPermission('facilities.create')) {
                        options = {facility : req.session.user.facility_id };
                     }
                  
                     Supplier.findWithRequests(options, function(err, suppliers){
                        next(null, suppliers)
                     });  
                     
                  },
                  function(suppliers, next) {
                              
                     Schema.findWithFullName({},function(err, schemas){ 
                        next(null, suppliers, schemas);
                     }); 
                  },
                  function(suppliers, schemas, next) {
                  
                     SupplierTest.find().where({ supplier_id : result.supplier_id }).exec(function(err, requests){
                        next(null, suppliers, schemas, requests);                     
                     });                  
                  },
                  function(suppliers, schemas, requests, next) {
                  
                     Sample.find().where({ supplier_test_id : result.supplier_test_id }).exec(function(err, samples){
                        next(null, suppliers, schemas, requests, samples);                     
                     });                  
                  },
                  function(suppliers, schemas, requests, samples, next) {
                  
                     SchemaRevision.findOne().where({ schema_id : result.schema_id, revision : result.schema_revision }).exec(function(err, schema){
                        
                        Schema.findLatestRevision(result.schema_id, function(err, latest) {
                        
                           next(null, suppliers, schemas, requests, samples, schema, latest);
                        
                        });                                             
                     });                  
                  }
               ],
               function(err, suppliers, schemas, requests, samples, schema, latest) {
               
                  res.locals.currentId = result.id;
               
                  res.view('test/edit', { 
                     test      : result, 
                     suppliers : suppliers, 
                     schemas   : schemas, 
                     requests  : requests, 
                     samples   : samples,
                     schema    : schema,
                     latest    : latest
                  }); 
               
               });            
            }
            else
            {
               res.send('Entry cannot be found');
            }
         }); 
      }
  },
  
  'new' : function(req, res) {
  
      var d = new Date();
      
      if(req.session.user.hasPermission('tests.create'))
      {   
        if(req.query.sample) {        
        
           async.waterfall([
              function(next){
                if(req.session.user.hasPermission('requests.create')) {
                
                   Sample.findOne(parseInt(req.query.sample)).done(function(err, result){
                      
                      if(!result) return next(404);                   
                   
                      if(req.session.user.facility_id != result.facility_id && !superAdmin) {
                         next(401);
                      } else {
                         next();
                      }
                   });
                } else {
                   next(401);
                }  
              },    
           
              function(next) {
              
                Sample.findOne().where({id : req.query.sample }).done(function(err, sample) {
                  next(null, sample);
                });              
              },
           
              function(sample, next) {
              
                 Supplier.findWithRequests({facility : sails.config.facilityId}, function(err, suppliers){
                    next(null, sample, suppliers)
                 });         
              },
              function(sample, suppliers, next){
              
                 Schema.findWithFullName({},function(err, schemas){ 
                    next(null, sample, suppliers, schemas);
                 });         
              }],
              function(err, sample, suppliers, schemas) {
     
                 if(err) {
                    if(err == 404) {
                      return res.render('404');
                    }
                    
                    if(err == 401) {
                      return res.forbidden("You don't have access to this resource");
                    }
                 }
     
                 res.view('test/new', { 
                    sample : sample,
                    suppliers : suppliers, 
                    schemas : schemas
                 });
              }
           );
        
        
        } else {
      
        
           async.waterfall([
           
              function(next){
              
                 HTMLHelper.optionList(Facility, 'id', 'name', { sort : 'name' }, function(facility_ops){
                    next(null, facility_ops)
                 });
              
              },
              function(facility_ops, next) {
              
                 Supplier.findWithRequests({facility : sails.config.facilityId}, function(err, suppliers){
                    next(null, facility_ops, suppliers)
                 });         
              },
              function(facility_ops, suppliers, next){
              
                 Schema.findWithFullName({},function(err, schemas){ 
                    next(null, facility_ops, suppliers, schemas);
                 });         
              }],
              function(err, facility_ops, suppliers, schemas) {
     
                 var d = new Date();
     
                 res.view('test/new', { 
                    sample  : null,
                    facility_option_list : facility_ops,
                    suppliers : suppliers, 
                    schemas : schemas
                 });
              }
           );
         
         }
      }
      else
      {
          res.forbidden("You don't have access to this resource");
      }
  },
  'list' : function(req, res) {
  
      var offset = parseInt(req.query.offset || 0);
      var limit  = parseInt(req.query.limit  || 25);
      var currentPage = parseInt(req.query.page || 1);
      var sort   = req.query.sort || 'created';
      var dir    = req.query.dir  || 'desc';
      var atts   = Object.keys(sails.models.sampletest.attributes).map(function(item){ return 'sample_tests.'+item });
      var cond   = Search.getFilter(req, 'sampletest');

      atts.push('samples.name');
      atts.push('suppliers.name');
            
      switch(dir)
      {
         case 'asc': case 'desc':
         break;
         
         default:
            dir = 'asc';
         break;
      }

      if(-1 == _.indexOf(atts, sort)) {
         sort = 'sample_tests.id';
      }
      
      sort = sort + ' ' + dir;
      
      offset = (currentPage * limit) - limit;
      
      var info = {
         results: {
             from: 0,
             to: 0,
             total: 0
         },
         pages: {
             current: 0,
             prev: null,
             next: null,
             total: 0
         }
      };
      
      var options = { facility : null };
      
      if(!req.session.user.hasPermission('facilities.create')){
        options.facility = req.session.user.facility_id;
      }
      
      async.waterfall([
         function(next) {
            
            SampleTest.findWithNames({ facility : options.facility, where : cond.where }, function(err, results){
               next(null, results);
            });         
         },
         function(results, next) {
         
            var resultsTotal = results.length;
         
            if (resultsTotal && offset >= 0 && offset < resultsTotal) {
         
               SampleTest.findWithNames({ limit : limit, offset : offset, sort : sort, facility : options.facility, where : cond.where }, function(err, results){                
                  
                  if (limit) {      
                     info = Pagination.getPagination(resultsTotal, offset, limit);
                  }
                  
                  next(null, results, info);        
               });
            }
            else
            {
               next(null, results, info);
            }         
         }],
         function(err, results, info){
            res.view('test/list', { tests : results, pagination : info });
         }
      );
   },
   'promote' : function(req, res) {
   
      var revision = req.param('revision');
      var id = req.param('id');
      
      SampleTest.findOne(id).done(function(err, test) {
      
         if(test) {
            
            test.schema_revision = revision;
            
            test.save(function(err){
            
               res.redirect('/test/edit/'+id);
            
            });
            
         } else {
         
            res.send('Entry cannot be found');
         }   
      });
   },
   'share' : function(req, res) {   
   
      if(req.method == 'POST') {
         
         SampleTest.findWithFullData(req.param('id'), function(err, results) {
         
            if(results.length > 0) {
               test = results[0];
               test.exposeSupplier = req.param('expose');
               test.results = JSON.parse(test.results);
            }
            else
            {
               test = new SampleTest._model();
               test.sample_name = 'Not Found';
               test.results = {
                  results : 
                  {
                     thcv : 14.5,
                     thc  : 22.5,
                     cbd  : 3.5,
                     cbg  : 1,
                     cbc  : 1,
                     cbn  : 1
                  }
               };
            }
                  
            SampleTest.buildShareDocument(test, function(pdf) {
            
              Image.pdfToJPG(pdf, function(err, jpg){            
                              
                 var options = {
                     from: 'noreply@cannabidata.com',
                     from_name: req.session.user.facility_name,
                     to: String(req.param('email')).split(/,|\s+/).join(';'),
                     subject: '['+req.session.user.facility_name + '] Test Results for ' + test.sample_name,
                     body_text: 'Attached are a PDF and JPG of your test results',
                     attachments : [{
                       name : test.sample_name.replace(/\W/g,'') + '.pdf',
                       buffer: pdf
                     },
                     {
                       name : test.sample_name.replace(/\W/g,'') + '.jpg',
                       buffer: jpg
                     }]
                 };    
                 
                 var client = elasticemail.createClient({
                    username: sails.config.email.username, 
                    apiKey: sails.config.email.apiKey 
                 });     
                 
                 client.mailer.send(options, function(err, result) {
                    console.log(err)
                    res.json({id: req.param('id')});
                 });
              });               
            });
         });
      
      } else {     
         
         var emails = [];
         
         SampleTest.findOne().where({ id  : req.param('id') }).exec(function(err, test){
         
            SupplierContact.find().where({ supplier_id : test.supplier_id }).exec(function(err, contacts){
              
              contacts.forEach(function(contact){
                emails.push(contact.email);
              });
              
              res.cookie('previewStatus', 'initialized');
              res.view('test/share', { emails : emails.join(',') });
              
            });         
         });
      }
   },
   'preview' : function(req, res){
   
      SampleTest.findWithFullData(req.param('id'), function(err, results) {
      
         if(results.length > 0) {
            test = results[0];
            test.results = JSON.parse(test.results);
            test.exposeSupplier = true;
            
            console.log('FOUND TEST : ' + test.id);
         }
         else
         {
            test = new SampleTest._model();
            test.sample_name = 'Not Found';
            test.results = {
               results : 
               {
                  thcv : 14.5,
                  thc  : 22.5,
                  cbd  : 3.5,
                  cbg  : 1,
                  cbc  : 1,
                  cbn  : 1
               }
            };
         }
               
         SampleTest.buildShareDocument(test, function(buffer) {
                           
            res.header('Cache-Control', 'public, max-age=3600'); 
            res.header('Expires', new Date(Date.now() + 3600000).toUTCString());
         
            res.contentType('application/pdf');
            res.header('Content-Disposition' , 'inline; filename="CannabidataTest'+req.param('id')+'.pdf"');      
            
            res.cookie('previewStatus', 'completed');
            res.send(buffer);
         });
      });
   }
};
