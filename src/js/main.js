// import route from "riot-route";
import background from "./modules/background.js";
import gallery from "./modules/gallery.js";
import promiseLoad from "./modules/promiseload.js";

window.scale = 0.5;

// var q = new createjs.LoadQueue(true);
// q.setMaxConnections(8);

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
  // var data, p;
  var data = {
    gallery: null,
    texts: null
  };


  promiseLoad.init();
  background.init();
  background.rotate.start();

  promiseLoad.load(["img/studio.png", "img/rg.png", "data/gallery.json"])
  // preloadWithPromise(q, ["img/studio.png", "img/rg.png", "data/gallery.json"])
  .then(d => {
    $(d[0].result).attr("id", "studio").appendTo(".main");
    $(d[1].result)
      .attr("id", "rg")
      .attr("class", "animated bounce infinite")
      .css({
        left: (470 * scale) + "px",
        bottom: (-60 * scale) + "px",
        width: (500 * scale) + "px",
        height: (530 * scale) + "px"
      })
      .appendTo(".main");

    $(".backgroundContainer").show();

    data.gallery = d[2].result;

    var p = promiseLoad.load(
      ["data/texts.json"].concat(_(data.gallery).map(d => ({ id: d.id, src: "img/people/" + d.id + ".png" })).value()),
      true,
      true
    );

    promiseLoad.on("promiseLoad.progress", (e, i) => { $(".info").html(Math.round(i * 100) + "%"); });
    return p;
  })
  .then(assets => {
    assets = _(assets).map(d => d.result).value();
    data.texts = assets.shift();
    data.gallery = _(assets).sortBy("item.id").zipWith(
      data.gallery,
      (i, d) =>  _(d).assign({ img: i }).value()
    ).value();
    return gallery.display(data.gallery);
  })
  // .then(() => delayPromise(2000))
  .then(() => {
    $("#rg").removeClass("bounce");
    gallery.on("gallery.firstMouseenter", background.rotate.stop);
    return;
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

function delayPromise (t) {
  return new Promise((resolve, reject) => {
    window.setTimeout(resolve, t);
  });
}
