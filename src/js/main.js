import background from "./background.js";
import gallery from "./gallery.js";

var q = new createjs.LoadQueue(true);
q.setMaxConnections(8);

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

function main () {
  var data;

  q.removeAll();
  q.loadManifest(["data/data.json", "img/studio.png"]);
  new Promise((resolve, reject) => {
    q.on("complete", () => { resolve(q.getItems()); });
    q.on("error", () => { reject("Erreur de chargement des données."); });
  })
  .then(items => { // NOTE: data.json et studio.png sont chargés
    data = _(items).find(i => i.item.id === "data/data.json").result;

    background.init();
    background.rotate.start();
    $("#studio").show();

    q.removeAll();

    gallery.init(data).then(background.rotate.stop);

    // gallery.init(data).then(d => { console.log(d); });




  })
  .catch(reason => { console.error(reason); });
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