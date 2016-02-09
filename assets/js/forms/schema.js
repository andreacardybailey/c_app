// schema form
$('#schemaForm').bind('beforeSubmit', function(e, origEvent){

   var form = $(this);

   // grab schema from UI
   var schema = { };

   $('tr', $('#schemaPreview')).each(function(){
   
      var coll = $(this).data('collection');
      var key  = $(this).data('key');
      var element = $.extend({}, $(this).data('element'));
                  
      if(false == schema.hasOwnProperty(coll))
      {
         schema[ coll ] = {};
      }
      
      schema[ coll ][ key ] = element;            
   });            

   // set to hidden field
   $('#data', form).val(JSON.stringify(schema));

   form.data('data', form.serialize());
   
}).bind('onUpdate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Testing Schema successfully saved!</div>');
   
   setTimeout(function(){
      window.location.reload();
   }, 3000);
   
}).bind('onCreate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Test Schema successfully created!</div>');
   
   setTimeout(function(){
      window.location = '/schema/edit/'+data.id;
   }, 3000);
}); 

         
$('#schemaForm').on('click', 'a.move', function(e){
   var dir = $(this).attr('href').substr(1)
   ,tr     = $(this).parents('tr:first')
   ,cid    = parseInt(tr.data('id'))
   ,next   = tr.next()
   ,prev   = tr.prev();
   
   switch(dir) {
   
      case 'moveUp':
      
         if(!prev) return;
         
         // insert before previous element
         prev.before(tr);   
                    
      break;
      
      case 'moveDown':
      
         if(!next) return;

         // insert before previous element
         next.after(tr);   

      break;
   
   }
   
   e.preventDefault();

});

// remove schema element
$('#schemaForm').on('click', 'a.remove', function(e) {
   var tr = $(this).parents('tr:first');
   var id = parseInt(tr.data('element'));
   
   tr.remove();
   
   e.preventDefault();         
});

$('#schemaForm').on('click', 'a.editElement', function(e){

  e.preventDefault();
  
  var tr = $(this).parents('tr:first')
  ,cid  = parseInt(tr.data('id'))
  ,el   = tr.data('element')
  ,gen  = $('#elementGenerator')
  ,pos  = gen.position()
  ,div  = document.createElement('div');
  
  // decode HTML chars
  div.innerHTML = (el.defaultsTo || '');
  el.defaultsTo = div.innerHTML;
  
  tr.addClass('elementUpdating');
  
  gen.data('origElement', $.extend(true, {}, el) );
    
  $('legend', gen).text('Update Element');
  $('button.add', gen).hide();
  $('button.update', gen).show();
  $('button.cancel', gen).show();
  
  $('tr[id=elementCollection]').hide();
  $('tr[id=elementKey]').hide();

  $('#element_label').val( el.label );
  $('#element_type').val( el.type ).trigger('chosen:updated');
  $('#element_unit').val( el.unit );
  
  if(el.defaultsTo.match(/derive:/)) { 
  
    $('#element_default_derived').prop('checked', true); 
    $('#element_default_derived').trigger('click');
    $('#element_default_value').val(el.defaultsTo);
  
  
  } else if(el.defaultsTo.match(/eval:/)) {    
  
    $('#element_default_var').prop('checked', true); 
    $('#element_default_var').trigger('click');
    $('#element_default_list').val(el.defaultsTo).trigger('chosen:updated');   
    
    
  } else {
  
    $('#element_default_text').prop('checked', true);
    $('#element_default_text').trigger('click');
    $('#element_default_value').val(el.defaultsTo);
    
  }
  
  $('#element_choices').val( el.choices.join("\n") );
  $('#element_type').trigger('change');  
  
  $('html,body').animate({ scrollTop : pos.top}, 250);
   
});


// element generator
$('#elementGenerator').on('click', 'button.add', function(e){
   Forms.buildTestElement.call(this, e);
});


$('#elementGenerator').on('click', 'button.update', function(e){
   Forms.updateTestElement.call(this, e);
});

$('#elementGenerator').on('click', 'button.cancel', function(e){
   
  var gen = $('#elementGenerator');
  
  $('legend', gen).text('Create New Element');
  $('button.add', gen).show();
  $('button.update', gen).hide();
  $('button.cancel', gen).hide();
  
  var tr = $('#schemaPreview tr.elementUpdating');
  var pos = tr.position();
  tr.removeClass('elementUpdating');
  
  $('input[type=text], textarea, select', gen).val('');
  $('#element_type', gen).val('string').trigger('chosen:updated');
  $('#element_default_text', gen).prop('checked', true);
  $('#element_default_text', gen).trigger('click');   
  
  $('tr[id=elementCollection]').show();
  $('tr[id=elementKey]').show();
  
  $('html,body').animate({scrollTop : pos.top}, 250);

});


 

