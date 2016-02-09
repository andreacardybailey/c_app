// sample origin form
$('#sampleoriginForm').bind('beforeSubmit', function(e, origEvent){
   $(this).data('data', $(this).serialize());
}).bind('onUpdate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Origin successfully saved! <a href="/sample/edit/'+data.sample_id+'">Edit sample.</a> &nbsp; <a href="/sampleorigin/new/?sample='+data.sample_id+'">Assign another origin.</a></div>');
   
   setTimeout(function(){
      window.location.reload();
   }, 8000);
   
}).bind('onCreate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Origin successfully created! <a href="/sample/edit/'+data.sample_id+'">Edit sample.</a> &nbsp; <a href="/sampleorigin/new/?sample='+data.sample_id+'">Assign another origin.</a></div>');
   
   setTimeout(function(){
      window.location = '/sampleorigin/edit/'+data.id;
   }, 8000);
});