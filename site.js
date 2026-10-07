(function(){var n=document.getElementById("nav");addEventListener("scroll",function(){n.classList.toggle("sc",scrollY>8)},{passive:true});
document.getElementById("menu").onclick=function(){n.classList.toggle("open")};
var io="IntersectionObserver" in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12}):null;
document.querySelectorAll(".rv").forEach(function(el,i){if(io){el.style.transitionDelay=(i%3)*80+"ms";io.observe(el)}else el.classList.add("in")})})();
