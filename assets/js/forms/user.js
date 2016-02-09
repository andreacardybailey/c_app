// user form         
$('#userForm').bind('beforeSubmit', function(e, origEvent){
   $(this).data('data', $(this).serialize());
}).bind('onUpdate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">User successfully saved!</div>');
   
   setTimeout(function(){
      window.location.reload();
   }, 3000);
   
}).bind('onCreate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">User successfully created! <a href="/technician/new/?user='+data.id+'">Make user a technician.</a></div>');
   
   setTimeout(function(){
      window.location = '/user/edit/'+data.id;
   }, 10000);
});