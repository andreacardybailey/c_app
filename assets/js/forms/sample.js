// sample form
$('#sampleForm').bind('beforeSubmit', function(e, origEvent){
   $(this).data('data', $(this).serialize());
}).bind('onUpdate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Sample successfully saved!</div>');
   
   setTimeout(function(){
      window.location.reload();
   }, 3000);
   
}).bind('onCreate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Sample successfully created! <a href="/sampleorigin/new/?sample='+data.id+'">Assign sample origins.</a> &nbsp; <a href="/sample/new/?request='+data.supplier_test_id+'">Add another sample.</a> &nbsp; <a href="/test/new/?sample='+data.id+'">Test Now.</a></div>');
   
   setTimeout(function(){
      window.location = '/sample/edit/'+data.id;
   }, 10000);
}); 


$('#sampleForm').on('change', '#supplier_id', function(e){

   $.ajaxSetup({ cache: false });
   
   $('#supplier_test_id').val('').trigger('chosen:updated');

   $.getJSON('/SupplierTest?where[status]=RECEIVED&where[supplier_id]='+$(this).val()+'&sort=created%20desc&callback=?').done(function(requests){
   
      var sel = $('#supplier_test_id', e.delegateTarget);
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
   });
});


$('#sampleForm').on('change', 'select[id=species]', function(e){
   var val = $(this).val();
   
   switch(val)
   {
      case 'HYBRID':
         $('#sampleIndica').show();
         $('#sampleSativa').show();
      break;
      
      default:
         $('#sampleIndica').hide();
         $('#sampleIndica input').val('');
         
         $('#sampleSativa').hide();
         $('#sampleSativa input').val('');  
      break;
   }

});


$('#sampleForm').on('change', 'select[id=type]', function(e){
   var val = $(this).val();

   switch(val)
   {
      case 'FLOWER':
         $('#sampleConcentrate').hide();
         $('#sampleConcentrate select').val('').trigger('chosen:updated');
         
         $('#sampleExtraction').hide();
         $('#sampleExtraction select').val('').trigger('chosen:updated');
      break;
      
      case 'CONCENTRATE':
         $('#sampleConcentrate').show();
         $('#sampleExtraction').hide();      
      break;
   }


});


$('#sampleForm').on('change', 'select[id=concentrate]', function(e){
   var val = $(this).val();

   switch(val)
   {
      case 'OIL':
         $('#sampleExtraction').show();
      break;
      
      default:
         $('#sampleExtraction').hide(); 
         $('#sampleExtraction select').val('').trigger('chosen:updated');     
      break;
   }


});



// smells, resets child nodes
$('#sampleForm').on('click', 'input[type=radio]', function(e){
   
   var par = $(this).parent().get(0);
   
   $(par).siblings().each(function(){
      if($(this).get(0) !== par) {
         $('input[type=radio]', $(this)).prop('checked', false);
      }
   });
});