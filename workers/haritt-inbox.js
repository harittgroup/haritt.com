/**
 * Haritt Group – Inbox (Cloudflare Worker, pilot)
 * - email(): receives mail sent to the addresses routed to this worker and keeps it 60 days in KV (INBOX).
 * - fetch(): small API for the admin Inbox tab. Every call needs an admin session from the joining script.
 */
const SCRIPT = "https://script.google.com/macros/s/AKfycbyjVZM40H9UKE_JgpAjn1R288XZTc94V74XshoqFqgKWycPcqXh4423V-1Oc9f5AU-OFw/exec";
const CORS = { "Access-Control-Allow-Origin": "https://haritt.com", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json", ...CORS } });
const MAX = 400000, TTL = 60 * 86400;

function dec(s, enc, cs) {
  enc = (enc || "").toLowerCase(); let bytes;
  if (enc === "base64") { try { const b = atob(s.replace(/\s+/g, "")); bytes = Uint8Array.from(b, c => c.charCodeAt(0)); } catch (e) { return s; } }
  else if (enc === "quoted-printable") {
    s = s.replace(/=\r?\n/g, ""); const a = []; for (let i = 0; i < s.length; i++) { if (s[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(s.substr(i + 1, 2))) { a.push(parseInt(s.substr(i + 1, 2), 16)); i += 2; } else a.push(s.charCodeAt(i) & 255); } bytes = Uint8Array.from(a);
  } else return s;
  try { return new TextDecoder(cs || "utf-8").decode(bytes); } catch (e) { return new TextDecoder().decode(bytes); }
}
function hdrs(block) {
  const h = {}; block.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/).forEach(l => { const i = l.indexOf(":"); if (i > 0) h[l.slice(0, i).toLowerCase()] = l.slice(i + 1).trim(); }); return h;
}
function word(s) { return String(s || "").replace(/=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g, (m, cs, e, t) => { try { return dec(e.toLowerCase() === "b" ? t : t.replace(/_/g, " "), e.toLowerCase() === "b" ? "base64" : "quoted-printable", cs); } catch (x) { return t; } }); }
function parts(raw, out) {
  const i = raw.search(/\r?\n\r?\n/); const head = i < 0 ? raw : raw.slice(0, i), body = i < 0 ? "" : raw.slice(i).replace(/^\r?\n\r?\n/, "");
  const h = hdrs(head), ct = h["content-type"] || "text/plain", cs = (/charset="?([\w-]+)/i.exec(ct) || [])[1];
  const bm = /boundary="?([^";]+)"?/i.exec(ct);
  if (/^multipart\//i.test(ct) && bm) { body.split("--" + bm[1]).slice(1).forEach(p => { if (/^--/.test(p)) return; parts(p.replace(/^\r?\n/, ""), out); }); return; }
  if (/attachment/i.test(h["content-disposition"] || "")) { out.att.push(((/filename="?([^";]+)/i.exec(h["content-disposition"]) || [])[1]) || "file"); return; }
  const t = dec(body, h["content-transfer-encoding"], cs);
  if (/^text\/plain/i.test(ct) && !out.text) out.text = t; else if (/^text\/html/i.test(ct) && !out.html) out.html = t;
}
function parse(raw) {
  const i = raw.search(/\r?\n\r?\n/), h = hdrs(i < 0 ? raw : raw.slice(0, i)), o = { text: "", html: "", att: [] }; parts(raw, o);
  let text = o.text || o.html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, "").replace(/<br\s*\/?>|<\/p>|<\/div>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n");
  return { subject: word(h.subject) || "(no subject)", from: word(h.from || ""), to: word(h.to || ""), date: h.date || "", text: text.trim().slice(0, 60000), att: o.att.slice(0, 20) };
}
async function admin(sess) {
  if (!sess) return false;
  try { const r = await fetch(SCRIPT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "admin_check", sess }), redirect: "follow" }); const j = JSON.parse(await r.text()); return !!(j && j.ok); } catch (e) { return false; }
}
export default {
  async email(message, env) {
    const size = message.rawSize || 0;
    let raw = size > MAX * 3 ? "" : await new Response(message.raw).text();
    const p = raw ? parse(raw.slice(0, MAX)) : { subject: "(too large to keep)", from: message.from, to: message.to, date: "", text: "", att: [] };
    const id = String(Date.now()).padStart(14, "0") + "-" + crypto.randomUUID().slice(0, 6);
    p.rcpt = message.to; p.env = message.from; p.read = false; p.at = new Date().toISOString();
    await env.INBOX.put("m:" + id, JSON.stringify(p), { expirationTtl: TTL, metadata: { s: p.subject.slice(0, 140), f: p.from.slice(0, 120), to: String(message.to).slice(0, 80), at: p.at, r: 0, n: p.att.length, p: p.text.replace(/\s+/g, " ").slice(0, 110) } });
  },
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method !== "POST") return json({ ok: true, service: "Haritt inbox" });
    let b = {}; try { b = JSON.parse(await req.text()); } catch (e) { return json({ ok: false, error: "bad" }); }
    if (!(await admin(b.sess))) return json({ ok: false, error: "login" }, 401);
    if (b.action === "list") {
      const l = await env.INBOX.list({ prefix: "m:", limit: 200 });
      return json({ ok: true, items: l.keys.map(k => Object.assign({ id: k.name.slice(2) }, k.metadata || {})).reverse() });
    }
    const id = String(b.id || ""); if (!/^[0-9]{14}-[0-9a-f]{6}$/.test(id)) return json({ ok: false, error: "id" });
    if (b.action === "get") {
      const v = await env.INBOX.get("m:" + id); if (!v) return json({ ok: false, error: "gone" });
      const m = JSON.parse(v); if (!m.read) { m.read = true; await env.INBOX.put("m:" + id, JSON.stringify(m), { expirationTtl: TTL, metadata: { s: m.subject.slice(0, 140), f: m.from.slice(0, 120), to: String(m.rcpt).slice(0, 80), at: m.at, r: 1, n: m.att.length, p: m.text.replace(/\s+/g, " ").slice(0, 110) } }); }
      return json({ ok: true, m });
    }
    if (b.action === "del") { await env.INBOX.delete("m:" + id); return json({ ok: true }); }
    return json({ ok: false, error: "action" });
  }
};
