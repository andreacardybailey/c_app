function FunnelChart(data, width, height, bottomPct) {
  /* Parameters:
    data: 
      Array containing arrays of categories and engagement in order from greatest expected funnel engagement to lowest.  
      I.e. Button loads -> Short link hits  
      Ex: [['Button Loads', 1500], ['Button Clicks', 300], ['Subscribers', 150], ['Shortlink Hits', 100]]
    width & height: 
      Optional parameters for width & height of chart in pixels, otherwise default width/height are used  
    bottomPct: 
      Optional parameter that specifies the percent of the total width the bottom of the trapezoid is
      This is used to calculate the slope, so the chart's view can be changed by changing this value
  */
  var DEFAULT_HEIGHT = 400,
      DEFAULT_WIDTH = 600, 
      DEFAULT_BOTTOM_PERCENT = 1/3;
  
  this.data = data;
  this.totalEngagement = 0;
  for(var i = 0; i < data.length; i++){
    this.totalEngagement += data[i][1];
  }
  this.width = typeof width !== 'undefined' ? width : DEFAULT_WIDTH;
  this.height = typeof height !== 'undefined' ? height : DEFAULT_HEIGHT;
  this.bottomPct = typeof bottomPct !== 'undefined' ? bottomPct : DEFAULT_BOTTOM_PERCENT;
  this.slope = 2*this.height/(this.width - this.bottomPct*this.width);
  this.totalArea = (this.width+this.bottomPct*this.width)*this.height/2;
}

FunnelChart.prototype.getLabel = function(ind){
  /* Get label of a category at index 'ind' in this.data */
  return this.data[ind][0]
}

FunnelChart.prototype.getEngagementCount = function(ind){
  /* Get engagement value of a category at index 'ind' in this.data */
  return this.data[ind][1]
}

FunnelChart.prototype.createPaths = function(){
  /* Returns an array of points that can be passed into d3.svg.line to create a path for the funnel */
  trapezoids = []

  function findNextPoints(chart, prevLeftX, prevRightX, prevHeight, dataInd){
    // reached end of funnel
    if(dataInd >= chart.data.length) return;

    // math to calculate coordinates of the next base
    area = chart.data[dataInd][1]*chart.totalArea/chart.totalEngagement;
    prevBaseLength = prevRightX - prevLeftX;
    nextBaseLength = Math.sqrt((chart.slope * prevBaseLength * prevBaseLength - 4 * area)/chart.slope);
    nextLeftX = (prevBaseLength - nextBaseLength)/2 + prevLeftX; 
    nextRightX = prevRightX - (prevBaseLength-nextBaseLength)/2;
    nextHeight = chart.slope * (prevBaseLength-nextBaseLength)/2 + prevHeight;

    points = [[nextRightX, nextHeight]]
    points.push([prevRightX, prevHeight]);
    points.push([prevLeftX, prevHeight]);
    points.push([nextLeftX, nextHeight]);
    points.push([nextRightX, nextHeight]);
    trapezoids.push(points);

    findNextPoints(chart, nextLeftX, nextRightX, nextHeight, dataInd+1);
  }

  findNextPoints(this, 0, this.width, 0, 0);
  return trapezoids;
}

FunnelChart.prototype.draw = function(window, elem, complete){
    
  var self = this;
    
  var funnelSvg = window.d3.select(elem).append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

  // Creates the correct d3 line for the funnel
  var funnelPath = window.d3.svg.line()
                  .x(function(d) { return d[0]; })
                  .y(function(d) { return d[1]; });

  // Automatically generates colors for each trapezoid in funnel
  var colorScale = window.d3.scale.category10()

  var paths = this.createPaths();

  function drawTrapezoids(funnel, i){
    var trapezoid = funnelSvg
                    .append('svg:path')
                    .attr('d', function(d){ return funnelPath([paths[i][0], paths[i][1], paths[i][2], paths[i][2], paths[i][1], paths[i][2]])})
                    .attr('fill', '#fff');

    nextHeight = paths[i][[paths[i].length]-1];

    //var totalLength = trapezoid.node().getTotalLength();

    trapezoid.attr("d", function(d){return funnelPath(paths[i])})
                      .attr("fill", function(d){ return self.data[i][2]});

    funnelSvg
    .append('text')
    .text(self.data[i][1] >= 1 ? funnel.getLabel(i) + ': ' + parseFloat(funnel.getEngagementCount(i)).toFixed(1) + '%' : '')
    .style('font-family', 'Helvetica')
    .style('font-weight', 'bold')
    .attr("x", function(d){ return funnel.width/2 })
    .attr("y", function(d){ return (paths[i][0][1] + paths[i][1][1])/2}) // Average height of bases
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#fff");

    if(i < paths.length - 1){
        drawTrapezoids(funnel, i+1)
    }
  }

  drawTrapezoids(this, 0);
  
  complete( window.d3.select(elem).html() );
}

module.exports = FunnelChart;