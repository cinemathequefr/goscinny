// import route from "riot-route";
import background from "./modules/background.js";
import gallery from "./modules/gallery.js";

window.scale = 0.5;

var q = new createjs.LoadQueue(true);
q.setMaxConnections(8);

$(main);
/*
if (!window.Promise) { // Conditionally loads Promise polyfill (see: https://philipwalton.com/articles/loading-polyfills-only-when-needed/)
  q.loadFile("dist/vendor/es6-promise.min.js");
  q.on("complete", () => {
    window.Promise = ES6Promise;
    $(main);
  });
  q.on("error", err => { console.log("Erreur de chargement de script"); });
} else {
  $(main);
}
*/

/*
// Routing
route("/", () => {
});

route("/*", function (code) {
  var item = _(data).find({ "code": code });
  if (item === undefined) {
    route("/");
  } else {    
  }
});

route.start(true);
*/

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

    $(".backgroundContainer").show();

    data = d[2].result;

    p = gallery.init(data);
    gallery.on("gallery.progress", (e, i) => { $(".info").html(Math.round(i * 100) + "%"); });
    return p;
  })
  .then(() => delayPromise(2000))
  .then(() => {
    $("#rg").removeClass("bounce");
    return gallery.display();
  })
  .then(() => delayPromise(2000))
  .then(background.rotate.stop)
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

function delayPromise (t) {
  return new Promise((resolve, reject) => {
    window.setTimeout(resolve, t);
  });
}
