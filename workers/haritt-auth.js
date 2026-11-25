/**
 * Haritt Admin sign-in (Cloudflare Worker) – haritt-auth
 * Ways in: Google (Firebase, done in the browser), a 6-digit code to a @haritt.com address, or a passkey (WebAuthn: Face ID, fingerprint,
 * screen PIN, or a phone via QR). Code and passkey end in a Firebase custom token for that person's own Firebase account.
 * Safety: never says if an email exists; codes are hashed, 10 min, single use; 5 wrong = 15 min lock + alert; per-address and per-IP limits;
 * passkey checks origin, challenge (single use, 5 min), rpId hash, user verification and signature; new-device mail; sign-in log 90 days.
 * KV (AUTH): ch:<id> challenge, otp:<h> code, lk:<h> lock, rl:<k> rate count, cr:<credId> passkey, pk:<h> list, pol:<h> policy, dv:<h> devices, lg:<h>:<ts> log.
 * Secrets: FB_SA (Firebase service key json), RESEND, PEPPER.
 */
const PROJECT = "harsh-reset", RP = "haritt.com", ORIGIN = "https://haritt.com", OWNER_UID = "vbqJe9D5IAYSBytSzM850motekm2", OWNER_MAIL = "harsh.goyal@haritt.com";
const FROM = "Haritt Group <security@haritt.com>";
const CORS = { "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS } });
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const enc = new TextEncoder(), dec = new TextDecoder();
const b64u = x => Uint8Array.from(atob(String(x).replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(String(x).length / 4) * 4, "=")), c => c.charCodeAt(0));
const ub64 = u => { u = u instanceof Uint8Array ? u : new Uint8Array(u); let s = ""; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const rnd = n => crypto.getRandomValues(new Uint8Array(n));
async function sha(s) { const d = await crypto.subtle.digest("SHA-256", typeof s === "string" ? enc.encode(s) : s); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join(""); }
const sha256 = async u => new Uint8Array(await crypto.subtle.digest("SHA-256", u));
const eq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a[i] ^ b[i]; return r === 0; };
const OKMAIL = /^[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const wait = ms => new Promise(r => setTimeout(r, ms));
const LOGO = "https://haritt.com/mail/haritt-3d-120.png";
const nm = a => String(a||"").split("@")[0].split(/[._-]/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(" ")||"there"; const nm0 = a => { const f = String(a || "").split("@")[0].split(/[._-]/)[0]; return f ? f[0].toUpperCase() + f.slice(1) : "there"; };
function steps(list) { return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 0">' + list.map((t, i) => '<tr><td width="34" valign="top" style="padding:5px 0"><div class="nb" style="width:24px;height:24px;line-height:24px;border-radius:12px;background:#FBEDEF;color:#A70D22;font-weight:700;font-size:13px;text-align:center">' + (i + 1) + '</div></td><td class="tx" style="padding:5px 0 5px 4px;font-size:15px;line-height:1.5;color:#1B1A1C">' + t + '</td></tr>').join("") + '</table>'; }
function idbox(a) { return '<div class="bx" style="margin:14px 0 18px;padding:14px 16px;border-radius:12px;background:#FBEDEF;border:1px solid #F1D5D9"><div class="lb" style="font-size:11px;letter-spacing:.08em;font-weight:700;color:#A70D22">YOUR BUSINESS EMAIL</div><div class="ad" style="font-size:19px;font-weight:700;margin-top:4px;color:#1B1A1C;word-break:break-all">' + esc(a) + '</div></div>'; }
function card(title, inner, btn, pre, label) {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><style>u + .body .gw{background:#000;mix-blend-mode:screen;display:inline-block}u + .body .gd{background:#000;mix-blend-mode:difference;display:inline-block}@media (prefers-color-scheme:dark){.bg{background:#0E0F12!important}.cd{background:#17161A!important;border-color:#2B2830!important}.tx,.hd,.ad{color:#F1EEF3!important}.mt{color:#B6B0BD!important}.bx{background:#2A1B1E!important;border-color:#4A2E33!important}.nb,.ac{background:#2A1B1E!important;color:#E88A93!important}.lb{color:#E88A93!important}.ft{background:#141210!important;border-color:#2A2623!important}.cta{background:#E88A93!important;color:#1B1A1C!important}}</style></head><body class="bg body" style="margin:0;background:#F6F4F7;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif">' + (pre ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + esc(pre) + '</div>' : "") + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background:#F6F4F7"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px"><tr><td class="cd" style="background:#fff;border:1px solid #ECE8EE;border-radius:16px;overflow:hidden;padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#16110F;background-image:linear-gradient(125deg,#16110F 0%,#2B0B0B 55%,#7A0C0C 100%);padding:16px 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="' + LOGO + '" width="30" height="30" alt="" style="display:block;border-radius:50%"></td><td style="padding-left:10px;vertical-align:middle;color:#fff;font-size:12px;font-weight:700;letter-spacing:.22em"><span class="gw"><span class="gd">HARITT GROUP</span></span></td></tr></table></td><td align="right" style="vertical-align:middle"><span style="display:inline-block;border:1px solid rgba(255,255,255,.28);border-radius:99px;padding:4px 11px;color:#F3D9D9;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase"><span class="gw"><span class="gd">' + esc(label || "Business email") + '</span></span></span></td></tr></table></td></tr></table><div style="padding:26px 26px 28px"><div class="hd" style="font-size:21px;line-height:1.3;font-weight:700;color:#1B1A1C;margin:0 0 10px">' + title + '</div><div class="mt" style="font-size:15px;line-height:1.6;color:#4A4650">' + inner + '</div>' + (btn ? '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px"><tr><td class="cta" style="background:#A70D22;border-radius:10px"><a class="cta" href="' + esc(btn[1]) + '" style="display:inline-block;padding:13px 24px;color:#fff;text-decoration:none;font-weight:600;font-size:15px;border-radius:10px">' + esc(btn[0]) + '</a></td></tr></table>' : "") + '</div><div class="ft" style="background:#FAF7F3;border-top:1px solid #EEE7DF;padding:18px 26px;text-align:center;font-size:12.5px;line-height:1.7;color:#8A8492"><b class="tx" style="color:#3D3730">Haritt Group</b> &middot; <a href="https://haritt.com" style="color:#8A8492;text-decoration:underline">haritt.com</a><br>Behind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001<br>Jaipur &middot; Bharatpur<br><span style="font-size:11.5px">This is a private message from Haritt Group. Please do not forward it.</span></div></td></tr></table></td></tr></table></body></html>';
}

/* ---------- Google service key: access token + custom token ---------- */
let SAK = null, GT = null;
async function saKey(env) { if (SAK) return SAK; const sa = JSON.parse(env.FB_SA); const pem = sa.private_key.replace(/-----[^-]+-----|\s/g, ""); SAK = { email: sa.client_email, key: await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]) }; return SAK; }
async function jwt(env, payload) { const k = await saKey(env), h = ub64(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" }))), p = ub64(enc.encode(JSON.stringify(payload))); const s = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", k.key, enc.encode(h + "." + p)); return h + "." + p + "." + ub64(s); }
async function gtoken(env) {
  if (GT && GT.exp > Date.now()) return GT.t;
  const k = await saKey(env), now = Math.floor(Date.now() / 1000);
  const a = await jwt(env, { iss: k.email, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const r = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + a })).json();
  GT = { t: r.access_token, exp: Date.now() + 3000000 }; return GT.t;
}
async function gcall(env, url, body) { const r = await fetch(url, { method: body ? "POST" : "GET", headers: { Authorization: "Bearer " + await gtoken(env), "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }); return { s: r.status, j: await r.json().catch(() => ({})) }; }
/* the person's own Firebase account (made once, email marked verified because they proved the inbox) */
async function uidFor(env, email) {
  const IT = "https://identitytoolkit.googleapis.com/v1/projects/" + PROJECT + "/accounts";
  const l = await gcall(env, IT + ":lookup", { email: [email] }); const u = (l.j.users || [])[0];
  if (u) { if (!u.emailVerified) await gcall(env, IT + ":update", { localId: u.localId, emailVerified: true }); if (u.disabled) return null; return u.localId; }
  const c = await gcall(env, IT, { email, emailVerified: true }); return c.j.localId || null;
}
async function customToken(env, uid, how) { const k = await saKey(env), now = Math.floor(Date.now() / 1000); return jwt(env, { iss: k.email, sub: k.email, aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit", iat: now, exp: now + 3600, uid, claims: { hxm: how, hxt: now } }); }
/* who may sign in: the owner, or anyone with a Team page entry */
async function member(env, email) {
  if (!email) return null; if (email === OWNER_MAIL) return { name: "Harsh Goyal", owner: true };
  const r = await gcall(env, "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents/team/" + encodeURIComponent(email));
  if (r.s !== 200) return null; const f = r.j.fields || {}; if (f.off && f.off.booleanValue) return null;
  return { name: (f.name && f.name.stringValue) || "", owner: false };
}

/* ---------- Firebase sign-in token check (Google public keys) ---------- */
let JWKS = null, JWKT = 0;
async function jwks() { if (JWKS && JWKT > Date.now()) return JWKS; const j = await (await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")).json(); JWKS = j.keys || []; JWKT = Date.now() + 3600000; return JWKS; }
async function idUser(t) {
  try {
    const [h, p, sg] = String(t).split("."); const hd = JSON.parse(dec.decode(b64u(h))), pl = JSON.parse(dec.decode(b64u(p)));
    if (hd.alg !== "RS256") return null; const k = (await jwks()).find(x => x.kid === hd.kid); if (!k) return null;
    const key = await crypto.subtle.importKey("jwk", k, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    if (!(await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(sg), enc.encode(h + "." + p)))) return null;
    const now = Date.now() / 1000;
    if (pl.aud !== PROJECT || pl.iss !== "https://securetoken.google.com/" + PROJECT || !(pl.exp > now) || pl.iat > now + 60 || !pl.sub) return null;
    if (now - (pl.auth_time || 0) > 12 * 3600) return null;   /* sessions end after 12 hours */
    const email = String(pl.email || "").toLowerCase();
    if (pl.sub !== OWNER_UID && (!email || pl.email_verified !== true)) return null;
    return { uid: pl.sub, email, fresh: now - (pl.auth_time || 0) < 600 };
  } catch (e) { return null; }
}
async function allowedUser(env, t) { const u = await idUser(t); if (!u) return null; if (u.uid === OWNER_UID) return { ...u, owner: true, alert: OWNER_MAIL }; const m = await member(env, u.email); return m ? { ...u, owner: m.owner, name: m.name, alert: /@haritt\.com$/.test(u.email) ? u.email : "" } : null; }

/* ---------- limits ---------- */
async function hit(env, key, max, ttl) { const k = "rl:" + key, n = Number(await env.AUTH.get(k) || 0); if (n >= max) return false; await env.AUTH.put(k, String(n + 1), { expirationTtl: ttl }); return true; }
const ipOf = req => req.headers.get("CF-Connecting-IP") || "0";

/* ---------- device + log + alert mails ---------- */
function device(req) {
  const u = req.headers.get("User-Agent") || ""; const os = /iPhone/.test(u) ? "iPhone" : /iPad/.test(u) ? "iPad" : /Android/.test(u) ? "Android" : /Mac OS X/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : /CrOS/.test(u) ? "Chromebook" : /Linux/.test(u) ? "Linux" : "a device";
  const br = /Edg\//.test(u) ? "Edge" : /OPR\//.test(u) ? "Opera" : /SamsungBrowser/.test(u) ? "Samsung Internet" : /CriOS|Chrome\//.test(u) ? "Chrome" : /FxiOS|Firefox\//.test(u) ? "Firefox" : /Safari\//.test(u) ? "Safari" : "Browser";
  const c = req.cf || {}; return { what: br + " on " + os, where: [c.city, c.country].filter(Boolean).join(", ") };
}
const ist = d => new Date(d.getTime() + 19800000).toISOString().replace("T", " ").slice(0, 16) + " IST";
async function mail(env, to, subject, html, text) { if (!env.RESEND || !to) return false; try { const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: [to], subject, html, text }) }); return r.ok; } catch (e) { return false; } }
function infoBox(rows) { return '<div class="bx" style="margin:14px 0 18px;padding:14px 16px;border-radius:12px;background:#FBEDEF;border:1px solid #F1D5D9">' + rows.map(r => '<div class="tx" style="font-size:14px;line-height:1.7;color:#1B1A1C"><span class="mt" style="color:#6B6670">' + esc(r[0]) + ':</span> <b>' + esc(r[1]) + '</b></div>').join("") + '</div>'; }
async function logIn(env, req, u, how, dev) {
  const h = await sha(u.uid), d = device(req), now = new Date();
  try { await env.AUTH.put("lg:" + h + ":" + String(now.getTime()).padStart(14, "0"), JSON.stringify({ at: now.toISOString(), how, what: d.what, where: d.where }), { expirationTtl: 90 * 86400 }); } catch (e) {}
  const dh = (await sha("dv" + (dev || "") + d.what)).slice(0, 16); let list = []; try { list = JSON.parse(await env.AUTH.get("dv:" + h) || "[]"); } catch (e) {}
  if (!list.includes(dh)) {
    list.unshift(dh); try { await env.AUTH.put("dv:" + h, JSON.stringify(list.slice(0, 20))); } catch (e) {}
    if (list.length > 1 && u.alert) { const how2 = { code: "Email code", passkey: "Passkey", google: "Google" }[how] || how;
      await mail(env, u.alert, "New sign-in to Haritt Admin", card("Hi " + esc(u.name || nm(u.alert)) + ",", "Your account was just used to sign in on a new device." + infoBox([["Device", d.what], ["Place", d.where || "Unknown"], ["Time", ist(now)], ["Method", how2]]) + "If this was you, you don't need to do anything.", ["Review sign-ins", "https://haritt.com/admin/login/#security"], "New sign-in on " + d.what, "Security"),
        "New sign-in to Haritt Admin\n\nDevice: " + d.what + "\nPlace: " + (d.where || "Unknown") + "\nTime: " + ist(now) + "\nMethod: " + how2 + "\n\nIf this wasn't you, tell the owner right away: " + OWNER_MAIL); }
  }
}
async function alertLock(env, req, email, name) {
  const d = device(req), now = new Date(), body = "5 wrong codes were entered for " + esc(email) + ". Sign-in with a code is paused for 15 minutes." + infoBox([["Device", d.what], ["Place", d.where || "Unknown"], ["Time", ist(now)]]) + "If this wasn't you, no action is needed: nobody got in.";
  const t = "Sign-in paused for " + email + "\n\n5 wrong codes. Paused 15 minutes. Device: " + d.what + ", " + (d.where || "Unknown") + ", " + ist(now);
  await mail(env, email, "Sign-in paused: too many wrong codes", card("Hi " + esc(name || nm(email)) + ",", body, null, "Too many wrong codes", "Security"), t);
  if (email !== OWNER_MAIL) await mail(env, OWNER_MAIL, "Team sign-in paused: " + email, card("Hi Harsh,", body, ["Open Team", "https://haritt.com/admin/team/"], "Too many wrong codes", "Security"), t);
}

/* ---------- WebAuthn helpers ---------- */
const AAG = { "fbfc3007-154e-4ecc-8c0b-6e020557d7bd": "iCloud Keychain", "dd4ec289-e01d-41c9-bb89-70fa845d4bf2": "iCloud Keychain", "ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4": "Google Password Manager", "adce0002-35bc-c60a-648b-0b25f1f05503": "Chrome on Mac", "08987058-cadc-4b81-b6e1-30de50dcbe96": "Windows Hello", "9ddd1817-af5a-4672-a2b9-3e3dd95000a9": "Windows Hello", "6028b017-b1d4-4c02-b4b3-afcdafc96bb2": "Windows Hello", "bada5566-a7aa-401f-bd96-45619a55120d": "1Password", "d548826e-79b4-db40-a3d8-11116f7e8349": "Bitwarden", "53414d53-554e-4700-0000-000000000000": "Samsung Pass", "531126d6-e717-415c-9320-3d9aa6981239": "Dashlane" };
const hex = u => [...u].map(b => b.toString(16).padStart(2, "0")).join("");
const aaguid = u => { const x = hex(u); return x.slice(0, 8) + "-" + x.slice(8, 12) + "-" + x.slice(12, 16) + "-" + x.slice(16, 20) + "-" + x.slice(20); };
async function newChallenge(env, kind, extra) { const c = ub64(rnd(32)); await env.AUTH.put("ch:" + c, JSON.stringify({ kind, ...extra }), { expirationTtl: 300 }); return c; }
async function takeChallenge(env, c, kind) { if (!c || c.length > 64) return null; const v = await env.AUTH.get("ch:" + c); if (!v) return null; await env.AUTH.delete("ch:" + c); const o = JSON.parse(v); return o.kind === kind ? o : null; }
async function clientData(raw, type) { const cd = JSON.parse(dec.decode(raw)); if (cd.type !== type || cd.origin !== ORIGIN || cd.crossOrigin === true) return null; return cd; }
async function authData(u) { if (u.length < 37) return null; if (!eq(u.subarray(0, 32), await sha256(enc.encode(RP)))) return null; const f = u[32]; if (!(f & 1) || !(f & 4)) return null; return { flags: f, count: ((u[33] << 24) >>> 0) + (u[34] << 16) + (u[35] << 8) + u[36] }; }
function derToRaw(d) { /* ES256 signature: DER -> r||s (64 bytes) */ let i = 2; if (d[1] & 0x80) i += d[1] & 0x7f; const rl = d[i + 1], r = d.subarray(i + 2, i + 2 + rl); i = i + 2 + rl; const sl = d[i + 1], s = d.subarray(i + 2, i + 2 + sl); const o = new Uint8Array(64); const cp = (x, at) => { x = x.subarray(Math.max(0, x.length - 32)); o.set(x, at + 32 - x.length); }; cp(r, 0); cp(s, 32); return o; }
async function verifySig(c, data, sig) {
  if (c.alg === -7) { const k = await crypto.subtle.importKey("spki", b64u(c.pk), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]); return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, k, derToRaw(sig), data); }
  if (c.alg === -257) { const k = await crypto.subtle.importKey("spki", b64u(c.pk), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]); return crypto.subtle.verify("RSASSA-PKCS1-v1_5", k, sig, data); }
  return false;
}
const strongOn = async (env, uid) => { try { return !!JSON.parse(await env.AUTH.get("pol:" + await sha(uid)) || "{}").strong; } catch (e) { return false; } };
async function pkList(env, uid) { try { return JSON.parse(await env.AUTH.get("pk:" + await sha(uid)) || "[]"); } catch (e) { return []; } }

/* ---------- requests ---------- */
async function handle(req, env) {
  let b; try { b = await req.json(); } catch (e) { return json({ ok: false, error: "bad" }, 400); }
  const a = String(b.action || ""), ip = ipOf(req);
  if (!(await hit(env, "ip:" + ip, 60, 3600))) return json({ ok: false, error: "slow" }, 429);

  if (a === "otp_start") {
    const email = String(b.email || "").trim().toLowerCase(), t0 = Date.now();
    const done = async () => { const left = 900 - (Date.now() - t0); if (left > 0) await wait(left); return json({ ok: true }); };   /* same answer and timing for everyone */
    if (!OKMAIL.test(email) || !/@haritt\.com$/.test(email)) return done();
    const h = await sha(email);
    if (await env.AUTH.get("lk:" + h)) return done();
    if (!(await hit(env, "os:" + h, 3, 900)) || !(await hit(env, "oi:" + ip, 8, 3600))) return done();
    const m = await member(env, email); if (!m) return done();
    const uid = await uidFor(env, email); if (!uid || await strongOn(env, uid)) return done();
    const code = String(100000 + (new Uint32Array(rnd(4).buffer)[0] % 900000));
    await env.AUTH.put("otp:" + h, JSON.stringify({ h: await sha(env.PEPPER + email + code), n: 0, exp: Date.now() + 600000 }), { expirationTtl: 600 });
    const d = device(req);
    await mail(env, email, code + " is your Haritt sign-in code", card("Hi " + esc(m.name || nm(email)) + ",", "Use this code to sign in to Haritt Admin. It works once, for 10 minutes.<div class=\"bx lb\" style=\"margin:16px 0 4px;padding:16px;border-radius:12px;background:#FBEDEF;text-align:center;font-size:30px;font-weight:700;letter-spacing:.3em;color:#A70D22\">" + code + "</div><div class=\"mt\" style=\"font-size:13px;color:#6B6670;margin-top:10px\">Requested from " + esc(d.what) + (d.where ? ", " + esc(d.where) : "") + ". Never share this code. Haritt will never ask for it.</div>", null, code + " is your sign-in code", "Sign-in code"),
      code + " is your Haritt sign-in code.\n\nIt works once, for 10 minutes. Requested from " + d.what + (d.where ? ", " + d.where : "") + ".\nNever share this code.");
    return done();
  }

  if (a === "otp_verify") {
    const email = String(b.email || "").trim().toLowerCase(), code = String(b.code || "").replace(/\D/g, "");
    if (!OKMAIL.test(email) || code.length !== 6) return json({ ok: false, error: "wrong" });
    const h = await sha(email);
    if (await env.AUTH.get("lk:" + h)) return json({ ok: false, error: "locked" });
    if (!(await hit(env, "ov:" + ip, 30, 3600))) return json({ ok: false, error: "slow" }, 429);
    /* wrong, expired and unknown all answer the same, and all count toward the lock, so nobody can test which emails exist */
    const raw = await env.AUTH.get("otp:" + h); let o = null; try { o = raw && JSON.parse(raw); } catch (e) {}
    const good = o && o.exp > Date.now() && eq(enc.encode(o.h), enc.encode(await sha(env.PEPPER + email + code)));
    if (!good) {
      const n = Number(await env.AUTH.get("ow:" + h) || 0) + 1;
      if (n >= 5) { await env.AUTH.delete("otp:" + h); await env.AUTH.delete("ow:" + h); await env.AUTH.put("lk:" + h, "1", { expirationTtl: 900 }); const m = await member(env, email); if (m) await alertLock(env, req, email, m.name); return json({ ok: false, error: "locked" }); }
      await env.AUTH.put("ow:" + h, String(n), { expirationTtl: 900 }); return json({ ok: false, error: "wrong" });
    }
    await env.AUTH.delete("ow:" + h);
    await env.AUTH.delete("otp:" + h);
    const m = await member(env, email); if (!m) return json({ ok: false, error: "wrong" });
    const uid = await uidFor(env, email); if (!uid) return json({ ok: false, error: "off" });
    await logIn(env, req, { uid, alert: email, name: m.name }, "code", b.dev);
    return json({ ok: true, token: await customToken(env, uid, "code") });
  }

  if (a === "selftest" && env.SELFTEST && b.key === env.SELFTEST) {   /* deploy check only: the key exists for a few seconds during deploy */
    const out = {}; try { out.member = !!(await member(env, "nobody.test@haritt.com")); const uid = await uidFor(env, OWNER_MAIL); out.uid = !!uid;
      const ct = await customToken(env, uid, "test"); const r = await (await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4", { method: "POST", headers: { "Content-Type": "application/json", Referer: ORIGIN + "/" }, body: JSON.stringify({ token: ct, returnSecureToken: true }) })).json();
      if (r.idToken) { const pl = JSON.parse(dec.decode(b64u(r.idToken.split(".")[1]))); out.email = pl.email === OWNER_MAIL; out.verified = pl.email_verified; out.claim = pl.hxm; out.idOk = !!(await idUser(r.idToken)); } else out.err = r.error && r.error.message;
    } catch (e) { out.err = String(e).slice(0, 120); } return json(out);
  }
  if (a === "pk_auth_start") { return json({ ok: true, opt: { challenge: await newChallenge(env, "get", {}), rpId: RP, userVerification: "required", timeout: 120000, allowCredentials: [] } }); }

  if (a === "pk_auth_finish") {
    const c = b.cred || {}; if (!(await hit(env, "pf:" + ip, 20, 3600))) return json({ ok: false, error: "slow" }, 429);
    try {
      const cdRaw = b64u(c.clientDataJSON), ad = b64u(c.authenticatorData), sig = b64u(c.signature);
      const cd = await clientData(cdRaw, "webauthn.get"); if (!cd || !(await takeChallenge(env, cd.challenge, "get"))) return json({ ok: false, error: "again" });
      const st = JSON.parse(await env.AUTH.get("cr:" + String(c.id).slice(0, 400)) || "null"); if (!st) return json({ ok: false, error: "unknown" });
      const info = await authData(ad); if (!info) return json({ ok: false, error: "verify" });
      const data = new Uint8Array(ad.length + 32); data.set(ad); data.set(await sha256(cdRaw), ad.length);
      if (!(await verifySig(st, data, sig))) return json({ ok: false, error: "verify" });
      if (st.count && info.count && info.count <= st.count) return json({ ok: false, error: "clone" });
      const u = { uid: st.uid, alert: st.alert, name: st.name };
      if (st.uid !== OWNER_UID) { const m = await member(env, st.email); if (!m) return json({ ok: false, error: "unknown" }); }
      st.count = info.count; st.last = new Date().toISOString(); await env.AUTH.put("cr:" + c.id, JSON.stringify(st));
      const list = await pkList(env, st.uid), it = list.find(x => x.id === c.id); if (it) { it.last = st.last; await env.AUTH.put("pk:" + await sha(st.uid), JSON.stringify(list)); }
      await logIn(env, req, u, "passkey", b.dev);
      return json({ ok: true, token: await customToken(env, st.uid, "passkey") });
    } catch (e) { return json({ ok: false, error: "verify" }); }
  }

  /* everything below needs a signed-in team member */
  const u = await allowedUser(env, b.idToken); if (!u) return json({ ok: false, error: "login" }, 401);
  const uh = await sha(u.uid);

  if (a === "pk_reg_start") {
    if (!u.fresh) return json({ ok: false, error: "reauth" });   /* adding a passkey needs a sign-in from the last 10 minutes */
    const list = await pkList(env, u.uid); if (list.length >= 6) return json({ ok: false, error: "max" });
    const label = u.email && !/@haritt\.com$/.test(u.email) ? OWNER_MAIL : (u.email || OWNER_MAIL);
    return json({ ok: true, opt: { challenge: await newChallenge(env, "create", { uid: u.uid }), rp: { id: RP, name: "Haritt Admin" }, user: { id: uh.slice(0, 32), name: label, displayName: u.name || nm(label) }, pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }], authenticatorSelection: { residentKey: "required", requireResidentKey: true, userVerification: "required" }, attestation: "none", timeout: 180000, excludeCredentials: list.map(x => ({ type: "public-key", id: x.id })) } });
  }
  if (a === "pk_reg_finish") {
    const c = b.cred || {};
    try {
      const cdRaw = b64u(c.clientDataJSON), cd = await clientData(cdRaw, "webauthn.create"); if (!cd) return json({ ok: false, error: "verify" });
      const ch = await takeChallenge(env, cd.challenge, "create"); if (!ch || ch.uid !== u.uid) return json({ ok: false, error: "again" });
      const ad = b64u(c.authenticatorData), info = await authData(ad); if (!info || !(info.flags & 64)) return json({ ok: false, error: "verify" });
      const idLen = (ad[53] << 8) + ad[54], credId = ub64(ad.subarray(55, 55 + idLen));
      if (credId !== c.id || ![-7, -257].includes(Number(c.alg)) || !c.publicKey) return json({ ok: false, error: "verify" });
      const prov = AAG[aaguid(ad.subarray(37, 53))] || "", d = device(req), now = new Date().toISOString();
      const name = String(prov || d.what).slice(0, 60);
      await env.AUTH.put("cr:" + credId, JSON.stringify({ uid: u.uid, email: u.email, alert: u.alert, name: u.name, alg: Number(c.alg), pk: c.publicKey, count: info.count, created: now }));
      const list = await pkList(env, u.uid); list.push({ id: credId, name, dev: d.what, created: now, last: "", synced: !!(info.flags & 8) });
      await env.AUTH.put("pk:" + uh, JSON.stringify(list));
      if (u.alert) await mail(env, u.alert, "A passkey was added to your Haritt account", card("Hi " + esc(u.name || nm(u.alert)) + ",", "A new passkey can now sign in to your account." + infoBox([["Passkey", name], ["Added from", d.what], ["Time", ist(new Date())]]) + "If this wasn't you, remove it now and tell the owner.", ["Review passkeys", "https://haritt.com/admin/login/#security"], "Passkey added", "Security"), "A passkey (" + name + ") was added from " + d.what + ". If this wasn't you, remove it at https://haritt.com/admin/login/#security");
      return json({ ok: true, name });
    } catch (e) { return json({ ok: false, error: "verify" }); }
  }
  if (a === "sec") {
    const lg = await env.AUTH.list({ prefix: "lg:" + uh + ":", limit: 1000 }); const last = lg.keys.slice(-8).reverse();
    const log = []; for (const k of last) { try { log.push(JSON.parse(await env.AUTH.get(k.name))); } catch (e) {} }
    return json({ ok: true, passkeys: await pkList(env, u.uid), strong: await strongOn(env, u.uid), log, me: u.email && /@haritt\.com$/.test(u.email) ? u.email : (u.uid === OWNER_UID ? OWNER_MAIL : "") });
  }
  if (a === "pk_remove") {
    const list = await pkList(env, u.uid), it = list.find(x => x.id === b.id); if (!it) return json({ ok: false, error: "none" });
    const rest = list.filter(x => x.id !== b.id); await env.AUTH.delete("cr:" + it.id); await env.AUTH.put("pk:" + uh, JSON.stringify(rest));
    if (!rest.length) await env.AUTH.delete("pol:" + uh);
    return json({ ok: true, strong: rest.length ? await strongOn(env, u.uid) : false });
  }
  if (a === "strong") {
    if (b.on && !(await pkList(env, u.uid)).length) return json({ ok: false, error: "needpk" });
    if (b.on) await env.AUTH.put("pol:" + uh, JSON.stringify({ strong: true })); else await env.AUTH.delete("pol:" + uh);
    return json({ ok: true, strong: !!b.on });
  }
  if (a === "note") { if (u.fresh) await logIn(env, req, u, String(b.how || "google").slice(0, 10), b.dev); return json({ ok: true }); }
  return json({ ok: false, error: "unknown" }, 400);
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method !== "POST") return new Response("Haritt sign-in", { headers: { "Content-Type": "text/plain" } });
    if (req.headers.get("Origin") !== ORIGIN) return json({ ok: false, error: "origin" }, 403);
    try { return await handle(req, env); } catch (e) { return json({ ok: false, error: "server" }, 500); }
  }
};
