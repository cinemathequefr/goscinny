!function(){"use strict";function t(t){return t.split(/[/?#]/)}function e(t,e){var n=e.replace(/\?/g,"\\?").replace(/\*/g,"([^/?#]+?)").replace(/\.\./,".*"),i=new RegExp("^"+n+"$"),r=t.match(i);if(r)return r.slice(1)}function n(t,e){var n;return function(){clearTimeout(n),n=setTimeout(t,e)}}function i(t){h=n(s,1),T[C](x,h),T[C](z,h),k[C](I,f),t&&s(!0)}function r(){this.$=[],b(this),K.on("stop",this.s.bind(this)),K.on("emit",this.e.bind(this))}function o(t){return t.replace(/^\/|\/$/,"")}function a(t){return"string"==typeof t}function c(t){return(t||N.href).replace(y,"")}function u(t){return"#"===g[0]?(t||N.href||"").split(g)[1]||"":(N?c(t):t||"").replace(g,"")}function s(t){var e=0===H;if(!(S<=H)&&(H++,j.push(function(){var e=u();(t||e!==m)&&(K[E]("emit",e),m=e)}),e)){for(var n;n=j.shift();)n();H=0}}function f(t){if(!(1!==t.which||t.metaKey||t.ctrlKey||t.shiftKey||t.defaultPrevented)){for(var e=t.target;e&&"A"!==e.nodeName;)e=e.parentNode;!e||"A"!==e.nodeName||e[A]("download")||!e[A]("href")||e.target&&"_self"!==e.target||-1===e.href.indexOf(N.href.match(y)[0])||e.href!==N.href&&(e.href.split("#")[0]===N.href.split("#")[0]||"#"!==g[0]&&0!==c(e.href).indexOf(g)||"#"===g[0]&&e.href.split(g)[0]!==N.href.split(g)[0]||!l(u(e.href),e.title||k.title))||t.preventDefault()}}function l(t,e,n){return L?(t=g+o(t),e=e||k.title,n?L.replaceState(null,e,t):L.pushState(null,e,t),k.title=e,R=!1,s(),R):K[E]("emit",u(t))}function d(){d3.select(".backgroundContainer svg").attr("width",window.innerWidth).attr("height",window.innerHeight).select("g").attr("transform","translate("+window.innerWidth/2+","+(window.innerHeight-150)+")")}function p(t){M.init(),$("body").on("click",M.rotate.toggle),_(t).filter(function(t){return 0!==t.z}).orderBy("z").forEach(function(e,n,i){window.setTimeout(function(){var r=$("<img data-id='"+e.id+"' style='z-index: "+(t.length-e.z)+"; width: "+e.w/2+"px; height: auto; left:"+e.x/2+"px; bottom:"+e.y/2+"px;' class='animated bounceIn' src='img/people/"+e.id+".png' alt=''>").appendTo(".peopleContainer");d3.select(".shapesContainer").datum(e).append("path").attr("d",e.path).attr("data-id",e.id),n+1===i.length&&r.on("animationend",function(){$(".peopleContainer img").removeClass("bounceIn")})},50*n)}),$(".shapesContainer").on("mouseenter","path",function(t){var e=$(t.target).data("id");$(".peopleContainer img[data-id='"+e+"']").addClass(F)}),$(".peopleContainer").on("animationend","img",function(t){$(t.target).removeClass(F)}),q("/",function(){}),q("/*",function(e){void 0===_(t).find({code:e})&&q("/")}),q.start(!0)}var h,g,m,v,w,b=function(t){t=t||{};var e={},n=Array.prototype.slice;return Object.defineProperties(t,{on:{value:function(n,i){return"function"==typeof i&&(e[n]=e[n]||[]).push(i),t},enumerable:!1,writable:!1,configurable:!1},off:{value:function(n,i){if("*"!=n||i)if(i)for(var r,o=e[n],a=0;r=o&&o[a];++a)r==i&&o.splice(a--,1);else delete e[n];else e={};return t},enumerable:!1,writable:!1,configurable:!1},one:{value:function(e,n){function i(){t.off(e,i),n.apply(t,arguments)}return t.on(e,i)},enumerable:!1,writable:!1,configurable:!1},trigger:{value:function(i){var r,o,a,c=arguments,u=arguments.length-1,s=new Array(u);for(a=0;a<u;a++)s[a]=c[a+1];for(r=n.call(e[i]||[],0),a=0;o=r[a];++a)o.apply(t,s);return e["*"]&&"*"!=i&&t.trigger.apply(t,["*",i].concat(s)),t},enumerable:!1,writable:!1,configurable:!1}}),t},y=/^.+?\/\/+[^/]+/,C="addEventListener",A="hasAttribute",x="popstate",z="hashchange",E="trigger",S=3,T="undefined"!=typeof window&&window,k="undefined"!=typeof document&&document,L=T&&history,N=T&&(L.location||T.location),O=r.prototype,I=k&&k.ontouchstart?"touchstart":"click",K=b(),P=!1,R=!1,j=[],H=0;O.m=function(t,e,n){!a(t)||e&&!a(e)?e?this.r(t,e):this.r("@",t):l(t,e,n||!1)},O.s=function(){this.off("*"),this.$=[]},O.e=function(t){this.$.concat("@").some(function(e){var n=("@"===e?v:w)(o(t),o(e));if(void 0!==n)return this[E].apply(null,[e].concat(n)),R=!0},this)},O.r=function(t,e){"@"!==t&&(t="/"+o(t),this.$.push(t)),this.on(t,e)};var W=new r,q=W.m.bind(W);q.create=function(){var t=new r,e=t.m.bind(t);return e.stop=t.s.bind(t),e},q.base=function(t){g=t||"#",m=u()},q.exec=function(){s(!0)},q.parser=function(n,i){n||i||(v=t,w=e),n&&(v=n),i&&(w=i)},q.query=function(){var t={};return(N.href||m).replace(/[?&](.+?)=([^&]*)/g,function(e,n,i){t[n]=i}),t},q.stop=function(){P&&(T&&(T.removeEventListener(x,h),T.removeEventListener(z,h),k.removeEventListener(I,f)),K[E]("stop"),P=!1)},q.start=function(t){P||(T&&("interactive"===document.readyState||"complete"===document.readyState?i(t):document.onreadystatechange=function(){"interactive"===document.readyState&&setTimeout(function(){i(t)},1)}),P=!0)},q.base(),q.parser();var B,D,J=d3.arc().innerRadius(50).outerRadius(2e3),M={init:function(t){t=t||40,(B=d3.selectAll(".backgroundContainer").append("svg").append("g").append("g").classed("rotate stop",!0)).selectAll("path").data(new Array(t)).enter().append("path").attr("d",function(e,n,i){var r=2*Math.PI/t;return J({startAngle:n*r,endAngle:n*r+r/2})}),d(),D.start()},resize:d,rotate:D={start:function(){B.classed("stop",!1)},stop:function(){B.classed("stop",!0)},toggle:function(){B.classed("stop",!B.classed("stop"))}}},F="flip";$(function(){$.getJSON("data/data.json").then(p)}),$(window).on("resize",function(){M.resize()})}();
