// technician form         
$('#technicianForm').bind('beforeSubmit', function(e, origEvent){
   $(this).data('data', $(this).serialize());
}).bind('onUpdate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Technician successfully saved!</div>');
   
   setTimeout(function(){
      window.location.reload();
   }, 3000);
   
}).bind('onCreate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Technician successfully created!</div>');
   
   setTimeout(function(){
      window.location = '/technician/edit/'+data.id;
   }, 3000);
}); 