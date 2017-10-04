(function () {
'use strict';

var arc = d3.arc().innerRadius(5).outerRadius(2000);
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

function display (data) {
  return new Promise(function (resolve, reject) {
    _(data).orderBy("order").reverse().forEach(function (d, i, j) {
      d3.select(".shapesContainer")
      .datum(d)
      .append("path")
      .attr("d", d.path)
      .attr("data-name", d.name)
      .attr("data-id", d.id)
      .style("display", "none");
    });

    _(data).orderBy("order").forEach(function (d, i, j) {
      var anim = d.anim || "bounceIn";
      window.setTimeout(
        function () {
          $(d.img)
          .attr("data-id", d.id)
          .css({
            zIndex: d.z,
            width: (d.w * scale) + "px",
            height: "auto",
            left: (d.x  * scale) + "px",
            bottom: (d.y * scale) + "px"
          })
          .addClass("animated")
          .addClass(anim)
          .appendTo(".peopleContainer")
          .on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
            $("path[data-id='" + d.id + "']").show();
          });

          // Traitements finaux (à la dernière image)
          if (i === j.length - 1) {
            $(".shapesContainer").one("mouseenter", "path", function (e) {
              mouseenter(e);
              $.publish("gallery.firstMouseenter"); // Au premier mouseenter, on arrête l'animation du background
              $(".shapesContainer").on("mouseenter", "path", function (e) {
                mouseenter(e);
              });
            });
            $(d.img).on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", resolve);
          }
        },
        (35 * i) + (i + 2 === j.length ? 1500 : 0) + (i + 1 === j.length ? 3500 : 0) // Délai supplémentaire pour les 2 derniers personnages
      );
    });
  });
}


function mouseenter (e) {
  var $elem = $(e.target);
  $(".info").html($elem.data("name"));
  $elem.one("mouseleave", function (f) { $(".info").html(""); });
}



function on (event, callback) {
  $.subscribe(event, callback);
}

/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);


var gallery = {
  display: display,
  on: on
};

// DEPS: Promise, preload.js, jQuery (tinyPubSub)
var q;
var isInit = false;

function init$1 (maxConnections) {
  if (!!isInit) { return; }
  q = new createjs.LoadQueue(true);
  q.setMaxConnections(parseInt(maxConnections, 10) || 8);
  isInit = true;
}


function load (manifest, clearQueue, emitProgress) { // SEE: http://www.createjs.com/docs/preloadjs/classes/LoadQueue.html
  return new Promise(function (resolve, reject) {
    if (!isInit) { reject("Le module de chargement n'a pas été initialisé."); }
    if (!!clearQueue) { q.removeAll(); }
    q.loadManifest(manifest);

    if (!!emitProgress) {
      q.on("progress", function (e) { $.publish("promiseLoad.progress", e.progress); }); // NB: le suivi de progress ne peut pas utiliser de promise, on utilise pub/sub
    }

    q.on("complete", function () { resolve(q.getItems()); });
    q.on("error", function () { reject("Erreur de chargement."); });
  });
}


function on$1 (event, callback) {
  $.subscribe(event, callback);
}


/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);

var promiseLoad = {
  init: init$1,
  load: load,
  on: on$1
};

// import route from "riot-route";
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
  .then(function (d) {
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
      ["data/texts.json"].concat(_(data.gallery).map(function (d) { return ({ id: d.id, src: "img/people/" + d.id + ".png" }); }).value()),
      true,
      true
    );

    promiseLoad.on("promiseLoad.progress", function (e, i) { $(".info").html(Math.round(i * 100) + "%"); });
    return p;
  })
  .then(function (assets) {
    assets = _(assets).map(function (d) { return d.result; }).value();
    data.texts = assets.shift();
    data.gallery = _(assets).sortBy("item.id").zipWith(
      data.gallery,
      function (i, d) { return _(d).assign({ img: i }).value(); }
    ).value();
    return gallery.display(data.gallery);
  })
  // .then(() => delayPromise(2000))
  .then(function () {
    $("#rg").removeClass("bounce");
    gallery.on("gallery.firstMouseenter", background.rotate.stop);
    return;
  })
  .catch(function (reason) { console.error(reason); });

}

}());
