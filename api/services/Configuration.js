exports.getValue = function(item) {
    
   if(sails.config.cannabidata.hasOwnProperty(item))
   {
      return sails.config.cannabidata[item];
   }
   else
   {
      return '';
   }
   
}