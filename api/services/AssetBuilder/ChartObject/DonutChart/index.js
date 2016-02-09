module.exports = function DonutChart(next)
{
   var colors = { 
      'CBD'  : '#dd6b00', 
      'CBN'  : '#d8889c', 
      'THC'  : '#9C2112', 
      'THCV' : '#E04800', 
      'CBG'  : '#E89D12', 
      'CBC'  : '#D15F7B' 
   };
   
   // set data defaults
   var data = [
      { cannabinoid : 'CBD',  value : 0 },
      { cannabinoid : 'CBN',  value : 0 },
      { cannabinoid : 'THC',  value : 0 },
      { cannabinoid : 'THCV', value : 0 },
      { cannabinoid : 'CBG',  value : 0 },
      { cannabinoid : 'CBC' , value : 0 }
   ];
   
   // map inputData to plot data
   data.forEach(function(entry) {
      if(self.inputData[entry.cannabinoid]) {
         entry.value = self.inputData[entry.cannabinoid];
      }
   });

   // ensure data values are integers
   data.forEach(function(d) {
      d.value = +d.value;
   });
   
   var getValue = function(key) {
      var val = 0.00;
      data.forEach(function(d){
         if(d.cannabinoid == key) {
            val =  parseFloat(d.value).toFixed(1) + '%';
         }
      });
      return val;
   }
   
   var dimensions = {
      canvas : {
         width : 550,
         height : 550
      },
      donut : {
         width : 520,
         height : 520
      },
      legend :  { 
         width : 120
      }
   }

   var radius = Math.min(dimensions.donut.width, dimensions.donut.height) / 2;
   
   var pie = d3.layout.pie()
       .sort(null)
       .value(function(d) { return d.value; });
       
   var arc = d3.svg.arc()
       .outerRadius(radius - 10)
       .innerRadius(radius - 140);
       
   var svg = d3.select("body").append("svg")
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr("width", dimensions.canvas.width) // 440 pt
      .attr("height", dimensions.canvas.height)
      .append("g")
      .attr("transform", "translate(" + dimensions.donut.width / 2 + "," + dimensions.donut.height / 2 + ")");

  var g = svg.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");
      

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { 
         console.log(d.data.cannabinoid); 
         return colors[d.data.cannabinoid]; 
      });            
      
   g.append("text")
         .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
         .attr("dy", ".35em")
         .style("text-anchor", "middle")
         .style('font-size', '12pt')
         .style('font-weight', 'bold')
         .style("font-family" ,"Helvetica")
         .style("fill" ,"#FFFFFF")
         .text(function(d) { return parseFloat(d.data.value) > 3 ? d.data.cannabinoid + '  ' + d.data.value.toFixed(1) + '%' : ''; });
      
}