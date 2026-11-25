/* Haritt Admin sign-in: Google, a code to the Haritt ID, or a passkey (Face ID, fingerprint, screen PIN, phone via QR).
   The sign-in worker checks codes and passkeys and hands back a Firebase sign-in. Nothing here says whether an email is on the team. */
(function () {
  var W = "https://haritt-auth.harittgroup.workers.dev";
  firebase.initializeApp({ apiKey: "AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4", authDomain: "harsh-reset.firebaseapp.com", projectId: "harsh-reset", appId: "1:592094409539:web:57d3aa494464b867bbf5f6" });
  var auth = firebase.auth(), $ = function (i) { return document.getElementById(i); }, B = document.body, em = "", busy = false, rsT = null, condAbort = null;
  var q = new URLSearchParams(location.search), nx = q.get("next") || "/admin/";
  if (!/^\/admin\//.test(nx) || /^\/admin\/login/.test(nx) || /[\\@]|\/\//.test(nx.slice(1))) nx = "/admin/";   /* only our own admin pages */
  var dev = (function () { try { var d = localStorage.getItem("hx-dev"); if (!d) { d = Array.from(crypto.getRandomValues(new Uint8Array(16)), function (b) { return b.toString(16).padStart(2, "0"); }).join(""); localStorage.setItem("hx-dev", d); } return d; } catch (e) { return ""; } })();
  var PK = !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);

  function go(n) { B.dataset.s = n; if (n !== 7) try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    var f = { 1: "em", 3: null }[n]; if (n === 1) setTimeout(function () { $("em").focus(); }, 60); if (n === 3) setTimeout(function () { otp()[0].focus(); }, 60);
    if (n === 1) cond(); else if (condAbort) { try { condAbort.abort(); } catch (e) {} condAbort = null; } }
  function load(on) { busy = on; $("cd").classList.toggle("busy", on); document.querySelectorAll(".pb,.opt,.sb2").forEach(function (b) { b.disabled = on; }); }
  function err(id, t, ok) { var e = $(id); e.textContent = t || ""; e.classList.toggle("ok", !!ok); }
  async function call(action, body) {
    body = body || {}; body.action = action; body.dev = dev;
    var r = await fetch(W, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    var j = await r.json().catch(function () { return { ok: false, error: "server" }; }); if (r.status === 429) j.error = "slow"; return j;
  }
  async function tok() { return auth.currentUser ? auth.currentUser.getIdToken(true) : ""; }
  function chip() { document.querySelectorAll(".cem").forEach(function (e) { e.textContent = em; }); document.querySelectorAll(".ini").forEach(function (e) { e.textContent = (em[0] || "H").toUpperCase(); }); }
  document.querySelectorAll("[data-back]").forEach(function (b) { b.onclick = function () { go(1); }; });
  document.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { go(+b.dataset.go); }; });
  var MSG = { slow: "Too many tries from here. Wait a few minutes and try again.", server: "Something went wrong. Try again.", network: "No connection. Check your internet and try again." };

  /* step 1: email */
  $("f1").onsubmit = function (e) {
    e.preventDefault(); var v = $("em").value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(v)) { err("e1", "Enter a valid email"); return; }
    err("e1"); em = v; chip(); try { sessionStorage.setItem("hx-em", em); } catch (x) {}
    $("oC").hidden = !/@haritt\.com$/.test(em); $("oP").hidden = !PK; err("e2"); go(2);
  };

  /* Google: Google's own account choice and 2-Step Verification */
  $("oG").onclick = async function () {
    if (busy) return; err("e2"); load(true);
    var p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ login_hint: em, prompt: "select_account" });
    try { await auth.signInWithPopup(p); var j = await call("note", { idToken: await tok(), how: "google" });
      if (j.error === "login") { await auth.signOut(); load(false); err("e2", "This Google account doesn't have admin access. Ask the owner to add you on the Team page."); return; }
      done(); }
    catch (x) { load(false); if (x && /popup-closed|cancelled-popup/.test(x.code || "")) return; err("e2", x && x.code === "auth/popup-blocked" ? "Your browser blocked the Google window. Allow pop-ups and try again." : MSG.server); }
  };

  /* email code */
  function otp() { return Array.prototype.slice.call(document.querySelectorAll("#otp input")); }
  otp().forEach(function (i, k, all) {
    i.addEventListener("input", function () { var d = i.value.replace(/\D/g, ""); if (d.length > 1) { fill(d); return; } i.value = d; if (d && all[k + 1]) all[k + 1].focus(); if (all.every(function (x) { return x.value; })) $("f3").requestSubmit(); });
    i.addEventListener("keydown", function (e) { if (e.key === "Backspace" && !i.value && all[k - 1]) { all[k - 1].focus(); all[k - 1].value = ""; } });
    i.addEventListener("paste", function (e) { var d = (e.clipboardData.getData("text") || "").replace(/\D/g, ""); if (d) { e.preventDefault(); fill(d); } });
  });
  function fill(d) { var a = otp(); d = d.slice(0, 6); a.forEach(function (x, k) { x.value = d[k] || ""; }); (a[Math.min(d.length, 5)]).focus(); if (d.length === 6) $("f3").requestSubmit(); }
  function resendIn(s) { var b = $("rs"); clearInterval(rsT); b.disabled = true; var t = s; var f = function () { if (t <= 0) { clearInterval(rsT); b.disabled = false; b.textContent = "Send again"; return; } b.textContent = "Send again in 0:" + String(t).padStart(2, "0"); t--; }; f(); rsT = setInterval(f, 1000); }
  async function sendCode() { load(true); try { await call("otp_start", { email: em }); } catch (x) { load(false); err("e2", MSG.network); return false; } load(false); return true; }
  $("oC").onclick = async function () { if (busy) return; err("e2"); if (await sendCode()) { otp().forEach(function (x) { x.value = ""; }); err("e3"); go(3); resendIn(60); } };
  $("rs").onclick = async function () { if ($("rs").disabled || busy) return; if (await sendCode()) { err("e3", "We sent a new code, if this account can sign in.", true); resendIn(60); otp()[0].focus(); } };
  $("f3").onsubmit = async function (e) {
    e.preventDefault(); if (busy) return; var c = otp().map(function (x) { return x.value; }).join("");
    if (c.length !== 6) { err("e3", "Enter all 6 digits"); return; }
    load(true); err("e3"); var j;
    try { j = await call("otp_verify", { email: em, code: c }); } catch (x) { load(false); err("e3", MSG.network); return; }
    if (j.ok && j.token) { try { await auth.signInWithCustomToken(j.token); done(); } catch (x) { load(false); err("e3", MSG.server); } return; }
    load(false); if (j.error === "locked") { go(4); return; }
    otp().forEach(function (x) { x.value = ""; }); otp()[0].focus();
    err("e3", MSG[j.error] || "That code didn't work. Check the latest email, or send a new code.");
  };

  /* passkeys */
  var b2u = function (b) { return btoa(String.fromCharCode.apply(null, new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  var u2b = function (s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); return Uint8Array.from(atob(s + "===".slice((s.length + 3) % 4)), function (c) { return c.charCodeAt(0); }); };
  async function pkFinish(cr) {
    var r = cr.response, j = await call("pk_auth_finish", { cred: { id: cr.id, clientDataJSON: b2u(r.clientDataJSON), authenticatorData: b2u(r.authenticatorData), signature: b2u(r.signature) } });
    if (j.ok && j.token) { await auth.signInWithCustomToken(j.token); done(); return true; }
    err(B.dataset.s === "1" ? "e1" : "e5", j.error === "unknown" ? "This passkey isn't linked to an admin account any more. Use another way, then create a new one." : j.error === "slow" ? MSG.slow : "Couldn't confirm the passkey. Try again."); return false;
  }
  async function pkSignIn() {
    if (busy) return; err("e5"); go(5); load(true);
    try { var s = await call("pk_auth_start"); if (!s.ok) throw 0; var o = s.opt; o.challenge = u2b(o.challenge);
      var cr = await navigator.credentials.get({ publicKey: o }); if (!(await pkFinish(cr))) load(false); }
    catch (x) { load(false); err("e5", x && x.name === "NotAllowedError" ? "Cancelled or timed out. Tap Try again." : "Couldn't use a passkey here. Try again, or use another way."); }
  }
  $("oP").onclick = pkSignIn; $("pkGo").onclick = pkSignIn;
  /* passkey suggestions right inside the email box, like Google */
  async function cond() {
    if (!PK || !PublicKeyCredential.isConditionalMediationAvailable || condAbort) return;
    try { if (!(await PublicKeyCredential.isConditionalMediationAvailable())) return; var s = await call("pk_auth_start"); if (!s.ok) return;
      var o = s.opt; o.challenge = u2b(o.challenge); condAbort = new AbortController();
      var cr = await navigator.credentials.get({ publicKey: o, mediation: "conditional", signal: condAbort.signal }); condAbort = null; load(true); if (!(await pkFinish(cr))) load(false);
    } catch (x) { condAbort = null; }
  }
  async function pkCreate(errId) {
    var s = await call("pk_reg_start", { idToken: await tok() });
    if (!s.ok) { if (s.error === "reauth") return "reauth"; err(errId, s.error === "max" ? "You already have 6 passkeys. Remove one first." : MSG[s.error] || MSG.server); return false; }
    var o = s.opt; o.challenge = u2b(o.challenge); o.user.id = new TextEncoder().encode(o.user.id); o.excludeCredentials = (o.excludeCredentials || []).map(function (c) { return { type: c.type, id: u2b(c.id) }; });
    var cr; try { cr = await navigator.credentials.create({ publicKey: o }); }
    catch (x) { err(errId, x && x.name === "InvalidStateError" ? "This device already has a passkey for your account." : x && x.name === "NotAllowedError" ? "Cancelled. Tap again when ready." : "This device couldn't make a passkey."); return false; }
    var r = cr.response; if (!r.getPublicKey || !r.getAuthenticatorData) { err(errId, "Update your browser to use passkeys."); return false; }
    var f = await call("pk_reg_finish", { idToken: await tok(), cred: { id: cr.id, clientDataJSON: b2u(r.clientDataJSON), authenticatorData: b2u(r.getAuthenticatorData()), publicKey: b2u(r.getPublicKey()), alg: r.getPublicKeyAlgorithm() } });
    if (!f.ok) { err(errId, f.error === "again" ? "That took too long. Try again." : MSG[f.error] || "Couldn't save the passkey. Try again."); return false; }
    return f.name || "Passkey";
  }

  function leave() { if (nx.indexOf("/admin/login/") === 0) { load(false); sec(); } else location.replace(nx); }
  /* after sign-in: offer a passkey once, then open the page */
  async function done() {
    load(true); $("m9").textContent = "Signing you in…"; go(9);
    var skip = 0; try { skip = +localStorage.getItem("hx-pk-skip") || 0; } catch (x) {}
    if (PK && Date.now() - skip > 14 * 864e5) { try { var j = await call("sec", { idToken: await tok() }); if (j.ok && !j.passkeys.length) { load(false); go(6); return; } } catch (x) {} }
    leave();
  }
  $("pkSkip").onclick = function () { try { localStorage.setItem("hx-pk-skip", String(Date.now())); } catch (x) {} leave(); };
  $("pkMk").onclick = async function () { if (busy) return; err("e6"); load(true); var r = await pkCreate("e6"); load(false); if (r && r !== "reauth") { err("e6", "Passkey saved in " + r + ".", true); setTimeout(leave, 900); } else if (r === "reauth") leave(); };

  /* Sign-in and security page (#security) */
  var rel = function (t) { if (!t) return "Never used"; var s = (Date.now() - Date.parse(t)) / 1000; return s < 90 ? "just now" : s < 3600 ? Math.round(s / 60) + " min ago" : s < 86400 ? Math.round(s / 3600) + " hours ago" : new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); };
  var dt = function (t) { return new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var IC = { phone: '<svg viewBox="0 0 256 256"><path d="M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16Zm8,200a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8Z"/></svg>', pc: '<svg viewBox="0 0 256 256"><path d="M232,168h-8V72a24,24,0,0,0-24-24H56A24,24,0,0,0,32,72v96H24a8,8,0,0,0-8,8v16a24,24,0,0,0,24,24H216a24,24,0,0,0,24-24V176A8,8,0,0,0,232,168ZM48,72a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8v96H48ZM224,192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8v-8H224Z"/></svg>' };
  async function sec() {
    go(7); try { history.replaceState(null, "", location.pathname + "#security"); } catch (x) {}
    var j; try { j = await call("sec", { idToken: await tok() }); } catch (x) { err("e7", MSG.network); return; }
    if (!j.ok) { if (j.error === "login") { await auth.signOut(); go(1); err("e1", "For safety, sign in again to see this page."); return; } err("e7", MSG[j.error] || MSG.server); return; }
    if (j.me) $("meL").textContent = j.me;
    $("pkL").innerHTML = j.passkeys.length ? j.passkeys.map(function (p) { return '<div class="pk"><span class="ic">' + (/iPhone|iPad|Android/.test(p.dev) ? IC.phone : IC.pc) + '</span><span><b>' + esc(p.name) + '</b><small>' + esc(p.dev) + ' · Created ' + esc(new Date(p.created).toLocaleDateString("en-IN", { day: "numeric", month: "short" })) + ' · ' + (p.last ? "Last used " + rel(p.last) : "Not used yet") + '</small></span><button class="rm" type="button" data-id="' + esc(p.id) + '">Remove</button></div>'; }).join("") : '<p class="empty">No passkeys yet. Create one on each phone or laptop you use. Keep at least 2.</p>';
    $("stg").setAttribute("aria-checked", j.strong ? "true" : "false");
    $("lgL").innerHTML = j.log.length ? j.log.map(function (l) { return '<div class="lgr"><span>' + esc(l.what) + '<small>' + esc(l.where || "Unknown place") + '</small></span><span>' + esc({ code: "Email code", passkey: "Passkey", google: "Google" }[l.how] || l.how) + '<small>' + esc(dt(l.at)) + '</small></span></div>'; }).join("") : '<p class="empty">No sign-ins recorded yet.</p>';
    $("pkL").querySelectorAll(".rm").forEach(function (b) { b.onclick = async function () {
      if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Tap to confirm"; setTimeout(function () { b.dataset.sure = ""; b.textContent = "Remove"; }, 4000); return; }
      b.textContent = "Removing…"; var r = await call("pk_remove", { idToken: await tok(), id: b.dataset.id }); if (r.ok) sec(); else err("e7", MSG.server); }; });
  }
  $("pkAdd").onclick = async function () { if (busy) return; err("e7"); load(true); var r = await pkCreate("e7"); load(false);
    if (r === "reauth") { err("e7", "For safety, sign in again to add a passkey. Signing you out…"); setTimeout(async function () { await auth.signOut(); nx = "/admin/login/#security"; location.hash = ""; go(1); }, 1600); return; }
    if (r) { err("e7", "Passkey saved in " + r + ".", true); sec(); } };
  $("stg").onclick = async function () { var on = $("stg").getAttribute("aria-checked") !== "true"; err("e7"); var r = await call("strong", { idToken: await tok(), on: on });
    if (r.ok) { $("stg").setAttribute("aria-checked", r.strong ? "true" : "false"); err("e7", r.strong ? "Done. Only a passkey or Google can sign in now." : "Email codes can sign in again.", true); }
    else err("e7", r.error === "needpk" ? "Create a passkey first, so you can't get locked out." : MSG.server); };
  $("so").onclick = async function () { await auth.signOut(); location.replace("/admin/login/"); };

  /* start */
  try { em = sessionStorage.getItem("hx-em") || ""; } catch (x) {}
  if (em) { $("em").value = em; chip(); $("oC").hidden = !/@haritt\.com$/.test(em); $("oP").hidden = !PK; }
  var first = true;
  auth.onAuthStateChanged(function (u) {
    if (!first) return; first = false;
    if (u && location.hash === "#security") { sec(); return; }
    if (u && !/^#/.test(location.hash || "")) {
      /* already signed in: keep going, unless the 12-hour session is over */
      u.getIdTokenResult().then(function (r) { if (Date.now() - Date.parse(r.authTime) > 12 * 3600e3) { auth.signOut(); go(1); err("e1", "Your session ended after 12 hours. Sign in again."); } else location.replace(nx); });
      return;
    }
    if (q.get("why") === "timeout") err("e1", "Your session ended after 12 hours. Sign in again.");
    if (location.hash === "#security") nx = "/admin/login/#security";
    go(1);
  });
})();
