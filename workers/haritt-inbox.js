/**
 * Haritt Group – Mail forwarder (Cloudflare Worker)
 * - email(): mail to a team address is sent on to that person's own Gmail through Resend (no Cloudflare "verify destination" mail).
 *   If the person has not set their inbox yet, mail waits 30 days and is delivered the moment they do.
 *   inbox@haritt.com is the old pilot: it is kept 60 days in KV and read in admin.
 * - fetch(): public setup calls (link + code, no login) and admin calls (admin session from the joining script).
 * KV (INBOX): dest:<addr> = Gmail, tok/otp = set-up, q: = waiting mail, b: = 30-day safety copy (both sealed with AES-GCM, key in a Cloudflare secret), a: = audit log, m: = pilot mail.
 */
const SCRIPT = "https://script.google.com/macros/s/AKfycbyjVZM40H9UKE_JgpAjn1R288XZTc94V74XshoqFqgKWycPcqXh4423V-1Oc9f5AU-OFw/exec";
const CORS = { "Access-Control-Allow-Origin": "https://haritt.com", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json", ...CORS } });
const MAX = 400000, TTL = 60 * 86400, QTTL = 30 * 86400, BIG = 12 * 1024 * 1024, QBIG = 8 * 1024 * 1024;
const FWD = "forward@haritt.com", SETUP = "https://haritt.com/setup/inbox/";
const OKMAIL = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- reading a raw mail ---------- */
function bin(buf) { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return s; }
function bytesOf(s, enc) {
  enc = (enc || "").toLowerCase();
  if (enc === "base64") { try { const b = atob(s.replace(/\s+/g, "")); return Uint8Array.from(b, c => c.charCodeAt(0)); } catch (e) { return new Uint8Array(0); } }
  if (enc === "quoted-printable") {
    s = s.replace(/=\r?\n/g, ""); const a = [];
    for (let i = 0; i < s.length; i++) { if (s[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(s.substr(i + 1, 2))) { a.push(parseInt(s.substr(i + 1, 2), 16)); i += 2; } else a.push(s.charCodeAt(i) & 255); }
    return Uint8Array.from(a);
  }
  return Uint8Array.from(s, c => c.charCodeAt(0) & 255);
}
function dec(s, enc, cs) { const b = bytesOf(s, enc); try { return new TextDecoder(cs || "utf-8").decode(b); } catch (e) { return new TextDecoder().decode(b); } }
function hdrs(block) { const h = {}; block.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/).forEach(l => { const i = l.indexOf(":"); if (i > 0) { const k = l.slice(0, i).toLowerCase(); if (!(k in h)) h[k] = l.slice(i + 1).trim(); } }); return h; }
function word(s) {
  s = String(s || "").replace(/(\?=)\s+(=\?)/g, "$1$2");
  const r = s.replace(/=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g, (m, cs, e, t) => { try { return dec(e.toLowerCase() === "b" ? t : t.replace(/_/g, " "), e.toLowerCase() === "b" ? "base64" : "quoted-printable", cs); } catch (x) { return t; } });
  return /[À-ÿ]{2}/.test(r) && !/[^\x00-\xff]/.test(r) ? (() => { try { return new TextDecoder().decode(Uint8Array.from(r, c => c.charCodeAt(0))); } catch (e) { return r; } })() : r;
}
function parts(raw, out) {
  const i = raw.search(/\r?\n\r?\n/), head = i < 0 ? raw : raw.slice(0, i), body = i < 0 ? "" : raw.slice(i).replace(/^\r?\n\r?\n/, "");
  const h = hdrs(head), ct = h["content-type"] || "text/plain", cs = (/charset="?([\w-]+)/i.exec(ct) || [])[1], te = (h["content-transfer-encoding"] || "").toLowerCase();
  const bm = /boundary="?([^";]+)"?/i.exec(ct);
  if (/^multipart\//i.test(ct) && bm) { body.split("--" + bm[1]).slice(1).forEach(p => { if (/^--/.test(p)) return; parts(p.replace(/^\r?\n/, ""), out); }); return; }
  const disp = h["content-disposition"] || "", fn = word((/filename\*?="?([^";]+)/i.exec(disp) || /name="?([^";]+)/i.exec(ct) || [])[1] || ""), cid = ((h["content-id"] || "").match(/<([^>]+)>/) || [])[1] || "";
  const isText = /^text\/(plain|html)/i.test(ct);
  if (/attachment/i.test(disp) || (!isText && !/^multipart\//i.test(ct)) || (fn && !isText)) {
    if (out.atts.length >= 15) return;
    const type = (ct.split(";")[0] || "application/octet-stream").trim();
    const b64 = te === "base64" ? body.replace(/\s+/g, "") : (() => { const b = bytesOf(body, te); let s = ""; for (let k = 0; k < b.length; k += 8192) s += String.fromCharCode.apply(null, b.subarray(k, k + 8192)); return btoa(s); })();
    out.atts.push({ filename: fn || (cid ? "image" : "file"), type, b64, cid }); return;
  }
  const t = dec(body, te, cs);
  if (/^text\/plain/i.test(ct) && !out.text) out.text = t; else if (/^text\/html/i.test(ct) && !out.html) out.html = t;
}
function parse(raw) {
  const i = raw.search(/\r?\n\r?\n/), h = hdrs(i < 0 ? raw : raw.slice(0, i)), o = { text: "", html: "", atts: [] }; parts(raw, o);
  const text = o.text || o.html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, "").replace(/<br\s*\/?>|<\/p>|<\/div>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n");
  const from = word(h.from || ""), fa = (/<([^>]+)>/.exec(from) || [, from])[1].trim(), fnm = from.replace(/<[^>]*>/, "").replace(/["']/g, "").trim();
  return { subject: word(h.subject) || "(no subject)", from, fromAddr: OKMAIL.test(fa) ? fa : "", fromName: fnm || fa, to: word(h.to || ""), date: h.date || "", text: text.trim(), html: o.html, atts: o.atts };
}

/* ---------- sending through Resend ---------- */
async function resend(env, body) {
  if (!env.RESEND) return false;
  try { const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND, "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.ok; } catch (e) { return false; }
}
async function forward(env, p, dest, rcpt) {
  const name = String(p.fromName || p.fromAddr || "Someone").replace(/[<>"\r\n]/g, "").slice(0, 60);
  const tos = String(dest).split(",").map(x => x.trim()).filter(Boolean);
  const b = { from: name + (/@haritt\.com$/i.test(p.fromAddr || "") ? "" : " via Haritt") + " <" + FWD + ">", to: tos, subject: p.subject, headers: { "X-Haritt-To": rcpt } };
  if (p.fromAddr) b.reply_to = p.fromAddr;
  if (p.html) { b.html = p.html; if (p.text) b.text = p.text; } else b.text = p.text || "(no text)";
  if (p.atts && p.atts.length) b.attachments = p.atts.map(a => { const x = { filename: a.filename, content: a.b64, content_type: a.type }; if (a.cid) x.content_id = a.cid; return x; });
  return resend(env, b);
}
const LOGO = "https://haritt.com/mail/haritt-3d-120.png";
const nm = a => String(a||"").split("@")[0].split(/[._-]/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(" ")||"there"; const nm0 = a => { const f = String(a || "").split("@")[0].split(/[._-]/)[0]; return f ? f[0].toUpperCase() + f.slice(1) : "there"; };
function steps(list) { return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 0">' + list.map((t, i) => '<tr><td width="34" valign="top" style="padding:5px 0"><div class="nb" style="width:24px;height:24px;line-height:24px;border-radius:12px;background:#FBEDEF;color:#A70D22;font-weight:700;font-size:13px;text-align:center">' + (i + 1) + '</div></td><td class="tx" style="padding:5px 0 5px 4px;font-size:15px;line-height:1.5;color:#1B1A1C">' + t + '</td></tr>').join("") + '</table>'; }
function idbox(a) { return '<div class="bx" style="margin:14px 0 18px;padding:14px 16px;border-radius:12px;background:#FBEDEF;border:1px solid #F1D5D9"><div class="lb" style="font-size:11px;letter-spacing:.08em;font-weight:700;color:#A70D22">YOUR BUSINESS EMAIL</div><div class="ad" style="font-size:19px;font-weight:700;margin-top:4px;color:#1B1A1C;word-break:break-all">' + esc(a) + '</div></div>'; }
function card(title, inner, btn, pre, label) {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><style>@media (prefers-color-scheme:dark){.bg{background:#0E0F12!important}.cd{background:#17161A!important;border-color:#2B2830!important}.tx,.hd,.ad{color:#F1EEF3!important}.mt{color:#B6B0BD!important}.bx{background:#2A1B1E!important;border-color:#4A2E33!important}.nb,.ac{background:#2A1B1E!important;color:#E88A93!important}.lb{color:#E88A93!important}.ft{background:#141210!important;border-color:#2A2623!important}.cta{background:#E88A93!important;color:#1B1A1C!important}}</style></head><body class="bg" style="margin:0;background:#F6F4F7;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif">' + (pre ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + esc(pre) + '</div>' : "") + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background:#F6F4F7"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px"><tr><td class="cd" style="background:#fff;border:1px solid #ECE8EE;border-radius:16px;overflow:hidden;padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#16110F;background-image:linear-gradient(125deg,#16110F 0%,#2B0B0B 55%,#7A0C0C 100%);padding:16px 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="' + LOGO + '" width="30" height="30" alt="" style="display:block;border-radius:50%"></td><td style="padding-left:10px;vertical-align:middle;color:#fff;font-size:12px;font-weight:700;letter-spacing:.22em">HARITT GROUP</td></tr></table></td><td align="right" style="vertical-align:middle"><span style="display:inline-block;border:1px solid rgba(255,255,255,.28);border-radius:99px;padding:4px 11px;color:#F3D9D9;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">' + esc(label || "Business email") + '</span></td></tr></table></td></tr></table><div style="padding:26px 26px 28px"><div class="hd" style="font-size:21px;line-height:1.3;font-weight:700;color:#1B1A1C;margin:0 0 10px">' + title + '</div><div class="mt" style="font-size:15px;line-height:1.6;color:#4A4650">' + inner + '</div>' + (btn ? '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px"><tr><td class="cta" style="background:#A70D22;border-radius:10px"><a class="cta" href="' + esc(btn[1]) + '" style="display:inline-block;padding:13px 24px;color:#fff;text-decoration:none;font-weight:600;font-size:15px;border-radius:10px">' + esc(btn[0]) + '</a></td></tr></table>' : "") + '</div><div class="ft" style="background:#FAF7F3;border-top:1px solid #EEE7DF;padding:18px 26px;text-align:center;font-size:12.5px;line-height:1.7;color:#8A8492"><b class="tx" style="color:#3D3730">Haritt Group</b> &middot; <a href="https://haritt.com" style="color:#8A8492;text-decoration:underline">haritt.com</a><br>Behind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001<br>Jaipur &middot; Bharatpur<br><span style="font-size:11.5px">This is a private message from Haritt Group. Please do not forward it.</span></div></td></tr></table></td></tr></table></body></html>';
}
async function sha(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join(""); }
const mask = e => e.replace(/^(.).*(@.*)$/, "$1•••$2");
async function flush(env, addr, dest) {
  const l = await env.INBOX.list({ prefix: "q:" + addr + ":", limit: 100 }); let n = 0;
  for (const k of l.keys) { const v = await env.INBOX.get(k.name); if (!v) continue; let p; try { p = await unseal(env, v); } catch (e) { p = null; } if (!p) { continue; } if (await forward(env, p, dest, addr)) { await env.INBOX.delete(k.name); n++; } }
  return n;
}
/* fast admin check: the worker verifies the Firebase sign-in token itself (Google public keys). Apps Script is asked only once an hour per person. */
let JWKS = null, JWKT = 0;
async function jwks() { if (JWKS && JWKT > Date.now()) return JWKS; const r = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"), j = await r.json(); JWKS = j.keys || []; JWKT = Date.now() + 3600000; return JWKS; }
const b64u = x => Uint8Array.from(atob(x.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(x.length / 4) * 4, "=")), c => c.charCodeAt(0));
async function verifyToken(t) {
  try {
    const [h, p, sg] = String(t).split("."); if (!h || !p || !sg) return null;
    const hd = JSON.parse(new TextDecoder().decode(b64u(h))), pl = JSON.parse(new TextDecoder().decode(b64u(p)));
    if (hd.alg !== "RS256") return null;
    const k = (await jwks()).find(x => x.kid === hd.kid); if (!k) return null;
    const key = await crypto.subtle.importKey("jwk", k, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    if (!(await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(sg), new TextEncoder().encode(h + "." + p)))) return null;
    const now = Date.now() / 1000;
    if (pl.aud !== "harsh-reset" || pl.iss !== "https://securetoken.google.com/harsh-reset" || !(pl.exp > now) || pl.iat > now + 60 || !pl.sub || !pl.email || pl.email_verified !== true) return null;
    return String(pl.email).toLowerCase();
  } catch (e) { return null; }
}
async function adminTok(env, idToken) {
  const em = await verifyToken(idToken); if (!em) return false;
  const kk = "adm:" + (await sha(em)), c = await env.INBOX.get(kk);
  if (c) { try { const o = JSON.parse(c); return o.ok ? { ok: true, owner: !!o.owner } : false; } catch (e) {} }
  let res = false;
  try {
    const call = async body => JSON.parse(await (await fetch(SCRIPT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), redirect: "follow" })).text());
    const l = await call({ action: "admin_login", idToken });
    if (l && l.ok && l.sess) { const k2 = await call({ action: "admin_check", sess: l.sess }); res = k2 && k2.ok ? { ok: true, owner: !!k2.owner } : false; }
  } catch (e) { return false; }
  await env.INBOX.put(kk, JSON.stringify(res || { ok: false }), { expirationTtl: res ? 3600 : 120 });
  return res;
}
const ADM = new Map();   /* remember a checked session for 10 minutes, so one page load is not 5 slow trips to Apps Script */
async function admin(sess) {
  if (!sess) return false;
  const hit = ADM.get(sess); if (hit && hit.t > Date.now()) return hit.v;
  const v = await admin0(sess); if (v) { if (ADM.size > 200) ADM.clear(); ADM.set(sess, { v, t: Date.now() + 600000 }); } return v;
}
async function admin0(sess) {
  try { const r = await fetch(SCRIPT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "admin_check", sess }), redirect: "follow" }); const j = JSON.parse(await r.text()); return (j && j.ok) ? { ok: true, owner: !!j.owner } : false; } catch (e) { return false; }
}
/* ---------- sealed storage: AES-GCM, key only lives in a Cloudflare secret, nobody can browse content ---------- */
async function ck(env) { if (!env.BACKUP_KEY) return null; const raw = Uint8Array.from(atob(env.BACKUP_KEY), c => c.charCodeAt(0)); return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]); }
async function seal(env, o) { const k = await ck(env), t = JSON.stringify(o); if (!k) return t; const iv = crypto.getRandomValues(new Uint8Array(12)), c = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(t))), u = new Uint8Array(12 + c.length); u.set(iv); u.set(c, 12); let b = ""; for (let i = 0; i < u.length; i += 8192) b += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return "e1:" + btoa(b); }
async function unseal(env, v) { if (!v) return null; if (v.slice(0, 3) !== "e1:") return JSON.parse(v); const k = await ck(env); if (!k) return null; const u = Uint8Array.from(atob(v.slice(3)), c => c.charCodeAt(0)); return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: u.subarray(0, 12) }, k, u.subarray(12)))); }
async function audit(env, what, addr) { try { await env.INBOX.put("a:" + String(Date.now()).padStart(14, "0") + "-" + crypto.randomUUID().slice(0, 4), JSON.stringify({ at: new Date().toISOString(), what, addr }), { expirationTtl: 90 * 86400 }); } catch (e) {} }
async function keep(env, addr, p, status, size) {
  const id = String(Date.now()).padStart(14, "0") + "-" + crypto.randomUUID().slice(0, 6), q = p.atts && p.atts.length && size > QBIG ? Object.assign({}, p, { atts: [] }) : p;
  await env.INBOX.put("b:" + addr + ":" + id, await seal(env, q), { expirationTtl: QTTL, metadata: { at: new Date().toISOString(), st: status, d: String(p.fromAddr || "").split("@")[1] || "" } });
  return id;
}
async function getSeq(env, a) { try { return (await unseal(env, await env.INBOX.get("seq:" + a))) || {}; } catch (e) { return {}; } }
async function putSeq(env, a, q) { await env.INBOX.put("seq:" + a, await seal(env, q), { expirationTtl: 90 * 86400 }); }
/* set-up mail sequence: Welcome, then up to 2 automatic reminders (after 2 days, then 3 more). Every send is counted per address. */
async function sendInvite(env, a, to) {
  const q = await getSeq(env, a), first = !(q.sent || []).length, n = nm(a);
  const t = crypto.randomUUID().replace(/-/g, ""), link = SETUP + "?t=" + t;
  await env.INBOX.put("tok:" + t, JSON.stringify({ addr: a, exp: Date.now() + 7 * 86400000, sends: 0 }), { expirationTtl: 7 * 86400 });
  const note = '<p class="mt" style="margin:14px 0 0;font-size:13.5px;color:#6B6670">Any Gmail you use daily works, it need not be the one you gave Haritt. Takes about 20 seconds. The link works for 7 days. Only you can see your Gmail.</p>';
  const ok = await resend(env, first
    ? { from: "Haritt Group <" + FWD + ">", to: [to], subject: "Your business email address is ready", html: card("Hi " + esc(n) + ",", "Your business email address is ready." + idbox(a) + "Set it up once, so its mail arrives in your own Gmail:" + steps(["Enter your personal Gmail address", "Type the 6 digit code we send there", "Done. Mail sent to <b>" + esc(a) + "</b> arrives in your Gmail"]) + note, ["Set up with your Gmail", link], "One quick step to get your Haritt mail in your own Gmail."), text: "Hi " + n + ",\n\nYour business email address is ready: " + a + "\n\nSet it up once so its mail arrives in your own Gmail:\n1. Enter the same Gmail you shared with Haritt (the one you joined with)\n2. Type the 6 digit code we send there\n3. Done. Mail sent to " + a + " arrives in your Gmail\n\nSet up with your Gmail (about 20 seconds, link works 7 days): " + link + "\n\nHaritt Group" }
    : { from: "Haritt Group <" + FWD + ">", to: [to], subject: "Finish setting up " + a, html: card("Hi " + esc(n) + ",", "Mail sent to your business email address is being held safely for you." + idbox(a) + "Choose your Gmail and it arrives there. Same 20 second steps:" + steps(["Enter your personal Gmail address", "Type the 6 digit code we send there"]) + note, ["Set up with your Gmail", link], "Your Haritt mail is waiting for you."), text: "Hi " + n + ",\n\nMail sent to " + a + " is being held safely for you. Choose your Gmail and it arrives there (about 20 seconds, link works 7 days): " + link + "\n\nHaritt Group" });
  if (ok) { q.to = to; q.done = ""; q.sent = (q.sent || []).concat([{ t: new Date().toISOString(), k: first ? "welcome" : "reminder" }]); await putSeq(env, a, q); }
  return { ok, link, first };
}
async function seqDone(env, a) { const q = await getSeq(env, a); if ((q.sent || []).length) { q.done = new Date().toISOString(); await putSeq(env, a, q); } }
const okAddr = a => /^[a-z0-9][a-z0-9._-]{0,60}@haritt\.com$/.test(a);

