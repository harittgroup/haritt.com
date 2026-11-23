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
const LOGO = "https://haritt.com/admin/haritt-icon.png";
function card(title, inner, btn) {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"></head><body style="margin:0;background:#F6F4F7;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;color:#1B1A1C"><div style="max-width:480px;margin:0 auto;padding:28px 16px"><div style="background:#fff;border:1px solid #ECE8EE;border-radius:18px;padding:28px 24px;color:#1B1A1C"><img src="' + LOGO + '" width="34" height="34" alt="" style="border-radius:8px;display:block;margin:0 0 16px"><h1 style="font-size:22px;line-height:1.25;margin:0 0 10px;color:#1B1A1C">' + title + '</h1><div style="font-size:15px;line-height:1.6;color:#4A4650">' + inner + '</div>' + (btn ? '<p style="margin:22px 0 4px"><a href="' + esc(btn[1]) + '" style="background:#A70D22;color:#fff;text-decoration:none;font-weight:600;border-radius:12px;padding:12px 22px;display:inline-block">' + esc(btn[0]) + '</a></p>' : "") + '</div><p style="text-align:center;color:#8A8492;font-size:12.5px;margin:14px 0 0">Haritt Group</p></div></body></html>';
}
async function sha(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join(""); }
const mask = e => e.replace(/^(.).*(@.*)$/, "$1•••$2");
async function flush(env, addr, dest) {
  const l = await env.INBOX.list({ prefix: "q:" + addr + ":", limit: 100 }); let n = 0;
  for (const k of l.keys) { const v = await env.INBOX.get(k.name); if (!v) continue; let p; try { p = await unseal(env, v); } catch (e) { p = null; } if (!p) { continue; } if (await forward(env, p, dest, addr)) { await env.INBOX.delete(k.name); n++; } }
  return n;
}
async function admin(sess) {
  if (!sess) return false;
  try { const r = await fetch(SCRIPT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "admin_check", sess }), redirect: "follow" }); const j = JSON.parse(await r.text()); return !!(j && j.ok); } catch (e) { return false; }
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
  },
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
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
        const ok = await resend(env, { from: "Haritt Group <" + FWD + ">", to: [g], subject: "Your Haritt code: " + code, html: card("Your code is " + code, "Enter this code on the setup page to receive mail for <b>" + esc(tk.addr) + "</b> here. It works for 10 minutes. If you did not ask for it, ignore this mail."), text: "Your Haritt code is " + code + ". It works for 10 minutes. Enter it on the setup page to receive mail for " + tk.addr + " here." });
        return json(ok ? { ok: true, to: mask(g) } : { ok: false, error: "send" });
      }
      const ov = await env.INBOX.get("otp:" + t); if (!ov) return json({ ok: false, error: "expired" });
      const o = JSON.parse(ov); if (o.tries >= 5) return json({ ok: false, error: "many" });
      if ((await sha(String(b.code || "").replace(/\D/g, "") + t)) !== o.h) { o.tries++; await env.INBOX.put("otp:" + t, JSON.stringify(o), { expirationTtl: 600 }); return json({ ok: false, error: "code" }); }
      await env.INBOX.put("dest:" + tk.addr, o.g); await env.INBOX.delete("tok:" + t); await env.INBOX.delete("otp:" + t);
      const n = await flush(env, tk.addr, o.g);
      await resend(env, { from: "Haritt Group <" + FWD + ">", to: [o.g], subject: "Your Haritt inbox is ready", html: card("You are all set", "Mail sent to <b>" + esc(tk.addr) + "</b> now arrives here in your Gmail." + (n ? " " + n + " waiting mail" + (n > 1 ? "s were" : " was") + " delivered." : "") + "<br><br>To reply as " + esc(tk.addr) + ", open the Send as setup link you were given, or ask the team."), text: "Mail sent to " + tk.addr + " now arrives in this Gmail." });
      return json({ ok: true, addr: tk.addr, gmail: mask(o.g), waiting: n });
    }
    /* ---- admin ---- */
    if (!(await admin(b.sess))) return json({ ok: false, error: "login" }, 401);
    if (b.action === "team") {
      const out = {}; for (const a of (Array.isArray(b.addrs) ? b.addrs : []).slice(0, 200)) { const x = String(a).toLowerCase(); if (okAddr(x)) { const l = await env.INBOX.list({ prefix: "q:" + x + ":", limit: 100 }); out[x] = { set: !!(await env.INBOX.get("dest:" + x)), waiting: l.keys.length }; } }
      return json({ ok: true, team: out });
    }
    if (b.action === "invite") {
      const a = String(b.addr || "").toLowerCase(); if (!okAddr(a)) return json({ ok: false, error: "addr" });
      const t = crypto.randomUUID().replace(/-/g, ""), exp = Date.now() + 7 * 86400000;
      await env.INBOX.put("tok:" + t, JSON.stringify({ addr: a, exp, sends: 0 }), { expirationTtl: 7 * 86400 });
      const link = SETUP + "?t=" + t, to = String(b.to || "").trim().toLowerCase();
      if (to) {
        if (!OKMAIL.test(to) || /@(haritt\.com|thehvverse\.com)$/.test(to)) return json({ ok: false, error: "gmail" });
        const ok = await resend(env, { from: "Haritt Group <" + FWD + ">", to: [to], subject: "Welcome to Haritt. Set up your inbox", html: card("Welcome to Haritt", "Your Haritt address is <b>" + esc(a) + "</b>.<br><br>Choose where its mail should arrive. It takes about 20 seconds. Pick your own Gmail and confirm it with a code. The link works for 7 days.", ["Set my inbox", link]), text: "Welcome to Haritt. Your address is " + a + ". Choose where its mail should arrive (about 20 seconds): " + link });
        return json(ok ? { ok: true, link, sent: true } : { ok: false, error: "send", link });
      }
      return json({ ok: true, link });
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
      const a = String(b.addr || "").toLowerCase(), gl = String(b.gmail || "").toLowerCase().split(/[,\s;]+/).filter(Boolean).slice(0, 8), g = gl.join(",");
      if (!okAddr(a) || !gl.length) return json({ ok: false, error: "addr" });
      if (gl.some(x => !OKMAIL.test(x) || /@(haritt\.com|thehvverse\.com)$/.test(x))) return json({ ok: false, error: "gmail" });
      await env.INBOX.delete("off:" + a); await env.INBOX.put("dest:" + a, g); await audit(env, "inbox_set", a);
      const n = await flush(env, a, g);
      return json({ ok: true, waiting: n });
    }
    if (b.action === "remove") {   /* person leaves: mail stops, their Send as keys are deleted */
      const a = String(b.addr || "").toLowerCase(); if (!okAddr(a) || a === "harsh.goyal@haritt.com") return json({ ok: false, error: "addr" });
      await env.INBOX.delete("dest:" + a); await env.INBOX.put("off:" + a, "1"); await audit(env, "removed", a);
      let keys = 0;
      try { const r = await fetch("https://api.resend.com/api-keys", { headers: { Authorization: "Bearer " + env.RESEND } }), j = await r.json(); for (const k of (j.data || [])) if (String(k.name || "").toLowerCase().indexOf("send-as " + a) === 0) { const d = await fetch("https://api.resend.com/api-keys/" + k.id, { method: "DELETE", headers: { Authorization: "Bearer " + env.RESEND } }); if (d.ok) keys++; } } catch (e) {}
      return json({ ok: true, keys });
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
