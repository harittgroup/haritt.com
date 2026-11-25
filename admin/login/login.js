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
    catch (x) { load(false); err("e5", x && x.name === "NotAllowedError" ? "No passkey found, or it was cancelled. First time? Tap Try another way, sign in with a code or Google, then create your passkey." : "Couldn't use a passkey here. Try another way."); }
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
    if (PK) { try { var j = await call("sec", { idToken: await tok() }); if (j.ok && !j.passkeys.length && (j.all || Date.now() - skip > 14 * 864e5)) { $("pkSkip").hidden = !!j.all; load(false); go(6); return; } } catch (x) {} }
    leave();
  }
  $("pkSkip").onclick = function () { try { localStorage.setItem("hx-pk-skip", String(Date.now())); } catch (x) {} leave(); };
  $("pkMk").onclick = async function () { if (busy) return; err("e6"); load(true); var r = await pkCreate("e6"); load(false); if (r && r !== "reauth") { err("e6", "Passkey saved in " + r + ".", true); setTimeout(leave, 900); } else if (r === "reauth") leave(); };

  /* Sign-in and security page (#security), like a Google Account security page */
  var SI = {"FP": "<svg viewBox=\"0 0 256 256\"><path d=\"M72,128a134.63,134.63,0,0,1-14.16,60.47,8,8,0,1,1-14.32-7.12A118.8,118.8,0,0,0,56,128,71.73,71.73,0,0,1,83,71.8,8,8,0,1,1,93,84.29,55.76,55.76,0,0,0,72,128Zm56-8a8,8,0,0,0-8,8,184.12,184.12,0,0,1-23,89.1,8,8,0,0,0,14,7.76A200.19,200.19,0,0,0,136,128,8,8,0,0,0,128,120Zm0-32a40,40,0,0,0-40,40,8,8,0,0,0,16,0,24,24,0,0,1,48,0,214.09,214.09,0,0,1-20.51,92A8,8,0,1,0,146,226.83,230,230,0,0,0,168,128,40,40,0,0,0,128,88Zm0-64A104.11,104.11,0,0,0,24,128a87.76,87.76,0,0,1-5,29.33,8,8,0,0,0,15.09,5.33A103.9,103.9,0,0,0,40,128a88,88,0,0,1,176,0,282.24,282.24,0,0,1-5.29,54.45,8,8,0,0,0,6.3,9.4,8.22,8.22,0,0,0,1.55.15,8,8,0,0,0,7.84-6.45A298.37,298.37,0,0,0,232,128,104.12,104.12,0,0,0,128,24ZM94.4,152.17A8,8,0,0,0,85,158.42a151,151,0,0,1-17.21,45.44,8,8,0,0,0,13.86,8,166.67,166.67,0,0,0,19-50.25A8,8,0,0,0,94.4,152.17ZM128,56a72.85,72.85,0,0,0-9,.56,8,8,0,0,0,2,15.87A56.08,56.08,0,0,1,184,128a252.12,252.12,0,0,1-1.92,31A8,8,0,0,0,189,168a8.39,8.39,0,0,0,1,.06,8,8,0,0,0,7.92-7,266.48,266.48,0,0,0,2-33A72.08,72.08,0,0,0,128,56Zm57.93,128.25a8,8,0,0,0-9.75,5.75c-1.46,5.69-3.15,11.4-5,17a8,8,0,0,0,5,10.13,7.88,7.88,0,0,0,2.55.42,8,8,0,0,0,7.58-5.46c2-5.92,3.79-12,5.35-18.05A8,8,0,0,0,185.94,184.26Z\"/></svg>", "SH": "<svg viewBox=\"0 0 256 256\"><path d=\"M208,40H48A16,16,0,0,0,32,56v58.77c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z\"/></svg>", "MAIL": "<svg viewBox=\"0 0 256 256\"><path d=\"M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z\"/></svg>", "G": "<svg viewBox=\"0 0 48 48\"><path fill=\"#FFC107\" d=\"M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z\"/><path fill=\"#FF3D00\" d=\"m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z\"/><path fill=\"#4CAF50\" d=\"M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z\"/><path fill=\"#1976D2\" d=\"M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z\"/></svg>", "CK": "<svg viewBox=\"0 0 256 256\"><path d=\"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z\"/></svg>", "WARN": "<svg viewBox=\"0 0 256 256\"><path d=\"M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z\"/></svg>", "LOCK": "<svg viewBox=\"0 0 256 256\"><path d=\"M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z\"/></svg>", "PH": "<svg viewBox=\"0 0 256 256\"><path d=\"M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16Zm8,200a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8ZM140,60a12,12,0,1,1-12-12A12,12,0,0,1,140,60Z\"/></svg>", "PC": "<svg viewBox=\"0 0 256 256\"><path d=\"M232,168h-8V72a24,24,0,0,0-24-24H56A24,24,0,0,0,32,72v96H24a8,8,0,0,0-8,8v16a24,24,0,0,0,24,24H216a24,24,0,0,0,24-24V176A8,8,0,0,0,232,168ZM48,72a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8v96H48ZM224,192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8v-8H224Z\"/></svg>", "OUT": "<svg viewBox=\"0 0 256 256\"><path d=\"M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z\"/></svg>"};
  var rel = function (t) { if (!t) return ""; var s = (Date.now() - Date.parse(t)) / 1000; return s < 120 ? "Active now" : s < 3600 ? Math.round(s / 60) + " min ago" : s < 86400 ? Math.round(s / 3600) + " hours ago" : s < 172800 ? "Yesterday" : Math.round(s / 86400) + " days ago"; };
  var dt = function (t) { var d = new Date(t), n = new Date(), tm = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }); return d.toDateString() === n.toDateString() ? "Today, " + tm : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var CV = '<svg class="cvx" viewBox="0 0 16 16"><path d="M6 3.5 10.5 8 6 12.5"/></svg>', HOW = { code: "Email code", passkey: "Passkey", google: "Google", same: "Same device" };
  var isPh = function (w) { return /iPhone|iPad|Android/.test(w || ""); };
  function rw(icon, cls, title, sub, right, attrs) { var tm = /data-t="([^"]*)"/.exec(attrs || ""); return '<div class="xr"' + (attrs || "") + '><span class="xi ' + (cls || "") + '">' + icon + '</span><span class="xt"><b>' + title + '</b><small>' + sub + '</small>' + (tm ? '<small class="xtm2">' + tm[1] + '</small>' : "") + '</span>' + (right || "") + '</div>'; }
  var stt = function (t, k) { return '<span class="xs ' + k + '"><i></i>' + t + '</span>'; };
  var S7 = null, openPk = false;
  function confirmBtn(b, fn) { if (b.dataset.sure !== "1") { b.dataset.sure = "1"; var t = b.textContent; b.textContent = "Tap to confirm"; setTimeout(function () { b.dataset.sure = ""; b.textContent = t; }, 4000); return; } fn(); }
  function paint7() {
    var j = S7, pk = j.passkeys.length, sc = j.score, lv = sc >= 80 ? ["Strong", "g"] : sc >= 60 ? ["Good", "a"] : ["Needs work", "rd"];
    var ck = [[pk >= 1, "Passkey on a device", "Sign in with Face ID, fingerprint or PIN", "Create", "add"], [pk >= 2, "Passkey on a second device", "So losing one device never locks you out", "Add", "add"], [true, "Sign-in alerts on", "You get a mail for every new device"], [true, "Sessions end after 12 hours", "Nobody stays signed in on a lost device"], [j.strong, "Only passkey or Google", "An email code alone can't sign in", "Turn on", "strong"]];
    ck.sort(function (a, b) { return (b[0] ? 1 : 0) - (a[0] ? 1 : 0); }); var left = ck.filter(function (c) { return !c[0]; }).length;
    var firstTodo = true;
    var h = '<h1 class="xh">Security</h1><p class="xl">' + esc(j.me || "Keep your Haritt account safe") + '</p>';
    h += '<section class="xc"><div class="xhero"><div class="xring ' + lv[1] + '" style="--p:' + sc + '"><svg viewBox="0 0 150 150"><circle class="tr" cx="75" cy="75" r="65"/><circle class="fg" cx="75" cy="75" r="65"/></svg><div class="v"><b>' + sc + '</b><span>out of 100</span></div></div>' +
      '<div><span class="xlv ' + lv[1] + '">' + SI.SH + lv[0] + '</span><h3>' + (sc >= 80 ? "Your account is well protected" : sc >= 60 ? "Your account is fairly safe" : "Your account needs attention") + '</h3><p>' + (left ? "Do " + left + " more step" + (left > 1 ? "s" : "") + " to reach 100." : "Everything is on. Nothing to do.") + '</p></div></div>' +
      ck.map(function (c) { var b = !c[0] && c[3] && firstTodo; if (!c[0] && c[3]) firstTodo = false; var dis = c[4] === "strong" && pk < 1; return '<div class="xk' + (c[0] ? " d" : "") + '"><span class="xki">' + (c[0] ? SI.CK : '<svg viewBox="0 0 256 256"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-width="16"/></svg>') + '</span><span class="xt"><b>' + c[1] + '</b><small>' + (dis ? "Create a passkey first" : c[2]) + '</small></span>' + (!c[0] && c[3] && !dis ? '<button class="xb' + (b ? "" : " o") + '" type="button" data-do="' + c[4] + '">' + c[3] + '</button>' : "") + '</div>'; }).join("") + '</section>';
    h += '<section class="xc"><div class="xch"><div><h2>Ways to sign in</h2><p>Use any of these to get into your account</p></div></div>' +
      rw(SI.FP, pk ? "g" : "a", "Passkeys", pk ? esc(j.passkeys.map(function (p) { return p.dev; }).join(", ")) : "Not set up yet", stt(pk ? pk + (pk > 1 ? " devices" : " device") : "None", pk ? "g" : "a") + CV, ' role="button" tabindex="0" data-do="pk" aria-expanded="' + (openPk ? "true" : "false") + '"') +
      ('<div class="xsubw' + (openPk ? " on" : "") + '"><div class="xsub">' + j.passkeys.map(function (p) { return '<div class="xr"><span class="xt"><b>' + esc(p.name) + '</b><small>' + esc(p.dev) + ' · ' + (p.last ? "Last used " + (rel(p.last) === "Active now" ? "just now" : rel(p.last).toLowerCase()) : "Not used yet") + '</small></span><button class="xb x" type="button" data-rm="' + esc(p.id) + '">Remove</button></div>'; }).join("") + '<div class="xr"><span class="xt"><small>Keep at least 2: phone and laptop.</small></span><button class="xb" type="button" data-do="add">+ Create a passkey</button></div></div></div>') +
      rw(SI.LOCK, j.strong ? "g" : "", "Only passkey or Google", pk ? "Email code alone can't sign in" : "Create a passkey first", '<button class="sw" type="button" role="switch" data-do="strong" aria-checked="' + (j.strong ? "true" : "false") + '" aria-label="Only passkey or Google"' + (pk ? "" : " disabled") + '></button>') +
      (j.me ? rw(SI.MAIL, "", "Email code", esc(j.me), stt(j.strong ? "Off" : "On", j.strong ? "" : "g")) : "") +
      rw(SI.G, "", "Google", j.personal ? 'Company: ' + esc(j.me) + '</small><small>Personal: ' + esc(j.personal) : "Your Google account", stt(j.personal ? "2 accounts" : "On", "g"), ' data-wrap="1"') + '</section>';
    h += '<section class="xc"><div class="xch"><div><h2>Your devices</h2><p>Where you signed in recently</p></div>' + (j.devices.length > 1 ? '<button class="xb o" type="button" data-do="outall">Sign out all</button>' : "") + '</div>' +
      (j.devices.length ? j.devices.map(function (d) { return rw(isPh(d.what) ? SI.PH : SI.PC, "", esc(d.what), esc([d.where, d.me ? "Active now" : rel(d.last)].filter(Boolean).join(" · ")), d.me ? '<span class="xtag">This device</span>' : '<button class="xb x" type="button" data-out="' + esc(d.id) + '">Sign out</button>'); }).join("") : '<p class="xn">Your devices show here after your next sign-in.</p>') + '</section>';
    var EV = function (l) { var w = esc([l.what, l.where].filter(Boolean).join(" · "));
      if (HOW[l.how]) return rw(isPh(l.what) ? SI.PH : SI.PC, "", "New sign-in", w + " · " + HOW[l.how], '<span class="xtm">' + dt(l.at) + '</span>', ' data-t="' + dt(l.at) + '"');
      var m = { pk_add: [SI.SH, "g", "Passkey added"], pk_rm: [SI.FP, "", "Passkey removed"], strong_on: [SI.LOCK, "g", "Only passkey or Google turned on"], strong_off: [SI.LOCK, "a", "Email code turned back on"], lock: [SI.WARN, "a", "5 wrong codes, paused 15 min"], dev_out: [SI.OUT, "", "Device signed out"], out_all: [SI.OUT, "", "Signed out everywhere"] }[l.how] || [SI.SH, "", l.how];
      return rw(m[0], m[1], m[2], (l.x ? esc(l.x) + " · " : "") + w + (l.how === "lock" ? " · Nobody got in" : ""), '<span class="xtm">' + dt(l.at) + '</span>', ' data-t="' + dt(l.at) + '"'); };
    h += '<section class="xc"><div class="xch"><div><h2>Recent activity</h2><p>Anything strange? Sign out all and tell the owner.</p></div></div>' + (j.log.length ? j.log.map(EV).join("") : '<p class="xn">Nothing yet.</p>') + '</section>';
    if (j.owner) h += '<section class="xc" id="xteam"><div class="xch"><div><h2>Team security</h2><p>Only you see this</p></div></div><p class="xn">Loading…</p></section>';
    h += '<div class="xend"><a class="lnk" href="/admin/" style="margin:0;text-decoration:none">Back to admin</a><button class="lnk" type="button" id="so" style="margin:0">Sign out</button></div>';
    var V = $("secV"), again = V.classList.contains("rd"); V.innerHTML = h; var fg = V.querySelector(".xring .fg"), off = String(408.4 - 408.4 * sc / 100);
    if (fg) { if (again) { fg.style.transition = "none"; fg.style.strokeDashoffset = off; } else setTimeout(function () { fg.style.strokeDashoffset = off; }, 40); }
    setTimeout(function () { V.classList.add("rd"); }, 900); $("so").onclick = async function () { await auth.signOut(); location.replace("/admin/login/"); };
    if (j.owner) team();
  }
  async function team() {
    var t = await call("team", { idToken: await tok() }).catch(function () { return null; }), el = $("xteam"); if (!el) return;
    if (!t || !t.ok) { el.querySelector(".xn").textContent = "Couldn't load the team right now."; return; }
    var RL = { owner: "Owner", cofounder: "Full access", team: "Team", viewer: "Viewer", custom: "Some pages", trial: "Trial", manager: "Manager" };
    el.innerHTML = '<div class="xch"><div><h2>Team security</h2><p>Only you see this</p></div></div>' + t.people.map(function (p) { var ini = p.name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
      return '<div class="xr"><span class="xav">' + esc(ini) + '</span><span class="xt"><b>' + esc(p.name) + '</b><small>' + esc([RL[p.role] || "Team", p.pks ? p.pks + " passkey" + (p.pks > 1 ? "s" : "") : "No passkey", p.last ? rel(p.last) : "Never signed in"].join(" · ")) + '</small></span><span class="xsc ' + (p.score >= 80 ? "g" : p.score >= 60 ? "a" : "rd") + '">' + p.score + '</span></div>'; }).join("") +
      '<div class="xr"><span class="xt"><b>Ask everyone for a passkey</b><small>They create one at their next sign-in</small></span><button class="sw" type="button" role="switch" data-do="all" aria-checked="' + (t.all ? "true" : "false") + '" aria-label="Ask everyone for a passkey"></button></div><p class="xn">Lost every device? Sign in with an email code or Google, then remove the old passkey here.</p>';
  }
  function navOn() { /* opened directly (not inside the admin): bring the admin header and menu */
    if (window.top !== window || document.querySelector('script[src*="/admin/nav.js"]')) return;
    var x = document.createElement("script"); x.src = "/admin/nav.js?v=68"; x.defer = true; document.body.appendChild(x);
  }
  async function sec() {
    navOn(); go(7); try { history.replaceState(null, "", location.pathname + "#security"); } catch (x) {}
    if (!S7) $("secV").innerHTML = '<p class="xn" style="border:0;padding:40px 0;text-align:center">Loading…</p>';
    var j; try { j = await call("sec", { idToken: await tok() }); } catch (x) { err("e7", MSG.network); return; }
    if (!j.ok) { if (j.error === "login") { await auth.signOut(); go(1); err("e1", "For safety, sign in again to see this page."); return; } err("e7", MSG[j.error] || MSG.server); return; }
    S7 = j; paint7();
  }
  $("secV").addEventListener("click", async function (e) {
    var b = e.target.closest("[data-do],[data-rm],[data-out]"); if (!b || busy) return; err("e7");
    if (b.dataset.rm) return confirmBtn(b, async function () { b.textContent = "Removing…"; var r = await call("pk_remove", { idToken: await tok(), id: b.dataset.rm }); if (r.ok) sec(); else err("e7", MSG.server); });
    if (b.dataset.out) return confirmBtn(b, async function () { b.textContent = "Signing out…"; var r = await call("dev_out", { idToken: await tok(), id: b.dataset.out }); if (r.ok) { err("e7", "That device is signed out.", true); sec(); } else err("e7", MSG.server); });
    var d = b.dataset.do;
    if (d === "pk") { openPk = !openPk; var w = $("secV").querySelector(".xsubw"); if (w) w.classList.toggle("on", openPk); b.setAttribute("aria-expanded", openPk ? "true" : "false"); return; }
    if (d === "add") { load(true); var r = await pkCreate("e7"); load(false);
      if (r === "reauth") { err("e7", "For safety, sign in again to add a passkey. Signing you out…"); setTimeout(async function () { await auth.signOut(); nx = "/admin/login/#security"; go(1); }, 1600); return; }
      if (r) { err("e7", "Passkey saved in " + r + ".", true); openPk = true; sec(); } return; }
    if (d === "strong") { var on = !S7.strong; document.querySelectorAll('#secV [data-do="strong"].sw').forEach(function (x) { x.setAttribute("aria-checked", on ? "true" : "false"); }); var r2 = await call("strong", { idToken: await tok(), on: on }); if (r2.ok) { err("e7", r2.strong ? "Done. Only a passkey or Google can sign in now." : "Email codes can sign in again.", true); sec(); } else err("e7", r2.error === "needpk" ? "Create a passkey first, so you can't get locked out." : MSG.server); return; }
    if (d === "all") { var on2 = b.getAttribute("aria-checked") !== "true"; var r3 = await call("policy_all", { idToken: await tok(), on: on2 }); if (r3.ok) b.setAttribute("aria-checked", r3.all ? "true" : "false"); else err("e7", MSG.server); return; }
    if (d === "outall") return confirmBtn(b, async function () { b.textContent = "Signing out…"; var r4 = await call("out_all", { idToken: await tok() }); if (r4.ok && r4.token) { await auth.signInWithCustomToken(r4.token); err("e7", "Every other device is signed out.", true); sec(); } else err("e7", MSG.server); });
  });

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
    if (q.get("why") === "timeout") err("e1", "Your session ended after 12 hours. Sign in again."); if (q.get("why") === "out") err("e1", "This device was signed out from your Security page.");
    if (location.hash === "#security") nx = "/admin/login/#security";
    go(1);
  });
})();
