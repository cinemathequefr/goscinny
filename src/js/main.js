import background from "./modules/background.js";
import gallery from "./modules/gallery.js";

window.scale = 0.5;

var q = new createjs.LoadQueue(true);
q.setMaxConnections(8);

$(main);
// if (!window.Promise) { // Conditionally loads Promise polyfill (see: https://philipwalton.com/articles/loading-polyfills-only-when-needed/)
//   q.loadFile("dist/vendor/es6-promise.min.js");
//   q.on("complete", () => {
//     window.Promise = ES6Promise;
//     $(main);
//   });
//   q.on("error", err => { console.log("Erreur de chargement de script"); });
// } else {
//   $(main);
// }

function main () {
  var data, p;

  background.init();
  background.rotate.start();

  preloadWithPromise(q, ["img/studio.png", "img/rg.png", "data/data.json"])
  .then(d => {
    $(d[0].result).attr("id", "studio").appendTo(".main");
    $(d[1].result)
      .attr("id", "rg")
      .attr("class", "animated bounce infinite")
      .css({
        left: (470 * scale) + "px",
        bottom: (-60 * scale) + "px",
        width: (500 * scale) + "px",
        height: (530 * scale) + "px" })
      .appendTo(".main");

    data = d[2].result;

    p = gallery.init(data);
    gallery.on("gallery.progress", (e, i) => { $(".info").html(Math.round(i * 100) + "%"); });
    return p;
  })
  .then(() => {
    window.setTimeout(() => {
      background.rotate.stop();
      $("#rg").removeClass("bounce");
    }, 2000);
  })
  .catch(reason => { console.error(reason); });

}


function preloadWithPromise (queue, manifest, doRemoveAll) {
  if (!!doRemoveAll) queue.removeAll();
  queue.loadManifest(manifest);
  return new Promise((resolve, reject) => {
    queue.on("complete", () => { resolve(queue.getItems()); });
    queue.on("error", () => { reject("Erreur de chargement."); });
  });
}





/*
import route from "riot-route";
import background from "./background.js";
import gallery from "./gallery.js";

var peopleAnimation = "flip";

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
  // route("/", () => {
  // });

  // route("/*", function (code) {
  //   var item = _(data).find({ "code": code });
  //   if (item === undefined) {
  //     route("/");
  //   } else {
  //     // DO SOMETHING
  //   }
  // });

  // route.start(true);



}
*/