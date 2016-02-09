module.exports.getFilter = function(req, model) {

  var filters = req.query.filters || [];
  var values  = req.query.text || [];
  var cond    = { where : {} };
  var fields  = Object.keys(sails.models[model].searchFields);
  
  filters.forEach(function(filter, index){
  
    var val = values[index] || '';
  
    if(-1 < _.indexOf(fields, filter)) {
      
      var column = sails.models[model].searchFields[filter];
      
      if(Object.prototype.toString.call(column) == '[object Object]') {
        field = column.field
      } else {
        field = column;
      }
      
      cond.where[field] = {
        contains : val
      };
    }
  });
  
  return cond;

};