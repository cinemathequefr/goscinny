import background from "./background.js";






$(() => {
  background.init();
});

$(window)
.on("resize", () => {
  background.resize();
});

$("body").on("click", () => {
  background.fast();
});





