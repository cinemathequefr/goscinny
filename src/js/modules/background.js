var arc = d3.arc().innerRadius(5).outerRadius(2000);
var bg;
var rotate;

function init (count) {
  count = count || 40;

  bg = d3
    .selectAll(".wrapper")
    // .selectAll(".backgroundContainer")
    .append("svg")
    .classed("background", true)
    .append("g")
    .append("g")
    .classed("rotate stop", true);

  bg.selectAll("path").data(new Array(count)).enter().append("path").attr("d", function (i, j, k) {
    var a = (2 * Math.PI) / count;
    return arc({
      startAngle: (j * a),
      endAngle: (j * a) + (a / 2)
    });
  });

  resize();
}

function resize () {

  var w = $(document).outerWidth(true);
  var h = $(document).outerHeight(true);


  d3.select(".wrapper svg")
    .attr("width", w)
    .attr("height", h)
    .select("g")
    .attr("transform", "translate(" + (w / 2) + "," + (h - 150) + ")");
    // .attr("width", window.innerWidth)
    // .attr("height", window.innerHeight)
    // .select("g")
    // .attr("transform", "translate(" + (window.innerWidth / 2) + "," + (window.innerHeight - 150) + ")");
}

rotate = {
  start: () => { bg.classed("stop", false); },
  stop: () => { bg.classed("stop", true); },
  toggle: () => { bg.classed("stop", !bg.classed("stop")); }
};

export default {
  init: init,
  resize: resize,
  rotate: rotate
};