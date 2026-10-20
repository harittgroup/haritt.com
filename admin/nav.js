/* One navigation for every admin page: top bar + sidebar (phone: Menu sheet), Ctrl K jump, theme switch. Added to each page by tools/admin_nav.py. */
(function () {
  if (window.__hvxNav) return; window.__hvxNav = 1;
  var I = {
    home: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/><path d="M7.5 15h9"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 10"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
    server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.9 1.6-1.8 0-1.3-1-1.6-1-2.7 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15.5" cy="7.5" r="1.2"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M21 16l-5-5-9 9"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
    rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M9 11a14 14 0 0 1 11-8 14 14 0 0 1-8 11l-3 1-1-1z"/><circle cx="15" cy="9" r="1.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 12h5"/>', spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    clock: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.9.3 5.5 2.6 5.5 5.8"/>'
  };
  var L = function (f) { return "/admin/logos/" + f; };
  var G = [
    ["Overview", [["/admin/", "Control centre", "Everything in one place", "home"]]],
    ["Websites", [["/admin/?site=haritt", "Haritt Group", "haritt.com", "globe", L("haritt.png")], ["/admin/?site=dev", "Haritt Developers", "developers.haritt.com", "globe", L("haritt-developers.png")], ["/admin/?site=world", "HV Verse", "Product hub", "globe", L("hv-world.svg")], ["/admin/?site=reset", "HV Reset", "App site", "globe", L("hv-reset.svg")], ["/admin/?site=vault", "HV Hunt", "Resume app", "globe", L("hv-vault.png")], ["/admin/?site=test", "HV Assess", "App site", "globe", L("hv-test.png")]]],
    ["Everyday work", [["/admin/analytics/", "Analytics", "Visitors and sign-ups across all products", "chart"], ["/admin/beta/", "HV Reset Beta", "Bug reports, ideas and testers", "flask"], ["/admin/enquiries/", "Enquiries", "Messages from the contact form", "inbox"], ["/admin/signups/", "Beta sign-ups", "People who applied to join the HV Verse beta", "flask"], ["/admin/marketing/", "Marketing", "Email your users, per brand", "rocket"], ["/admin/playbooks/", "Playbooks", "Articles that bring people to Haritt", "layers"], ["https://thehvverse.com/hv-assess/admin/", "HV Assess scores", "Test numbers and scorecards", "check"]]],
    ["People and accounts", [["/admin/team/", "Team and access", "Add people by email, choose what they open", "users"], ["/admin/logins/", "Social media logins", "Passwords for our profiles, encrypted", "key"], ["/admin/social/", "Social accounts list", "Every handle and email we own", "at"]]],
    ["Brand and content", [["/admin/media/", "Covers and thumbnails", "Ready-to-post images in 1920x1080", "image"], ["/admin/brand/", "Brand assets", "Logos, colours and fonts", "palette"], ["/admin/academy/", "Marketing Academy", "Branding for all three brands", "book"], ["/admin/social-strategy/", "Social media strategy", "Platforms, posts, calendar and prompts", "at"], ["/admin/designs/", "Design decisions", "What we chose and why, per brand", "layers"]]],
    ["Setup and guides", [["/admin/setup/", "Domain and email setup", "haritt.com DNS, hosting and email", "globe"], ["/admin/launch/", "Launch guide", "Step by step, domain to email", "rocket"], ["/admin/app-plan/", "App launch plan", "HV Reset on Android and iPhone", "phone"], ["/admin/infrastructure/", "Hosting map", "Which platform runs which site", "server"], ["/admin/rules/", "Rules and scripts", "Firestore rules and email scripts", "shield"], ["/admin/programs/", "Startup programs", "Startups and Open Source plans", "spark"], ["/admin/changelog/", "Changelog", "What changed each day", "clock"]]]
  ];
  var path = location.pathname.replace(/index\.html$/, "").replace(/^\/w\//, "/");
  var alias = { "/admin/oss/": "/admin/programs/", "/admin/startups/": "/admin/programs/" };
  var cur = alias[path] || path, best = "";
  var sk = (new URLSearchParams(location.search).get("site") || "").toLowerCase();
  G.forEach(function (g) { g[1].forEach(function (l) { if (l[0].indexOf("?site=") > 0) return; if (cur.indexOf(l[0]) === 0 && l[0].length > best.length) best = l[0]; }); });
  if (best === "/admin/" && cur !== "/admin/") best = "";
  if (cur === "/admin/" && sk) best = "/admin/?site=" + sk;
  var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[k] + '</svg>'; };
  var item = function (l) { return '<a class="hvx-i' + (l[0] === best ? ' on' : '') + '" href="' + l[0] + '"' + (l[0] === best ? ' aria-current="page"' : '') + '><span class="hvx-ic' + (l[4] ? ' lg' : '') + '">' + (l[4] ? '<img src="' + l[4] + '" alt="" width="22" height="22">' : svg(l[3])) + '</span><span class="hvx-tx"><b>' + l[1] + '</b></span></a>'; };
  var css =
    '.hvx{position:fixed;top:0;left:0;right:0;z-index:900;height:56px;background:var(--bg,#FAF7F2);border-bottom:1px solid var(--line,#EAE3D8);font-family:var(--font,Inter,system-ui,sans-serif);color:var(--ink,#1E1B16)}' +
    '.hvx *,.hvx-sh *,.hvx-pal *{box-sizing:border-box}' +
    '.hvx-w{height:56px;padding:0 16px;display:flex;align-items:center;gap:10px}' +
    '.hvx-b{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;font-weight:700;font-size:15.5px;white-space:nowrap;margin-right:auto}.hvx-b img{width:28px;height:28px;border-radius:50%;object-fit:cover}' +
    '.hvx-b small{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--soft,#6B645A);background:var(--sb,#F3EEE6);border-radius:99px;padding:3px 8px}' +
    '.hvx-bt{flex:none;width:34px;height:34px;border:1px solid var(--line,#EAE3D8);border-radius:10px;background:var(--card,#fff);cursor:pointer;display:grid;place-items:center;color:var(--soft,#6B645A);transition:background .15s,color .15s}.hvx-bt:hover{background:var(--sb,#F3EEE6);color:var(--ink,#1E1B16)}' +
    'html.adm-dark .hvx-bt{color:#EDE7DC!important;border-color:#4A4540!important}html.adm-dark .hvx-bt:hover{color:#fff!important}.hvx-bt svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}' +
    '.hvx-sb{display:none}.hvx-m{display:none;width:auto;padding:0 12px;font:inherit;font-size:13.5px;font-weight:600;color:var(--ink,#1E1B16)}' +
    '.hvx-q{display:flex;align-items:center;gap:10px;min-width:250px;height:34px;padding:0 8px 0 12px;border:1px solid var(--line,#EAE3D8);border-radius:10px;background:var(--card,#fff);color:var(--faint,#8C8579);font:inherit;font-size:13.5px;cursor:pointer;transition:border-color .15s}.hvx-q:hover{border-color:var(--accln,#E8C9C9)}' +
    '.hvx-q kbd{margin-left:auto;font:600 11px var(--font,Inter,system-ui,sans-serif);padding:2px 6px;border-radius:6px;background:var(--sb,#F3EEE6);color:var(--soft,#6B645A)}' +
    '.hvx-me{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--soft,#6B645A);white-space:nowrap}.hvx-me[hidden]{display:none}.hvx-me img{width:30px;height:30px;border-radius:50%;object-fit:cover}.hvx-me span{max-width:200px;overflow:hidden;text-overflow:ellipsis}' +
    '.hvx-me .btn{padding:5px 11px!important;min-height:0!important;font-size:12.5px!important;border-radius:9px!important;background:var(--card,#fff)!important;color:var(--ink,#1E1B16)!important;border:1px solid var(--line,#EAE3D8)!important;cursor:pointer}' +
    '@media(max-width:1180px){.hvx-me span{display:none}}' +
    /* sidebar */
    '.hvx-sh{position:fixed;inset:56px 0 0;background:var(--sb,#F3EEE6);overflow:auto;padding:10px 12px 40px;display:none;z-index:899;font-family:var(--font,Inter,system-ui,sans-serif);color:var(--ink,#1E1B16);overscroll-behavior:contain}' +
    'body.hvx-mopen .hvx-sh{display:block}body.hvx-mopen{overflow:hidden}' +
    '.hvx-i{position:relative;display:flex;gap:10px;align-items:center;padding:7px 10px;border-radius:9px;text-decoration:none;color:var(--soft,#6B645A);font-size:13.5px;font-weight:550;transition:background .15s,color .15s}' +
    '.hvx-i:hover{background:var(--line,#EAE3D8);color:var(--ink,#1E1B16)}.hvx-i.on{background:var(--accbg,#F7ECEA);color:var(--ink,#1E1B16)}' +
    '.hvx-i.on:before{content:"";position:absolute;left:0;top:7px;bottom:7px;width:2.5px;border-radius:2px;background:var(--accent,#A8434C)}' +
    '.hvx-i b{font-weight:inherit}.hvx-ic{flex:none;width:22px;height:22px;display:grid;place-items:center}.hvx-ic img{width:22px;height:22px;border-radius:50%;object-fit:cover}' +
    '.hvx-ic svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.hvx-i.on .hvx-ic svg{stroke:var(--accent,#A8434C)}' +
    '.hvx-dt{margin-top:4px}.hvx-dh{cursor:pointer;margin:14px 8px 5px;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--faint,#8C8579);display:flex;justify-content:space-between;align-items:center;user-select:none}' +
    '.hvx-dh:after{content:"";width:6px;height:6px;border-right:1.6px solid currentColor;border-bottom:1.6px solid currentColor;transform:rotate(45deg) translate(-2px,-2px);transition:transform .2s var(--ease,ease)}.hvx-dt:not(.open)>.hvx-dh:after{transform:rotate(-45deg)}' +
    '.hvx-db{display:grid;grid-template-rows:1fr;transition:grid-template-rows .22s var(--ease,ease)}.hvx-db>div{overflow:hidden;min-height:0}.hvx-dt:not(.open)>.hvx-db{grid-template-rows:0fr}' +
    '.hvx-hd{display:none;width:100%;margin:2px 0 0;padding:6px 8px;border:0;background:none;font:inherit;font-size:12.5px;font-weight:600;color:var(--faint,#8C8579);text-align:left;cursor:pointer}.hvx-hd:hover{color:var(--accent,#A8434C)}' +
    '@media(min-width:1021px){body.hvx-in .hvx-sh{display:block;right:auto;width:236px;border-right:1px solid var(--line,#EAE3D8);z-index:800}body.hvx-in{padding-left:236px}.hvx-m{display:none!important}.hvx-hd{display:block}body.hvx-in .hvx-sb{display:grid}' +
    'body.hvx-nosb{padding-left:0!important}body.hvx-nosb .hvx-sh{display:none!important}}' +
    '@media(max-width:1020px){.hvx-m{display:grid}}' +
    '.hvx-so{display:none;width:100%;margin-top:22px;padding:11px;border-radius:10px;border:1px solid var(--line,#EAE3D8);background:var(--card,#fff);font:inherit;font-weight:600;color:var(--ink,#1E1B16);cursor:pointer}@media(max-width:640px){body.hvx-signed .hvx-so{display:block}}' +
    '@media(max-width:640px){.hvx-w{padding:0 12px;gap:8px}.hvx-bn,.hvx-b small,.hvx-q kbd{display:none}.hvx-b{margin-right:0}.hvx-q{flex:1;min-width:0;justify-content:flex-start}.hvx-q span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.hvx-me .btn{display:none}}' +
    'body.hvx-on{padding-top:56px}' +
    'body.hvx-anon .hvx-sh,body.hvx-anon .hvx-sb,body.hvx-anon .hvx-q,body.hvx-anon .hvx-m{display:none!important}body.hvx-anon{padding-left:0!important}' +
    /* the pages' own old bars: their links now live here */
    'body.hvx-on header.nav,body.hvx-on header.anav{display:none!important}body.hvx-on .top:has(.brand) .brand,body.hvx-on .top:has(.brand)>.wrap>a{display:none!important}body.hvx-on .top:has(.brand)>.wrap{justify-content:flex-end}' +
    /* palette */
    '.hvx img,.hvx-sh img,.hvx-pal img{position:static!important;left:auto!important;top:auto!important;max-width:none!important;display:block!important;margin:0!important;object-fit:cover!important;border-radius:50%!important}.hvx-b img{width:28px!important;height:28px!important}.hvx-me img{width:30px!important;height:30px!important}.hvx-me img[hidden]{display:none!important}.hvx-ic img{width:22px!important;height:22px!important}' +
    '.hvx img,.hvx-sh img,.hvx-pal img{filter:none!important;box-shadow:none!important;opacity:1!important;mix-blend-mode:normal!important}' +
    '.hvx-pal{position:fixed;inset:0;z-index:1000;display:none;align-items:flex-start;justify-content:center;padding:12vh 16px 16px;background:rgba(20,16,12,.38);font-family:var(--font,Inter,system-ui,sans-serif)}.hvx-pal.open{display:flex;animation:hvxPf .12s ease}@keyframes hvxPf{from{opacity:0}}' +
    '.hvx-pb{width:min(560px,100%);background:var(--card,#fff);color:var(--ink,#1E1B16);border:1px solid var(--line,#EAE3D8);border-radius:16px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);overflow:hidden;animation:hvxPp .18s var(--ease,ease)}@keyframes hvxPp{from{opacity:0;transform:translateY(-6px) scale(.985)}}' +
    '.hvx-pb input{width:100%;border:0!important;border-bottom:1px solid var(--line,#EAE3D8)!important;border-radius:0!important;background:transparent!important;color:inherit;font:inherit;font-size:16px;padding:16px 18px;outline:0!important;box-shadow:none!important}' +
    '.hvx-pl{max-height:min(55vh,420px);overflow:auto;padding:6px}.hvx-pl a{display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:10px;text-decoration:none;color:inherit}.hvx-pl a.sel{background:var(--accbg,#F7ECEA)}' +
    '.hvx-pl .hvx-ic svg{stroke:var(--soft,#6B645A)}.hvx-pl b{display:block;font-size:14px;font-weight:600}.hvx-pl small{display:block;font-size:12px;color:var(--faint,#8C8579)}.hvx-pl em{margin-left:auto;font-style:normal;font-size:11.5px;color:var(--faint,#8C8579)}.hvx-pe{padding:22px;text-align:center;color:var(--faint,#8C8579);font-size:14px}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var sheet = G.map(function (g, i) {
    var has = g[1].some(function (l) { return l[0] === best; }), op = true;
    var sv = null; try { sv = localStorage.getItem("hvx-g" + i); } catch (e) {} if (sv === "0" && !has) op = false;
    if (i === 0) return g[1].map(item).join("");
    return '<div class="hvx-dt' + (op ? " open" : "") + '" data-i="' + i + '"><div class="hvx-dh" role="button" tabindex="0" aria-expanded="' + op + '">' + g[0] + '</div><div class="hvx-db"><div>' + g[1].map(item).join("") + '</div></div></div>';
  }).join("");
  var SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>', MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  var n = document.createElement("nav"); n.className = "hvx"; n.setAttribute("aria-label", "Admin");
  n.innerHTML = '<div class="hvx-w"><button class="hvx-bt hvx-sb" type="button" aria-label="Hide or show the menu" title="Hide or show the menu">' + MENU + '</button><a class="hvx-b" href="/admin/"><img src="/admin/haritt-logo.png" alt="" width="28" height="28"><span class="hvx-bn">Haritt Group</span> <small>ADMIN</small></a><button class="hvx-q" type="button" aria-label="Search or jump to a page" title="Search or jump (Ctrl K)">' + SEARCH.replace("<svg", '<svg width="16" height="16" style="fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round"') + '<span>Search or jump…</span><kbd>Ctrl K</kbd></button><button class="hvx-bt hvx-dk" type="button" aria-label="Dark mode" title="Dark mode"></button><button class="hvx-bt hvx-m" type="button" aria-expanded="false">Menu</button></div>';
  var sh = document.createElement("div"); sh.className = "hvx-sh"; sh.innerHTML = sheet;   /* outside the bar so a fixed panel is never trapped inside it */
  var put = function () { document.body.insertBefore(n, document.body.firstChild); document.body.appendChild(sh);
    /* the signed-in person and Sign out move up into this bar, so there is no second strip under it */
    var me = document.getElementById("me"), top = me && me.closest(".top");
    var so = document.getElementById("signOut");
    if (so) { var b2 = document.createElement("button"); b2.type = "button"; b2.className = "hvx-so"; b2.textContent = "Sign out"; b2.onclick = function () { document.body.classList.remove("hvx-mopen"); so.click(); }; sh.appendChild(b2);
      new MutationObserver(function () { document.body.classList.toggle("hvx-signed", !!me && !me.hidden); }).observe(me || document.body, { attributes: true }); document.body.classList.toggle("hvx-signed", !!me && !me.hidden); }
    var inF = window.hvxSync = function () { document.body.classList.toggle("hvx-anon", window.__hvxUser === false); document.body.classList.toggle("hvx-in", me ? !me.hidden : !document.documentElement.classList.contains("hvg-wait")); };
    inF(); if (me) new MutationObserver(inF).observe(me, { attributes: true, attributeFilter: ["hidden"] });
    /* pages with no sign-in strip of their own (the static pages): the page lock tells us who is signed in */
    window.hvxProfile = function (u, out) {
      var e = n.querySelector(".hvx-me2"); if (e) e.remove(); if (me || !u) return;
      e = document.createElement("div"); e.className = "hvx-me hvx-me2";
      var im = document.createElement("img"); im.alt = ""; if (u.photoURL) im.src = u.photoURL; else im.hidden = true;
      var sp = document.createElement("span"); sp.textContent = u.email || u.displayName || "";
      var b = document.createElement("button"); b.type = "button"; b.className = "btn ghost sm"; b.textContent = "Sign out"; b.onclick = function () { try { localStorage.removeItem("hvadmin"); localStorage.removeItem("hvown"); } catch (x) {} out(); };
      e.appendChild(im); e.appendChild(sp); e.appendChild(b); n.querySelector(".hvx-w").insertBefore(e, n.querySelector(".hvx-m"));
    };
    if (window.__hvxPending) window.hvxProfile(window.__hvxPending[0], window.__hvxPending[1]);
    /* pages with neither a sign-in strip nor the page lock (Social accounts, Design decisions): load sign-in just to show who you are */
    if (!me && !document.querySelector("script[data-area]")) {
      var ld = function (src) { return new Promise(function (ok, no) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }, GS = "https://www.gstatic.com/firebasejs/10.12.2/";
      ld(GS + "firebase-app-compat.js").then(function () { return ld(GS + "firebase-auth-compat.js"); }).then(function () {
        if (!firebase.apps.length) firebase.initializeApp({ apiKey: "AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4", authDomain: "harsh-reset.firebaseapp.com", projectId: "harsh-reset", appId: "1:592094409539:web:57d3aa494464b867bbf5f6" });
        var a = firebase.auth(); a.onAuthStateChanged(function (u) { window.hvxProfile(u, function () { a.signOut(); }); });
      }).catch(function () {});
    }
    var hb = document.createElement("button"); hb.type = "button"; hb.className = "hvx-hd"; hb.textContent = "« Hide menu"; hb.onclick = function () { n.querySelector(".hvx-sb").click(); }; sh.insertBefore(hb, sh.firstChild);
    if (me) { n.querySelector(".hvx-w").insertBefore(me, n.querySelector(".hvx-m")); me.classList.add("hvx-me"); if (top && !top.querySelector("button,input,select")) top.style.display = "none"; } document.body.classList.add("hvx-on"); };
  if (document.body) put(); else document.addEventListener("DOMContentLoaded", put);
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>', SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var dk = n.querySelector(".hvx-dk"), paint = function () { var on = document.documentElement.classList.contains("adm-dark"); dk.innerHTML = on ? SUN : MOON; dk.setAttribute("aria-pressed", String(on)); dk.title = on ? "Light mode" : "Dark mode"; };
  paint();
  dk.addEventListener("click", function () { var R = document.documentElement; R.classList.add("hvx-tx"); clearTimeout(window.__hvxTx); window.__hvxTx = setTimeout(function () { R.classList.remove("hvx-tx"); }, 450); var on = R.classList.toggle("adm-dark"); try { localStorage.setItem("hv-adm-theme", on ? "dark" : "light"); } catch (e) {} paint(); });
  var flip = function (e) { var h = e.target.closest && e.target.closest(".hvx-dh"); if (!h) return; var d = h.parentNode, o = d.classList.toggle("open"); h.setAttribute("aria-expanded", String(o)); try { localStorage.setItem("hvx-g" + d.dataset.i, o ? "1" : "0"); } catch (x) {} };
  sh.addEventListener("click", flip); sh.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { flip(e); e.preventDefault(); } });
  var applySb = function (off) { document.body.classList.toggle("hvx-nosb", off); };
  try { if (localStorage.getItem("hvx-sb") === "off") { if (document.body) applySb(true); else document.addEventListener("DOMContentLoaded", function () { applySb(true); }); } } catch (e) {}
  n.querySelector(".hvx-sb").onclick = function () { var off = !document.body.classList.contains("hvx-nosb"); applySb(off); try { localStorage.setItem("hvx-sb", off ? "off" : "on"); } catch (e) {} };
  n.addEventListener("click", function (e) {
    if (e.target.closest(".hvx-m")) { var o = document.body.classList.toggle("hvx-mopen"); n.querySelector(".hvx-m").setAttribute("aria-expanded", String(o)); n.querySelector(".hvx-m").textContent = o ? "Close" : "Menu"; }
  });
  /* Ctrl K: jump to any page or website */
  var pal = null, sel = 0, rows = [];
  var all = []; G.forEach(function (g, gi) { g[1].forEach(function (l) { all.push({ l: l, g: gi === 0 ? "Overview" : g[0] }); }); });
  var closePal = function () { if (pal) pal.classList.remove("open"); };
  var drawPal = function (q) {
    q = (q || "").toLowerCase().trim(); rows = all.filter(function (r) { return !q || (r.l[1] + " " + r.l[2] + " " + r.g).toLowerCase().indexOf(q) >= 0; }); sel = 0;
    var box = pal.querySelector(".hvx-pl");
    box.innerHTML = rows.length ? rows.map(function (r, i) { return '<a href="' + r.l[0] + '" data-i="' + i + '" class="' + (i === 0 ? "sel" : "") + '"><span class="hvx-ic">' + (r.l[4] ? '<img src="' + r.l[4] + '" alt="">' : svg(r.l[3])) + '</span><span><b>' + r.l[1] + '</b><small>' + r.l[2] + '</small></span><em>' + r.g + '</em></a>'; }).join("") : '<div class="hvx-pe">Nothing matches that.</div>';
  };
  var openPal = function () {
    if (!pal) {
      pal = document.createElement("div"); pal.className = "hvx-pal"; pal.setAttribute("role", "dialog"); pal.setAttribute("aria-label", "Jump to a page");
      pal.innerHTML = '<div class="hvx-pb"><input type="text" placeholder="Jump to a page or website…" aria-label="Search" autocomplete="off"><div class="hvx-pl"></div></div>'; document.body.appendChild(pal);
      var inp = pal.querySelector("input");
      inp.addEventListener("input", function () { drawPal(inp.value); });
      pal.addEventListener("mousedown", function (e) { if (e.target === pal) closePal(); });
      pal.addEventListener("mousemove", function (e) { var a = e.target.closest && e.target.closest("a[data-i]"); if (a) mark(+a.dataset.i); });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { mark(Math.min(rows.length - 1, sel + 1)); e.preventDefault(); }
        else if (e.key === "ArrowUp") { mark(Math.max(0, sel - 1)); e.preventDefault(); }
        else if (e.key === "Enter" && rows[sel]) { location.href = rows[sel].l[0]; }
      });
    }
    pal.querySelector("input").value = ""; drawPal(""); pal.classList.add("open"); setTimeout(function () { pal.querySelector("input").focus(); }, 0);
  };
  var mark = function (i) { sel = i; var els = pal.querySelectorAll("a[data-i]"); els.forEach(function (a) { a.classList.toggle("sel", +a.dataset.i === i); }); if (els[i]) els[i].scrollIntoView({ block: "nearest" }); };
  n.querySelector(".hvx-q").addEventListener("click", openPal);
  document.addEventListener("keydown", function (e) {
    if (!document.body.classList.contains("hvx-anon") && (e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); if (pal && pal.classList.contains("open")) closePal(); else openPal(); }
    else if (e.key === "Escape") { closePal(); document.body.classList.remove("hvx-mopen"); var m = n.querySelector(".hvx-m"); if (m) { m.textContent = "Menu"; m.setAttribute("aria-expanded", "false"); } }
  });
  /* the next page is fetched while you hover or touch a link, so it opens at once */
  var pre = {}, warm = function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return; var h = a.getAttribute("href");
    if (!h || h.charAt(0) !== "/" || h.indexOf("/admin") !== 0 || pre[h] || a.target === "_blank") return; pre[h] = 1;
    var l = document.createElement("link"); l.rel = "prefetch"; l.href = h; document.head.appendChild(l);
  };
  document.addEventListener("mouseover", warm, { passive: true }); document.addEventListener("touchstart", warm, { passive: true });
  /* floating up/down button, remembers scroll position and unsent drafts */
  (function () {
    var P = location.pathname, SK = "hv-scroll:" + P, ss = function (f) { try { return f(); } catch (e) {} };
    var st = document.createElement("style");
    st.textContent = '.hvx-fl{position:fixed;right:16px;bottom:18px;z-index:850;width:42px;height:42px;border-radius:50%;border:1px solid var(--line,#EAE3D8);background:var(--card,#fff);color:var(--ink,#1E1B16);box-shadow:0 6px 18px rgba(0,0,0,.14);cursor:pointer;display:grid;place-items:center;opacity:0;transform:translateY(10px) scale(.9);pointer-events:none;transition:opacity .2s,transform .2s,background .15s}.hvx-fl.show{opacity:1;transform:none;pointer-events:auto}.hvx-fl:hover{background:var(--sb,#F3EEE6)}.hvx-fl svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:transform .25s}.hvx-fl.dn svg{transform:rotate(180deg)}html.adm-dark .hvx-fl{background:#26231F;color:#EDE7DC;border-color:#4A4540}@media(prefers-reduced-motion:reduce){.hvx-fl,.hvx-fl svg{transition:none}}';
    document.head.appendChild(st);
    var b = document.createElement("button"); b.type = "button"; b.className = "hvx-fl"; b.setAttribute("aria-label", "Scroll to top");
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
    document.body.appendChild(b);
    var maxY = function () { return Math.max(0, document.documentElement.scrollHeight - innerHeight); };
    var upd = function () {
      var y = scrollY, m = maxY(), far = y > 500, nearTop = y < 200 && m > 900;
      b.classList.toggle("dn", !far); b.classList.toggle("show", far || nearTop);
      b.setAttribute("aria-label", far ? "Scroll to top" : "Scroll to bottom");
    };
    b.addEventListener("click", function () { var up = scrollY > 500; scrollTo({ top: up ? 0 : maxY(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
    var t; addEventListener("scroll", function () { upd(); clearTimeout(t); t = setTimeout(function () { ss(function () { sessionStorage.setItem(SK, String(Math.round(scrollY))); }); }, 150); }, { passive: true });
    addEventListener("resize", upd); setInterval(upd, 1500); upd();
    /* restore scroll on reload; pages fill in late, so keep trying until tall enough */
    var want = ss(function () { return +sessionStorage.getItem(SK) || 0; }), n = 0;
    if (want > 0) { if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      var tryR = function () { if (maxY() >= want - 2 || n > 30) { scrollTo(0, Math.min(want, maxY())); upd(); return; } n++; setTimeout(tryR, 150); }; tryR(); }
    /* drafts: only the Marketing composer fields */
    if (/^\/admin\/marketing\//.test(P)) {
      var IDS = ["subj", "kick", "head", "body", "hl", "btn", "link", "vid", "gfx", "img", "extra", "cimp"], DK = "hv-draft:";
      var get = function (id) { return document.getElementById(id); };
      var saved = ss(function () { return JSON.parse(localStorage.getItem(DK + P) || "{}"); }) || {}, cur = {};
      cur = JSON.parse(JSON.stringify(saved));
      setInterval(function () { var ch = false;
        IDS.forEach(function (id) { var e = get(id); if (!e) return;
          if (!e.__hvd) { /* first sight of this field: bring back the draft */
            if (!e.value && cur[id]) { if (e.tagName === "SELECT" && !Array.prototype.some.call(e.options, function (o) { return o.value === cur[id]; })) return;
              e.value = cur[id]; e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); }
            e.__hvd = 1; }
          var v = e.value; if (v !== (cur[id] || "")) { if (v) cur[id] = v; else delete cur[id]; ch = true; } });
        if (ch) ss(function () { Object.keys(cur).length ? localStorage.setItem(DK + P, JSON.stringify(cur)) : localStorage.removeItem(DK + P); }); }, 600);
    }
  })();
})();
