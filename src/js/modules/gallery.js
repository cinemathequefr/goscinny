


function display (data) { // `data` est un objet contenant les informations sur chaque item de la galerie, y compris le blob image.
  return new Promise((resolve, reject) => {
    _(data).orderBy("order").reverse().forEach((d, i, j) => {
      d3.select(".shapesContainer")
      .datum(d)
      .append("path")
      .attr("d", d.path)
      .attr("data-name", d.name)
      .attr("data-id", d.id)
      .attr("data-code", d.code)
      .attr("data-textid", d.textId)
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
              $.publish("gallery.firstMouseenter");
              $(".shapesContainer").on("mouseenter", "path", e => {
                mouseenter(e);
              });
            });
            $(d.img).on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", resolve);
          }
        },
        (35 * i) // Sans délai supplémentaire pour les 2 derniers personnages
        // (35 * i) + (i + 2 === j.length ? 750 : 0) + (i + 1 === j.length ? 1500 : 0) // Délai supplémentaire pour les 2 derniers personnages
      );
    });
  });
}


function mouseenter (e) {
  var $elem = $(e.target);
  $(".info").html($elem.data("name"));
  $elem.one("mouseleave", f => { $(".info").html(""); });
}


function on (event, callback) {
  $.subscribe(event, callback);
}


/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);


export default {
  display: display,
  on: on
};