import route from "riot-route";
import background from "./background.js";
import gallery from "./gallery.js";






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
  background.rotate.start();

  gallery.init(data);

  gallery.on("gallery.progress", (e, data) => {
    $(".info").html(Math.round(data * 100) + "%");
  });

  gallery.on("gallery.complete", e => {
    $(".info").html("Done!");
    background.rotate.stop();
    gallery.display();
  });

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