$('#element_label, #element_key').on('change', function(e){
   
   var val = $.trim($(this).val() || '').toLowerCase();
   
   var symbols = {
      '%' : 'percent',
      '#' : 'number',
      '\\$' : 'amount',
      '\\?' : ''
   };
   
   for(var symbol in symbols) {
      var re = new RegExp(symbol, 'g');
      val = val.replace(re, symbols[symbol]);
   }
   
   val = val.replace(/^\s+|\s+$/g,'').replace(/\W/g,'_');
   
   $('#element_key').val(val);      
   
   if(val.length > 15){
   
      var ekey = $('#element_key');
      ekey.attr('title', 'This key is a bit long, perhaps you want to short it?');
      ekey.smallipop();
      
      ekey.trigger('mouseover');    
        
   } else {
      
      try{
        ekey.smallipop('destroy');
      }catch(e){};
      
   }
});

$('#elementDefault').on('click', 'input[type=radio]', function(e){
   var val = $(this).val();
   
   switch(val) {
      case 'text':
        $('#elementDefaultDerived').hide();
         $('#elementDefaultText').show();
         $('#elementDefaultSystem').hide();
         $('#element_default_list').val('').trigger('chosen:updated');
         $('#element_default_derived_key').val('').trigger('chosen:updated');
         $('#element_default_derived_val').val('').trigger('chosen:updated');
         
         try{
          $('#element_default_value').smallipop('destroy')
          } catch(e){}
      break;
      
      case 'var':
        $('#elementDefaultDerived').hide();
         $('#elementDefaultText').hide();
         $('#elementDefaultSystem').show();   
         $('#element_default_value').val('');  
         $('#element_default_derived_key').val('').trigger('chosen:updated');
         $('#element_default_derived_val').val('').trigger('chosen:updated');     
         
         try{
          $('#element_default_value').smallipop('destroy')
          } catch(e){}     
      break;
      
      case 'derived':
         $('#elementDefaultText').show();
         $('#elementDefaultDerived').show();
         $('#elementDefaultSystem').hide();   
         $('#element_default_value').val(''); 
         $('#element_default_derived_key').val('').trigger('chosen:updated');
         $('#element_default_derived_val').val('').trigger('chosen:updated');
      break;
   }
});


$('#element_derived_add').on('click', function(e){

  e.preventDefault();

  var key   = $('#element_default_derived_key').val();
  var match = $('#element_default_derived_val').val();
  var val   = $('#element_derived_value').val();
  
  var def = $('#element_default_value').val();
  var query = 'WHEN ' + key + ' = "' + match + '" THEN "' + val + '"';
  
  if(String(def).match(/derive\:/)) {  
    def += ' '+ query;  
  } else {  
    def = 'derive:' + query;  
  }
  
  $('#element_default_value').val(def);
  $('#element_derived_value').val('');
  $('#element_default_derived_key').val('').trigger('chosen:updated');
  $('#element_default_derived_val').val('').trigger('chosen:updated');
  
  var ekey = $('#element_default_value');

  if(!ekey.hasClass('smallipop-initialized')) {

    ekey.attr('title', 'Choose from select boxes to append to derived query!');
    ekey.smallipop({ handleInputs : false , preferredPosition : 'bottom' });  
  }
  
  
  ekey.smallipop('show'); 
  ekey.smallipop('update', 'Derived query updated!');
  
  setTimeout(function(){
    ekey.smallipop('hide');    
  }, 1500);   

});



$('#element_default_derived_key').on('change', function(e){

  var val = $(this).val();
  var sel = $('#element_default_derived_val');
  var ops = '';

  var map = {
    'sample.type'        : [ 'FLOWER','CONCENTRATE' ],
    'sample.concentrate' : [ 'HASH','KIEF','OIL','BUTTER','TINCTURE' ],
    'sample.extraction'  : [ 'BUTANE','NAPTHA','ISOPROPLE','CO2','PROPANE' ],
    'sample.species'     : [ 'INDICA','SATIVA','HYBRID','RUDERALIS' ],
    'sample.environment' : [ 'INDOOR','OUTDOOR','UNKNOWN' ]
  };
  
  var options = map[ val ];

  sel.empty();
  
  ops += '<option>➥ Select value</option>';
  
  if(options) {
    for(var i=0; i < options.length; i++) {
      ops += '<option value="'+options[i]+'">'+options[i]+'</option>'; 
    }
  }
  
  sel.html(ops);
  sel.trigger('chosen:updated');

});

$('#element_type').on('change', function(e){
   var val = $(this).val();
   
   switch(val) {

      case 'listmulti':
         $('#elementDefault').hide();
         $('input, select', $('#elementDefault')).val(''); 
         
         // no break
      case 'listsingle':
         $('#elementChoices').show(); 
         $('#elementUnit').val('').hide(); 
                       
      break; 
      
      case 'image':
         $('#elementDefault').hide();
         $('input, select', $('#elementDefault')).val('');    
         $('#elementUnit').val('').hide(); 
         $('#elementChoices').val('').hide();          
      break;
      
      case 'float':
      case 'number':
         $('#elementUnit').show();
      break;           
      
      default:
         $('#elementUnit').val('').hide();
         $('#elementChoices').val('').hide();
      break;
   }

});