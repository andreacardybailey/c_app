var Forms = (function($){
   
   // default dataType for jQuery Ajax calls
   $.ajaxSetup({  dataType: 'json', cache: false });
   
   var module = { 

      init : function( script )
      {      
         //
         // Form initializers
         // to cancel a submission beforeSubmit set:
         //
         // origEvent.cancelSubmit = true;
         //
         
         $.getScript('/js/forms/'+script+'.js').done(function(script, status) {
         
         }).fail(function(xhr, settings, exception){
         
          console.warn(exception);
         
         });
         
         this.parseSearchFields();
         
      },
      updateTestElement : function(e) {
        
         var gen = $('#elementGenerator');
         var tr = $('tr.elementUpdating');
         var fld  = tr.parents('fieldset:first');
         var coll = fld.attr('id') == 'schema_environment_data' ? 'environment' : 'results';
         var re = new RegExp('^' + coll + '_');
         var key  = tr.data('id').replace(re,'');
         var defaultsTo = '';
        
         var def = $('input[name=element_default_type]:checked').val();
         var choices = $('#element_choices').val();   
         
         switch(def) {
            case 'text':
              defaultsTo = $('#element_default_value').val();
            break;
            
            case 'var':
              defaultsTo = $('#element_default_list').val();
            break;
            
            case 'derived' : 
              defaultsTo = $('#element_default_value').val();
            break;
         }      
      
         var element = {
            label      : $('#element_label').val(),
            type       : $('#element_type').val(),
            unit       : $('#element_unit').val(),
            help       : $('#element_help').val(),
            choices    : choices ? $.trim(choices).split(/\r?\n/) : [],
            defaultsTo : defaultsTo
         };        
         
         var newtr = App.createTestingElement(coll, key, element, true);
         tr.replaceWith(newtr);
         
         $('select', newtr).chosen({width: App.defaults.select.width });
         
         // clear class of current element
         $('#schemaPreview tr').removeClass('elementUpdating');
         
         var pos = gen.position();
         $('html, body').animate({scrollTop : pos.top}, 250);
         
         gen.prepend('<div class="notice">Element updated!</div>');
         
         setTimeout(function(){
         
           $('.notice', $('#elementGenerator')).remove();
            
           // reset element form, chosen-ize select
           $('input:not([type=radio]),select,textarea', $('#elementGenerator')).val('');
           $('#elementUnit').hide(); 
           $('#elementChoices').hide()
           $('#elementDefault').show();    
           $('#element_default_text').prop('checked', true).trigger('change');
           $('select', $('#elementGenerator')).trigger('chosen:updated');
           
           $('legend', gen).text('Create New Element');
           $('button.add', gen).show();
           $('button.update', gen).hide();
           $('button.cancel', gen).hide();
            
           var pos = newtr.position();
           $('html, body').animate({scrollTop : pos.top}, 250);
            
         }, 2000);   
      },
      buildTestElement: function(e) {
      
         var id = (new Date()).getTime();
         var coll = $('#element_collection').val();
         var set = $('#schema_'+coll+'_data');
         
         var prev = $('table tbody tr:last', set);
         var key = $('#element_key').val();
         var def = $('input[name=element_default_type]:checked').val();
         var choices = $('#element_choices').val();
         var defaultsTo = '';
         
         switch(def) {
            case 'text':
              defaultsTo = $('#element_default_value').val();
            break;
            
            case 'var':
              defaultsTo = $('#element_default_list').val();
            break;
            
            case 'derived' : 
              defaultsTo = $('#element_default_value').val()
            break;
         }  
      
         var element = {
            label      : $('#element_label').val(),
            type       : $('#element_type').val(),
            unit       : $('#element_unit').val(),
            help       : $('#element_help').val(),
            choices    : choices ? $.trim(choices).split(/\r?\n/) : [],
            defaultsTo : defaultsTo
         };

         var tr = App.createTestingElement(coll, key, element, true);
         
         // append new <tr>
         $('table tbody', set).append(tr);  
         $('select', tr).chosen({width: App.defaults.select.width });
                   
         
         // reset element form, chosen-ize select
         $('input:not([type=radio]),select,textarea', $('#elementGenerator')).val('');
         $('#elementUnit').hide(); 
         $('#elementChoices').hide()
         $('#elementDefaultDerived').hide();
         $('#elementDefault').show();    
         $('#element_default_text').prop('checked', true).trigger('change');
         $('select', $('#elementGenerator')).trigger('chosen:updated');
         
         var pos = $('#elementGenerator').position();         
         $('html,body').animate({scrollTop : pos.top}, 250);
      
         $('#elementGenerator').prepend('<div class="notice">Element added! Preview test form below.</div>');
         
         setTimeout(function(){
            $('.notice', $('#elementGenerator')).remove();
         }, 3000);     
      },
      
      parseSearchFields : function() {
      
        $('.search_filter').on('change', 'select.search_field', function(e){
        
          var par = $(e.delegateTarget)
          ,val    = $(this).val()
          ,idx    = this.selectedIndex
          ,op     = $('option:eq('+idx+')', this)
          ,lookup = op.data('lookup')
          ,format = op.data('format')
          ,txt    = $('input.search_text', par)
          ,sel    = $('select.search_text', par)
          ,defval = '';
          
          if(txt.length){
            defval = txt.get(0).defaultValue;
          }
          
          if(lookup) {
          
            var items = [];
            var sel = $('<select data-width="31%" data-search="false" class="search_text" name="text[]">');
            var ops = '';
            
            if(Object.prototype.toString.call(lookup) == '[object Object]'){
            
              for(var key in lookup) {
                ops += '<option value="'+key+'">'+lookup[key]+'</option>';
              }
            
            }
            
            if(Object.prototype.toString.call(lookup) == '[object Array]'){
              
              for(var i = 0; i < lookup.length; i++) {
                ops += '<option value="'+lookup[i]+'">'+lookup[i]+'</option>';
              }
            
            }
                        
            sel.html(ops);
            sel.val(defval);
            
            txt.replaceWith(sel);
            
            sel.chosen({ disable_search: true, width: '31%' });
            
          } else {
          
            if(txt.length == 0){
              txt = $('<input class="search_text" type="text" name="text[]" />');
            }
            
            if(typeof format != 'undefined'){
            
              txt.attr('type', format);
            
            } else {
            
              txt.attr('type', 'text');
              txt.val(defval);
  
            }
            
            sel.chosen('destroy');
            sel.replaceWith(txt);
          }
        
        });  
        
         // trigger change on search field
         var event = $.Event('change');
         event.target = $('.search_filter select.search_field')[0];         
         $('.search_filter').trigger(event);    
      }
   
   };
   
   return module;
   
})(jQuery);