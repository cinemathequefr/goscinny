var isGalleryLoaded = false;
var data;
var q = new createjs.LoadQueue(true); // http://www.createjs.com/Docs/PreloadJS/classes/LoadQueue.html

q.setMaxConnections(8);



function init (_data) {
  data = _data;
  var files = _(data).sortBy("z").map(d => ({ id: d.id, src: "img/people/" + d.id + ".png" })).value();
  q.loadManifest(files);

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
          .attr("style", "z-index: " + (data.length - d.z) + "; width: " + (d.w / 2) + "px; height: auto; left:" + (d.x  / 2) + "px; bottom:" + (d.y / 2) + "px;")
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


}




// OK
/*
function init (_data) {
  data = _data;
  var files = _(data).sortBy("z").map(d => ({ id: d.id, src: "img/people/" + d.id + ".png" })).value();

  q.loadManifest(files);

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
        .attr("style", "z-index: " + (data.length - d.z) + "; width: " + (d.w / 2) + "px; height: auto; left:" + (d.x  / 2) + "px; bottom:" + (d.y / 2) + "px;")
        .addClass("animated")
        .addClass("bounceIn")
        .appendTo(".peopleContainer");

        if (i + 1 === j.length) { alert("Done"); }

      }, 50 * i);
    });
  });
}
*/





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


function display () {
  if (!isGalleryLoaded) return;



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






export default {
  init: init,
  display: display,
  on: on
};