(function () {
'use strict';

var observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {};

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice;

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given `event` ands
     * execute the `callback` each time an event is triggered.
     * @param  { String } event - event id
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(event, fn) {
        if (typeof fn == 'function')
          { (callbacks[event] = callbacks[event] || []).push(fn); }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given `event` listeners
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(event, fn) {
        if (event == '*' && !fn) { callbacks = {}; }
        else {
          if (fn) {
            var arr = callbacks[event];
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn) { arr.splice(i--, 1); }
            }
          } else { delete callbacks[event]; }
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given `event` and
     * execute the `callback` at most once
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(event, fn) {
        function on() {
          el.off(event, on);
          fn.apply(el, arguments);
        }
        return el.on(event, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given `event`
     * @param   { String } event - event id
     * @returns { Object } el
     */
    trigger: {
      value: function(event) {
        var arguments$1 = arguments;


        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns,
          fn,
          i;

        for (i = 0; i < arglen; i++) {
          args[i] = arguments$1[i + 1]; // skip first argument
        }

        fns = slice.call(callbacks[event] || [], 0);

        for (i = 0; fn = fns[i]; ++i) {
          fn.apply(el, args);
        }

        if (callbacks['*'] && event != '*')
          { el.trigger.apply(el, ['*', event].concat(args)); }

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  });

  return el

};

var RE_ORIGIN = /^.+?\/\/+[^/]+/;
var EVENT_LISTENER = 'EventListener';
var REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER;
var ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER;
var HAS_ATTRIBUTE = 'hasAttribute';
var POPSTATE = 'popstate';
var HASHCHANGE = 'hashchange';
var TRIGGER = 'trigger';
var MAX_EMIT_STACK_LEVEL = 3;
var win = typeof window != 'undefined' && window;
var doc = typeof document != 'undefined' && document;
var hist = win && history;
var loc = win && (hist.location || win.location);
var prot = Router.prototype;
var clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click';
var central = observable();

var started = false;
var routeFound = false;
var debouncedEmit;
var base;
var current;
var parser;
var secondParser;
var emitStack = [];
var emitStackLevel = 0;

/**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @returns {array} array
 */
function DEFAULT_PARSER(path) {
  return path.split(/[/?#]/)
}

/**
 * Default parser (second). You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @param {string} filter - filter string (normalized)
 * @returns {array} array
 */
function DEFAULT_SECOND_PARSER(path, filter) {
  var f = filter
    .replace(/\?/g, '\\?')
    .replace(/\*/g, '([^/?#]+?)')
    .replace(/\.\./, '.*');
  var re = new RegExp(("^" + f + "$"));
  var args = path.match(re);

  if (args) { return args.slice(1) }
}

/**
 * Simple/cheap debounce implementation
 * @param   {function} fn - callback
 * @param   {number} delay - delay in seconds
 * @returns {function} debounced function
 */
function debounce(fn, delay) {
  var t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, delay);
  }
}

/**
 * Set the window listeners to trigger the routes
 * @param {boolean} autoExec - see route.start
 */
function start(autoExec) {
  debouncedEmit = debounce(emit, 1);
  win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit);
  win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
  doc[ADD_EVENT_LISTENER](clickEvent, click);
  if (autoExec) { emit(true); }
}

/**
 * Router class
 */
function Router() {
  this.$ = [];
  observable(this); // make it observable
  central.on('stop', this.s.bind(this));
  central.on('emit', this.e.bind(this));
}

function normalize(path) {
  return path.replace(/^\/|\/$/, '')
}

function isString(str) {
  return typeof str == 'string'
}

/**
 * Get the part after domain name
 * @param {string} href - fullpath
 * @returns {string} path from root
 */
function getPathFromRoot(href) {
  return (href || loc.href).replace(RE_ORIGIN, '')
}

/**
 * Get the part after base
 * @param {string} href - fullpath
 * @returns {string} path from base
 */
function getPathFromBase(href) {
  return base[0] === '#'
    ? (href || loc.href || '').split(base)[1] || ''
    : (loc ? getPathFromRoot(href) : href || '').replace(base, '')
}

function emit(force) {
  // the stack is needed for redirections
  var isRoot = emitStackLevel === 0;
  if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) { return }

  emitStackLevel++;
  emitStack.push(function() {
    var path = getPathFromBase();
    if (force || path !== current) {
      central[TRIGGER]('emit', path);
      current = path;
    }
  });
  if (isRoot) {
    var first;
    while (first = emitStack.shift()) { first(); } // stack increses within this call
    emitStackLevel = 0;
  }
}

function click(e) {
  if (
    e.which !== 1 // not left click
    || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
    || e.defaultPrevented // or default prevented
  ) { return }

  var el = e.target;
  while (el && el.nodeName !== 'A') { el = el.parentNode; }

  if (
    !el || el.nodeName !== 'A' // not A tag
    || el[HAS_ATTRIBUTE]('download') // has download attr
    || !el[HAS_ATTRIBUTE]('href') // has no href attr
    || el.target && el.target !== '_self' // another window or frame
    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) === -1 // cross origin
  ) { return }

  if (el.href !== loc.href
    && (
      el.href.split('#')[0] === loc.href.split('#')[0] // internal jump
      || base[0] !== '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
      || base[0] === '#' && el.href.split(base)[0] !== loc.href.split(base)[0] // outside of #base
      || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
    )) { return }

  e.preventDefault();
}

/**
 * Go to the path
 * @param {string} path - destination path
 * @param {string} title - page title
 * @param {boolean} shouldReplace - use replaceState or pushState
 * @returns {boolean} - route not found flag
 */
function go(path, title, shouldReplace) {
  // Server-side usage: directly execute handlers for the path
  if (!hist) { return central[TRIGGER]('emit', getPathFromBase(path)) }

  path = base + normalize(path);
  title = title || doc.title;
  // browsers ignores the second parameter `title`
  shouldReplace
    ? hist.replaceState(null, title, path)
    : hist.pushState(null, title, path);
  // so we need to set it manually
  doc.title = title;
  routeFound = false;
  emit();
  return routeFound
}

/**
 * Go to path or set action
 * a single string:                go there
 * two strings:                    go there with setting a title
 * two strings and boolean:        replace history with setting a title
 * a single function:              set an action on the default route
 * a string/RegExp and a function: set an action on the route
 * @param {(string|function)} first - path / action / filter
 * @param {(string|RegExp|function)} second - title / action
 * @param {boolean} third - replace flag
 */
prot.m = function(first, second, third) {
  if (isString(first) && (!second || isString(second))) { go(first, second, third || false); }
  else if (second) { this.r(first, second); }
  else { this.r('@', first); }
};

/**
 * Stop routing
 */
prot.s = function() {
  this.off('*');
  this.$ = [];
};

/**
 * Emit
 * @param {string} path - path
 */
prot.e = function(path) {
  this.$.concat('@').some(function(filter) {
    var args = (filter === '@' ? parser : secondParser)(normalize(path), normalize(filter));
    if (typeof args != 'undefined') {
      this[TRIGGER].apply(null, [filter].concat(args));
      return routeFound = true // exit from loop
    }
  }, this);
};

/**
 * Register route
 * @param {string} filter - filter for matching to url
 * @param {function} action - action to register
 */
prot.r = function(filter, action) {
  if (filter !== '@') {
    filter = '/' + normalize(filter);
    this.$.push(filter);
  }
  this.on(filter, action);
};

var mainRouter = new Router();
var route = mainRouter.m.bind(mainRouter);

/**
 * Create a sub router
 * @returns {function} the method of a new Router object
 */
route.create = function() {
  var newSubRouter = new Router();
  // assign sub-router's main method
  var router = newSubRouter.m.bind(newSubRouter);
  // stop only this sub-router
  router.stop = newSubRouter.s.bind(newSubRouter);
  return router
};

/**
 * Set the base of url
 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
 */
route.base = function(arg) {
  base = arg || '#';
  current = getPathFromBase(); // recalculate current path
};

/** Exec routing right now **/
route.exec = function() {
  emit(true);
};

/**
 * Replace the default router to yours
 * @param {function} fn - your parser function
 * @param {function} fn2 - your secondParser function
 */
route.parser = function(fn, fn2) {
  if (!fn && !fn2) {
    // reset parser for testing...
    parser = DEFAULT_PARSER;
    secondParser = DEFAULT_SECOND_PARSER;
  }
  if (fn) { parser = fn; }
  if (fn2) { secondParser = fn2; }
};

/**
 * Helper function to get url query as an object
 * @returns {object} parsed query
 */
route.query = function() {
  var q = {};
  var href = loc.href || current;
  href.replace(/[?&](.+?)=([^&]*)/g, function(_, k, v) { q[k] = v; });
  return q
};

/** Stop routing **/
route.stop = function () {
  if (started) {
    if (win) {
      win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit);
      win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
      doc[REMOVE_EVENT_LISTENER](clickEvent, click);
    }
    central[TRIGGER]('stop');
    started = false;
  }
};

