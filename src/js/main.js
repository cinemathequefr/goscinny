import route from "riot-route";
import background from "./background.js";

$(() => {
  $.getJSON("data/data.json").then(run);
});

$(window).on("resize", () => {
  background.resize();
});

function run (data) {
  background.init();
  $("body").on("click", background.rotate.toggle);

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