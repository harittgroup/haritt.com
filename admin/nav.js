/* One navigation for every admin page: top bar + sidebar (phone: Menu sheet), Ctrl K jump, theme switch. Added to each page by tools/admin_nav.py. */
(function () {
  if (window.__hvxNav) return; window.__hvxNav = 1;
  var HVX_EMB = false; try { HVX_EMB = window.top !== window.self && !!window.top.__hvxShell; } catch (e) {} if (!HVX_EMB) window.__hvxShell = 1;
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
    ["Mail", [["/admin/mailcenter/", "Team inboxes", "Team inboxes, who gets each mail", "at"], ["/admin/addresses/", "Email addresses", "Create and manage @haritt.com addresses", "at"], ["/admin/mail/", "Send email", "Write emails and see every sent email, opened or not", "at"]], "sub"],
    ["People and accounts", [["/admin/join/", "Onboarding", "Applications, invitations, agreements and sent emails", "check"], ["/admin/team/", "Team and access", "Add people by email, choose what they open", "users"], ["/admin/logins/", "Social media logins", "Passwords for our profiles, encrypted", "key"], ["/admin/social/", "Social accounts list", "Every handle and email we own", "at"]]],
    ["Brand and content", [["/admin/media/", "Covers and thumbnails", "Ready-to-post images in 1920x1080", "image"], ["/admin/brand/", "Brand assets", "Logos, colours and fonts", "palette"], ["/admin/academy/", "Marketing Academy", "Branding for all three brands", "book"], ["/admin/social-strategy/", "Social media strategy", "All three brands: platforms, posts, calendar, prompts", "at"], ["/admin/content-calendar/", "Content calendar", "HV Verse posts, day by day", "clock"]]],
    ["Setup and guides", [["/admin/seo/", "SEO", "Google index and sitemaps, automatic", "chart"], ["/admin/system-status/", "System health", "Websites, backend and email", "server"], ["/admin/expiry/", "Expiry and limits", "Renewals, free-plan usage and API keys", "clock"], ["/admin/automations/", "Automations", "What runs by itself and when", "clock"], ["/admin/infrastructure/", "Hosting map", "Which platform runs which site", "server"], ["/admin/changelog/", "Changelog", "What changed each day", "clock"]]]
  ];
  var path = location.pathname.replace(/index\.html$/, "").replace(/^\/w\//, "/");
  var alias = {};
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
    '.hvx-sub>.hvx-dh{margin:2px 0;padding:7px 10px;gap:10px;justify-content:flex-start;font-size:13.5px;font-weight:550;letter-spacing:0;text-transform:none;color:var(--soft,#6B645A);border-radius:9px;position:relative}.hvx-sub>.hvx-dh:hover{background:var(--line,#EAE3D8);color:var(--ink,#1E1B16)}.hvx-sub>.hvx-dh:after{position:absolute;right:12px;top:50%;margin-top:-4px}.hvx-sub>.hvx-dh .hvx-ic svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}body.hvx-own .hvx-sh .hvx-sub>.hvx-dh{margin:2px 0;font-size:14.5px;text-transform:none}.hvx-sc{margin:2px 0 4px 20px;padding-left:8px;border-left:1.5px solid var(--line,#EAE3D8)}.hvx-sc .hvx-ic{display:none}.hvx-sc .hvx-i{padding:7px 10px}.hvx-sc .hvx-i.on:before{left:-9.5px}' +
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
    if (g[2] === "sub") return '<div class="hvx-dt hvx-sub' + (op ? " open" : "") + '" data-i="' + i + '"><div class="hvx-dh" role="button" tabindex="0" aria-expanded="' + op + '"><span class="hvx-ic">' + svg("at") + '</span><span>' + g[0] + '</span></div><div class="hvx-db"><div class="hvx-sc">' + g[1].map(item).join("") + '</div></div></div>';
    return '<div class="hvx-dt' + (op ? " open" : "") + '" data-i="' + i + '"><div class="hvx-dh" role="button" tabindex="0" aria-expanded="' + op + '">' + g[0] + '</div><div class="hvx-db"><div>' + g[1].map(item).join("") + '</div></div></div>';
  }).join("");
  var SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>', MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  var n = document.createElement("nav"); n.className = "hvx"; n.setAttribute("aria-label", "Admin");
  n.innerHTML = '<div class="hvx-w"><button class="hvx-bt hvx-sb" type="button" aria-label="Hide or show the menu" title="Hide or show the menu">' + MENU + '</button><a class="hvx-b" href="/admin/"><img src="/admin/haritt-app.png" alt="" width="28" height="28"><span class="hvx-bn">Haritt Group</span> <small>ADMIN</small></a><button class="hvx-q" type="button" aria-label="Search or jump to a page" title="Search or jump (Ctrl K)">' + SEARCH.replace("<svg", '<svg width="16" height="16" style="fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round"') + '<span>Search or jump…</span><kbd>Ctrl K</kbd></button><button class="hvx-bt hvx-dk" type="button" aria-label="Dark mode" title="Dark mode"></button><button class="hvx-bt hvx-m" type="button" aria-expanded="false">Menu</button></div>';
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
    /* pages with neither a sign-in strip nor the page lock (Social accounts): load sign-in just to show who you are */
    if (!me && !document.querySelector("script[data-area]")) {
      var ld = function (src) { return new Promise(function (ok, no) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }, GS = "https://www.gstatic.com/firebasejs/10.12.2/";
      ld(GS + "firebase-app-compat.js").then(function () { return ld(GS + "firebase-auth-compat.js"); }).then(function () {
        if (!firebase.apps.length) firebase.initializeApp({ apiKey: "AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4", authDomain: "harsh-reset.firebaseapp.com", projectId: "harsh-reset", appId: "1:592094409539:web:57d3aa494464b867bbf5f6" });
        var a = firebase.auth(); a.onAuthStateChanged(function (u) { window.hvxProfile(u, function () { a.signOut(); }); });
      }).catch(function () {});
    }
    /* signed in with a personal Google ID that is linked to a company person (Mail > People > Link personal ID): show the company name, address and role instead */
    (function () {
      var RO = { owner: "Owner", cofounder: "Co-founder", team: "Team", trial: "Trial" }, tries = 0;
      var hx = function (t) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(t).toLowerCase().trim())).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }); };
      var swap = function (from, to) { Array.prototype.forEach.call(document.querySelectorAll(".hvx-me"), function (el) { var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), t; while ((t = w.nextNode())) if (t.nodeValue.indexOf(from) >= 0) t.nodeValue = t.nodeValue.split(from).join(to); }); };
      var run = function () {
        var u = window.firebase && firebase.apps && firebase.apps.length && firebase.auth().currentUser;
        if (!u || !u.email) { if (++tries < 40) setTimeout(run, 500); return; }
        if (/@haritt\.com$/i.test(u.email) || window.hvxIdentity) return;
        hx(u.email).then(function (h) { return fetch("https://firestore.googleapis.com/v1/projects/harsh-reset/databases/(default)/documents/rmcfg_13fba2fddc/main?key=AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
          var j = JSON.parse((d && d.fields && d.fields.json && d.fields.json.stringValue) || "{}"), p = (j.people || []).filter(function (q) { return q.alt && q.alt.v && q.alt.h === h; })[0]; if (!p) return;
          window.hvxIdentity = { name: p.n, email: p.e, role: RO[p.role] || p.role, title: p.title || "", focus: p.focus || "", login: u.email };
          var to = p.n + " · " + (p.title || RO[p.role] || p.role) + " · " + p.e, go = function () { swap(u.email, to); }; go(); new MutationObserver(go).observe(n, { childList: true, subtree: true, characterData: true });
        }); }).catch(function () {});
      };
      run();
    })();
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
  /* pages with their own header (Social Strategy, Academy): no admin top bar; the menu button joins that header and opens the sidebar as a drawer */
  (function () {
    var go = function () {
      var hd = document.querySelector("header.atop .wrap"); if (!hd) return;
      document.body.classList.add("hvx-own");
      var s2 = document.createElement("style");
      s2.textContent = 'body.hvx-own .hvx{display:none!important}body.hvx-own.hvx-on{padding-top:0!important;padding-left:0!important}body.hvx-own .atop{top:0!important}body.hvx-own .part,body.hvx-own .cc,body.hvx-own .sec{scroll-margin-top:120px!important}' +
        '.hvx-hb{flex:none;width:38px;height:38px;border:1px solid #3A3D45;border-radius:11px;background:#16181D;color:#ECEEF1;cursor:pointer;display:grid;place-items:center;padding:0;transition:background .15s}.hvx-hb:hover{background:#1D2027}.hvx-hb svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round}body.hvx-anon .hvx-hb{display:none}' +
        'body.hvx-own .hvx-sh,body.hvx-own.hvx-nosb .hvx-sh,body.hvx-own.hvx-anon .hvx-sh{display:flex!important;flex-direction:column;inset:0 auto 0 0!important;width:304px!important;max-width:88vw;padding:16px 14px 0!important;background:#121419;border-right:1px solid #262A31!important;z-index:1001!important;transform:translateX(-104%);visibility:hidden;transition:transform .26s var(--ease,ease),visibility 0s .26s;--ink:#ECEEF1;--soft:#A3A9B5;--faint:#7C8390;--line:#262A31;--card:#16181D;--accent:#E08A91;--accbg:#2A1D20}' +
        'body.hvx-own.hvx-mopen .hvx-sh{transform:none;visibility:visible;transition:transform .26s var(--ease,ease)}body.hvx-own.hvx-anon .hvx-sh{display:none!important}' +
        '.hvx-sc{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .2s}body.hvx-mopen .hvx-sc{opacity:1;pointer-events:auto}' +
        'body.hvx-own .hvx-sh .hvx-i{padding:10px 12px;margin:1px 0;font-size:14.5px;gap:12px}body.hvx-own .hvx-sh .hvx-dh{margin:22px 10px 8px}body.hvx-own .hvx-sh .hvx-dt:first-of-type{margin-top:0}body.hvx-own .hvx-sh .hvx-hd,body.hvx-own .hvx-sh .hvx-so{display:none!important}' +
        '.hvx-dr{display:flex;align-items:center;gap:10px;padding:0 4px 16px;font-weight:700;font-size:15.5px;color:#ECEEF1}.hvx-dr img{width:30px;height:30px;border-radius:50%}.hvx-dr small{font-size:10px;font-weight:700;letter-spacing:.12em;color:#A3A9B5;background:#1D2027;border-radius:99px;padding:3px 8px}.hvx-dr button{margin-left:auto}' +
        '.hvx-ds{display:flex;align-items:center;gap:10px;width:100%;height:40px;margin:0 0 14px;padding:0 12px;border:1px solid #262A31;border-radius:11px;background:#16181D;color:#7C8390;font:inherit;font-size:14px;cursor:pointer;text-align:left}.hvx-ds svg{flex:none;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round}.hvx-ds kbd{margin-left:auto;font:600 11px Inter,system-ui,sans-serif;padding:2px 6px;border-radius:6px;background:#1D2027;color:#A3A9B5}' +
        '.hvx-df{position:sticky;bottom:0;margin:auto -14px 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));background:#121419;border-top:1px solid #262A31;display:flex;flex-direction:column;gap:12px}.hvx-df .hvx-em{display:flex;align-items:center;gap:10px;font-size:13px;color:#A3A9B5;min-width:0}.hvx-df .hvx-em img{width:30px;height:30px;border-radius:50%;object-fit:cover}.hvx-df .hvx-em span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hvx-df .hvx-r{display:flex;gap:10px}.hvx-df .hvx-r button{flex:1;height:40px;border:1px solid #262A31;border-radius:11px;background:#16181D;color:#ECEEF1;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}.hvx-df .hvx-r button:hover{background:#1D2027}' +
        'body.hvx-own .hvx-sh .hvx-ic.lg{margin:0!important;display:grid!important}.hvx-sh .hvx-df .hvx-em img[hidden]{display:none!important}@media(max-width:640px){body.hvx-own .atop .wrap{gap:8px}}';
      document.head.appendChild(s2);
      var X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      var hb = document.createElement("button"); hb.type = "button"; hb.className = "hvx-hb"; hb.setAttribute("aria-label", "Open the admin menu"); hb.innerHTML = MENU; hd.insertBefore(hb, hd.firstChild);
      var sc = document.createElement("div"); sc.className = "hvx-sc"; document.body.appendChild(sc);
      var top = document.createElement("div"); top.className = "hvx-dr"; top.innerHTML = '<img src="/admin/haritt-app.png" alt="" width="30" height="30"><span>Haritt Group</span><small>ADMIN</small><button class="hvx-hb" type="button" aria-label="Close the menu">' + X + '</button>';
      var q = document.createElement("button"); q.type = "button"; q.className = "hvx-ds"; q.innerHTML = SEARCH + '<span>Search or jump…</span><kbd>Ctrl K</kbd>';
      sh.insertBefore(q, sh.firstChild); sh.insertBefore(top, sh.firstChild);
      var ft = document.createElement("div"); ft.className = "hvx-df"; ft.innerHTML = '<div class="hvx-em"><img alt="" hidden><span></span></div><div class="hvx-r"><button type="button" class="hvx-th"></button><button type="button" class="hvx-out">Sign out</button></div>'; sh.appendChild(ft);
      var tb = document.querySelector("header.atop .tabs"), on = tb && tb.querySelector(".bt.on");
      if (on) { var fit = function () { var a = on.getBoundingClientRect(), c = tb.getBoundingClientRect(); if (a.right > c.right) tb.scrollLeft += a.right - c.right + 12; }; fit(); setTimeout(fit, 400); }
      var set = function (o) { document.body.classList.toggle("hvx-mopen", o); hb.setAttribute("aria-expanded", String(o)); };
      var fill = function () {
        var src = n.querySelector(".hvx-me"), t = src && src.querySelector("span"), im = src && src.querySelector("img"), e = ft.querySelector(".hvx-em");
        e.querySelector("span").textContent = t ? t.textContent : "";
        var mi = e.querySelector("img"); if (im && im.getAttribute("src")) { mi.src = im.src; mi.hidden = false; } else mi.hidden = true;
        ft.querySelector(".hvx-th").textContent = document.documentElement.classList.contains("adm-dark") ? "☀ Light mode" : "☾ Dark mode";
      };
      hb.onclick = function () { fill(); set(true); };
      top.querySelector("button").onclick = sc.onclick = function () { set(false); };
      q.onclick = function () { set(false); openPal(); };
      ft.querySelector(".hvx-th").onclick = function () { dk.click(); setTimeout(fill, 60); };
      ft.querySelector(".hvx-out").onclick = function () { set(false); var b = n.querySelector(".hvx-me .btn") || document.getElementById("signOut"); if (b) b.click(); };
    };
    if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
  })();
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
        else if (e.key === "Enter" && rows[sel]) { if (window.__hvxGo) { closePal(); window.__hvxGo(rows[sel].l[0]); } else location.href = rows[sel].l[0]; }
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
  /* every sidebar page is prefetched once the page is idle (and prerendered on hover where the browser allows), so a tap opens at once */
  (function () {
    var hs = {}; document.querySelectorAll(".hvx-sh a[href^='/admin']").forEach(function (a) { var h = a.getAttribute("href"); if (h && !a.target) hs[h.split("#")[0]] = 1; });
    var list = Object.keys(hs).filter(function (h) { return h !== location.pathname + location.search; });
    if (!list.length) return;
    var go = function () {
      try {
        if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
          var sr = document.createElement("script"); sr.type = "speculationrules";
          sr.textContent = JSON.stringify({ prefetch: [{ source: "list", urls: list, eagerness: "moderate" }, { source: "list", urls: list.slice(0, 6), eagerness: "conservative" }] });
          document.head.appendChild(sr);
        } else list.forEach(function (h) { if (!pre[h]) { pre[h] = 1; var l = document.createElement("link"); l.rel = "prefetch"; l.href = h; document.head.appendChild(l); } });
      } catch (e) {}
    };
    (window.requestIdleCallback || function (f) { setTimeout(f, 1200); })(go, { timeout: 2500 });
  })();
  /* tap feedback: thin progress bar + the page content fades the moment a link is tapped, so it never feels stuck */
  (function () {
    var st = document.createElement("style");
    st.textContent = '.hvx-pg{position:fixed;left:0;top:0;height:3px;width:0;z-index:2000;background:var(--accent,#A8434C);pointer-events:none;opacity:0;transition:width .6s cubic-bezier(.1,.7,.2,1),opacity .2s}.hvx-pg.on{opacity:1;width:82%}main,.wrap#app,body>.wrap{transition:opacity .15s ease}html.hvx-go main,html.hvx-go .wrap#app{opacity:.55}@media(prefers-reduced-motion:reduce){.hvx-pg{transition:none}}';
    document.head.appendChild(st);
    var bar = document.createElement("div"); bar.className = "hvx-pg"; document.body.appendChild(bar);
    var stop = function () { document.documentElement.classList.remove("hvx-go"); bar.classList.remove("on"); bar.style.width = "0"; };
    window.__hvxBar = { on: function () { bar.style.width = ""; bar.classList.add("on"); }, off: stop };
    document.addEventListener("click", function (e) {
      if (HVX_EMB || window.__hvxShell) return;
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]"); if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || u.pathname.indexOf("/admin") !== 0) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      bar.style.width = ""; bar.classList.add("on"); document.documentElement.classList.add("hvx-go");
      setTimeout(stop, 8000);
    });
    addEventListener("pageshow", stop);
  })();
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
  /* ---- persistent shell: the top bar and sidebar stay; pages open inside the content area, no full reload, and opened pages stay alive so going back is instant ---- */
  (function () {
    var root = document.documentElement, isAdm = function (u) { return u.origin === location.origin && /^\/admin(\/|$)/.test(u.pathname) && !/\.[a-z0-9]{2,5}$/i.test(u.pathname.replace(/\/$/, "").split("/").pop()); };
    var linkOf = function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
      var a = e.target.closest && e.target.closest("a[href]"); if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return null;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return null; } return isAdm(u) ? u : null;
    };
    if (HVX_EMB) {
      root.classList.add("hvx-emb");
      var es = document.createElement("style");
      es.textContent = 'html.hvx-emb .hvx,html.hvx-emb .hvx-sh,html.hvx-emb .hvx-pal{display:none!important}html.hvx-emb body.hvx-on{padding:0!important}';
      document.head.appendChild(es);
      document.addEventListener("click", function (e) {
        var u = linkOf(e); if (!u) return;
        if (u.hash && u.pathname === location.pathname && u.search === location.search) return;
        e.preventDefault(); window.top.__hvxGo(u.href);
      });
      document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); e.stopImmediatePropagation(); try { window.top.__hvxPal(); } catch (x) {} }
      }, true);
      return;
    }
    var st = document.createElement("style");
    st.textContent = '.hvx-fr{position:fixed;top:56px;left:0;right:0;bottom:0;z-index:700;display:none;background:var(--bg,#FAF7F2);transition:opacity .15s ease}html.hvx-spa .hvx-fr{display:block}.hvx-fr.ld{opacity:.6}' +
      '@media(min-width:1021px){body.hvx-in:not(.hvx-nosb):not(.hvx-anon) .hvx-fr{left:236px}}' +
      '.hvx-fr iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:var(--bg,#FAF7F2);visibility:hidden}.hvx-fr iframe.on{visibility:visible}' +
      'html.hvx-spa,html.hvx-spa body{overflow:hidden}html.hvx-spa body>*:not(.hvx):not(.hvx-sh):not(.hvx-pal):not(.hvx-fr):not(.hvx-pg):not(script):not(style){display:none!important}html.hvx-spa .hvx-fl{display:none!important}';
    document.head.appendChild(st);
    var fr = document.createElement("div"); fr.className = "hvx-fr"; document.body.appendChild(fr);
    var key = function (u) { return u.pathname + u.search; }, native = key(location), nativeTitle = document.title, cur = native, frames = {}, order = [], MAXF = 7, STALE = 120000;
    var bar = function (on) { if (window.__hvxBar) { if (on) window.__hvxBar.on(); else window.__hvxBar.off(); } fr.classList.toggle("ld", on); };
    var dark = function (f) { try { f.el.contentDocument.documentElement.classList.toggle("adm-dark", root.classList.contains("adm-dark")); } catch (e) {} };
    new MutationObserver(function () { Object.keys(frames).forEach(function (k) { dark(frames[k]); }); }).observe(root, { attributes: true, attributeFilter: ["class"] });
    var closeMenu = function () { document.body.classList.remove("hvx-mopen"); var m = n.querySelector(".hvx-m"); if (m) { m.textContent = "Menu"; m.setAttribute("aria-expanded", "false"); } };
    var setActive = function (u) {
      var links = [].slice.call(sh.querySelectorAll("a.hvx-i")), best = null, bl = 0, site = u.searchParams.get("site");
      links.forEach(function (a) { var h = new URL(a.getAttribute("href"), location.origin), s = 0;
        if (h.search) { if (u.pathname === h.pathname && u.search === h.search) s = 1000; }
        else if (h.pathname === "/admin/") { if (u.pathname === "/admin/" && !site) s = 999; }
        else if (u.pathname.indexOf(h.pathname) === 0) s = h.pathname.length;
        if (s > bl) { bl = s; best = a; } });
      links.forEach(function (a) { var on = a === best; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    };
    var drop = function (k) { var f = frames[k]; if (!f) return; f.el.remove(); delete frames[k]; order = order.filter(function (x) { return x !== k; }); };
    var show = function (k) {
      var f = frames[k]; if (!f) return;
      if (!root.classList.contains("hvx-spa")) nativeTitle = document.title;
      Object.keys(frames).forEach(function (x) { var on = x === k; frames[x].el.classList.toggle("on", on); if (!on && frames[x].shown) { frames[x].hid = Date.now(); } frames[x].shown = on; });
      root.classList.add("hvx-spa"); try { document.title = f.el.contentDocument.title || document.title; } catch (e) {}
      order = order.filter(function (x) { return x !== k; }); order.push(k);
      while (order.length > MAXF) { var old = order.shift(); if (old !== k) drop(old); }
      bar(false); try { f.el.contentWindow.focus(); } catch (e) {}
    };
    var go = window.__hvxGo = function (href, push) {
      var u; try { u = new URL(href, location.href); } catch (e) { return; }
      if (!isAdm(u)) { location.href = href; return; }
      if (push !== false) history.pushState({ hvx: 1 }, "", u.pathname + u.search + u.hash);
      var k = key(u); cur = k; closeMenu(); closePal(); setActive(u);
      if (k === native) { Object.keys(frames).forEach(function (x) { if (frames[x].shown) { frames[x].hid = Date.now(); frames[x].shown = false; frames[x].el.classList.remove("on"); } }); root.classList.remove("hvx-spa"); document.title = nativeTitle; bar(false); scrollTo(0, 0); return; }
      var f = frames[k];
      if (f && f.hid && Date.now() - f.hid > STALE) { drop(k); f = null; }
      if (f) { if (u.hash) { try { f.el.contentWindow.location.hash = u.hash; } catch (e) {} } show(k); return; }
      bar(true);
      var el = document.createElement("iframe"); el.setAttribute("title", "Admin page");
      f = frames[k] = { el: el, hid: 0, shown: false };
      el.addEventListener("load", function () { dark(f); if (cur === k && frames[k] === f) show(k); else bar(false); });
      el.src = u.pathname + u.search + u.hash; fr.appendChild(el);
    };
    window.__hvxPal = function () { try { if (pal && pal.classList.contains("open")) closePal(); else openPal(); } catch (e) {} };
    document.addEventListener("click", function (e) {
      var u = linkOf(e); if (!u) return;
      if (u.hash && u.pathname === location.pathname && u.search === location.search && !root.classList.contains("hvx-spa")) return;
      e.preventDefault(); go(u.href, true);
    });
    addEventListener("popstate", function () { go(location.href, false); });
  })();
})();

