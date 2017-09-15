

var arc = d3.arc().innerRadius(50).outerRadius(2000);

function init (count) {
  count = count || 40;

  var v = d3
    .selectAll("svg")
    .append("g")
    .append("g")
    .attr("class", "rotating")
    .selectAll("path").data(new Array(count)).enter().append("path").attr("d", function (i, j, k) {
      var a = (2 * Math.PI) / count;
      return arc({
        startAngle: (j * a),
        endAngle: (j * a) + (a / 2)
      });
    });

  resize();
}



function resize () {
  d3.select("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)
    .select("g")
    .attr("transform", "translate(" + (window.innerWidth / 2) + "," + (window.innerHeight * 0.667) + ")");
}


export default {
  init: init,
  resize: resize
};