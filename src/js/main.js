import route from "riot-route";
import background from "./background.js";


var peopleAnimation = "zoomIn";
// var peopleAnimation = "flipInX";

$(() => {
  $.getJSON("data/data.json").then(run);
});

$(window).on("resize", () => {
  background.resize();
});

function run (data) {
  background.init();
  $("body").on("click", background.rotate.toggle);


  _(data).filter(d => d.z !== 0).orderBy("z").forEach((d, i, j) => {

  console.log(d);



    // window.setTimeout(function () {
    //   $("<img style='z-index: " + (data.length - d.z) + "; width: " + (d.w / 2) + "px; height: auto; left:" + (d.x  / 2) + "px; bottom:" + (d.y / 2) + "px;' src='img/people/" + d.id + ".png' alt=''>").appendTo(".peopleContainer");
    // }, 50 * i);


    window.setTimeout(function () {
      var $el = $("<img style='z-index: " + (data.length - d.z) + "; width: " + (d.w / 2) + "px; height: auto; left:" + (d.x  / 2) + "px; bottom:" + (d.y / 2) + "px;' class='animated bounceIn' src='img/people/" + d.id + ".png' alt=''>").appendTo(".peopleContainer");
      if (i + 1 === j.length) {
        $el.on("animationend", () => {
          $(".peopleContainer img").removeClass("bounceIn");
        });
      }
    }, 50 * i);

  });



  // $(".peopleContainer").on("animationend", "img", e => {
  //   $(e.target).removeClass(peopleAnimation);
  // });

  // $(".peopleContainer").on("mouseover", "img", e => {
  //   $(e.target).addClass(peopleAnimation);
  // });


  // Routing

  route("/", () => {
  });

  route("/*", function (code) {
    var item = _(data).find({ "code": code });
    if (item === undefined) {
      route("/");
    } else {
      // DO SOMETHING
    }
  });

  route.start(true);
}