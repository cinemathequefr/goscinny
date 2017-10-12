var data;
var $elBalloon;
var t;

function init (_data, elem, img) {
  var scale = 0.5;
  data = _data;
  $elBalloon = $("<div id='balloon'></div>")
  .appendTo(elem)
  .attr("class", "animated fast")
  .css({
    right: (0 * scale) + "px",
    bottom: (141 * scale) + "px",
    width: (315 * scale) + "px",
    height: (266 * scale) + "px",
    backgroundImage: "url(" + img + ")"
  })
  .hide();
}

function show (text) {
  window.clearTimeout(t);
  $elBalloon.removeClass("bounceOut").html(text).show().addClass("bounceIn");
}

function hide () {
  t = window.setTimeout(() => {
    $elBalloon.removeClass("bounceIn").addClass("bounceOut");
  }, 500);
}

export default {
  init: init,
  show: show,
  hide: hide
};