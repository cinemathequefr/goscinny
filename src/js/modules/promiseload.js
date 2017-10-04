// DEPS: Promise, preload.js, jQuery (tinyPubSub)
var q;
var isInit = false;

function init (maxConnections) {
  if (!!isInit) return;
  q = new createjs.LoadQueue(true);
  q.setMaxConnections(parseInt(maxConnections, 10) || 8);
  isInit = true;
}


function load (manifest, clearQueue, emitProgress) { // SEE: http://www.createjs.com/docs/preloadjs/classes/LoadQueue.html
  return new Promise((resolve, reject) => {
    if (!isInit) { reject("Le module de chargement n'a pas été initialisé."); }
    if (!!clearQueue) q.removeAll();
    q.loadManifest(manifest);

    if (!!emitProgress) {
      q.on("progress", e => { $.publish("promiseLoad.progress", e.progress); }); // NB: le suivi de progress ne peut pas utiliser de promise, on utilise pub/sub
    }

    q.on("complete", () => { resolve(q.getItems()); });
    q.on("error", () => { reject("Erreur de chargement."); });
  });
}


function on (event, callback) {
  $.subscribe(event, callback);
}


/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);

export default {
  init: init,
  load: load,
  on: on
};