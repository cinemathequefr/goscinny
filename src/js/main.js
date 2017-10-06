import route from "riot-route";
import background from "./modules/background.js";
import gallery from "./modules/gallery.js";
import promiseLoad from "./modules/promiseload.js";
import Viewer from "./modules/viewer.js";

window.scale = 0.5;

var template = {
  content: _.template([
    "<div class='content'>",
      "<h1><%= title %></h1>",
      "<div class='text'><%= text %></div>",
    "</div>"
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
  background.init();
  // background.rotate.start();

  $("a").on("click", () => {
    if ($(".wrapper").hasClass("show")) {
      $(".wrapper").removeClass("show");
    } else {
      $(".wrapper").addClass("show");
    }
  });



}


/*
function main () {
  var data = {
    gallery: null,
    texts: null
  };

  var v = new Viewer({
    $parent: $(".viewer-placeholder"),
    enableRequestClose: true
  });

  promiseLoad.init();
  background.init();
  background.rotate.start();

  promiseLoad.load(["img/studio.png", "img/rg.png", "data/gallery.json"])
  .then(d => {
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
      ["data/texts.json"].concat(_(data.gallery).map(d => ({ id: d.id, src: "img/people/" + d.id + ".png" })).value()),
      true,
      true
    );

    promiseLoad.on("promiseLoad.progress", (e, i) => { $(".info").html(Math.round(i * 100) + "%"); });
    return p;
  })
  .then(assets => {
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


    // UI binding + routing

    v.on("viewer.open", (e) => {
      v.$content.html(template.content(_(data.texts).find({ id: parseInt(v.$source.data("textid"), 10) })));
    });

    v.on("viewer.requestClose", () => {
      route("/");
    });

    $(".shapesContainer").on("click", "path", e => {
      route($(e.target).data("code"));
    });


    route("/", () => { v.close(); });

    route("/*", function (code) {
      var item = _(data.texts).find({ "code": code });
      if (item === undefined) {
        route("/");
      } else {


        if (item.text !== "") {
          window.setTimeout(() => {
            v.open($("path[data-id=50]"));
          }, 275);

        }

      }
    });
    route.start(true);



    var p = gallery.display(data.gallery);
    gallery.on("gallery.firstMouseenter", background.rotate.stop);
    return p;



  })
  .then(() => {


    $("#rg").removeClass("bounce");
    return;
  })
  .catch(reason => { console.error(reason); });
}
*/



function delayPromise (t) {
  return new Promise((resolve, reject) => {
    window.setTimeout(resolve, t);
  });
}
