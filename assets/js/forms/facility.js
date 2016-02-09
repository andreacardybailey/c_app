// facility form         
$('#facilityForm').bind('beforeSubmit', function(e, origEvent){
   $(this).data('data', $(this).serialize());
}).bind('onUpdate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Facility successfully saved!</div>');
   
   setTimeout(function(){
      window.location.reload();
   }, 3000);
   
}).bind('onCreate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Facility successfully created! <a href="/user/new/?facility='+data.id+'">Create a new user.</a></div>');
   
   setTimeout(function(){
      window.location = '/facility/edit/'+data.id;
   }, 10000);
});