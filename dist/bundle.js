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



function init$1 (_data) {
  data = _data;
  var files = _(data).sortBy("z").map(function (d) { return ({ id: d.id, src: "img/people/" + d.id + ".png" }); }).value();
  q$1.loadManifest(files);

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

          if (i + 1 === j.length) { resolve(); }

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


/*
function display () {
  if (!isGalleryLoaded) return;
  _(data).filter(d => d.z !== 0).orderBy("z").forEach((d, i, j) => {
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
}
*/




/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);






var gallery = {
  init: init$1,
  display: display,
  on: on
};

var q = new createjs.LoadQueue(true);
q.setMaxConnections(8);

if (!window.Promise) { // Conditionally loads Promise polyfill (see: https://philipwalton.com/articles/loading-polyfills-only-when-needed/)
  q.loadFile("dist/vendor/es6-promise.min.js");
  q.on("complete", function () {
    window.Promise = ES6Promise;
    $(main);
  });
  q.on("error", function (err) { console.log("Erreur de chargement de script"); });
} else {
  $(main);
}

function main () {
  var data;

  q.removeAll();
  q.loadManifest(["data/data.json", "img/studio.png"]);
  new Promise(function (resolve, reject) {
    q.on("complete", function () { resolve(q.getItems()); });
    q.on("error", function () { reject("Erreur de chargement des données."); });
  })
  .then(function (items) { // NOTE: data.json et studio.png sont chargés
    data = _(items).find(function (i) { return i.item.id === "data/data.json"; }).result;

    background.init();
    background.rotate.start();
    $("#studio").show();

    q.removeAll();

    gallery.init(data).then(background.rotate.stop);

    // gallery.init(data).then(d => { console.log(d); });




  })
  .catch(function (reason) { console.error(reason); });
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
