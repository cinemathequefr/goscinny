var arc = d3.arc().innerRadius(50).outerRadius(2000);
var bg;
var rotate;

function init (count) {
  count = count || 40;

  bg = d3
    .selectAll(".backgroundContainer")
    .append("svg")
    .append("g")
    .append("g")
    .classed("rotate", true);

  bg.selectAll("path").data(new Array(count)).enter().append("path").attr("d", function (i, j, k) {
    var a = (2 * Math.PI) / count;
    return arc({
      startAngle: (j * a),
      endAngle: (j * a) + (a / 2)
    });
  });

  resize();
  rotate.start();
}

function resize () {
  d3.select("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)
    .select("g")
    .attr("transform", "translate(" + (window.innerWidth / 2) + "," + (window.innerHeight * 0.667) + ")");
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