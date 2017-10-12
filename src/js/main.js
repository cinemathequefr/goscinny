import route from "riot-route";
import background from "./modules/background.js";
import balloon from "./modules/balloon.js";
import gallery from "./modules/gallery.js";
import promiseLoad from "./modules/promiseload.js";

window.scale = 0.5;

var template = {
  content: _.template([
    "<h1><%= title %></h1>",
    "<div class='text'><%= text %></div>",
  ].join(""))
};

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

function main () {
  var data = {
    gallery: null,
    texts: null
  };
  var currentCode = null; // Code du texte actuellement chargé

  window.onkeydown = function (e) { 
    return !(e.keyCode == 32);
  };

  $(".textinnercontainer").perfectScrollbar({
    suppressScrollX: true,
    wheelSpeed: 3
  });

  promiseLoad.init();
  background.init();
  background.rotate.start(30); // Rotation pendant 30 s

  promiseLoad.load(["img/studio.png", "img/rg.png", "img/balloon.png", "data/gallery.json"])
  .then(d => {
    data.gallery = d[3].result;
    $(d[0].result).attr("id", "studio").appendTo(".gallerycontainer");
    $(d[1].result)
    .attr("id", "rg")
    .attr("class", "animated bounce infinite")
    .css({
      left: (470 * scale) + "px",
      bottom: (-60 * scale) + "px",
      width: (500 * scale) + "px",
      height: (530 * scale) + "px"
    })
    .appendTo(".gallerycontainer");

    balloon.init(data.gallery, document.querySelector(".gallerycontainer"), d[2].result.src);

    var p = promiseLoad.load(
      ["data/texts.json"].concat(_(data.gallery).map(d => ({ id: d.id, src: "img/people/" + d.id + ".png" })).value()),
      true,
      true
    );

    promiseLoad.on("promiseLoad.progress", (e, i) => { $(".info").html(Math.round(i * 100) + "%"); });
    return p;
  })
  .then(assets => {

    $(".info").fadeOut(500);
    $("#rg").removeClass("bounce");

    assets = _(assets).map(d => d.result).value();
    data.texts = assets.shift();

    data.gallery = _(assets)
    .sortBy("item.id")
    .zipWith( // Ajoute les blobs images
      data.gallery,
      (i, d) =>  _(d).assign({ img: i }).value()
    )
    .map(d => { // Ajoute les codes (url)
      var t = _(data.texts).find({ id: d.text });
      return t ? _(d).assign({ code: t.code, textId: t.id }).value() : d;
    })
    .value();

    // Routing

    route("/", () => {
      $(".wrapper").removeClass("show");
      $("a.caret-down").removeClass("rubberBand");
      $("svg.background").removeClass("uderzo");
    });

    route("/*", function (code) {
      currentCode = code;
      var item = _(data.texts).find({ "code": code });
      if (item === undefined) {
        currentCode = null;
        route("/");
      } else {
        if (code === "albert-uderzo") {
          $("svg.background").addClass("uderzo");
          background.rotate.start(15);
        } else {
          $("svg.background").removeClass("uderzo");
        }


        $(".textscroller").html(template.content(_(data.texts).find({ code: code })));
        $(".textinnercontainer").scrollTop(0).perfectScrollbar("update");
        $(".wrapper").addClass("show");
        $("a.caret-down").hide();
        window.setTimeout(() => {
          $("a.caret-down").show().addClass("rubberBand");
        }, 450);
      }
    });
    route.start(true);

    // Bindings
    $(".shapescontainer").on("click", "path", e => {
      route($(e.target).data("code"));
    });

    $(document).on("mousewheel", _.debounce(function (e) {
      if (e.deltaY < 0 && window.location.hash !== "") route("/");
      if (e.deltaY > 0 && currentCode !== null) route(currentCode);
    }.bind(this), 10));


    return gallery.display(data.gallery); // Promise
  })
  .then(() => {
    gallery.on("gallery.mouseenter", (e, f) => { balloon.show($(f).data("name")); });
    gallery.on("gallery.mouseleave", balloon.hide);
    return;
  })
  .catch(reason => { console.error(reason); });

  $("a").on("click", () => {
    if ($(".wrapper").hasClass("show")) {
      $(".wrapper").removeClass("show");
    } else {
      $(".wrapper").addClass("show");
    }
  });
}


function delayPromise (t) {
  return new Promise((resolve, reject) => {
    window.setTimeout(resolve, t);
  });
}

/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.12
 *
 * Requires: jQuery 1.2.2+
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});
