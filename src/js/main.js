import route from "riot-route";
import background from "./background.js";


var peopleAnimation = "flip";
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

    // window.setTimeout(function () {
    //   $("<img style='z-index: " + (data.length - d.z) + "; width: " + (d.w / 2) + "px; height: auto; left:" + (d.x  / 2) + "px; bottom:" + (d.y / 2) + "px;' src='img/people/" + d.id + ".png' alt=''>").appendTo(".peopleContainer");
    // }, 50 * i);


    window.setTimeout(function () {
      var $el = $("<img data-id='" + d.id + "' style='z-index: " + (data.length - d.z) + "; width: " + (d.w / 2) + "px; height: auto; left:" + (d.x  / 2) + "px; bottom:" + (d.y / 2) + "px;' class='animated bounceIn' src='img/people/" + d.id + ".png' alt=''>").appendTo(".peopleContainer");



      if (i + 1 === j.length) {
        $el.on("animationend", () => {
          $(".peopleContainer img").removeClass("bounceIn");
        });
      }
    }, 30 * i);

  });


  // Silhouettes
  _(data).filter(d => d.path).orderBy("z").reverse().forEach((d, i, j) => {
    d3.select(".shapesContainer").datum(d).append("path").attr("d", d.path).attr("data-name", d.name).attr("data-id", d.id);
  });

  $(".shapesContainer").on("mouseenter", "path", e => {
    var $elem = $(e.target);
    $(".info").html($elem.data("name"));

    $elem.one("mouseleave", f => { $(".info").html(""); });

  });






  // $(".shapesContainer").on("mouseenter", "path", e => {
  //   var id = $(e.target).data("id");
  //   $(".peopleContainer img[data-id='" + id + "']").addClass("blowup");
  //   // $(e.target).addClass("blowup");

  //   $(e.target).one("mouseleave", f => {
  //     window.setTimeout(() => {
  //       $(".peopleContainer img[data-id='" + id + "']").removeClass("blowup");
  //       // $(e.target).removeClass("blowup");
  //     }, 100);
  //   });
  // });


  // $(".peopleContainer").on("animationend", "img", e => {
  //   $(e.target).removeClass(peopleAnimation);
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