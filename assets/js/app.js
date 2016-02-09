   ///////////////////////////////////////
 // Main object
//

// html5 tag
document.createElement('main');
document.createElement('search');

var debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date().getTime();
      var later = function() {
        var last = new Date().getTime() - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

var App = (function($){
   
   // default dataType for jQuery Ajax calls
   $.ajaxSetup({  dataType: 'json', cache: false });
   
   var module = 
   {
      params : null,
      sync   : true,
      defaults : {
        select : { width : '70%' },
      },
      fieldMap : {
        supplier_id : 'Supplier',
        supplier_test_id : 'Request',
        name : 'Name',
        schema_id : 'Schema',
        sample_id : 'Sample',
        firstname : 'First name',
        lastname  : 'Last name',
        email     : 'E-mail'
      },
      messageMap : {
        '"" is not of type "integer"'        : 'should be an id reference',
        '"" Rule "required(true)" failed.'   : 'is required',
        '"NaN" Rule "required(true)" failed.' : 'is required',
        '"NaN" is not of type "integer"'     : 'should be an id reference',
        '"" Rule "number(true)" failed.'     : 'should be a number',
        '"" Rule "email(true)" failed.'       : 'should be an email address'
      },
      getFieldName : function(name) {
        var self = this;
        return self.fieldMap[name] || name;      
      },
      parseMessage : function(message){
        var self = this;
        return self.messageMap[message.replace(/^\s+|\s$/,'')] || message;      
      },
      init   : function( params )
      {
         var self = this;
         
         self.params = params || {};
      
         $(window).unload(function(){
            self = null;
         });
         
         var parseSelects = function(){
         
           $('select').each(function(){
           
              var sel = $(this);
              var options = {};
              var wid = String(sel.data('width'));
              var des = String(sel.data('deselect'));
              
              if(wid != 'auto') {  
              
                  if(wid.match(/px|em|\%|pt/i)) {
                  
                     options.width = wid;
                     
                  } else {            
                     
                     options.width = self.defaults.select.width;
                  }
              }
              
              if(des.match(/true|yes|on/i)){
                options.allow_single_deselect = true;
              }
              
              if(sel.data('search') === false) {
                options.disable_search = true;
              }
              
              sel.chosen(options);         
           });
         }
         
         parseSelects();         

         // redo select chosen on resize
         var lazySelect = debounce(function(e){
            $('select').chosen('destroy');
            parseSelects();      
         },500);
         
         
         if('ontouchstart' in document.documentElement) 
         {         
            $(window).on('orientationchange', lazySelect);            
         }
         else
         {
            $(window).on('resize', lazySelect);
         }
         
         self.forms.parseXMLHttp.call(self);
         self.buttons.parse.call(self);
         self.uploads.parse.call(self);     
         self.search.init.call(self);   
         
         $('.tooltip').smallipop({ theme : 'black' });
         
         $('.notice').on('click', 'a.close', function(e){
            e.preventDefault();
            $(e.delegateTarget).remove();
         }); 
         
         $('canvas.test-progress').each(function(){         
           App.progress.draw($(this).attr('id'), parseInt( $(this).data('value') ));
         });
         
         $('canvas.request-progress').each(function(){         
           App.progress.draw($(this).attr('id'), parseInt( $(this).data('value') ));
         });
         
      },
      post: function(url, params, onSuccess, onError)
      {
         this.makeRequest('POST', url, params, onSuccess, onError);
      },
      get: function(url, params, onSuccess, onError)
      {
         this.makeRequest('GET', url, params, onSuccess, onError);
      },
      put: function(url, params, onSuccess, onError)
      {
         var self = this;
         this.makeRequest('PUT', url, params, onSuccess, onError, function(xhr, settings){
            self.beforeSend(xhr, settings);
            xhr.setRequestHeader('X-HTTP-Method-Override', 'PUT');
         });
      },
      'delete': function(url, params, onSuccess, onError)
      {
         var self = this;
         this.makeRequest('PUT', url, params, onSuccess, onError, function(xhr, settings){
            self.beforeSend(xhr, settings);
            xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
         });
      },
      beforeSend: function(xhr, settings) 
      {
         if (!(/^http(s)?:.*/.test(settings.url))) {
            xhr.setRequestHeader('X-Requested-With', 'XML-Http-Request');
            xhr.setRequestHeader('Accept', 'application/json');
         }
      },
      onError: function(xhr, err, msg)
      {      
         var messages = [];
               
         if(xhr.status == 500)
         {
            if(xhr.responseJSON.hasOwnProperty('errors'))
            {
               var errors = xhr.responseJSON.errors;
               
               for(var i=0; i < errors.length; i++)
               {
                  // nested validation errors per form element
                  if(errors[i].hasOwnProperty('ValidationError'))
                  {
                     for(var name in errors[i].ValidationError)
                     {
                        for(var j=0; j < errors[i].ValidationError[name].length; j++)
                        {
                           var message = errors[i].ValidationError[name][j].message;
                           message = message.replace(/Validation error:/,'');
                           messages.push(App.getFieldName(name) + ' ' + App.parseMessage(message));
                        }
                     }
                  }
                  else
                  {
                     // standard errors
                     messages.push(errors[i]);
                  }
               }            
            }
         }
         
         $('.loader').remove();
      
         alert("Request could not be completed:\n\n"+messages.join('\n'));
      },
      makeRequest:function(type, url, params, onSuccess, onError, beforeSend)
      {
         var self = this;
         
         $.ajax({
            beforeSend : beforeSend || self.beforeSend,
            url        : url,
            type       : type || 'GET',
            data       : params || {},
            async      : self.sync,
            success    : onSuccess,
            error      : onError || self.onError
         });
      },
      uploads : 
      {
         processes : {},
         parse : function(parent)
         {
            var self = this;
            
            $(document).on('change', 'input[type=file]', function(e){
               self.uploads.submit.call(self, e, $(this));
            });         
         },
         submit : function(e, input)
         {
            var self = this
            , target = 'upload'+(new Date().getTime())
            , clone  = input.clone(true)
            , name   = input.attr('name').replace(/^\_/,'')
            , process = self.uploads.processes[target] = {};

            // clone input and append
            input.before(clone);

            // file uploads are handled in an IFRAME
            // we need to send the original file input into a 
            // new form because you can't set the value of a input[type=file]
            process.loader = $('<img src="/images/ajax.gif" width="16" height="16"/>');
            process.image  = clone.nextAll('img');
            process.frame  = $('<iframe>').css({display:'none'}).attr({src: 'javascript:false', border:0, frameSpacing:0, id : target, name: target });
            process.form   = $('<form>').css({display:'none'}).attr({method : 'post', action : '/upload/'+name, enctype: 'multipart/form-data', target : target });
            process.name   = name;
            
            // add ajax loader
            clone.after(process.loader);
            
            process.success = function(file) 
            {                    
               // set the hidden value path 
               $('#'+process.name).val(file.path);               
               
               // show the preview image
               process.image.css({maxWidth:'35%', height:'auto', display:'block'});
               process.image.attr('src', file.preview);
               
               // remove loader, frame and form
               process.loader.remove();               
               process.frame.remove();
               process.form.remove();               
               
               delete(process);         
            };
            
            process.error = function(err)
            {
               // remove loader, frame and form
               process.frame.remove();
               process.form.remove();
               process.loader.remove();

               alert(err);
            }
            
            process.form.append(input);
            process.form.append($('<input type="hidden" name="process" value="'+target+'"/>'));
            process.form.append($('<input type="hidden" name="_csrf" value="'+$('input[name=_csrf]').val()+'"/>'));
            
            $('body').append(process.frame, process.form);
            
            process.form.trigger('submit');
      
         }      
      },      
      buttons : 
      {
         parse : function()
         {
            var buttons = $('button[data-href]');
            
            buttons.on('click', function(e){
               window.location = $(this).data('href');
            });
         }
      },
      forms : 
      {
         parseXMLHttp : function()
         {
            var self = this;
            var forms = $('form[data-submit=ajax]');
            
            forms.attr('data-parsed','true').submit(function(e){
               var form = $(this);
               e.preventDefault();
               self.forms.submit.call(self, e, form);
               return false;
            });         
         },
         submit : function(e, form){
         
            var self = this
            ,url     = form.attr('action')
            ,method  = form.attr('method')
            ,success = self.forms.success
            ,loader = $('<img class="loader" src="/images/ajax.gif" width="16" height="16"/>')
            ,button = $('[type=submit]', form);
            
            $('.loader').remove();
            $('.notice').remove();   
            
            // add loader image
            button.after(loader);
            
            form.trigger('beforeSubmit', [e]);
         
            if(!e.cancelSubmit)
            {
               var data = form.data('data') || form.serialize();

               self.makeRequest(method, url, data, function(data, status, xhr){
                  
                  loader.remove();
                  
                  if(method.match(/post/i))
                  {
                     form.trigger('onCreate', [ data ]);
                  }
                  
                  if(method.match(/put/i))
                  {
                     form.trigger('onUpdate', [ data ]);
                  }
                  
                  if(method.match(/delete/i))
                  {
                     form.trigger('onDelete', [ data ]);
                  }
                  
                  $('html,body').animate({scrollTop : 0}, 250);
                  
               });
            }
         }
      },
      search : {
      
         init: function()
         {
            var self = this;
            
            $('#searchForm').on('submit', self.search.run);
         },
         run : function(e)
         {
         
            var form = $(e.delegateTarget)
            ,asset = $('#asset', form).val()
            ,facility = $('#facility_id', form).val()
            ,query = encodeURIComponent($('#query',form).val())
            ,urls = [];
            
            urls.push('/'+asset+'?where[facility_id]='+facility+'&where[like][id]='+query);
            urls.push('/'+asset+'?where[facility_id]='+facility+'&where[like][name]='+query);
            
            console.log(urls);
            
            e.preventDefault();
         
         }
      
      },
      createTestingElement : function(collection, key, element, manage)
      {
         var tr = '<tr data-id="'+collection+'_'+key+'" data-type="'+element.type+'" data-collection="'+collection+'" data-key="'+key+'"><td><label title="'+(element.help || '')+'">{label}</label></td><td>{input}</td>';
         var read = String(element.defaultsTo).match(/derive\:|eval\:/);
         
         if(manage) 
         {
            tr += '<td><a href="#update" class="editElement">✎</a><a href="#moveUp" class="move">▲</a><a href="#moveDown" class="move">▼</a> <a href="#delete" class="remove">✖</a></td>';
         }
         
         tr += '</tr>';
         
         var items = element.choices;
         var tagid = (collection+'_'+key);
         
         element.defaultsTo = (element.defaultsTo || '').replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
         
         switch(element.type)
         {
            case 'image':
               input  = '<input id="_'+tagid+'" name="_'+tagid+'" type="file" />';
               input += '<input type="hidden" name="'+tagid+'" id="'+tagid+'" />';
               input += '<img src="" style="display:none;max-width:400px"/>';
            break;
      
            case 'string':
               input = '<input id="'+tagid+'" \
                        name="'+tagid+'" type="text" \
                        value="'+(element.defaultsTo ? element.defaultsTo : '')+'"'+(read ? ' readonly="readonly"' : '')+' />';
            break;
            
            case 'number':
               input = '<input id="'+tagid+'" \
                        name="'+tagid+'" type="number" \
                        value="'+(element.defaultsTo ? element.defaultsTo : '')+'"'+(read ? ' readonly="readonly"' : '')+' />';
            break;
            
            case 'float':
               input = '<input id="'+tagid+'" \
                        name="'+tagid+'" type="number" \
                        step="any" value="'+(element.defaultsTo ? element.defaultsTo : '')+'"'+(read ? ' readonly="readonly"' : '')+' />';
            break;
            
            case 'date':
               input = '<input id="'+tagid+'" \
                        name="'+tagid+'" type="date" \
                        value="'+(element.defaultsTo ? element.defaultsTo : '')+'" />';
            break;
            
            case 'text':
               input = '<textarea id="'+tagid+'"  \
                        name="'+tagid+'" rows="4">'+(element.defaultsTo ? element.defaultsTo : '')+'</textarea>';
            break;     
            
            case 'boolean' : 
               var isTrue = element.defaultsTo && String(element.defaultsTo).match(/^(1|true|yes|on|enabled)$/i);
               
               input = '<div class="radio"><input id="'+(collection+'_'+key+'_true')+'" \
                        name="'+tagid+'" type="radio"'+(isTrue ? ' \
                        checked="checked"' : '')+'/> <label for="'+(collection+'_'+key+'_true')+'">Yes</label>\
                        <input id="'+(collection+'_'+key+'_false')+'" \
                        name="'+tagid+'" type="radio"'+(!isTrue ? ' checked="checked"' : '')+'/> \
                        <label for="'+(collection+'_'+key+'_false')+'">No</label></div>';
            break;
            
            case 'listmulti' :
            
               if(items.length <= 3) 
               {
                  input ='<div class="checkbox"><ul>';
                  
                  for(var i=0; i < items.length;i++) 
                  {
                     input += '<li><input id="'+(collection+'_'+key+'_'+i)+'" name="'+tagid+'[]" value="'+(items[i])+'" type="checkbox" value="'+items[i]+'"/> <label for="'+(collection+'_'+key+'_'+i)+'">'+items[i]+'</label></li>';
                  }
                  input +=' </ul></div>';
               }
               else 
               {
                  input = '<select id="'+tagid+'" name="'+tagid+'[]" data-width="auto" multiple="multiple" data-placeholder="'+'➥ Select '+element.label.toLowerCase()+'">';
               
                  for(var i=0; i < items.length;i++) 
                  {
                     input += '<option>'+items[i]+'</option>';
                  }                  
                  input += '</select>';               
               }
            
            break;
            
            case 'listsingle' :
            
               if(items.length <= 3) 
               {
                  input = '<div class="radio">';
                  
                  for(var i=0; i < items.length;i++) 
                  {
                     input += '<input id="'+(collection+'_'+key+'_'+i)+'" data-width="auto" name="'+tagid+'" type="radio"'+(element.defaultsTo && items[i] == element.defaultsTo ? ' checked="checked"' : '')+' value="'+items[i]+'"/> <label for="'+(collection+'_'+key+'_'+i)+'">'+items[i]+'</label>';
                  }
                  input += '</div>';
               }
               else 
               {
                  input = '<select id="'+tagid+'" name="'+tagid+'"data-placeholder="'+'➥ Select '+element.label.toLowerCase()+'">';
               
                  for(var i=0; i < items.length;i++) 
                  {
                     input += '<option'+(element.defaultsTo && items[i] == element.defaultsTo ? ' selected="selected"' : '')+'>'+items[i]+'</option>';
                  }                  
                  input += '</select>';               
               }
            
            break;
            
            default:
               input = '<input id="'+tagid+'" name="'+tagid+'"type="text" '+(read ? ' readonly="readonly"' : '')+' value="'+(element.defaultsTo ? element.defaultsTo : '')+'" />';
            break;
         }        
         
         if(element.unit != '') {
            input += ' <small>('+element.unit+')</small>';
         }
         
         // replace content into template
         tr = tr.replace(/\{label\}/, element.label);
         tr = tr.replace(/\{input\}/, input); 
         tr = $(tr);  
         
         // add data for element
         tr.data('element', element);
         
         return tr;   
      },
      renderTestingForm : function(schema) {
      
         var env  = $('#testEnvironment');
         var data = $('#testData');
         var expr = new RegExp('WHEN\\s+(\\w+)\.(\\w+)\\s+=\\s+"(.[^"]*)"\\s+THEN\\s+"(.[^"]*)"', 'gim');
         var el = document.createElement('div');         
         
         $('table tbody', env).empty();
         $('table tbody', data).empty();
      
         for(var key in schema.environment) 
         {
            var element = schema.environment[key];     
            var def = String(element.defaultsTo);
            var match;
            
            // unescape HTML
            el.innerHTML = def;
            def = el.innerHTML;
            
            // process derived value
            if(def.match(/derive:/)) {
            
              element.defaultsTo = '';

              if(App.Sample) {
              
                while(match = expr.exec(def)){

                  if(App.Sample[ match[2] ] && String(App.Sample[ match[2] ]) == String(match[3])) {
                    element.defaultsTo = match[4];
                  }
                }     
                
                element.derivedDefault = true;
                element.derivedQuery   = def;
              }
            }     
                    
            var tr = App.createTestingElement('environment', key, element);
            
            tr.data('collection', 'environment');
            tr.data('key', key);
            tr.data('element', element);
            
            $('select', tr).chosen({ width: App.defaults.select.width });
            
            $('label', tr).smallipop();
            
            $('table tbody', env).append(tr);
         }
         
         for(var key in schema.results) 
         {
            var element = schema.results[key];            
            var tr = App.createTestingElement('results', key, element);
            
            tr.data('collection', 'results');
            tr.data('key', key);
            tr.data('element', key);
            
            $('table tbody', data).append(tr);
         }
         
         var parseSelects = function(cnt){
         
           $('select', cnt).each(function(){
           
              var sel = $(this);
              var options = {};
              var wid = String(sel.data('width'));
              
              if(wid != 'auto') {  
              
                  if(wid.match(/px|em|\%|pt/i)) {
                  
                     options.width = wid;
                     
                  } else {            
                     
                     options.width = App.defaults.select.width;
                  }
              }
              
              if(sel.data('search') === false) {
                options.disable_search = true;
              }
              
              sel.chosen(options);         
           });
         };         
         
         $('#testEnvironment').fadeIn('fast',function(){
          parseSelects(this);         
         });
         
         $('#testData').fadeIn('fast',function(){
          parseSelects(this);         
         });


      },
      parseElementValue : function(collection, key, row){
      
         var element = $(row).data('element');
         var val = null;
      
         switch(element.type)
         {
            case 'boolean':
               val = $('input[name='+collection+'_'+key+']:checked').val() == 'on' ? true : false; 
            break;
            
            case 'listsingle':
               var inputs = $('input:checked', row);
               var select = $('select', row);   
               
               if(inputs.length > 0)
               {
                  val = inputs.val()
               }      
               
               if(select.length > 0)
               {
                  val = select.val();
               }   
            break;
            
            case 'listmulti':
               var val = [];
               var inputs = $('input:checked', row);
               var select = $('select', row);
               
               if(inputs.length > 0)
               {
                  inputs.each(function(){
                     val.push($(this).val());
                  });
               }
               
               if(select.length > 0)
               {
                  val = select.val();
               }
            break;
            
            case 'image':
               var val = $('#'+collection+'_'+key).val();
               
               // append image: to new images
               if(val.match(/uploads/)) 
               {
                  val = 'image:' + val;
               }
            break;
            
            default:
               val = $('#'+collection+'_'+key).val();
            break;
         }     
         
         // convert numbers as necessary
         if(!isNaN(parseFloat(val)) && isFinite(val))
         {
            val = parseFloat(val);
         }
         
         if($.trim(val) == '')
         {
            val = null;
         }
         
         return val;  
      },
      progress: {
      
        draw : function(id, value) {
            App.progress.drawDonut(id, value, '#EEEEEE', '#086792');
        },
          
        drawDonut : function(container, percent, bgcolor, fgcolor) {
            App.progress.drawCircle(100, container, bgcolor);
            App.progress.drawCircle(percent, container, fgcolor);
            App.progress.drawPercent(percent, container);    
        },
              
        drawPercent : function(percentage, id) {
            var bg = document.getElementById(id),
                ctx = bg.getContext('2d'),
                posLeft = parseInt(percentage, 0) == 100 ? 15 : 18;
        
            ctx.fillStyle = "#333333";
            ctx.font = "12px sans-serif";
            ctx.fillText(percentage + '%', posLeft, 35);
        },
        
        drawCircle : function(percentage, id, color) {
            var radius = 22,
                position = 60,
                positionBy2 = position / 2,
                bg = document.getElementById(id),
                ctx = bg.getContext('2d'),
                imd = null,
                circ = Math.PI * 2,
                quart = Math.PI / 2;
        
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineCap = 'butt';
            ctx.closePath();
            ctx.fill();
            ctx.lineWidth = 10;
        
            imd = ctx.getImageData(0, 0, position, position);
        
            var draw = function (current) {
                ctx.putImageData(imd, 0, 0);
                ctx.beginPath();
                ctx.arc(positionBy2, positionBy2, radius, -(quart), ((circ) * current) - quart, false);
                ctx.stroke();
            };
            draw(percentage / 100);
        }     
      
      }
   };

   return module;
})(jQuery);

