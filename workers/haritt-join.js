/**
 * Haritt Group – Joining edge (Cloudflare Worker)
 * Sits in front of the "Haritt Group – Joining e-sign" Apps Script so the slow parts feel instant:
 *  - sign codes are sent and checked here (about 0.3 s instead of 2-6 s)
 *  - open positions are cached here for 5 minutes
 *  - everything else is passed to the Apps Script unchanged
 * Settings (Worker > Settings > Variables and Secrets):
 *  SCRIPT_URL  (text)   the Apps Script web app URL (…/exec)
 *  EDGE_SECRET (secret) the same long random text as the EDGE_SECRET script property
 *  RESEND_KEY  (secret) the same Resend key as the script
 */
const CODE_HTML = "<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"color-scheme\" content=\"light dark\"><meta name=\"supported-color-schemes\" content=\"light dark\"><style>:root{color-scheme:light dark}u+.body .gm-s{background:#000;mix-blend-mode:screen}u+.body .gm-d{background:#000;mix-blend-mode:difference}@media (max-width:620px){.e-px{padding-left:22px!important;padding-right:22px!important}.e-ttl{font-size:24px!important}}@media (prefers-color-scheme:dark){.e-bg{background:#0B0A09!important}.e-card{background:#181614!important;box-shadow:none!important;border-color:#2A2623!important}.e-h,.e-v{color:#F4F1EC!important}.e-t{color:#CFC8BE!important}.e-s,.e-k{color:#8F877C!important}.e-tile{background:#211E1B!important;border-color:#332E29!important}.e-ft{background:#141210!important;border-color:#2A2623!important}.e-num{background:#2A1717!important;color:#F08A8A!important;border-color:#7A3A3A!important}.e-code{color:#F08A8A!important}.e-lbl{color:#A59D92!important}.e-bd{border-color:#332E29!important}.e-bar{background:#F08A8A!important}}</style></head><body class=\"e-bg body\" style=\"margin:0;padding:0;background:#EFEAE4\"><table class=\"e-bg\" role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#EFEAE4;padding:32px 12px\"><tr><td align=\"center\"><table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;\"><tr><td class=\"e-card\" style=\"background:#FFFFFF;border-radius:22px;overflow:hidden;border:1px solid #E7E0D7;box-shadow:0 18px 50px rgba(50,30,15,.10)\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td class=\"e-px\" style=\"background:#16110F;background-image:linear-gradient(125deg,#16110F 0%,#2B0B0B 55%,#7A0C0C 100%);padding:22px 36px\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td style=\"vertical-align:middle\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr><td style=\"vertical-align:middle\"><img src=\"https://haritt.com/join/agreement/hg-3d.png\" width=\"36\" height=\"36\" alt=\"Haritt Group\" style=\"display:block;border:0\"></td><td style=\"padding-left:12px;vertical-align:middle;color:#FFFFFF;font-size:12px;font-weight:700;letter-spacing:.26em;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;\"><span class=\"gm-s\"><span class=\"gm-d\">HARITT GROUP</span></span></td></tr></table></td><td align=\"right\" style=\"vertical-align:middle\"><span style=\"display:inline-block;border:1px solid rgba(255,255,255,.22);border-radius:99px;padding:5px 12px;color:#F3D9D9;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;\"><span class=\"gm-s\"><span class=\"gm-d\">Confirm it is you</span></span></span></td></tr></table></td></tr><tr><td class=\"e-px\" style=\"padding:36px 40px 6px\"><div class=\"e-bar\" style=\"width:34px;height:3px;border-radius:3px;background:#8B0D0D;margin-bottom:16px\"></div><div class=\"e-h e-ttl\" style=\"color:#14100E;font-size:28px;line-height:1.25;font-weight:800;letter-spacing:-.015em\">Your code is <span class=\"e-code\" style=\"color:#8B0D0D;letter-spacing:.14em\">{{CODE}}</span></div></td></tr><tr><td class=\"e-px\" style=\"padding:14px 40px 36px\"><div class=\"e-t\" style=\"color:#4A4540;font-size:15.5px;line-height:1.7\">Use this code to sign the Step 1 Joining Agreement {{ID}}.</div><div class=\"e-s\" style=\"color:#8F877C;font-size:13px;line-height:1.65;margin-top:22px\">It works for 15 minutes. If you did not ask for it, you can ignore this email.</div></td></tr><tr><td class=\"e-ft e-px\" style=\"background:#FAF7F3;border-top:1px solid #EEE7DF;padding:20px 40px\"><div class=\"e-s\" style=\"color:#8F877C;font-size:12px;line-height:1.7\"><b class=\"e-v\" style=\"color:#3D3730\">Haritt Group</b> · Haritt Developers · HV Verse<br>Behind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001<br>Jaipur · Bharatpur · Remote-first</div></td></tr></table></td></tr><tr><td align=\"center\" class=\"e-s\" style=\"padding:18px 8px 0;color:#A39A8F;font-size:11.5px;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;\">This is a private message from Haritt Group. Please do not forward it.</td></tr></table></td></tr></table></body></html>";
const FROM = "Haritt Group <verify@haritt.com>";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json", ...CORS } });
const enc = new TextEncoder();
async function hmac(key, msg) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
  return [...s].map(b => b.toString(16).padStart(2, "0")).join("");
}
function same(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
const ck = k => new Request("https://edge.cache/" + encodeURIComponent(k));
async function cget(k) { const r = await caches.default.match(ck(k)); return r ? r.json() : null; }
async function cput(k, v, ttl) { await caches.default.put(ck(k), new Response(JSON.stringify(v), { headers: { "Cache-Control": "max-age=" + ttl } })); }
async function cdel(k) { await caches.default.delete(ck(k)); }
async function script(env, body) {
  const r = await fetch(env.SCRIPT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: typeof body === "string" ? body : JSON.stringify(body), redirect: "follow" });
  return r.text();
}
async function info(env, id, t) {
  const k = "ei:" + id + ":" + t; let i = await cget(k); if (i) return i;
  try { i = JSON.parse(await script(env, { action: "edge_info", key: env.EDGE_SECRET, id, t })); } catch (e) { return null; }
  if (i && i.ok) await cput(k, i, 3600);
  return i;
}
const mask = e => { const p = String(e).split("@"); return p[0].slice(0, 2) + "***@" + (p[1] || ""); };
const okId = id => /^HG-JN-\d{4}-[A-Z0-9]{6}$/.test(String(id || ""));