/* Build badge (bottom-left on every admin page). Build number = count of published changes on haritt.com.
   Dot: green = this page and the email system run the latest build; amber = email system still installing it (wait before sending);
   blue = a newer build is live, refresh the page. Reads only public GitHub info and the joining script's public "build" check. */
(function () {
  if (window.__hgBuild) return; window.__hgBuild = 1;
  try { if (window.top !== window) return; } catch (e) {}   // only the top admin window shows and checks the badge
  var SCRIPT = "https://script.google.com/macros/s/AKfycbyjVZM40H9UKE_JgpAjn1R288XZTc94V74XshoqFqgKWycPcqXh4423V-1Oc9f5AU-OFw/exec";
  var css = document.createElement("style");
  css.textContent = ".hvx-w .hvx-b{margin-right:0!important;flex:none!important}.hgb{position:relative;margin-left:10px;margin-right:auto;flex:none;z-index:950;font:600 12px/1 Inter,-apple-system,Segoe UI,Roboto,sans-serif}.hgb.fx{position:fixed;left:14px;bottom:14px;margin:0}.hgb.fx .hgp{top:auto;bottom:40px}" +
    ".hgb button{display:flex;align-items:center;gap:7px;padding:6px 11px 6px 9px;border-radius:99px;border:1px solid rgba(120,110,100,.22);background:rgba(255,255,255,.86);color:#3D3730;cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);letter-spacing:.02em;transition:transform .2s ease,box-shadow .2s ease}" +
    ".hgb button:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(30,20,10,.12)}.hgb i{width:8px;height:8px;border-radius:50%;background:#B9B1A7;box-shadow:0 0 0 3px rgba(185,177,167,.22);transition:background .3s}" +
    ".hgb[data-s=ok] i{background:#1F9D55;box-shadow:0 0 0 3px rgba(31,157,85,.18)}.hgb[data-s=wait] i{background:#E0A100;box-shadow:0 0 0 3px rgba(224,161,0,.2);animation:hgbp 1.2s ease-in-out infinite}.hgb[data-s=new] i{background:#2F6FEB;box-shadow:0 0 0 3px rgba(47,111,235,.2)}" +
    ".hgb small{font-weight:500;color:#8F877C;margin-left:2px}.hgb .hgp{position:absolute;left:0;top:38px;width:260px;padding:12px 14px;border-radius:14px;background:#fff;color:#3D3730;border:1px solid rgba(120,110,100,.18);box-shadow:0 14px 34px rgba(30,20,10,.14);font-weight:500;line-height:1.55}" +
    ".hgb .hgl{display:block!important;margin-top:10px;padding-top:10px;border-top:1px solid rgba(120,110,100,.16);font-size:11.5px;color:#8F877C}.hgb .hgl span{display:flex;align-items:center;gap:8px;margin:3px 0}.hgb .hgl i{width:7px;height:7px;box-shadow:none;animation:none;flex:none}html.adm-dark .hgb .hgl{border-color:rgba(255,255,255,.1)}" +
    ".hgb .hgp b{display:block;font-size:13px;margin-bottom:6px;color:#14100E}.hgb .hgp div{display:flex;justify-content:space-between;gap:10px}.hgb .hgp em{font-style:normal;font-weight:600}" +
    "@keyframes hgbp{50%{opacity:.45}}html.adm-dark .hgb button,html.adm-dark .hgb .hgp{background:rgba(28,25,23,.9);color:#E8E2DA;border-color:rgba(255,255,255,.1)}html.adm-dark .hgb .hgp b{color:#fff}" +
    "@media (max-width:720px){.hgb{margin-left:6px}.hgb button{padding:5px 9px 5px 8px;font-size:11px}.hgb small{display:none}.hgb .hgp{position:fixed;left:12px;right:12px;top:60px;width:auto}}";
  document.head.appendChild(css);
  var box = document.createElement("div"); box.className = "hgb"; box.innerHTML = '<button type="button" aria-label="Build status"><i></i><span>Build …</span></button><div class="hgp" hidden></div>';
  var tries = 0, go = function () { var b = document.querySelector(".hvx-w .hvx-b"); if (b && b.parentNode) { b.parentNode.insertBefore(box, b.nextSibling); return; } if (++tries < 20) { setTimeout(go, 150); return; } box.className = "hgb fx"; document.body.appendChild(box); };   // next to "Haritt Group ADMIN" in the top bar
  if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
  var btn = box.querySelector("button"), pop = box.querySelector(".hgp"), st = { n: 0, page: "", mail: "", pub: 0, msg: "", at: 0, liveAt: 0 }, timer = 0;
  var esc = function (t) { return String(t || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var clock = function (ms) { var s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  var ago = function (t) { var m = Math.round((Date.now() - t) / 60000); return m < 1 ? "just now" : m < 60 ? m + " min ago" : Math.round(m / 60) + " hr ago"; };
  var tm = function (t) { return new Date(t).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }); };
  var draw = function () {
    var s = st.page === "new" ? "new" : st.pub ? "wait" : st.mail === "wait" ? "wait" : st.n ? "ok" : "";
    box.setAttribute("data-s", s);
    btn.querySelector("span").innerHTML = st.n ? "Build " + st.n + (s === "new" ? " <small>· Refresh</small>" : st.pub ? " <small>· Publishing " + clock(Date.now() - st.pub) + "</small>" : st.mail === "wait" ? " <small>· Email updating</small>" : " <small>· Live</small>") : "Build …";
    pop.innerHTML = "<b>Build " + (st.n || "…") + (st.liveAt ? " · live since " + tm(st.liveAt) : "") + "</b>" +
      "<div><span>Website</span><em>" + (st.page === "new" ? "New build live, reloading" : st.pub ? "Publishing, " + clock(Date.now() - st.pub) + " so far" : st.n ? "Live, up to date" : "Checking…") + "</em></div>" +
      "<div><span>Email system</span><em>" + (st.mail === "wait" ? "Installing, please wait" : st.mail === "ok" ? "Up to date" : st.mail === "na" ? "Up to date" : "Checking…") + "</em></div>" +
      (st.msg ? "<div><span>Last change</span><em style=\"text-align:right;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\" title=\"" + esc(st.msg) + "\">" + esc(st.msg) + "</em></div><div><span></span><em style=\"font-weight:500;color:#8F877C\">" + ago(st.at) + "</em></div>" : "") +
      '<div class="hgl"><span><i style="background:#1F9D55"></i>Green: live and up to date</span><span><i style="background:#E0A100"></i>Amber: a change is publishing (about 1 to 2 min)</span><span><i style="background:#2F6FEB"></i>Blue: new build ready, page reloads by itself</span></div>';
  };
  /* Live build = /admin/build.json (written after each change). Latest change = GitHub's public commit list for this site
     (revalidated with ETag, so repeat checks don't use the GitHub limit). If they differ, the change is still publishing. */
  var LS = "hgb-c", mem = {}, rd = function () { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch (e) { return mem; } }, wr = function (o) { mem = o; try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} };
  var newer = async function (path) { try { var h = await fetch(path, { method: "HEAD", cache: "no-store" }); return Date.parse(h.headers.get("Last-Modified") || ""); } catch (e) { return 0; } };
  var LOADED = Date.now(), mine = Date.parse(document.lastModified) || LOADED, tick = 0;
  var latest = async function () {
    try { var sc = JSON.parse(localStorage.getItem("hgb-gh") || "null"); if (sc && Date.now() - sc.t < 15000) return sc.v; } catch (e) {}   // one GitHub check shared by all open admin tabs
    if (document.hidden) return null;   // background tabs don't ask GitHub
    var v = await latest0(); try { if (v) localStorage.setItem("hgb-gh", JSON.stringify({ t: Date.now(), v: v })); } catch (e) {} return v;
  };
  var latest0 = async function () {
    try {
      var r = await fetch("https://api.github.com/repos/harittgroup/haritt.com/commits?sha=main&per_page=6", { cache: "no-cache", headers: { Accept: "application/vnd.github+json" } });
      if (!r.ok) return null; var L = await r.json();
      for (var i = 0; i < L.length; i++) { var m = (L[i].commit && L[i].commit.message || "").split("\n")[0]; if (!/^Build stamp/.test(m)) return { sha: L[i].sha, msg: m, at: Date.parse(L[i].commit.committer.date) }; }
    } catch (e) {} return null;
  };
  /* which files a build changed (GitHub compare, public). Refresh only when this page, its folder or the shared admin files changed. */
  var touches = async function (a, b) {
    var tk = "hgb-t:" + a.slice(0, 8) + b.slice(0, 8) + location.pathname, tv; try { tv = sessionStorage.getItem(tk) || localStorage.getItem("hgb-f:" + a + b); } catch (e) {}
    if (tv) { try { var F0 = JSON.parse(tv); if (Array.isArray(F0)) return rel(F0); } catch (e) {} }
    try {
      var r = await fetch("https://api.github.com/repos/harittgroup/haritt.com/compare/" + a + "..." + b, { headers: { Accept: "application/vnd.github+json" } });
      if (!r.ok) return true; var j = await r.json(), F = (j.files || []).map(function (f) { return f.filename; });
      if (!F.length || (j.files || []).length >= 300) return true;
      try { localStorage.setItem("hgb-f:" + a + b, JSON.stringify(F)); } catch (e) {}   // other tabs reuse this list
      return rel(F);
    } catch (e) { return true; }
  };
  var rel = function (F) { var dir = location.pathname.replace(/^\//, "").replace(/index\.html$/, "");
    return F.some(function (f) { return /^admin\/(nav\.js|theme\.css|gate\.js|access\.js)$/.test(f) || (dir && f.indexOf(dir) === 0 && f.slice(dir.length).indexOf("/") < 0); }); };
  var check = async function () {
    clearTimeout(timer);
    var c = rd();
    try {
      var bj = await (await fetch("/admin/build.json?t=" + Date.now(), { cache: "no-store" })).json();
      if (bj && bj.n) { if (bj.sha !== c.sha) c = { sha: bj.sha, n: bj.n, fs: bj.fs || "", at: bj.at || "" }; wr(c); }
    } catch (e) {}
    if (c.n) { st.n = c.n; st.liveAt = Date.parse(c.at) || 0; }
    var lc = await latest();
    if (lc) { st.msg = lc.msg; st.at = lc.at; st.pub = c.sha && lc.sha !== c.sha && Date.now() - lc.at < 20 * 60000 && !(Date.parse(c.at) > lc.at) ? lc.at : 0;   /* live build stamped after this change = not publishing */ }   // older than 20 min = not a publish in progress
    // this page: a newer copy of the page or of nav.js is live
    if (!window.__hgSha && c.sha) window.__hgSha = c.sha;   // build this page was opened on
    st.page = "ok";
    if (c.sha && window.__hgSha && c.sha !== window.__hgSha && !st.pub) {   // a newer build finished publishing: refresh only if it changed this page
      var rel = await touches(window.__hgSha, c.sha);
      if (rel) st.page = "new"; else window.__hgSha = c.sha;   // nothing on this page changed: just show the new number, no refresh
    }
    try {
      if (c.fs && (c.fs !== window.__hgFs || st.mail === "wait" || !st.mail)) { window.__hgFs = c.fs; var j = await (await fetch(SCRIPT, { method: "POST", body: JSON.stringify({ action: "build" }) })).json(); st.mail = !j.ok || !j.blob ? "na" : j.blob === c.fs ? "ok" : "wait"; }
      else if (!c.fs) st.mail = "na";
    } catch (e) { st.mail = "na"; }
    if (st.page === "new") {   // newer build live: reload by itself, but never while you are typing or a window is open
      var a = document.activeElement, busy = (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || !!document.querySelector(".pv:not([hidden]), dialog[open], [aria-modal=true]:not([hidden])");
      if (!busy) { try { sessionStorage.setItem("hgb-y", String(scrollY)); sessionStorage.setItem("hgb-soft", "1"); } catch (e) {}
        try { await fetch(location.href, { cache: "reload" }); } catch (e) {}   // warm the new copy first, then swap with a smooth fade (no white flash)
        location.replace(location.href); return; }
    }
    draw(); clearInterval(tick); if (st.pub) tick = setInterval(draw, 1000);
    timer = setTimeout(check, st.page === "new" ? 5000 : st.pub || st.mail === "wait" ? 8000 : 20000);
  };
  btn.onclick = function () { if (box.getAttribute("data-s") === "new") { location.replace(location.href); return; } pop.hidden = !pop.hidden; };
  document.addEventListener("click", function (e) { if (!box.contains(e.target)) pop.hidden = true; });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) check(); });
  try { var y = sessionStorage.getItem("hgb-y"); if (y) { sessionStorage.removeItem("hgb-y"); addEventListener("load", function () { setTimeout(function () { scrollTo(0, +y); }, 300); }); } } catch (e) {}
  draw(); setTimeout(check, 600);
})();
