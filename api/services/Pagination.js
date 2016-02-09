exports.getPagination = function(resultsTotal, offset, limit) {

   var info = {
      results: {
          from: 0,
          to: 0,
          total: 0
      },
      pages: {
          current: 0,
          prev: null,
          next: null,
          total: 0
      }
   };

    var page = Math.floor(offset / limit) + 1;
   
    // Calculate the results from
    var resultsFrom = offset + 1;
    if (resultsFrom > resultsTotal) {
        resultsFrom = resultsTotal;
    }
   
    // Calculate the results to
    var resultsTo = (resultsFrom + limit) - 1;
    if (resultsTo > resultsTotal) {
        resultsTo = resultsTotal;
    }
   
    // Calculate total pages
    var pagesTotal = Math.ceil(resultsTotal / limit)
   
    // Calculate previous page number
    var prevPage = page - 1;
    if (prevPage < 1) {
        prevPage = null;
    }
   
    // Calculate next page number
    var nextPage = page + 1;
    if (nextPage > pagesTotal) {
        nextPage = null;
    }
   
    // Set response info
    info.results.total = resultsTotal;
    info.results.from  = resultsFrom;
    info.results.to    = resultsTo;
    info.pages.current = page;
    info.pages.prev    = prevPage;
    info.pages.next    = nextPage;
    info.pages.total   = pagesTotal;
    
    return info;
    
} 