async function otpSend(env, b) {
  if (!okId(b.id) || !b.t) return json({ ok: false, error: "link" });
  const i = await info(env, b.id, String(b.t)); if (!i || !i.ok) return json({ ok: false, error: (i && i.error) || "server" });
  const nk = "on:" + b.id + i.role, n = (await cget(nk)) || 0; if (n >= 6) return json({ ok: false, error: "wait" });
  await cput(nk, n + 1, 3600);
  const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
  const exp = Date.now() + 15 * 60e3, ot = i.role + "." + exp + "." + await hmac(env.EDGE_SECRET, ["otp", b.id, b.t, i.role, code, exp].join("|"));
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [i.email], subject: "Your code to sign: " + code, headers: { "Auto-Submitted": "auto-generated" },
      text: "Your one-time code to sign the Haritt Group joining agreement is " + code + ". It works for 15 minutes. If you did not ask for it, ignore this email.\n\nHaritt Group",
      html: CODE_HTML.replace("{{CODE}}", code).replace("{{ID}}", b.id) }) });
  if (!r.ok) return json({ ok: false, error: "mail" });
  await cdel("ob:" + b.id + i.role);
  return json({ ok: true, email: mask(i.email), ot });
}
async function otpCheck(env, b) {
  if (!okId(b.id) || !b.t || !b.ot) return json({ ok: false, error: "bad_code" });
  const [role, exp, sig] = String(b.ot).split(".");
  if (role !== "member" && role !== "founder") return json({ ok: false, error: "bad_code" });
  const bk = "ob:" + b.id + role, bad = (await cget(bk)) || 0; if (bad >= 5) return json({ ok: false, error: "locked" });
  const code = String(b.code || "").replace(/\D/g, "");
  const want = await hmac(env.EDGE_SECRET, ["otp", b.id, b.t, role, code, exp].join("|"));
  if (Number(exp) < Date.now() || !same(want, String(sig || ""))) { await cput(bk, bad + 1, 3600); return json({ ok: false, error: "bad_code" }); }
  const e2 = Date.now() + 3600e3;
  return json({ ok: true, v: "e." + e2 + "." + await hmac(env.EDGE_SECRET, ["proof", b.id, role, e2].join("|")) });
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method !== "POST") return json({ ok: true, service: "Haritt Group joining edge" });
    const raw = await req.text(); let b = {}; try { b = JSON.parse(raw); } catch (e) { return json({ ok: false, error: "bad" }); }
    const edge = env.EDGE_SECRET && env.RESEND_KEY;
    try {
      if (b.action === "positions") {
        let p = await cget("pos"); if (p) return json(p);
        const t = await script(env, raw); try { p = JSON.parse(t); if (p.ok) ctx.waitUntil(cput("pos", p, 300)); } catch (e) {}
        return new Response(t, { headers: { "Content-Type": "application/json", ...CORS } });
      }
      if (edge && b.action === "otp_send") return await otpSend(env, b);
      if (edge && b.action === "otp_check" && b.ot) return await otpCheck(env, b);
      if (b.action === "pos_save" || b.action === "pos_del") ctx.waitUntil(cdel("pos"));
      if (/^addr_/.test(String(b.action))) return new Response(await script(env, JSON.stringify(Object.assign({}, b, { cf_token: env.CF_TOKEN || "", cf_account: env.CF_ACCOUNT || "", resend_full: env.RESEND_FULL_KEY || "" }))), { headers: { "Content-Type": "application/json", ...CORS } });   // Cloudflare token lives here (set by the deploy workflow), never in the browser
      const t = await script(env, raw);
      if (edge && b.action === "view" && okId(b.id) && b.t) ctx.waitUntil(info(env, b.id, String(b.t)));   // warm the email lookup so "Send code" is instant
      return new Response(t, { headers: { "Content-Type": "application/json", ...CORS } });
    } catch (e) { return json({ ok: false, error: "server" }); }
  }
};
