var isGalleryLoaded = false;
var data;
var q = new createjs.LoadQueue(true); // http://www.createjs.com/Docs/PreloadJS/classes/LoadQueue.html
var scale = 0.5; // TODO

q.setMaxConnections(8);


// Initialise
function init (_data) {
  data = _data;

  q.on("progress", e => { $.publish("gallery.progress", e.progress); }); // NB: le suivi de progress ne peut pas utiliser de promise, on utilise pub/sub

  return preloadWithPromise(
    q,
    _(data).sortBy("z").map(d => ({ id: d.id, src: "img/people/" + d.id + ".png" })).value()
  )
  .then(images => {
    isGalleryLoaded = true;
    data = _(images).sortBy("item.id").zipWith(
      data,
      (i, d) =>  _(d).assign({ img: i.result }).value()
    ).value();
  });
}


function display () {
  return new Promise((resolve, reject) => {
    if (!isGalleryLoaded) {
      reject("La galerie n'est pas encore chargée.");
    } else {


      // NOTE: l'ordre de superposition des paths svg est forcément celui de leur ordre d'affichage (pas de z-index), qui est l'ordre inverse de celui d'affichage des images, donc il faut deux itérations distinctes
      _(data).orderBy("order").reverse().forEach((d, i, j) => {
        d3.select(".shapesContainer")
        .datum(d)
        .append("path")
        .attr("d", d.path)
        .attr("data-name", d.name)
        .attr("data-id", d.id)
        .style("display", "none");
      });

      _(data).orderBy("order").forEach((d, i, j) => {
        var anim = d.anim || "bounceIn";
        window.setTimeout(
          () => {
            $(d.img)
            .attr("data-id", d.id)
            .css({
              zIndex: d.z,
              // zIndex: data.length - d.z,
              width: (d.w * scale) + "px",
              height: "auto",
              left: (d.x  * scale) + "px",
              bottom: (d.y * scale) + "px"
            })
            .addClass("animated")
            .addClass(anim)
            .appendTo(".peopleContainer")
            .on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", () => {
              $("path[data-id='" + d.id + "']").show();
            });

            // Traitements finaux (à la dernière image)
            if (i === j.length - 1) {
              $(".shapesContainer").one("mouseenter", "path", e => {
                mouseenter(e);
                $.publish("gallery.firstMouseenter"); // Au premier mouseenter, on arrête l'animation du background
                $(".shapesContainer").on("mouseenter", "path", e => {
                  mouseenter(e);
                });
              });
              $(d.img).on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", resolve);
            }

          },
          (35 * i) + (i + 2 === j.length ? 3000 : 0) + (i + 1 === j.length ? 6000 : 0) // Délai supplémentaire pour les 2 derniers personnages
        );
      });
    }
  });
}


function mouseenter (e) {
  var $elem = $(e.target);
  $(".info").html($elem.data("name"));
  $elem.one("mouseleave", f => { $(".info").html(""); });
}



function off (event, callback) {
  $.unsubscribe(event, callback);
}


function on (event, callback) {
  $.subscribe(event, callback);
}


function one (event, callback) {
  $.subscribe(event, () => {
    callback();
    $.unsubscribe(event);
  });
}


function preloadWithPromise (queue, manifest, doRemoveAll) { // NB : duplicated from main.js
  if (!!doRemoveAll) queue.removeAll();
  queue.loadManifest(manifest);
  return new Promise((resolve, reject) => {
    queue.on("complete", () => { resolve(queue.getItems()); });
    queue.on("error", () => { reject("Erreur de chargement."); });
  });
}


/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);

export default {
  init: init,
  display: display,
  on: on
};