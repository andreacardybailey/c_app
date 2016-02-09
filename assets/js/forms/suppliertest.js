// request form
$('#requestForm').bind('beforeSubmit', function(e, origEvent){
   $(this).data('data', $(this).serialize());
}).bind('onUpdate', function(e, data){
   var form = $(this);
   form.prepend('<div class="notice">Request successfully saved!</div>');
   
   setTimeout(function(){
      window.location.reload();
   }, 3000);
   
}).bind('onCreate', function(e, data){
   var form = $(this);
   window.location = '/sample/new/?request='+data.id;
}); 

$('select.select_view_tests').on('change', function(e){

  var loc = '/test/edit/'+ $(this).val()+'?r='+encodeURIComponent(window.location.pathname);
  window.location = loc;

});