export default {
  async email(message, env) {
    const to = String(message.to || "").toLowerCase(), size = message.rawSize || 0;
    if (String(message.from || "").toLowerCase() === FWD) return;
    if (to === "inbox@haritt.com") {   /* old pilot inbox, read in admin */
      let raw = size > MAX * 3 ? "" : bin(await new Response(message.raw).arrayBuffer());
      const p = raw ? parse(raw.slice(0, MAX * 3)) : { subject: "(too large to keep)", from: message.from, to: message.to, date: "", text: "", atts: [] };
      const id = String(Date.now()).padStart(14, "0") + "-" + crypto.randomUUID().slice(0, 6);
      const m = { subject: p.subject, from: p.from, to: p.to, date: p.date, text: p.text.slice(0, 60000), att: p.atts.map(a => a.filename).slice(0, 20), rcpt: message.to, env: message.from, read: false, at: new Date().toISOString() };
      await env.INBOX.put("m:" + id, JSON.stringify(m), { expirationTtl: TTL, metadata: { s: m.subject.slice(0, 140), f: m.from.slice(0, 120), to: String(message.to).slice(0, 80), at: m.at, r: 0, n: m.att.length, p: m.text.replace(/\s+/g, " ").slice(0, 110) } });
      return;
    }
    if (await env.INBOX.get("off:" + to)) { message.setReject("Mailbox unavailable"); return; }
    const dest = await env.INBOX.get("dest:" + to);
    let p;
    if (size > BIG) p = { subject: "Large mail from " + message.from, fromAddr: "", fromName: String(message.from), text: "A mail to " + to + " was too large to pass on (over 12 MB). Ask the sender to send it again with smaller files.", html: "", atts: [] };
    else p = parse(bin(await new Response(message.raw).arrayBuffer()));
    if (!p.fromAddr && /^[^@\s]+@[^@\s]+$/.test(String(message.from))) p.fromAddr = String(message.from);
    if (dest) {
      const bid = await keep(env, to, p, "sent", size);
      try { await flush(env, to, dest); } catch (e) {}   /* deliver anything that waited before the inbox was set */   /* sealed 30-day safety copy, deleted automatically */
      if (await forward(env, p, dest, to)) return;
      try { await message.forward(String(dest).split(",")[0].trim()); return; } catch (e) {}   /* only works while Cloudflare already trusts this address */
      await env.INBOX.put("b:" + to + ":" + bid, await seal(env, p), { expirationTtl: QTTL, metadata: { at: new Date().toISOString(), st: "failed", d: String(p.fromAddr || "").split("@")[1] || "" } });
      const own = await env.INBOX.get("dest:harsh.goyal@haritt.com");   /* tell the Owner, without any mail content */
      if (own) await resend(env, { from: "Haritt Alerts <" + FWD + ">", to: own.split(",").map(x => x.trim()), subject: "Haritt: a mail could not be delivered", text: "A mail to " + to + " could not be passed on to its Gmail. A safe copy is kept for 30 days. Open Admin, Mail, Inbox, Safety copy to send it again.\nhttps://haritt.com/admin/mailcenter/" });
    }
    if (size > QBIG) p.atts = [];
    const id = String(Date.now()).padStart(14, "0") + "-" + crypto.randomUUID().slice(0, 6);
    await env.INBOX.put("q:" + to + ":" + id, await seal(env, p), { expirationTtl: QTTL });
  },
  async scheduled(ev, env) {   /* every 5 min: deliver anything waiting for an address that now has a Gmail */
    const l = await env.INBOX.list({ prefix: "q:", limit: 500 }), seen = {};
    for (const k of l.keys) { const a = k.name.split(":")[1]; if (seen[a]) continue; seen[a] = 1; const d = await env.INBOX.get("dest:" + a); if (d) await flush(env, a, d); }
    const sl = await env.INBOX.list({ prefix: "seq:", limit: 200 });
    for (const k of sl.keys) {
      const a = k.name.slice(4); if (await env.INBOX.get("dest:" + a) || await env.INBOX.get("off:" + a)) continue;
      const q = await getSeq(env, a), n = (q.sent || []).length; if (!q.to || q.done || n < 1 || n >= 3) continue;
      const wait = (n === 1 ? 2 : 3) * 86400000; if (Date.now() - new Date(q.sent[n - 1].t).getTime() > wait) await sendInvite(env, a, q.to);
    }
  },
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method === "GET") {
      const sp = new URL(req.url).searchParams.get("stop");
      if (sp && /^[0-9a-f]{32}$/.test(sp)) {
        const v = await env.INBOX.get("stp:" + sp); let msg = "This link is no longer valid.";
        if (v) { const o = JSON.parse(v); await env.INBOX.delete("dest:" + o.addr); await env.INBOX.delete("stp:" + sp); await audit(env, "stopped_by_owner_of_gmail", o.addr); msg = "Done. Mail for " + o.addr + " is no longer sent to this Gmail."; }
        return new Response("<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'><body style='font-family:system-ui;margin:0;display:grid;place-items:center;min-height:100vh;background:#F6F4F7;color:#1B1A1C'><div style='max-width:420px;padding:28px;text-align:center'><h2>Haritt Group</h2><p>" + esc(msg) + "</p></div>", { headers: { "content-type": "text/html;charset=utf-8" } });
      }
    }
    if (req.method !== "POST") return json({ ok: true, service: "Haritt mail" });
    let b = {}; try { b = JSON.parse(await req.text()); } catch (e) { return json({ ok: false, error: "bad" }); }
    /* ---- public: person sets their own inbox (link + code) ---- */
    if (b.action === "inv_get" || b.action === "otp_send" || b.action === "otp_check") {
      const t = String(b.t || ""); if (!/^[0-9a-f]{32}$/.test(t)) return json({ ok: false, error: "link" });
      const tv = await env.INBOX.get("tok:" + t); if (!tv) return json({ ok: false, error: "link" });
      const tk = JSON.parse(tv);
      if (b.action === "inv_get") return json({ ok: true, addr: tk.addr });
      if (b.action === "otp_send") {
        const g = String(b.gmail || "").trim().toLowerCase();
        if (!OKMAIL.test(g) || /@(haritt\.com|thehvverse\.com)$/.test(g)) return json({ ok: false, error: "gmail" });
        if ((tk.sends || 0) >= 5) return json({ ok: false, error: "many" });
        tk.sends = (tk.sends || 0) + 1; await env.INBOX.put("tok:" + t, JSON.stringify(tk), { expirationTtl: Math.max(60, Math.floor((tk.exp - Date.now()) / 1000)) });
        const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
        await env.INBOX.put("otp:" + t, JSON.stringify({ h: await sha(code + t), g, tries: 0 }), { expirationTtl: 600 });
        const ok = await resend(env, { from: "Haritt Group <" + FWD + ">", to: [g], subject: "Your Haritt code: " + code, html: card("Your code is " + code, "Enter this code on the setup page to finish setting up <b>" + esc(tk.addr) + "</b>. It works for 10 minutes.<div class=\"bx lb\" style=\"margin:16px 0 4px;padding:16px;border-radius:12px;background:#FBEDEF;text-align:center;font-size:30px;letter-spacing:.3em;font-weight:700;color:#A70D22\">" + code + "</div><p class=\"mt\" style=\"margin:12px 0 0;font-size:13.5px;color:#6B6670\">If you did not ask for this, you can ignore this mail.</p>", null, "Your 6 digit code for Haritt."), text: "Your Haritt code is " + code + ". It works for 10 minutes. Enter it on the setup page for " + tk.addr + ". If you did not ask for this, ignore this mail." });
        return json(ok ? { ok: true, to: mask(g) } : { ok: false, error: "send" });
      }
      const ov = await env.INBOX.get("otp:" + t); if (!ov) return json({ ok: false, error: "expired" });
      const o = JSON.parse(ov); if (o.tries >= 5) return json({ ok: false, error: "many" });
      if ((await sha(String(b.code || "").replace(/\D/g, "") + t)) !== o.h) { o.tries++; await env.INBOX.put("otp:" + t, JSON.stringify(o), { expirationTtl: 600 }); return json({ ok: false, error: "code" }); }
      await env.INBOX.put("dest:" + tk.addr, o.g); await env.INBOX.delete("tok:" + t); await env.INBOX.delete("otp:" + t);
      const n = await flush(env, tk.addr, o.g); await seqDone(env, tk.addr);
      await resend(env, { from: "Haritt Group <" + FWD + ">", to: [o.g], subject: "You are all set: " + tk.addr, html: card("You are all set", "Mail sent to <b>" + esc(tk.addr) + "</b> now arrives here, in your Gmail." + (n ? "<br><br>" + n + " mail" + (n > 1 ? "s that were" : " that was") + " waiting " + (n > 1 ? "have" : "has") + " been delivered." : "") + "<br><br>To reply as " + esc(tk.addr) + " from Gmail, ask the team for the Send as link.", null, "Your Haritt mail now arrives in this Gmail."), text: "You are all set. Mail sent to " + tk.addr + " now arrives in this Gmail." + (n ? " " + n + " waiting mail(s) delivered." : "") });
      return json({ ok: true, addr: tk.addr, gmail: mask(o.g), waiting: n });
    }
    /* ---- admin ---- */
    const adm = b.idToken ? await adminTok(env, b.idToken) : await admin(b.sess); if (!adm) return json({ ok: false, error: "login" }, 401);
    if (b.action === "team") {
      const out = {}; await Promise.all((Array.isArray(b.addrs) ? b.addrs : []).slice(0, 200).map(async a => { const x = String(a).toLowerCase(); if (!okAddr(x)) return; const [l, q, dv] = await Promise.all([env.INBOX.list({ prefix: "q:" + x + ":", limit: 100 }), getSeq(env, x), env.INBOX.get("dest:" + x)]); out[x] = { set: !!dv, gm: dv ? String(dv).split(",").map(z => adm.owner ? z.trim() : mask(z.trim())).join(", ") : "", waiting: l.keys.length, sent: (q.sent || []).map(m => ({ t: m.t, k: m.k })), known: !!q.to, done: q.done || "" }; }));
      return json({ ok: true, team: out });
    }
    if (b.action === "invite") {
      const a = String(b.addr || "").toLowerCase(); if (!okAddr(a)) return json({ ok: false, error: "addr" });
      let to = String(b.to || "").trim().toLowerCase(); if (!to) to = (await getSeq(env, a)).to || "";
      if (to) {
        if (!OKMAIL.test(to) || /@(haritt\.com|thehvverse\.com)$/.test(to)) return json({ ok: false, error: "gmail" });
        const r = await sendInvite(env, a, to); await audit(env, "invite_mail", a);
        return json(r.ok ? { ok: true, link: r.link, sent: true } : { ok: false, error: "send" });
      }
      const t = crypto.randomUUID().replace(/-/g, "");
      await env.INBOX.put("tok:" + t, JSON.stringify({ addr: a, exp: Date.now() + 7 * 86400000, sends: 0 }), { expirationTtl: 7 * 86400 });
      return json({ ok: true, link: SETUP + "?t=" + t });
    }
    if (b.action === "remove") {   /* person leaves: mail stops, their Send as keys are deleted */
      const a = String(b.addr || "").toLowerCase(); if (!okAddr(a) || a === "harsh.goyal@haritt.com") return json({ ok: false, error: "addr" });
      await env.INBOX.delete("dest:" + a); await env.INBOX.put("off:" + a, "1"); await audit(env, "removed", a);
      let keys = 0;
      try { const r = await fetch("https://api.resend.com/api-keys", { headers: { Authorization: "Bearer " + env.RESEND } }), j = await r.json(); for (const k of (j.data || [])) if (String(k.name || "").toLowerCase().indexOf("send-as " + a) === 0) { const d = await fetch("https://api.resend.com/api-keys/" + k.id, { method: "DELETE", headers: { Authorization: "Bearer " + env.RESEND } }); if (d.ok) keys++; } } catch (e) {}
      return json({ ok: true, keys });
    }
    if (b.action === "backup_list") {
      const a = String(b.addr || "").toLowerCase(); if (!okAddr(a)) return json({ ok: false, error: "addr" });
      const l = await env.INBOX.list({ prefix: "b:" + a + ":", limit: 200 });
      return json({ ok: true, items: l.keys.map(k => ({ id: k.name.slice(("b:" + a + ":").length), at: (k.metadata || {}).at, st: (k.metadata || {}).st, d: (k.metadata || {}).d })).reverse() });
    }
    if (b.action === "backup_resend") {   /* only ever to that person's own saved Gmail, never to a typed address */
      const a = String(b.addr || "").toLowerCase(), id = String(b.id || ""); if (!okAddr(a) || !/^[0-9]{14}-[0-9a-f]{6}$/.test(id)) return json({ ok: false, error: "id" });
      const dest = await env.INBOX.get("dest:" + a); if (!dest) return json({ ok: false, error: "noinbox" });
      let p; try { p = await unseal(env, await env.INBOX.get("b:" + a + ":" + id)); } catch (e) { p = null; }
      if (!p) return json({ ok: false, error: "gone" });
      const ok = await forward(env, p, dest, a); await audit(env, ok ? "resend" : "resend_failed", a);
      return json({ ok });
    }
    if (b.action === "audit") { const l = await env.INBOX.list({ prefix: "a:", limit: 100 }); const o = []; for (const k of l.keys.slice(-50)) { const v = await env.INBOX.get(k.name); if (v) o.push(JSON.parse(v)); } return json({ ok: true, items: o.reverse() }); }
    if (b.action === "set") {   /* owner sets someone's Gmail directly, no code */
      if (!adm.owner) return json({ ok: false, error: "owner" });
      const a = String(b.addr || "").toLowerCase(), gl = String(b.gmail || "").toLowerCase().split(/[,\s;]+/).filter(Boolean).slice(0, 8), g = gl.join(",");
      if (!okAddr(a) || !gl.length) return json({ ok: false, error: "addr" });
      if (gl.some(x => !OKMAIL.test(x) || /@(haritt\.com|thehvverse\.com)$/.test(x))) return json({ ok: false, error: "gmail" });
      await env.INBOX.delete("off:" + a); await env.INBOX.put("dest:" + a, g); await audit(env, "inbox_set", a);
      const n = await flush(env, a, g);
      const st = crypto.randomUUID().replace(/-/g, ""); await env.INBOX.put("stp:" + st, JSON.stringify({ addr: a, g }), { expirationTtl: 30 * 86400 });
      for (const x of gl) await resend(env, { from: "Haritt Group <" + FWD + ">", to: [x], subject: "Your business email address is ready", html: card("Hi " + esc(nm(a)) + ",", "Your business email address is ready." + idbox(a) + "Mail sent to it now arrives in this Gmail." + '<p class="mt" style="margin:14px 0 0;font-size:12.5px;color:#8A8492">Not expected? <a href="https://haritt-inbox.harittgroup.workers.dev/?stop=' + st + '" style="color:#8A8492;text-decoration:underline">Stop this</a></p>', null, "Your business email address is ready.", "Business email") });
      return json({ ok: true, waiting: n });
    }
    if (b.action === "unset") { const a = String(b.addr || "").toLowerCase(); if (!okAddr(a)) return json({ ok: false, error: "addr" }); await env.INBOX.delete("dest:" + a); await audit(env, "inbox_cleared", a); return json({ ok: true }); }
    if (b.action === "list") {
      const l = await env.INBOX.list({ prefix: "m:", limit: 200 });
      return json({ ok: true, items: l.keys.map(k => Object.assign({ id: k.name.slice(2) }, k.metadata || {})).reverse() });
    }
    const id = String(b.id || ""); if (!/^[0-9]{14}-[0-9a-f]{6}$/.test(id)) return json({ ok: false, error: "id" });
    if (b.action === "get") {
      const v = await env.INBOX.get("m:" + id); if (!v) return json({ ok: false, error: "gone" });
      const m = JSON.parse(v); if (!m.read) { m.read = true; await env.INBOX.put("m:" + id, JSON.stringify(m), { expirationTtl: TTL, metadata: { s: m.subject.slice(0, 140), f: m.from.slice(0, 120), to: String(m.rcpt).slice(0, 80), at: m.at, r: 1, n: (m.att || []).length, p: m.text.replace(/\s+/g, " ").slice(0, 110) } }); }
      return json({ ok: true, m });
    }
    if (b.action === "del") { await env.INBOX.delete("m:" + id); return json({ ok: true }); }
    return json({ ok: false, error: "action" });
  }
};
