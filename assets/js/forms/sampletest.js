
App.Samples = {};
App.Sample  = null;

window.previewTimer = null;
window.previewLoader = null;

var progressFields = [
  'environment_sample_weight',
  'environment_load_size',
  'environment_expected_range',
  'environment_lab_temperature',
  'environment_lab_humidity',
  'environment_decarb_lane',
  'environment_plate_image',
  'results_cbd',
  'results_cbn',
  'results_thc',
  'results_thcv',
  'results_thca',
  'results_cbda',
  'results_cbg',
  'results_cbc'  
];

var applyProgressIdentifiers = function() { 
  for(var i=0, len = progressFields.length;i <len;i++) {
    var icon = $('<i class="ss-icon" style="float:right;display:inline-block;color:#086792;font-size:12px;vertical-align:top" title="Value recommended for Sharing, required to update Test progress">&#xF4C0;</i>');
    icon.smallipop();  
    $('tr[data-id='+progressFields[i]+'] td:first > label').append(icon);
  }
}

var createPreloader = function() {

  var cache = $.cookie('previewCache');
  
  if(cache && cache.split(',').indexOf($('#test_preview').attr('src')) > -1) {
    return;
  }

  var fld = $('#testShareForm > fieldset');
  fld.css({ position : 'relative' });
  
  var loader = $('<img id="preview_loader" src="/images/large_preload.gif" width="64" height="64" />')
    .css({ position:'absolute', width:64, height:64, top : 300, left : '47%', zIndex : 1000 } );
    
  fld.append(loader);
  
  window.previewLoader = loader;
  window.previewTimer   = setInterval(checkPreviewProgress, 100);
};  

var checkPreviewProgress = function(){

  if($.cookie('previewStatus') == 'completed') {
  
    window.previewLoader.remove();
    $.removeCookie('previewStatus');
    
    clearInterval(window.previewTimer); 
    
    var cache = $.cookie('previewCache') || '';      
    cache = cache.split(',');
    cache.push($('#test_preview').attr('src'));
    $.cookie('previewCache', cache.join(','));

  }
};

var populateSample = function(){

  // build loader animation
  var fld = $('#testForm > fieldset:first');
  fld.css({ position : 'relative' });
  
  var loader = $('<img id="preview_loader" src="/images/large_preload.gif" width="64" height="64" />')
    .css({ position:'absolute', width:64, height:64, top : 300, left : '47%', zIndex : 1000 } );
    
  fld.append(loader);

  // populate supplier and trigger change event
  $('#supplier_id').val(window.Sample.supplier_id);
  $('#supplier_id').trigger('chosen:updated');
    
    var evt = $.Event('change', { callback : function(){
    
    // populate test id and trigger change event
    $('#supplier_test_id').val(window.Sample.supplier_test_id);
    $('#supplier_test_id').trigger('chosen:updated');    
  
    var evt = $.Event('change', { callback : function(){
    
      // populate sample and trigger change event
      $('#sample_id').val(window.Sample.id);
      $('#sample_id').trigger('chosen:updated'); 
      
      var evt = $.Event('change');
      evt.target = $('#sample_id')[0];        
 
      $('#testForm').trigger(evt);
      
      $('#preview_loader').remove();
      
      $('#schema_id').trigger('chosen:activate');
      
      window.Sample = null;
    
    } });
    
    evt.target = $('#supplier_test_id')[0];    
    $('#testForm').trigger(evt);
  
  } });
  
  evt.target = $('#supplier_id')[0];  
  $('#testForm').trigger(evt);  
};



$('#testShareForm').bind('onCreate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Test successfully shared!</div>');
   
   setTimeout(function(){
      $('div.notice', form).slideUp('fast', function(){
        $(this).remove();
      });
   }, 5000);
});


// test form
$('#testForm').bind('beforeSubmit', function(e, origEvent){

   var form   = $(this);            
   var data = { environment : {}, results : {} };            

   $('tr[data-collection]', form).each(function(){
   
      var tr = $(this);
      var col = tr.data('collection');
      var key = tr.data('key');
      
      data[col][ key ] = App.parseElementValue(col, key, tr);            
   });
   
   $('#results', form).val(JSON.stringify(data));

   form.data('data', form.serialize());
   
}).bind('onUpdate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Test successfully saved!</div>');
   
   setTimeout(function(){
      window.location.reload();
   }, 3000);
   
}).bind('onCreate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Test successfully created!</div>');
   
   setTimeout(function(){
      window.location = '/test/edit/'+data.id;
   }, 3000);
});  

$('#testForm').on('change', '#supplier_id', function(e){

   $.ajaxSetup({ cache: false });
   
   $('#supplier_test_id').val('').trigger('chosen:updated');
   $('#sample_id').val('').trigger('chosen:updated');

   $.getJSON('/SupplierTest?where[status]=RECEIVED&where[supplier_id]='+$(this).val()+'&sort=created%20desc&callback=?').done(function(requests){
   
      var sel = $('#testForm #supplier_test_id');
      var ops = [];
      sel.empty();
      
      for(var i = 0; i < requests.length; i++)
      {
         ops.push('<option value="'+requests[i].id+'">#'+requests[i].id + ' / '+Globalize.format( new Date(requests[i].created), 'dddd, MMMM dd, yyyy hh:mmtt')+'</option>');
      }
      
      if(ops.length == 0) 
      {
         ops.push('<option>❢ There are no requests for that supplier</option>');
      }
      else
      {
         ops.unshift('<option>Select your request&hellip;</option>');
      }
      
      sel.html(ops.join('')); 
      
      sel.trigger('chosen:updated');    
      
      if(e.callback) e.callback.call();
             
   });
});




$('#testForm').on('change', '#supplier_test_id', function(e){

   $.ajaxSetup({ cache: false });
   
   $('#sample_id').val('').trigger('chosen:updated');

   $.getJSON('/Sample?where[status]=ACCEPTED&where[supplier_test_id]='+$(this).val()+'&sort=created%20desc&callback=?').done(function(samples){
   
      var sel = $('#testForm #sample_id');
      var ops = [];
      sel.empty();
      
      // store these to calculate derived defaults
      App.Samples = {};
      
      for(var i = 0; i < samples.length; i++)
      {
         var type = samples[i].type.charAt(0).toUpperCase() + samples[i].type.slice(1).toLowerCase();
         
         App.Samples[ samples[i].id ] = samples[i];
      
         ops.push('<option value="'+samples[i].id+'">#'+samples[i].id+' / '+type+' / '+samples[i].name+'</option>');
      }
      
      if(ops.length == 0) 
      {
         ops.push('<option>❢ There are no samples for that request</option>');
      }
      else
      {
         ops.unshift('<option>Select your sample&hellip;</option>');
      }
      
      sel.html(ops.join('')); 
      
      sel.trigger('chosen:updated');    
      
      if(e.callback) e.callback.call();        
   });
});


$('#testForm').on('change', '#sample_id', function(e){
   
  for(var id in App.Samples){
    if(parseInt($(this).val()) == parseInt(id)) {      
      App.Sample = App.Samples[id];
      break;
    }
  }
  
  if(e.callback) e.callback.call();
});


$('#testForm').on('change', '#schema_id', function(e){

   $.ajaxSetup({ cache: false });

   $.getJSON('/Schema?where[id]='+$(this).val()+'&callback=?').done(function(schemas){
   
      if(schemas.length > 0) {               
         App.renderTestingForm( schemas[0].data );  
         applyProgressIdentifiers();             
      }         
   });
});

if($('#testShareForm').length > 0){
  createPreloader();
}

if(window.Sample) {
  populateSample();
}

applyProgressIdentifiers();
