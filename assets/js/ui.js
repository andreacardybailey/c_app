var UI = (function($){
  
  // instantiate slide-in menu for tablet
  var open = 0;
  $('.quick_menu').click(function(){
    if (open == 0) {
      $('menu').animate({
        left: 0
      }, 200);
      open = 1;
    }
    else {
      $('menu').animate({
        left: -266
      }, 200);
      open = 0;
    }
  });
  
  // disable tabs
  $('.tabs>li>a').each(function(){
    $(this).click(function(e) {
      if ($(this).parent().is('.disabled')) {
        e.preventDefault();
      }
    });
  })

})(jQuery);