/**
 * Start routing
 * @param {boolean} autoExec - automatically exec after starting if true
 */
route.start = function (autoExec) {
  if (!started) {
    if (win) {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        start(autoExec);
      }
      else {
        document.onreadystatechange = function () {
          if (document.readyState === 'interactive') {
            // the timeout is needed to solve
            // a weird safari bug https://github.com/riot/route/issues/33
            setTimeout(function() { start(autoExec); }, 1);
          }
        };
      }
    }
    started = true;
  }
};

/** Prepare the router **/
route.base();
route.parser();

var arc = d3.arc().innerRadius(5).outerRadius(2000);
var bg;
var rotate;

function init (count) {
  count = count || 40;

  bg = d3
    .selectAll(".wrapper")
    .append("svg")
    .classed("background", true)
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

  var w = $(document).outerWidth(true);
  var h = $(document).outerHeight(true);


  d3.select("svg.background")
    .attr("width", w)
    .attr("height", h)
    .select("g")
    .attr("transform", "translate(" + (w / 2) + "," + (h - 150) + ")");
    // .attr("width", window.innerWidth)
    // .attr("height", window.innerHeight)
    // .select("g")
    // .attr("transform", "translate(" + (window.innerWidth / 2) + "," + (window.innerHeight - 150) + ")");
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

var $elBalloon;
var t;

function init$1 (_data, elem, img) {
  var scale = 0.5;
  $elBalloon = $("<div id='balloon'></div>")
  .appendTo(elem)
  .attr("class", "animated fast")
  .css({
    right: (0 * scale) + "px",
    bottom: (141 * scale) + "px",
    width: (315 * scale) + "px",
    height: (266 * scale) + "px",
    backgroundImage: "url(" + img + ")"
  })
  .hide();
}


function show (text) {
  window.clearTimeout(t);
  $elBalloon.removeClass("bounceOut").html(text).show().addClass("bounceIn");
}

function hide () {
  t = window.setTimeout(function () {
    $elBalloon.removeClass("bounceIn").addClass("bounceOut");
  }, 250);
}


var balloon = {
  init: init$1,
  show: show,
  hide: hide
};

function display (data) { // `data` est un objet contenant les informations sur chaque item de la galerie, y compris le blob image.
  return new Promise(function (resolve, reject) {
    _(data).orderBy("order").reverse().forEach(function (d, i, j) {
      d3.select(".shapescontainer")
      .datum(d)
      .append("path")
      .attr("d", d.path)
      .attr("data-name", d.name)
      .attr("data-id", d.id)
      .attr("data-code", d.code)
      .attr("data-textid", d.textId)
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
          .appendTo(".peoplecontainer")
          .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
            $("path[data-id='" + d.id + "']").show();
          });

          // Traitements finaux (à la dernière image)
          if (i === j.length - 1) {
            $(".shapescontainer").one("mouseenter", "path", function (e) {
              mouseenter(e);
              $.publish("gallery.firstMouseenter");
              $(".shapescontainer").on("mouseenter", "path", function (e) {
                mouseenter(e);
              });
            });
            $(d.img).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", resolve);
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
  $.publish("gallery.mouseenter", $elem);
  $elem.one("mouseleave", function (f) { $.publish("gallery.mouseleave"); });
}
/*
function mouseenter (e) {
  var $elem = $(e.target);
  $(".info").html($elem.data("name"));
  $elem.one("mouseleave", f => { $(".info").html(""); });
}
*/


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

function init$2 (maxConnections) {
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
  init: init$2,
  load: load,
  on: on$1
};

window.scale = 0.5;

var template = {
  content: _.template([
    "<h1><%= title %></h1>",
    "<div class='text'><%= text %></div>" ].join(""))
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
  var this$1 = this;

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
  background.rotate.start();
  window.setTimeout(background.rotate.stop, 60000);

  promiseLoad.load(["img/studio.png", "img/rg.png", "img/balloon.png", "data/gallery.json"])
  .then(function (d) {
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


      balloon.init(data.gallery, document.querySelector(".gallerycontainer"), d[2].result.src); // TODO: déplacer après l'affichage de l'écureuil
/*
    $("<div id='balloon'></div>")
      .appendTo(".gallerycontainer")
      .css({
        right: (0 * scale) + "px",
        bottom: (141 * scale) + "px",
        width: (315 * scale) + "px",
        height: (266 * scale) + "px",
        backgroundImage: "url(" + d[2].result.src + ")"
      });
*/


    var p = promiseLoad.load(
      ["data/texts.json"].concat(_(data.gallery).map(function (d) { return ({ id: d.id, src: "img/people/" + d.id + ".png" }); }).value()),
      true,
      true
    );

    promiseLoad.on("promiseLoad.progress", function (e, i) { $(".info").html(Math.round(i * 100) + "%"); });
    return p;
  })
  .then(function (assets) {

    $(".info").fadeOut(500);


    assets = _(assets).map(function (d) { return d.result; }).value();
    data.texts = assets.shift();

    data.gallery = _(assets)
    .sortBy("item.id")
    .zipWith( // Ajoute les blobs images
      data.gallery,
      function (i, d) { return _(d).assign({ img: i }).value(); }
    )
    .map(function (d) { // Ajoute les codes (url)
      var t = _(data.texts).find({ id: d.text });
      return t ? _(d).assign({ code: t.code, textId: t.id }).value() : d;
    })
    .value();

    // Routing

    route("/", function () {
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
        } else {
          $("svg.background").removeClass("uderzo");
        }


        $(".textscroller").html(template.content(_(data.texts).find({ code: code })));
        $(".textinnercontainer").scrollTop(0).perfectScrollbar("update");
        $(".wrapper").addClass("show");
        $("a.caret-down").hide();
        window.setTimeout(function () {
          $("a.caret-down").show().addClass("rubberBand");
        }, 450);
      }
    });
    route.start(true);

    // Bindings
    $(".shapescontainer").on("click", "path", function (e) {
      route($(e.target).data("code"));
    });

    $(document).on("mousewheel", _.debounce(function (e) {
      if (e.deltaY < 0 && window.location.hash !== "") { route("/"); }
      if (e.deltaY > 0 && currentCode !== null) { route(currentCode); }
    }.bind(this$1), 10));

    var p = gallery.display(data.gallery);



    // gallery.on("gallery.firstMouseenter", background.rotate.stop);
    return p;
  })
  .then(function () {

    gallery.on("gallery.mouseenter", function (e, f) { balloon.show($(f).data("name")); });
    gallery.on("gallery.mouseleave", function () { balloon.hide(); });
    // balloon.show();

    $("#rg").removeClass("bounce");
    return;
  })
  .catch(function (reason) { console.error(reason); });






  $("a").on("click", function () {
    if ($(".wrapper").hasClass("show")) {
      $(".wrapper").removeClass("show");
    } else {
      $(".wrapper").addClass("show");
    }
  });



}




/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.12
 *
 * Requires: jQuery 1.2.2+
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery);}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q;}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r;}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top;}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null;}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks){ for(var j=g.length;j;){ a.event.fixHooks[g[--j]]=a.event.mouseHooks; } }var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){
var this$1 = this;
if(this.addEventListener){ for(var c=h.length;c;){ this$1.addEventListener(h[--c],b,!1); } }else { this.onmousewheel=b; }a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this));},teardown:function(){
var this$1 = this;
if(this.removeEventListener){ for(var c=h.length;c;){ this$1.removeEventListener(h[--c],b,!1); } }else { this.onmousewheel=null; }a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height");},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}});});

}());
