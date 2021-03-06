var arc = d3.arc().innerRadius(5).outerRadius(2000);
var bg;
var rotate;

function init (count) {
  count = count || 40;

  bg = d3
    .selectAll(".wrapper")
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
  var w = $("body").outerWidth(true);
  var h = $("body").outerHeight(true);
  d3.select("svg.background")
  .attr("width", w)
  .attr("height", h)
  .select("g")
  .attr("transform", "translate(" + (w / 2) + "," + (h - 150) + ")");
}


rotate = (function () {
  var t;
  return {
    start: (sec) => {
      bg.classed("stop", false);
      if (sec) {
        window.clearTimeout(t);
        t = window.setTimeout(rotate.stop, sec * 1000);
      }
    },
    stop: () => {
      bg.classed("stop", true);
      window.clearTimeout(t);
    },
    toggle: () => { bg.classed("stop", !bg.classed("stop")); }
  }
})();

export default {
  init: init,
  resize: resize,
  rotate: rotate
};