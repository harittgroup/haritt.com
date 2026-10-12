(function(){var tt=document.getElementById("totop");if(tt){var up=function(){tt.classList.toggle("on",scrollY>window.innerHeight*1.2)};addEventListener("scroll",up,{passive:true});up();tt.addEventListener("click",function(){scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})})}})();
(function(){var n=document.getElementById("nav");addEventListener("scroll",function(){n.classList.toggle("sc",scrollY>8)},{passive:true});
document.getElementById("menu").onclick=function(){n.classList.toggle("open")};
var io="IntersectionObserver" in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12}):null;
document.querySelectorAll(".rv").forEach(function(el,i){if(io){el.style.transitionDelay=(i%3)*80+"ms";io.observe(el)}else el.classList.add("in")})})();
