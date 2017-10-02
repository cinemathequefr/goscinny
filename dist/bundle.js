(function () {
'use strict';

var arc = d3.arc().innerRadius(50).outerRadius(2000);
var bg;
var rotate;

function init (count) {
  count = count || 40;

  bg = d3
    .selectAll(".backgroundContainer")
    .append("svg")
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
  // rotate.start();
}

function resize () {
  d3.select(".backgroundContainer svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)
    .select("g")
    .attr("transform", "translate(" + (window.innerWidth / 2) + "," + (window.innerHeight - 150) + ")");
}

rotate = {
  start: function () { bg.classed("stop", false); },
  stop: function () { bg.classed("stop", true); },
  toggle: function () { bg.classed("stop", !bg.classed("stop")); }
};

var background = {
  init: init,
  resize: resize,
  rotate: rotate
};

var isGalleryLoaded = false;
var data;
var q$1 = new createjs.LoadQueue(true); // http://www.createjs.com/Docs/PreloadJS/classes/LoadQueue.html

q$1.setMaxConnections(8);


// Initialise
function init$1 (_data) {
  data = _data;
  var files = _(data).sortBy("z").map(function (d) { return ({ id: d.id, src: "img/people/" + d.id + ".png" }); }).value();
  q$1.loadManifest(files);

  q$1.on("progress", function (e) { $.publish("gallery.progress", e.progress); }); // NB: le suivi de progress ne peut pas utiliser de promise, on utilise pub/sub

  return new Promise(function (resolve, reject) {
    q$1.on("complete", function (e) {
      isGalleryLoaded = true;
      var images = q$1.getItems();

      data = _(images).sortBy("item.id").zipWith(
        data,
        function (i, d) { return _(d).assign({ img: i.result }).value(); }
      ).value();

      _(data).orderBy("z").forEach(function (d, i, j) {
        window.setTimeout(function () {
          $(d.img)
          .attr("data-id", d.id)
          .attr("style", "z-index: " + (data.length - d.z) + "; width: " + (d.w / 2) + "px; height: auto; left:" + (d.x  / 2) + "px; bottom:" + (d.y / 2) + "px;")
          .addClass("animated")
          .addClass("bounceIn")
          .appendTo(".peopleContainer");

          if (i + 1 === j.length) {

            // Silhouettes
            _(data).filter(function (d) { return d.path; }).orderBy("z").reverse().forEach(function (d, i, j) {
              d3.select(".shapesContainer").datum(d).append("path").attr("d", d.path).attr("data-name", d.name).attr("data-id", d.id);
            });

            $(".shapesContainer").on("mouseenter", "path", function (e) {
              var $elem = $(e.target);
              $(".info").html($elem.data("name"));

              $elem.one("mouseleave", function (f) { $(".info").html(""); });
            });

            resolve();
          }

        }, 35 * i);
      });
    });

  });
}

function on (event, callback) {
  $.subscribe(event, callback);
}


function display () {
  if (!isGalleryLoaded) { return; }



}

/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);

var gallery = {
  init: init$1,
  display: display,
  on: on
};

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
  .then(function (d) {
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
    gallery.on("gallery.progress", function (e, i) { $(".info").html(Math.round(i * 100) + "%"); });
    return p;
  })
  .then(function () {
    window.setTimeout(function () {
      background.rotate.stop();
      $("#rg").removeClass("bounce");
    }, 2000);
  })
  .catch(function (reason) { console.error(reason); });

}


function preloadWithPromise (queue, manifest, doRemoveAll) {
  if (!!doRemoveAll) { queue.removeAll(); }
  queue.loadManifest(manifest);
  return new Promise(function (resolve, reject) {
    queue.on("complete", function () { resolve(queue.getItems()); });
    queue.on("error", function () { reject("Erreur de chargement."); });
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

}());
