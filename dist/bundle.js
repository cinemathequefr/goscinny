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
var scale$1 = 0.5; // TODO

q$1.setMaxConnections(8);


// Initialise
function init$1 (_data) {
  data = _data;

  q$1.on("progress", function (e) { $.publish("gallery.progress", e.progress); }); // NB: le suivi de progress ne peut pas utiliser de promise, on utilise pub/sub

  return preloadWithPromise$1(
    q$1,
    _(data).sortBy("z").map(function (d) { return ({ id: d.id, src: "img/people/" + d.id + ".png" }); }).value()
  )
  .then(function (images) {
    isGalleryLoaded = true;
    data = _(images).sortBy("item.id").zipWith(
      data,
      function (i, d) { return _(d).assign({ img: i.result }).value(); }
    ).value();
  });


/*
  return new Promise((resolve, reject) => {
    q.on("complete", e => {
      isGalleryLoaded = true;
      var images = q.getItems();

      data = _(images).sortBy("item.id").zipWith(
        data,
        (i, d) =>  _(d).assign({ img: i.result }).value()
      ).value();

      _(data).orderBy("z").forEach((d, i, j) => {
        window.setTimeout(() => {
          $(d.img)
          .attr("data-id", d.id)
          .css({
            zIndex: (data.length - d.z),
            width: (d.w * scale) + "px",
            height: "auto",
            left: (d.x  * scale) + "px",
            bottom: (d.y * scale) + "px"
          })
          // .attr("style", "z-index: " + (data.length - d.z) + "; width: " + (d.w * s) + "px; height: auto; left:" + (d.x  * s) + "px; bottom:" + (d.y * s) + "px;")
          .addClass("animated")
          .addClass("bounceIn")
          .appendTo(".peopleContainer");

          if (i + 1 === j.length) {

            // Silhouettes
            _(data).filter(d => d.path).orderBy("z").reverse().forEach((d, i, j) => {
              d3.select(".shapesContainer").datum(d).append("path").attr("d", d.path).attr("data-name", d.name).attr("data-id", d.id);
            });

            $(".shapesContainer").on("mouseenter", "path", e => {
              var $elem = $(e.target);
              $(".info").html($elem.data("name"));

              $elem.one("mouseleave", f => { $(".info").html(""); });
            });

            resolve();
          }

        }, 35 * i);
      });
    });
  });
*/

}


function display () {
  return new Promise(function (resolve, reject) {
    if (!isGalleryLoaded) {
      reject("La galerie n'est pas encore chargée.");
    } else {
      _(data).orderBy("z").forEach(function (d, i, j) {
        window.setTimeout(function () {
          $(d.img)
          .attr("data-id", d.id)
          .css({
            zIndex: (data.length - d.z),
            width: (d.w * scale$1) + "px",
            height: "auto",
            left: (d.x  * scale$1) + "px",
            bottom: (d.y * scale$1) + "px"
          })
          .addClass("animated")
          .addClass("bounceIn")
          .appendTo(".peopleContainer");

          if (i + 1 === j.length) {
            _(data).filter(function (d) { return d.path; }).orderBy("z").reverse().forEach(function (d, i, j) {
              d3.select(".shapesContainer").datum(d).append("path").attr("d", d.path).attr("data-name", d.name).attr("data-id", d.id);
            });

            $(".shapesContainer").on("mouseenter", "path", function (e) {
              var $elem = $(e.target);
              $(".info").html($elem.data("name"));
              $elem.one("mouseleave", function (f) { $(".info").html(""); });
            });

            $(d.img).on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", resolve);
          }
        }, 35 * i);
      });
    }
  });
}


function on (event, callback) {
  $.subscribe(event, callback);
}


function preloadWithPromise$1 (queue, manifest, doRemoveAll) { // NB : duplicated from main.js
  if (!!doRemoveAll) { queue.removeAll(); }
  queue.loadManifest(manifest);
  return new Promise(function (resolve, reject) {
    queue.on("complete", function () { resolve(queue.getItems()); });
    queue.on("error", function () { reject("Erreur de chargement."); });
  });
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

// import route from "riot-route";
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
  .then(function () { return delayPromise(2000); })
  .then(function () {
    $("#rg").removeClass("bounce");
    return gallery.display();
  })
  .then(function () { return delayPromise(2000); })
  .then(background.rotate.stop)
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

function delayPromise (t) {
  return new Promise(function (resolve, reject) {
    window.setTimeout(resolve, t);
  });
}

}());
