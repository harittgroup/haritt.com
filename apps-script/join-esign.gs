/**
 * Project name in Apps Script: "Haritt Group – Joining e-sign"
 * Backend for the Step 1 Joining Agreement (haritt.com/join/agreement/) and the admin page haritt.com/admin/join/.
 * Flow: the team issues an agreement → the member gets an email → confirms with a one-time code, fills their details, reads and signs →
 * the founding team gets an email and signs → the signed PDF is emailed to both.
 *
 * Set up once (script.google.com, signed in to the Haritt Group Google account):
 *   New project → paste this file → Project settings → Script properties:
 *     RESEND_KEY    = the Resend API key (same as the other Group scripts)
 *     FOUNDER_EMAIL = email of the founding team signer (Harsh Goyal)
 *     ADMINS        = emails that can open haritt.com/admin/join, comma separated (the founder email is always allowed)
 *     CC_EMAILS     = (optional) team emails in CC on every applicant email (application, shortlist, not now) and the final signed agreement, comma separated (max 8)
 *     BCC_EMAILS    = (optional) hidden copies of the same emails, comma separated
 *   Deploy → New deployment → Web app · Execute as: Me · Who has access: Anyone → Deploy → allow Drive + email when asked.
 * Agreements, signed PDFs, applications (HG-AP-…) and positions.json are saved in the Drive folder "Haritt joining agreements".
 * Public form: haritt.com/join (actions positions + apply). Admin: haritt.com/admin/join (Applications, Positions, Agreements, Verify).
 * After every change: Deploy > Manage deployments > Edit > Version: New version > Deploy (the URL stays the same).
 */
var FROM_NAME = "Haritt Group", SYS_FROM = "team@haritt.com", CODE_FROM = "verify@haritt.com";
var JOIN_FROM = "join@haritt.com", JOIN_NAME = "Haritt Group";
/* people the team can send an invitation as (Admin > Invite > Send from) */
var SENDERS = [{ id: "simran", name: "Simran Jain", role: "HR", email: "simran.jain@haritt.com" }, { id: "sanil", name: "Sanil Bhoir", role: "Development", email: "sanil.bhoir@haritt.com" }, { id: "harsh", name: "Harsh Goyal", role: "Founder & CMO · Marketing and Growth Lead", email: "harsh.goyal@haritt.com", bare: true }, { id: "pulkit", name: "Pulkit Soni", role: "Founding Team", email: "pulkit.soni@haritt.com" }];
var HR_FROM = "simran.jain@haritt.com", HR_NAME = "Haritt Group", HR_DESK = "hr@haritt.com";   // shortlisted + final signed mail: from Simran (HR), hr@ in CC   // applicant emails (application, shortlist, not now); CC = script property CC_EMAILS
var FBKEY = "AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4";   // haritt.com admin Firebase web key (public): checks the admin Google login
var SITE = "https://haritt.com/join/agreement/";
var LOGO = "https://haritt.com/join/agreement/hg-3d.png";
var FOLDER = "Haritt joining agreements";
var FOUNDER_NAME = "Harsh Goyal", FOUNDER_LABEL = "Founding Team, Haritt Group";
var ROLES = ["Client Growth", "Marketing & Content", "Operations"], LEVELS = ["Founding Team / Co-founder", "Founding Team", "Core Member"];

/* speed: run setupKeepWarm once from the editor (Run). A ping every 5 minutes keeps the script warm, so codes and forms answer fast. */
var READS = ["__reload", "build", "compose_from", "mails_list", "mail_view", "edge_info", "verify", "positions", "apps_list", "list", "pos_list", "admin_login", "addr_list", "gmail_pending"];
function keepWarm() { folder_(); posAll_(); rows_(); }
function setupKeepWarm() { ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "keepWarm") ScriptApp.deleteTrigger(t); }); ScriptApp.newTrigger("keepWarm").timeBased().everyMinutes(5).create(); }
function doGet(e) {
  var o = e && e.parameter && e.parameter.o; if (o) { seen_(String(o)); return ContentService.createTextOutput(""); }   // open pixel in sent emails
  return out({ ok: true, service: "Haritt Group joining e-sign" });
}
function doPost(e) {
  var lock = LockService.getScriptLock(), held = false;
  try {
    var b = JSON.parse(e.postData.contents || "{}"), a = b.action, r;
    if (READS.indexOf(a) < 0) { lock.waitLock(20000); held = true; }   // reads never wait for a lock

    r = a === "__reload" ? reload_(b) : a === "build" ? { ok: true, blob: prop_("AUTO_BLOB"), at: prop_("AUTO_AT") } : a === "view" ? view_(b) : a === "edge_info" ? edgeInfo_(b) : a === "otp_send" ? otpSend_(b) : a === "otp_check" ? otpCheck_(b) : a === "details" ? details_(b) : a === "sign" ? sign_(b) : a === "final" ? final_(b) : a === "reissue" ? reissue_(b) : a === "verify" ? verify_(b) :
      a === "positions" ? positions_(b) : a === "apply" ? apply_(b) :
      a === "apps_list" ? appsList_(b) : a === "app_note" ? appNote_(b) : a === "shortlist" ? shortlist_(b) : a === "not_now" ? notNow_(b) : a === "invite" ? applyInvite_(b) : a === "mails_list" ? mailsList_(b) : a === "mail_view" ? mailView_(b) : a === "gmail_pending" ? gmailPending_(b) : a === "gmail_mark" ? gmailMark_(b) : a === "compose" ? compose_(b) : a === "compose_from" ? composeFrom_(b) : a === "pos_list" ? posList_(b) : a === "pos_save" ? posSave_(b) : a === "pos_del" ? posDel_(b) :
      a.indexOf("addr_") === 0 ? addrApi_(a, b) : a === "admin_login" ? adminLogin_(b) : a === "list" ? list_(b) : a === "agreement_pdf" ? agreementPdf_(b) : a === "create" ? create_(b) : a === "remind" ? remind_(b) : a === "void" ? void_(b) : { ok: false, error: "bad_action" };
    return out(r);
  } catch (err) { console.error(err && err.stack || err); return out({ ok: false, error: "server", msg: String(err && err.message || err).slice(0, 200) }); } finally { if (held) try { lock.releaseLock(); } catch (x) {} }
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ""; }
function folder_() {
  var c = CacheService.getScriptCache(), id = c.get("fid") || prop_("FOLDER_ID");
  if (id) try { var f0 = DriveApp.getFolderById(id); c.put("fid", id, 21600); return f0; } catch (e) {}
  var it = DriveApp.getFoldersByName(FOLDER), f = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
  try { PropertiesService.getScriptProperties().setProperty("FOLDER_ID", f.getId()); c.put("fid", f.getId(), 21600); } catch (e) {}
  return f;
}
/* one cached index of all applications + agreements, so Admin opens fast. Any save clears it. */
function bust_() { try { CacheService.getScriptCache().remove("rows"); } catch (e) {} ping_("rows"); }
// Real-time: bumps Firestore adminLive/join (only {t: server time, k}) so open admin pages refresh at once. Throttled to 1 per 2 s.
function ping_(k) {
  try { var c = CacheService.getScriptCache(); if (c.get("lp")) return; c.put("lp", "1", 2);
    UrlFetchApp.fetch("https://firestore.googleapis.com/v1/projects/harsh-reset/databases/(default)/documents:commit?key=" + FBKEY, { method: "post", contentType: "application/json", muteHttpExceptions: true,
      payload: JSON.stringify({ writes: [{ update: { name: "projects/harsh-reset/databases/(default)/documents/adminLive/join", fields: { k: { stringValue: String(k || "x").slice(0, 20) } } }, updateMask: { fieldPaths: ["k"] }, updateTransforms: [{ fieldPath: "t", setToServerValue: "REQUEST_TIME" }] }] }) });
  } catch (e) {}
}
function rows_() {
  var c = CacheService.getScriptCache(), h = c.get("rows"); if (h) try { return JSON.parse(h); } catch (e) {}
  var ap = [], jn = [], it = folder_().searchFiles("title contains 'HG-' and trashed = false");
  while (it.hasNext()) { var f = it.next(), n = f.getName(); if (!/^HG-(AP|JN)-.*\.json$/.test(n)) continue; try { var d = JSON.parse(f.getBlob().getDataAsString()); (n.indexOf("HG-AP-") === 0 ? ap : jn).push(d); } catch (e) {} }
  var jr = jn.map(row_), st = {}; jr.forEach(function (r) { st[r.id] = r.status; });
  var ar = ap.map(function (d) { return { id: d.id, created: d.created, status: d.status, pos: d.pos, a: d.a, note: d.note || "", ag: d.ag || "", agStatus: d.ag ? (st[d.ag] || "") : "" }; });
  var by = function (x, y) { return x.created < y.created ? 1 : -1; }; jr.sort(by); ar.sort(by);
  var o = { ap: ar, jn: jr }; try { c.put("rows", JSON.stringify(o), 21600); } catch (e) {}
  return o;
}
function okId_(id) { return /^HG-JN-\d{4}-[A-Z0-9]{6}$/.test(String(id || "")); }
function load_(id) { if (!okId_(id)) return null; var it = folder_().getFilesByName(id + ".json"); if (!it.hasNext()) return null; var f = it.next(); return { file: f, d: JSON.parse(f.getBlob().getDataAsString()) }; }
function save_(st) { st.file.setContent(JSON.stringify(st.d)); bust_(); }
function now_() { return new Date().toISOString(); }
function s_(v, max) { return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max); }
function okEmail_(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) && v.length <= 200; }
function okSig_(v) { return typeof v === "string" && /^data:image\/png;base64,[A-Za-z0-9+\/=]+$/.test(v) && v.length < 250000; }
function tok_() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, "").slice(0, 32); }
function newId_() { var C = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "", i; for (i = 0; i < 6; i++) s += C[Math.floor(Math.random() * C.length)]; return "HG-JN-" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyMM") + "-" + s; }
function mask_(e) { var p = String(e).split("@"); return p[0].slice(0, 2) + "***@" + (p[1] || ""); }
function log_(d, role, ev, x) { d.log = d.log || []; d.log.push({ t: now_(), r: role || "", e: ev, x: x || "" }); if (d.log.length > 200) d.log.shift(); }
function allSigned_(d) { return !!(d.p.member.signedAt && d.p.founder.signedAt); }
function roleOf_(d, t) { t = String(t || ""); if (!t) return null; if (d.tok.member === t) return "member"; if (d.tok.founder === t) return "founder"; return null; }
function status_(d) { return d.void ? "void" : allSigned_(d) ? "signed" : (d.p.member.signedAt || d.p.founder.signedAt) ? "partly" : "issued"; }

/* ---------- signer side (personal link token) ---------- */
function pub_(d, role) {
  var sg = function (r) { var p = d.p[r]; return { name: p.name, label: p.label, signedAt: p.signedAt || "", sig: p.sig || "" }; };
  return { id: d.id, created: d.created, status: status_(d), role: role || "", m: d.m, member: sg("member"), founder: sg("founder"), final: d.final ? { at: d.final.at, re: !!(d.final.re || d.final.rePend) } : null,
    email: role ? mask_(d.p[role].email) : "" };
}
function view_(b) {
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d, role = roleOf_(d, b.t); if (!role) return { ok: false, error: "link" };
  if (d.void) return { ok: false, error: "void" };
  if (!d.p[role].opened) { d.p[role].opened = now_(); log_(d, role, "opened", ""); save_(st); }
  return { ok: true, doc: pub_(d, role) };
}
function otpSend_(b) {
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d, role = roleOf_(d, b.t); if (!role) return { ok: false, error: "link" };
  if (d.void) return { ok: false, error: "void" };
  var c = CacheService.getScriptCache(), nk = "otpn:" + d.id + role, n = Number(c.get(nk) || 0); if (n >= 6) return { ok: false, error: "wait" };
  c.put(nk, String(n + 1), 3600);
  var code = String(Math.floor(100000 + Math.random() * 900000)); c.put("otp:" + d.id + role, code, 900); c.remove("otpbad:" + d.id + role);
  mail_(d.p[role].email, "Your code to sign: " + code, "Your one-time code to sign the Haritt Group joining agreement is " + code + ". It works for 15 minutes. If you did not ask for it, ignore this email.\n\nHaritt Group",
    { code: 1, htmlBody: shell_("Confirm it is you", 'Your code is <span class="e-code" style="color:#8B0D0D;letter-spacing:.14em">' + code + '</span>', txt_("Use this code to sign the Step 1 Joining Agreement " + esc(d.id) + ".") + small_("It works for 15 minutes. If you did not ask for it, you can ignore this email.")) });
  return { ok: true, email: mask_(d.p[role].email) };
}
function otpCheck_(b) {
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d, role = roleOf_(d, b.t); if (!role) return { ok: false, error: "link" };
  var c = CacheService.getScriptCache(), bk = "otpbad:" + d.id + role, bad = Number(c.get(bk) || 0);
  if (bad >= 5) return { ok: false, error: "locked" };
  var code = c.get("otp:" + d.id + role);
  if (!code || String(b.code || "").trim() !== code) { c.put(bk, String(bad + 1), 3600); return { ok: false, error: "bad_code" }; }
  c.remove("otp:" + d.id + role);
  var pf = tok_(); c.put("pf:" + d.id + role, pf, 3600);
  return { ok: true, v: pf };
}
function proof_(d, role, b) {
  var v = String(b.v || ""), es = prop_("EDGE_SECRET");
  if (es && v.indexOf("e.") === 0) { var p = v.split("."); return p.length === 3 && Number(p[1]) > Date.now() && p[2] === hhex_(es, ["proof", d.id, role, p[1]].join("|")); }   // proof from the Cloudflare edge (code checked there)
  var pf = CacheService.getScriptCache().get("pf:" + d.id + role); return !!pf && pf === v;
}
/* Cloudflare edge (Haritt Group – Joining edge): sends and checks sign codes fast. It asks only for the signer's email, with the shared EDGE_SECRET. */
function hhex_(k, m) { return Utilities.computeHmacSha256Signature(m, k, Utilities.Charset.UTF_8).map(function (x) { return ("0" + ((x + 256) % 256).toString(16)).slice(-2); }).join(""); }
function edgeInfo_(b) {
  var es = prop_("EDGE_SECRET"); if (!es || String(b.key || "") !== es) return { ok: false, error: "bad_action" };
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d, role = roleOf_(d, b.t); if (!role) return { ok: false, error: "link" };
  if (d.void) return { ok: false, error: "void" };
  return { ok: true, role: role, email: alias_(d.p[role].email) };
}
/* member fills or corrects their details before reading and signing */
function details_(b) {
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d, role = roleOf_(d, b.t); if (role !== "member") return { ok: false, error: "link" };
  if (d.void) return { ok: false, error: "void" };
  if (!proof_(d, role, b)) return { ok: false, error: "verify" };
  if (d.p.member.signedAt) return { ok: false, error: "already" };
  var x = b.data || {}, name = s_(x.name, 80), phone = s_(x.phone, 20).replace(/[^0-9+ ]/g, ""), city = s_(x.city, 60), addr = s_(x.address, 200);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10 || city.length < 2 || addr.length < 6) return { ok: false, error: "fields" };
  d.m.name = name; d.m.phone = phone; d.m.city = city; d.m.address = addr; d.p.member.name = name; d.m.filled = now_();
  log_(d, role, "details", ""); save_(st);
  return { ok: true, doc: pub_(d, role) };
}
function sign_(b) {
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d, role = roleOf_(d, b.t); if (!role) return { ok: false, error: "link" };
  if (d.void) return { ok: false, error: "void" };
  if (!proof_(d, role, b)) return { ok: false, error: "verify" };
  if (role === "member" && !d.m.filled) return { ok: false, error: "details" };
  if (role === "founder" && !d.p.member.signedAt) return { ok: false, error: "member_first" };
  if (d.p[role].signedAt) return { ok: false, error: "already" };
  if (!okSig_(b.sig)) return { ok: false, error: "sig" };
  if (b.agree !== true) return { ok: false, error: "agree" };
  var p = d.p[role]; p.sig = b.sig; p.signedAt = now_(); p.via = "email code"; p.ua = s_(b.ua, 200); p.lang = b.lang === "hi" ? "hi" : "en";
  log_(d, role, "signed", p.via);
  if (role === "member") { invite_(d, "founder"); log_(d, "founder", "invited", "member signed"); }
  save_(st);
  return { ok: true, doc: pub_(d, role) };
}
function final_(b) {
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d, role = roleOf_(d, b.t); if (!role) return { ok: false, error: "link" };
  if (d.void) return { ok: false, error: "void" };
  if (!allSigned_(d)) return { ok: false, error: "not_complete" };
  if (d.final) return { ok: true, already: true };
  var pdf = String(b.pdf || ""); if (!/^[A-Za-z0-9+\/=]+$/.test(pdf) || pdf.length > 12000000) return { ok: false, error: "pdf" };
  var fname = "Joining Agreement - " + d.m.name.replace(/[^A-Za-z0-9 ]+/g, "").trim() + " - " + d.id + ".pdf";
  var blob = Utilities.newBlob(Utilities.base64Decode(pdf), "application/pdf", fname);
  var file = folder_().createFile(blob).setName(fname);
  var sha = hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, blob.getBytes()));
  d.final = { at: now_(), fileId: file.getId(), sha: sha }; log_(d, role, "final", sha.slice(0, 12));
  save_(st);
  try { PropertiesService.getScriptProperties().setProperty("vh:" + sha, d.id); } catch (e) {}
  var to = [d.p.member.email]; if (to.indexOf(d.p.founder.email) < 0) to.push(d.p.founder.email);
  mail_(to.join(","), "Signed: Step 1 Joining Agreement · " + d.m.name + " · Haritt Group", finalText_(d), { htmlBody: finalHtml_(d), attachments: [blob], join: true, hr: true, cc: true });
  try { welcome_(d); log_(d, "member", "welcomed", ""); save_(st); } catch (e) {}
  return { ok: true };
}
/* re-issue a signed agreement in the current PDF format (same signatures).
   Step 1: the founding team's link makes the new PDF; it is saved in Drive and a TEST copy goes only to the contact person (from HR).
   Step 2: after the founder checks it, an outbox entry {type:"reissue", doc:"<id>"} sends it to the member, contact person + hr@ in CC. */
function reissue_(b) {
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d, role = roleOf_(d, b.t); if (role !== "founder") return { ok: false, error: "link" };
  if (d.void || !allSigned_(d) || !d.final) return { ok: false, error: "not_complete" };
  if (d.final.re || d.final.rePend) return { ok: true, already: true };
  var lock = LockService.getScriptLock(); if (!lock.tryLock(10000)) return { ok: false, error: "busy" };
  var blob;
  try {
    st = load_(b.id); d = st.d; if (d.final.re || d.final.rePend) return { ok: true, already: true };
    var pdf = String(b.pdf || ""); if (!/^[A-Za-z0-9+\/=]+$/.test(pdf) || pdf.length > 12000000) return { ok: false, error: "pdf" };
    blob = Utilities.newBlob(Utilities.base64Decode(pdf), "application/pdf", pdfName_(d));
    var file = folder_().createFile(blob).setName(pdfName_(d));
    var sha = hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, blob.getBytes()));
    d.final.rePend = { at: now_(), fileId: file.getId(), sha: sha }; log_(d, role, "reissue_test", sha.slice(0, 12)); save_(st);
    try { PropertiesService.getScriptProperties().setProperty("vh:" + sha, d.id); } catch (e) {}
  } finally { lock.releaseLock(); }
  var m = reissueMail_(d);
  mail_(contactId_(d), "[Check before sending] " + m.subject, m.text, { htmlBody: m.html, attachments: [blob], join: true, hr: true, cc: false, nosplit: true, ccOnly: [] });
  return { ok: true, test: true };
}
function reissueSend_(id) {
  var st = load_(id); if (!st) return "not_found";
  var d = st.d, p = d.final && d.final.rePend; if (!p) return "no test copy yet";
  if (d.final.re) return "already sent";
  var blob = DriveApp.getFileById(p.fileId).getBlob().setName(pdfName_(d));
  d.final.re = p; delete d.final.rePend; log_(d, "founder", "reissued", p.sha.slice(0, 12)); save_(st);
  var m = reissueMail_(d);
  mail_(d.p.member.email, m.subject, m.text, { htmlBody: m.html, attachments: [blob], join: true, hr: true, cc: true, nosplit: true, ccOnly: [contactId_(d), HR_DESK] });
  return "sent to member";
}
function pdfName_(d) { return "Joining Agreement - " + d.m.name.replace(/[^A-Za-z0-9 ]+/g, "").trim() + " - " + d.id + ".pdf"; }
function reissueMail_(d) {
  var first = d.m.name.split(" ")[0];
  var info = kv_("Document ID", esc(d.id)) + kv_("Signed by " + esc(d.p.member.name), ist_(d.p.member.signedAt)) + kv_("Signed by " + esc(d.p.founder.name), ist_(d.p.founder.signedAt));
  var inner = txt_("We are happy to have you with us. Here is your signed Joining Agreement, with your signature and the founding team's signature.<br><br>The PDF is attached to this email. Please download it and keep it safe with you.") + tile_("Joining Agreement", "PDF attached · Signed by both sides") +
    '<table class="e-tile" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;background:#FAFAF8;border:1px solid #ECE7E1;border-radius:12px"><tr><td style="padding:10px 18px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + info + "</table></td></tr></table>" +
    small_("This copy is in our updated format. The agreement and the signatures are the same. The QR code on the last page confirms it is genuine.<br>यह आपका साइन किया हुआ एग्रीमेंट है। इसे डाउनलोड करके संभालकर रखें।") + signHR_();
  var text = "Hi " + first + ",\n\nCongratulations, and welcome to the team. We are happy to have you with us. Here is your signed Joining Agreement, with your signature and the founding team's signature.\n\nThe PDF is attached to this email. Please download it and keep it safe with you.\n\nDocument ID: " + d.id +
    "\nSigned by " + d.p.member.name + ": " + ist_(d.p.member.signedAt) + "\nSigned by " + d.p.founder.name + ": " + ist_(d.p.founder.signedAt) +
    "\n\nThis copy is in our updated format. The agreement and the signatures are the same.\n\nSimran Jain\nHR, Haritt Group";
  return { subject: "Welcome to the team, " + first + " · Your signed Joining Agreement", html: shell_("Your agreement", "Congratulations " + esc(first) + ", welcome to the team", inner), text: text };
}
function hex_(bytes) { return bytes.map(function (x) { return ("0" + (x & 255).toString(16)).slice(-2); }).join(""); }
/* public check behind the QR code: by Document ID (or by the SHA-256 of the signed PDF) */
function verify_(b) {
  var id = String(b.id || "").toUpperCase();
  if (!okId_(id) && /^[0-9a-f]{64}$/.test(String(b.sha || ""))) id = prop_("vh:" + b.sha);
  var st = load_(id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d;
  return { ok: true, id: d.id, status: status_(d), name: d.m.name, role: d.m.role, level: d.m.level, created: d.created,
    member: { name: d.p.member.name, signedAt: d.p.member.signedAt || "" }, founder: { name: d.p.founder.name, signedAt: d.p.founder.signedAt || "" },
    completed: d.final ? d.final.at : "", match: !!(b.sha && d.final && (b.sha === d.final.sha || (d.final.re && b.sha === d.final.re.sha) || (d.final.rePend && b.sha === d.final.rePend.sha))) };
}

/* ---------- team side (haritt.com/admin/join, Google login of the admin) ---------- */
function admins_() { var l = prop_("ADMINS").toLowerCase().split(",").map(function (x) { return x.trim(); }).filter(String); var f = prop_("FOUNDER_EMAIL").toLowerCase(); if (f && l.indexOf(f) < 0) l.push(f); return l; }
function adminLogin_(b) {
  var r = UrlFetchApp.fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + FBKEY, { method: "post", contentType: "application/json", payload: JSON.stringify({ idToken: String(b.idToken || "") }), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return { ok: false, error: "bad_token" };
  var u = (JSON.parse(r.getContentText()).users || [])[0], em = u && String(u.email || "").toLowerCase();
  if (!u || !u.emailVerified || admins_().indexOf(em) < 0) return { ok: false, error: "not_allowed", email: em || "" };
  var s = tok_(); CacheService.getScriptCache().put("sess:" + s, em, 21600);
  return { ok: true, sess: s, email: em };
}
function who_(b) { return CacheService.getScriptCache().get("sess:" + String(b.sess || "")) || ""; }
function row_(d) { return { id: d.id, name: d.m.name, email: d.m.email, role: d.m.role, level: d.m.level, created: d.created, by: d.by, status: status_(d),
  member: { signedAt: d.p.member.signedAt || "", opened: d.p.member.opened || "" }, founder: { signedAt: d.p.founder.signedAt || "", opened: d.p.founder.opened || "" }, final: d.final ? d.final.at : "" }; }
/* admin: download the signed PDF (latest copy) saved in Drive */
function agreementPdf_(b) {
  if (!who_(b)) return { ok: false, error: "login" };
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var f = st.d.final; if (!f) return { ok: false, error: "not_complete" };
  var id = (f.re && f.re.fileId) || (f.rePend && f.rePend.fileId) || f.fileId, file = DriveApp.getFileById(id);
  return { ok: true, name: "Joining Agreement - " + st.d.m.name.replace(/[^A-Za-z0-9 ]+/g, "").trim() + " - " + st.d.id + ".pdf", data: Utilities.base64Encode(file.getBlob().getBytes()) };
}
function list_(b) {
  if (!who_(b)) return { ok: false, error: "login" };
  return { ok: true, rows: rows_().jn, me: who_(b), founder: prop_("FOUNDER_EMAIL") ? mask_(prop_("FOUNDER_EMAIL")) : "" };
}
function create_(b) {
  var by = who_(b); if (!by) return { ok: false, error: "login" };
  var fe = prop_("FOUNDER_EMAIL").toLowerCase(); if (!okEmail_(fe)) return { ok: false, error: "founder_email" };
  var m = { name: s_(b.name, 80), email: s_(b.email, 200).toLowerCase(), phone: s_(b.phone, 20).replace(/[^0-9+ ]/g, ""), city: s_(b.city, 60), address: "",
    role: ROLES.indexOf(b.role) >= 0 ? b.role : ROLES[0], level: LEVELS.indexOf(b.level) >= 0 ? b.level : LEVELS[0] };
  var pz = posAll_().filter(function (p) { return p.full === b.role; })[0]; if (pz) { m.role = pz.full; m.rdesc = pz.sum || ""; }
  if (m.name.length < 2 || !okEmail_(m.email)) return { ok: false, error: "member" };
  var id = newId_(); while (load_(id)) id = newId_();
  var d = { id: id, created: now_(), by: by, m: m, tok: { member: tok_(), founder: tok_() }, final: null, void: null, log: [],
    p: { member: { name: m.name, email: m.email, label: "Joining member" }, founder: { name: FOUNDER_NAME, email: fe, label: FOUNDER_LABEL } } };
  log_(d, "", "created", by);
  folder_().createFile(id + ".json", JSON.stringify(d), MimeType.PLAIN_TEXT); bust_();
  var st = load_(id), mailed = { member: invite_(d, "member") };
  log_(d, "", "invited", JSON.stringify(mailed)); st.d = d; save_(st);
  return { ok: true, row: row_(d), mailed: mailed };
}
function remind_(b) {
  if (!who_(b)) return { ok: false, error: "login" };
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d; if (d.void || allSigned_(d)) return { ok: false, error: "closed" };
  var sent = [];
  var r = d.p.member.signedAt ? "founder" : "member"; if (b.preview) return invite_(d, r, true, true) || { ok: false, error: "preview" };
  if (invite_(d, r, true)) sent.push(r);
  log_(d, "", "reminded", sent.join(",")); save_(st);
  return { ok: true, sent: sent };
}
function void_(b) {
  var by = who_(b); if (!by) return { ok: false, error: "login" };
  var st = load_(b.id); if (!st) return { ok: false, error: "not_found" };
  var d = st.d; if (allSigned_(d)) return { ok: false, error: "signed" };
  d.void = { at: now_(), by: by }; log_(d, "", "cancelled", by); save_(st);
  return { ok: true, row: row_(d) };
}

/* ---------- emails ---------- */
// The founding-team contact's official ID (shown in CC on member reminders, so the member sees who is following up)
function contactId_(d) { var n = String((d.p.founder && d.p.founder.name) || "").toLowerCase(), s = SENDERS.filter(function (x) { return x.name.toLowerCase() === n; })[0]; return s ? s.email : "harsh.goyal@haritt.com"; }
function invite_(d, role, again, preview) {
  try {
    var p = d.p[role], link = SITE + "?id=" + d.id + "&t=" + d.tok[role], first = esc(p.name.split(" ")[0]);
    var who = role === "member" ? "Haritt Group has sent you your Step 1 Joining Agreement." : esc(d.m.name) + " has filled their details and signed the Step 1 Joining Agreement. Please review and sign as the founding team.";
    var inner = txt_((again ? "We are still waiting for your signature.<br>" : "") + who) + tile_("Step 1 Joining Agreement", esc(d.m.name) + " · " + esc(d.id)) + btn_(link, again ? "Sign now" : "Review and sign") +
      steps_(role === "member" ? ["Confirm it is you with a code", "Fill your details", "Read every page and sign", "Get the signed PDF on this email"] : ["Confirm it is you with a code", "Check the details", "Read and sign", "Both get the signed PDF"]) +
      small_("आप फ़ोन से ही अंगुली से साइन कर सकते हैं। दोनों के साइन होते ही साइन किया हुआ PDF इसी ईमेल पर आ जाएगा।") +
      small_('This link is personal to you. Please do not share it.<br>Button not working? Copy this address into your browser:<br><span class="e-s" style="color:#6B7280;word-break:break-all">' + esc(link) + "</span>");
    var subj = role === "founder" ? (again ? "Reminder to sign: " : "") + d.m.name + " has signed. Your turn: Step 1 Joining Agreement" : (again ? "Reminder to sign" : "Please sign") + ": Step 1 Joining Agreement · " + d.m.name,
      hb = shell_(again ? "Reminder" : "Agreement to sign", "Hi " + first + ", " + (again ? "a quick reminder to sign" : "please review and sign"), inner), mo = again && role === "member" ? { hr: true, cc: true, nosplit: true, ccOnly: [contactId_(d), HR_DESK] } : {};
    if (preview) return { ok: true, html: hb, subject: subj, from: mo.hr ? HR_NAME + " <" + HR_FROM + ">" : FROM_NAME + " <" + SYS_FROM + ">", to: role === "member" ? p.email : alias_(p.email) === p.email ? p.email : "Founding team", cc: (mo.ccOnly || []).join(", "), role: role };
    mail_(p.email, subj,
      "Hi " + p.name.split(" ")[0] + ",\n\n" + (role === "member" ? "Haritt Group has sent you your Step 1 Joining Agreement." : d.m.name + " has filled their details and signed the Step 1 Joining Agreement. Please review and sign as the founding team.") +
      "\nOpen this link, read every page and sign with your finger:\n" + link + "\n\nYou will get the signed PDF on this email after both sides sign.\n\nHaritt Group",
      Object.assign({ htmlBody: hb }, mo));
    return true;
  } catch (err) { return false; }
}
/* welcome email to the new member, sent right after the signed PDF email */
function day_(iso, add) { var x = new Date(new Date(iso).getTime() + 330 * 60000); x.setUTCDate(x.getUTCDate() + add); return x; }
function dfmt_(x, long) { var W = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return long ? W[x.getUTCDay()] + ", " + x.getUTCDate() + " " + M[x.getUTCMonth()] : W[x.getUTCDay()].slice(0, 3) + " " + x.getUTCDate() + " " + M[x.getUTCMonth()].slice(0, 3); }
function welcome_(d) {
  var t = d.p.member.signedAt, w = day_(t, 0).getUTCDay(), m = (8 - w) % 7 || 7, first = esc(d.m.name.split(" ")[0]);
  var D1 = day_(t, m), D3 = day_(t, m + 2), D4 = day_(t, m + 3), D5 = day_(t, m + 4), D10 = day_(t, m + 11);
  var link = SITE + "?id=" + d.id + "&t=" + d.tok.member;
  var row = function (when, what, sub, last) { return '<tr><td class="e-code e-bd" style="padding:12px 14px 12px 0;vertical-align:top;white-space:nowrap;color:#8B0D0D;font-size:12.5px;font-weight:700;' + (last ? "" : "border-bottom:1px solid #ECE7E1;") + '">' + when + '</td><td class="e-bd" style="padding:12px 0;' + (last ? "" : "border-bottom:1px solid #ECE7E1;") + '"><div class="e-v" style="color:#14161C;font-size:14px;font-weight:700">' + what + '</div><div class="e-s" style="color:#6B7280;font-size:13px;line-height:1.5;margin-top:2px">' + sub + "</div></td></tr>"; };
  var inner = txt_("Congratulations. Your Step 1 Joining Agreement is signed by both sides, and you are now part of the Haritt team for your first 10 days. We are glad to have you with us.") +
    '<table class="e-tile" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;background:#FBF4F2;border:1px solid #F0DCD6;border-radius:14px"><tr><td align="center" style="padding:18px 16px">' +
    '<div class="e-lbl" style="color:#9A8F84;font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">Your Day 1</div>' +
    '<div class="e-code" style="color:#8B0D0D;font-size:22px;font-weight:800;margin-top:4px">' + dfmt_(D1, true) + '</div>' +
    '<div class="e-s" style="color:#6B7280;font-size:13px;margin-top:4px">Work starts online. Final review on ' + dfmt_(D10, true) + ".</div></td></tr></table>" +
    '<div class="e-h" style="color:#14161C;font-size:15px;font-weight:700;margin:26px 0 4px">Your first 10 days</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    row(dfmt_(D1) + " to " + dfmt_(D3), "Learn", "Understand Haritt Group and how we work.") +
    row(dfmt_(D4), "First review and access", "A short call on what you learned. You get your company email and the tools you need.") +
    row(dfmt_(D5) + " onward", "Real work", "Small, real tasks in your role, with a short update every day.") +
    row(dfmt_(D10), "Final review", "We decide your level and where you fit best, together.", true) + "</table>" +
    '<div class="e-h" style="color:#14161C;font-size:15px;font-weight:700;margin:24px 0 6px">Before Day 1</div>' +
    '<div class="e-t" style="color:#4A505C;font-size:14px;line-height:1.75">1. Keep the signed PDF safe (it came in the email before this one).<br>2. Keep everything about Haritt confidential, from today.<br>3. Have a question? Just reply to this email.</div>' +
    btn_(link, "Open my agreement") +
    '<div class="e-t" style="color:#4A4540;font-size:15px;line-height:1.6;margin-top:26px">See you on Day 1.<br><b class="e-v" style="color:#14161C">' + esc(FOUNDER_NAME) + '</b><br><span class="e-s" style="color:#8A91A0;font-size:12.5px">' + esc(FOUNDER_LABEL) + "</span></div>" +
    small_("Haritt परिवार में आपका स्वागत है। आपका पहला दिन " + dfmt_(D1, true) + " है। कोई भी सवाल हो तो इसी ईमेल का जवाब दें।");
  var text = "Welcome to the Haritt family, " + d.m.name.split(" ")[0] + ".\n\nCongratulations. Your Step 1 Joining Agreement is signed by both sides.\n\nYour Day 1: " + dfmt_(D1, true) + " (online). Final review: " + dfmt_(D10, true) +
    ".\n\nYour first 10 days:\n- " + dfmt_(D1) + " to " + dfmt_(D3) + ": Learn\n- " + dfmt_(D4) + ": First review and access\n- " + dfmt_(D5) + " onward: Real work\n- " + dfmt_(D10) + ": Final review\n\nKeep the signed PDF safe, keep everything about Haritt confidential, and reply to this email with any question.\n\nSee you on Day 1.\n" + FOUNDER_NAME + "\n" + FOUNDER_LABEL;
  mail_(d.p.member.email, "Welcome to the Haritt family, " + d.m.name.split(" ")[0], text, { htmlBody: shell_("Congratulations", "Welcome to the Haritt family, " + first, inner) });
}
function ist_(iso) { return Utilities.formatDate(new Date(iso), "Asia/Kolkata", "d MMM yyyy, h:mm a") + " IST"; }
function finalText_(d) {
  return "Signed: Step 1 Joining Agreement\n\nBoth sides have signed. The signed PDF is attached. The member and the founding team get this same email and the same PDF.\n\nDocument ID: " + d.id +
    "\nMember: " + d.m.name + " (" + d.m.role + ")\nSigned by " + d.p.member.name + ": " + ist_(d.p.member.signedAt) + "\nSigned by " + d.p.founder.name + ": " + ist_(d.p.founder.signedAt) +
    "\n\nKeep the PDF safe. The Haritt team can check it with the QR code on its last page.\n\nSimran Jain\nHR, Haritt Group";
}
function kv_(k, v) { return '<tr><td class="e-k" style="padding:7px 0;color:#8A91A0;font-size:13px;white-space:nowrap">' + k + '</td><td class="e-v" align="right" style="padding:7px 0 7px 14px;color:#14161C;font-size:13.5px;font-weight:600">' + v + "</td></tr>"; }
function finalHtml_(d) {
  var info = kv_("Document ID", esc(d.id)) + kv_("Member", esc(d.m.name)) + kv_("Role", esc(d.m.role)) + kv_("Signed by " + esc(d.p.member.name), ist_(d.p.member.signedAt)) + kv_("Signed by " + esc(d.p.founder.name), ist_(d.p.founder.signedAt));
  var inner = txt_("The Step 1 Joining Agreement is now complete. The signed PDF is attached to this email.") + tile_("Step 1 Joining Agreement", "Signed by both · " + esc(d.id)) +
    '<table class="e-tile" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;background:#FAFAF8;border:1px solid #ECE7E1;border-radius:12px"><tr><td style="padding:10px 18px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + info + "</table></td></tr></table>" +
    small_("Keep the PDF safe. The Haritt team can check it with the QR code on its last page.<br>साइन किया हुआ PDF इस ईमेल में लगा है। इसे संभालकर रखें।") + signHR_();
  return shell_("Agreement signed", "Both sides have signed", inner);
}
function mail_(to, sub, text, o) {
  o = o || {};
  if (!o.noalias) to = alias_(to);
  var lid = mlId_(), hpx = o.htmlBody ? (/<\/body>/i.test(o.htmlBody) ? o.htmlBody.replace(/<\/body>/i, pixel_(lid) + "</body>") : o.htmlBody + pixel_(lid)) : "";
  var key = prop_("RESEND_KEY"), reply = prop_("FOUNDER_EMAIL") || "team@haritt.com";
  if (key) {
    try {
      var body = { from: o.sendAs ? o.sendAs.name + " <" + o.sendAs.email + ">" : o.hr ? HR_NAME + " <" + (o.fromA || HR_FROM) + ">" : o.join ? JOIN_NAME + " <" + JOIN_FROM + ">" : FROM_NAME + " <" + (o.code ? CODE_FROM : SYS_FROM) + ">", to: String(to).split(","), subject: sub, text: text, reply_to: o.sendAs ? o.sendAs.email : o.hr ? (o.fromA || HR_FROM) : o.join ? JOIN_FROM : reply, headers: { "Auto-Submitted": "auto-generated" } }; if (o.sendAs) delete body.headers;
      var ccl = ((o.cc || o.join) && !o.nocc) ? ccFor_(to, o) : [], bcl = o.join ? lst_("BCC_EMAILS", to).filter(function (x) { return ccl.indexOf(x) < 0; }) : []; if (ccl.length) body.cc = ccl; if (bcl.length) body.bcc = bcl;
      if (o.htmlBody) body.html = hpx;
      var split = ccl.length && o.htmlBody && !o.nosplit && prop_("SPLIT_CC") === "1", cs = {};   // default: one mail, everyone sees the CC list. SPLIT_CC=1: each CC person gets an own copy ("Opened" per person)
      if (split) delete body.cc;
      if (o.attachments) body.attachments = o.attachments.map(function (b) { return { filename: b.getName(), content: Utilities.base64Encode(b.getBytes()), content_type: b.getContentType() }; });
      var r = UrlFetchApp.fetch("https://api.resend.com/emails", { method: "post", contentType: "application/json", muteHttpExceptions: true, headers: { Authorization: "Bearer " + key }, payload: JSON.stringify(body) });
      if (r.getResponseCode() >= 200 && r.getResponseCode() < 300) {
        var rid = ""; try { rid = JSON.parse(r.getContentText()).id || ""; } catch (e) {}
        if (split) ccl.forEach(function (c, i) {
          var cid = lid + "C" + (i + 1), note = '<div style="font:12.5px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8A91A0;text-align:center;padding:10px 12px 0">Team copy · this email was sent to ' + esc(body.to.join(", ")) + "</div>";
          var ch = o.htmlBody.replace(/<body[^>]*>/i, function (m) { return m + note; }); if (ch === o.htmlBody) ch = note + ch;
          ch = /<\/body>/i.test(ch) ? ch.replace(/<\/body>/i, pixel_(cid) + "</body>") : ch + pixel_(cid);
          var cb = JSON.parse(JSON.stringify(body)); cb.to = [c]; cb.html = ch; cb.text = "Team copy: this email was sent to " + body.to.join(", ") + "\n\n" + text; delete cb.bcc;
          try { var cr = UrlFetchApp.fetch("https://api.resend.com/emails", { method: "post", contentType: "application/json", muteHttpExceptions: true, headers: { Authorization: "Bearer " + key }, payload: JSON.stringify(cb) }); cs[cid] = { e: c, ok: cr.getResponseCode() < 300 }; } catch (e) { cs[cid] = { e: c, ok: false }; }
        });
        mlog_({ from: body.from, to: body.to.join(", "), cc: ccl.join(", "), cs: split ? cs : undefined, subject: sub, via: "resend", rid: rid, att: !!o.attachments, k: o.kind || "" }, o.htmlBody || "", lid); return { via: "resend", id: rid };
      }
    } catch (e) {}
  }
  var g = { name: o.sendAs ? o.sendAs.name : o.hr ? HR_NAME : o.join ? JOIN_NAME : FROM_NAME, replyTo: o.sendAs ? o.sendAs.email : o.hr ? (o.fromA || HR_FROM) : o.join ? JOIN_FROM : reply }; if ((o.cc || o.join) && !o.nocc && ccFor_(to, o).length) g.cc = ccFor_(to, o).join(","); if (o.join && lst_("BCC_EMAILS", to).length) g.bcc = lst_("BCC_EMAILS", to).join(","); if (o.htmlBody) g.htmlBody = hpx; if (o.attachments) g.attachments = o.attachments;
  MailApp.sendEmail(to, sub, text, g);
  mlog_({ from: g.name + " (Gmail)", to: String(to), cc: g.cc || "", subject: sub, via: "gmail", rid: "", att: !!o.attachments, k: o.kind || "" }, o.htmlBody || "", lid);
  return { via: "gmail", id: "" };
}
function signJ_() { return '<div class="e-t" style="color:#4A4540;font-size:14.5px;line-height:1.6;margin-top:26px"><b class="e-h" style="color:#17140F">Haritt Group</b><br><span class="e-s" style="color:#8F877C">join@haritt.com</span></div>'; }
// ALIAS_MAP (script property) "harsh.goyal@haritt.com=me@gmail.com,..." : team-only mails go straight to the real inbox (no Cloudflare forward, no spam); mails an applicant also sees keep the @haritt.com address
function alias_(to) { var m = {}; prop_("ALIAS_MAP").split(",").forEach(function (x) { var p = x.split("="); if (p.length === 2 && okEmail_(p[0].trim()) && okEmail_(p[1].trim())) m[p[0].trim().toLowerCase()] = p[1].trim(); }); var l = String(to).split(",").map(function (x) { return x.trim().toLowerCase(); }).filter(String); return l.length && l.every(function (x) { return m[x]; }) ? l.map(function (x) { return m[x]; }).join(",") : to; }
function ccFor_(to, o) { if (o.ccOnly) return o.ccOnly.filter(function (x) { return String(to).toLowerCase().split(",").indexOf(x) < 0; }); return lst_("CC_EMAILS", to).filter(function (x) { return !o.hr || x !== (o.fromA || HR_FROM); }); }
function signP_(p) { return '<div class="i-ink" style="color:#17140F;font-size:15px;font-weight:700;margin-top:22px;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">' + esc(p.name) + '</div><div class="i-sub" style="color:#6B645B;font-size:13.5px;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">' + esc(p.role) + ' · Haritt Group · ' + esc(p.email) + '</div>'; }
function signHR_(w) { w = w || { name: "Simran Jain", role: "HR", email: HR_DESK }; return '<div class="e-t" style="color:#4A4540;font-size:14.5px;line-height:1.6;margin-top:26px"><b class="e-h" style="color:#17140F">' + esc(w.name) + '</b><br><span class="e-s" style="color:#8F877C">' + (w.bare ? esc(w.role) : esc(w.role) + ' · Haritt Group · ' + esc(w.email)) + '</span></div>'; }
/* Admin can pick the sender and the CC list for mails sent from Admin. Only team addresses are allowed. */
var CC_CHOICES = ["hr@haritt.com", "join@haritt.com", "simran.jain@haritt.com", "sanil.bhoir@haritt.com", "harsh.goyal@haritt.com", "pulkit.soni@haritt.com"];
function ccPick_(b) { if (!Array.isArray(b.cc)) return null; return b.cc.map(function (x) { return String(x).toLowerCase().trim(); }).filter(function (x, i, a) { return CC_CHOICES.indexOf(x) >= 0 && a.indexOf(x) === i; }); }
function sender_(id) { return SENDERS.filter(function (x) { return x.id === id; })[0] || null; }
function lst_(k, to) { var t = String(to || "").toLowerCase().split(","); return prop_(k).split(",").map(function (x) { return x.trim().toLowerCase(); }).filter(function (x) { return okEmail_(x) && t.indexOf(x) < 0; }).slice(0, 8); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); }
function shell_(label, title, inner) {
  var F = 'font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;';
  return '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><style>:root{color-scheme:light dark}u+.body .gm-s{background:#000;mix-blend-mode:screen}u+.body .gm-d{background:#000;mix-blend-mode:difference}' +
    '@media (max-width:620px){.e-px{padding-left:22px!important;padding-right:22px!important}.e-ttl{font-size:24px!important}}' +
    '@media (prefers-color-scheme:dark){.e-bg{background:#0B0A09!important}.e-card{background:#181614!important;box-shadow:none!important;border-color:#2A2623!important}.e-h,.e-v{color:#F4F1EC!important}.e-t{color:#CFC8BE!important}.e-s,.e-k{color:#8F877C!important}.e-a{color:#F4F1EC!important;text-decoration-color:#C9A99A!important}' +
    '.e-tile{background:#211E1B!important;border-color:#332E29!important}.e-ft{background:#141210!important;border-color:#2A2623!important}.e-num{background:#2A1717!important;color:#F08A8A!important;border-color:#7A3A3A!important}.e-code{color:#F08A8A!important}.e-lbl{color:#A59D92!important}.e-bd{border-color:#332E29!important}.e-bar{background:#F08A8A!important}}</style></head>' +
    '<body class="e-bg body" style="margin:0;padding:0;background:#EFEAE4"><table class="e-bg" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEAE4;padding:32px 12px"><tr><td align="center">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;' + F + '">' +
    '<tr><td class="e-card" style="background:#FFFFFF;border-radius:22px;overflow:hidden;border:1px solid #E7E0D7;box-shadow:0 18px 50px rgba(50,30,15,.10)">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="e-px" style="background:#16110F;background-image:linear-gradient(125deg,#16110F 0%,#2B0B0B 55%,#7A0C0C 100%);padding:22px 36px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="' + LOGO + '" width="36" height="36" alt="Haritt Group" style="display:block;border:0"></td>' +
    '<td style="padding-left:12px;vertical-align:middle;color:#FFFFFF;font-size:12px;font-weight:700;letter-spacing:.26em;' + F + '"><span class="gm-s"><span class="gm-d">HARITT GROUP</span></span></td></tr></table></td>' +
    '<td align="right" style="vertical-align:middle"><span style="display:inline-block;border:1px solid rgba(255,255,255,.22);border-radius:99px;padding:5px 12px;color:#F3D9D9;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;' + F + '"><span class="gm-s"><span class="gm-d">' + label + '</span></span></span></td></tr></table></td></tr>' +
    '<tr><td class="e-px" style="padding:36px 40px 6px"><div class="e-bar" style="width:34px;height:3px;border-radius:3px;background:#8B0D0D;margin-bottom:16px"></div>' +
    '<div class="e-h e-ttl" style="color:#14100E;font-size:28px;line-height:1.25;font-weight:800;letter-spacing:-.015em">' + title + '</div></td></tr>' +
    '<tr><td class="e-px" style="padding:14px 40px 36px">' + inner + '</td></tr>' +
    '<tr><td class="e-ft e-px" style="background:#FAF7F3;border-top:1px solid #EEE7DF;padding:20px 40px"><div class="e-s" style="color:#8F877C;font-size:12px;line-height:1.7">' +
    '<b class="e-v" style="color:#3D3730">Haritt Group</b> · <a href="https://haritt.com" style="color:#8F877C;text-decoration:underline">haritt.com</a><br>Behind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001<br>Jaipur · Bharatpur · Remote-first</div></td></tr></table>' +
    '</td></tr><tr><td align="center" class="e-s" style="padding:18px 8px 0;color:#A39A8F;font-size:11.5px;' + F + '">This is a private message from Haritt Group. Please do not forward it.</td></tr>' +
    "</table></td></tr></table></body></html>";
}
function btn_(href, label) { return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px"><tr><td style="border-radius:12px;background:#8B0D0D;background-image:linear-gradient(180deg,#A3151B 0%,#7E0B0B 100%);box-shadow:0 8px 20px rgba(139,13,13,.28)"><a href="' + href + '" style="display:inline-block;padding:15px 30px;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:.01em"><span class="gm-s"><span class="gm-d">' + label + ' &nbsp;&rarr;</span></span></a></td></tr></table>'; }
function steps_(list) {
  return '<div class="e-lbl" style="color:#9A8F84;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin:30px 0 10px">What happens next</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    list.map(function (t, i) { return '<tr><td style="width:40px;padding:6px 0;vertical-align:top"><div class="e-num" style="width:26px;height:26px;border-radius:50%;border:1.5px solid #E2BDBD;background:#FBF1F1;color:#8B0D0D;font-size:12px;font-weight:800;line-height:26px;text-align:center">' + (i + 1) + '</div></td><td class="e-t" style="padding:9px 0 6px;color:#2E2925;font-size:14.5px;line-height:1.45;vertical-align:top">' + t + "</td></tr>"; }).join("") + "</table>";
}
function tile_(title, sub) { return '<table class="e-tile" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;background:#FBF8F5;border:1px solid #EEE7DF;border-radius:16px"><tr><td style="padding:16px 18px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:44px;vertical-align:middle"><img src="' + LOGO + '" width="44" height="44" alt="" style="display:block;border:0;border-radius:12px"></td><td style="padding-left:14px;vertical-align:middle"><div class="e-v" style="color:#14100E;font-size:15.5px;font-weight:700;line-height:1.35">' + esc(title) + '</div><div class="e-s" style="color:#8F877C;font-size:13px;margin-top:3px">' + sub + "</div></td></tr></table></td></tr></table>"; }
function txt_(h) { return '<div class="e-t" style="color:#4A4540;font-size:15.5px;line-height:1.7">' + h + "</div>"; }
function small_(h) { return '<div class="e-s" style="color:#8F877C;font-size:13px;line-height:1.65;margin-top:22px">' + h + "</div>"; }

/* ---------- open positions + applications (haritt.com/join) ---------- */
var POS_DEFAULT = [
  { id: "coo", lv: "Co-founder", t: "Chief Operating Officer (COO)", full: "Co-founder & Chief Operating Officer (COO)", level: "Founding Team / Co-founder", open: true, mode: "Remote · flexible hours",
    sum: "Lead data, technology and client delivery.",
    own: ["Data and technology: the health of every product and website, what works, what breaks, speed and security.", "Quality: bugs and priorities with our development team, and a quality check before anything goes live.", "Data and analytics: clear dashboards for users, clients, projects and growth, and decisions based on numbers.", "Client portal and Workspace: how they work for clients and what to improve next.", "Clients: join client calls, answer their questions and turn their needs into clear plans.", "Tools and process: keep every department connected, and use AI or machine learning where it genuinely helps.", "Everything else a founder does: we are a small team, so you also help with launches, marketing, sales and support whenever needed."],
    fit: ["A background in data analytics, machine learning, technology or business", "You can talk to clients with confidence and turn business needs into clear plans", "You think in systems. No coding needed; our developers build, you make sure the right thing is built and works"],
    grow: "Co-founder level means the same responsibility as the founders for your area, and a say in where Haritt goes. Your title is confirmed at the Day 10 review." },
  { id: "pqi", lv: "Founding Team", t: "Product Quality & Insights", full: "Founding Team · Product Quality & Insights", level: "Founding Team", open: true, mode: "Remote · flexible hours",
    sum: "Test products. Turn feedback into insights.",
    own: ["Test new features and releases on phone and web before they go live.", "Report bugs clearly with steps and screenshots, and check the fix.", "Collect feedback from students and clients, and turn it into short weekly insights."],
    fit: ["Curious, careful and honest", "Comfortable with apps, spreadsheets and simple data", "Students and freshers are welcome"],
    grow: "Can grow into a larger product role based on behaviour and results." }];
var BGS = ["Data / ML", "Software / Tech", "Business / Sales", "Marketing / Design", "Student", "Other"], NOWS = ["Working", "Student", "Own business", "Looking for work", "Other"], SRCS = ["Friend or someone at Haritt", "Instagram", "LinkedIn", "Website", "Other"];
function posFile_() { var it = folder_().getFilesByName("positions.json"); return it.hasNext() ? it.next() : null; }
function posAll_() { var c = CacheService.getScriptCache(), h = c.get("pos"); if (h) try { return JSON.parse(h); } catch (e) {} var l = posRead_(); try { c.put("pos", JSON.stringify(l), 600); } catch (e) {} return l; }
function posRead_() { var f = posFile_(); if (!f) return POS_DEFAULT; try { return JSON.parse(f.getBlob().getDataAsString()); } catch (e) { return POS_DEFAULT; } }
function posPut_(list) { CacheService.getScriptCache().remove("pos"); var f = posFile_(), t = JSON.stringify(list); if (f) f.setContent(t); else folder_().createFile("positions.json", t, MimeType.PLAIN_TEXT); }
function posPub_(p) { return { id: p.id, lv: p.lv, t: p.t, full: p.full, sum: p.sum, own: p.own, fit: p.fit, grow: p.grow, mode: p.mode }; }
function positions_() { return { ok: true, positions: posAll_().filter(function (p) { return p.open; }).map(posPub_) }; }
function posList_(b) { if (!who_(b)) return { ok: false, error: "login" }; return { ok: true, positions: posAll_(), levels: LEVELS }; }
function lines_(v, n) { return (Array.isArray(v) ? v : String(v || "").split("\n")).map(function (x) { return s_(x, 300); }).filter(String).slice(0, n); }
function posSave_(b) {
  if (!who_(b)) return { ok: false, error: "login" };
  var p = b.p || {}, list = posAll_(), id = /^[a-z0-9-]{2,24}$/.test(String(p.id || "")) ? p.id : "p" + Date.now().toString(36);
  var lv = s_(p.lv, 40), t = s_(p.t, 80); if (!lv || !t) return { ok: false, error: "fields" };
  var o = { id: id, lv: lv, t: t, full: s_(p.full, 120) || lv + " · " + t, level: LEVELS.indexOf(p.level) >= 0 ? p.level : LEVELS[1], open: !!p.open, mode: s_(p.mode, 60) || "Remote · flexible hours",
    sum: s_(p.sum, 160), own: lines_(p.own, 12), fit: lines_(p.fit, 8), grow: s_(p.grow, 400) };
  var i = list.map(function (x) { return x.id; }).indexOf(id); if (i >= 0) list[i] = o; else list.push(o);
  posPut_(list); return { ok: true, positions: list };
}
function posDel_(b) { if (!who_(b)) return { ok: false, error: "login" }; var list = posAll_().filter(function (x) { return x.id !== b.id; }); posPut_(list); return { ok: true, positions: list }; }

function okAp_(id) { return /^HG-AP-\d{4}-[A-Z0-9]{4}$/.test(String(id || "")); }
function newAp_() { var C = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "", i; for (i = 0; i < 4; i++) s += C[Math.floor(Math.random() * C.length)]; return "HG-AP-" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyMM") + "-" + s; }
function loadAp_(id) { if (!okAp_(id)) return null; var it = folder_().getFilesByName(id + ".json"); if (!it.hasNext()) return null; var f = it.next(); return { file: f, d: JSON.parse(f.getBlob().getDataAsString()) }; }
function pick_(v, list) { return list.indexOf(v) >= 0 ? v : ""; }
function apply_(b) {
  if (b.website) return { ok: true, id: "HG-AP-0000-0000" };                       // honeypot: bots fill the hidden field
  var c = CacheService.getScriptCache(), em = s_(b.email, 200).toLowerCase();
  var pos = posAll_().filter(function (p) { return p.open && p.id === b.pos; })[0];
  var a = { name: s_(b.name, 80), email: em, phone: s_(b.phone, 20).replace(/[^0-9+ ]/g, ""), city: s_(b.city, 60), bg: pick_(b.bg, BGS), now: pick_(b.now, NOWS), src: pick_(b.src, SRCS),
    why: s_(b.why, 1500), proud: s_(b.proud, 1500), link: /^https?:\/\/\S+$/.test(s_(b.link, 300)) ? s_(b.link, 300) : "" };
  if (!pos) return { ok: false, error: "position" };
  if (a.name.length < 2 || !okEmail_(em) || a.phone.replace(/\D/g, "").length < 10 || a.why.length < 10) return { ok: false, error: "fields" };
  if (c.get("ap:" + em)) return { ok: false, error: "already" };
  var n = +(c.get("ap:n") || 0); if (n > 60) return { ok: false, error: "busy" }; c.put("ap:n", String(n + 1), 3600);
  var id = newAp_(); while (loadAp_(id)) id = newAp_();
  var d = { id: id, created: now_(), status: "new", pos: { id: pos.id, full: pos.full, level: pos.level, sum: pos.sum }, a: a, note: "", ag: "", log: [] };
  log_(d, "", "applied", "");
  folder_().createFile(id + ".json", JSON.stringify(d), MimeType.PLAIN_TEXT); bust_();
  c.put("ap:" + em, id, 21600);
  try { apMail_(d); } catch (e) {}
  try { apTeam_(d); } catch (e) {}
  return { ok: true, id: id };
}
/* invite someone the team already spoke to: one email with a personal link to the application form (name, email and position filled in) */
function inviteLink_(name, email, posId) { return "https://haritt.com/join/?n=" + encodeURIComponent(name) + "&e=" + encodeURIComponent(email) + (posId ? "&p=" + encodeURIComponent(posId) : "") + "#apply"; }
function inviteHtml_(name, pos, link, who) {
  who = who || SENDERS[0];
  /* same look as haritt.com/join: cream page, big headline, black pill button. Solid colours only, so Gmail and Apple Mail dark modes turn it dark cleanly. */
  var F = "font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;", D = "font-family:Sora,Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;";
  var first = esc(String(name).split(" ")[0]), px = "padding-left:40px;padding-right:40px;";
  var eb = function (t) { return '<div class="i-red" style="color:#A70D22;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;' + F + '">' + t + "</div>"; };
  var step = function (n, t, d, last) { return '<tr><td style="width:44px;vertical-align:top;padding:0 0 ' + (last ? 0 : 22) + 'px"><div class="i-num" style="width:30px;height:30px;line-height:28px;border:1.5px solid #A70D22;border-radius:50%;text-align:center;color:#A70D22;font-size:12px;font-weight:700;' + F + '">' + n + '</div></td><td style="vertical-align:top;padding:4px 0 ' + (last ? 0 : 22) + 'px"><div class="i-ink" style="color:#17140F;font-size:16px;font-weight:700;' + D + '">' + t + '</div><div class="i-sub" style="color:#6B645B;font-size:14.5px;line-height:1.55;margin-top:2px;' + F + '">' + d + "</div></td></tr>"; };
  return '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">' +
    '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600&display=swap" rel="stylesheet"><style>:root{color-scheme:light dark}' +
    '@media (max-width:620px){.i-px{padding-left:18px!important;padding-right:18px!important}.i-h{font-size:31px!important}.i-btn{display:block!important;text-align:center!important}}' +
    '@media (prefers-color-scheme:dark){.i-bg{background:#12100E!important}.i-alt{background:#1B1814!important}.i-wh{background:#16130F!important}.i-ink{color:#F4F1EC!important}.i-sub{color:#A8A097!important}.i-red{color:#F08A8A!important}.i-num{color:#F08A8A!important;border-color:#F08A8A!important}' +
    '.i-line{border-color:#2A2622!important}.i-btnc{background:#F4F1EC!important}.i-btn{color:#17140F!important}.i-ft{color:#7E776E!important}}</style></head>' +
    '<body class="i-bg" style="margin:0;padding:0;background:#F6F1EA"><table class="i-bg" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EA"><tr><td align="center" style="padding:0 0 30px">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">' +
    /* header: dark card image (same in light and dark mode) */
    '<tr><td style="padding:0 0 22px"><img src="https://haritt.com/join/mail/invite-card.jpg?v=2" width="600" alt="Haritt Group · Invitation" style="display:block;width:100%;height:auto;border:0"></td></tr>' +
    /* hero */
    '<tr><td class="i-px" style="' + px + 'padding-top:10px;padding-bottom:28px">' + eb("Invitation to apply") +
    '<div class="i-h i-ink" style="color:#17140F;font-size:36px;line-height:1.1;font-weight:600;letter-spacing:-.035em;margin-top:14px;' + D + '">Hi ' + first + ',<br><span class="i-red" style="color:#A70D22">you are invited to apply.</span></div>' +
    '<div class="i-sub" style="color:#6B645B;font-size:16.5px;line-height:1.6;margin-top:18px;' + F + '">Thank you for speaking with us. As discussed, please complete your application using the link below. It takes about 5 minutes, and your details are already filled in.</div>' +
    '</td></tr>' +
    (pos ? '<tr><td class="i-px" style="' + px + 'padding-top:0;padding-bottom:36px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="i-line" style="border-top:1px solid #E3DACE;border-bottom:1px solid #E3DACE"><tr><td style="padding:16px 0">' +
      '<div class="i-sub" style="color:#8A8278;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;' + F + '">Position offered</div>' +
      '<div class="i-ink" style="color:#17140F;font-size:17px;font-weight:600;letter-spacing:-.015em;margin-top:4px;' + D + '">' + esc(pos.full) + "</div>" +
      "</td></tr></table></td></tr>" : "") +
    '<tr><td class="i-px" style="' + px + 'padding-top:0;padding-bottom:8px">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:0"><tr><td class="i-btnc" style="background:#17140F;border-radius:99px"><a class="i-btn" href="' + link + '" style="display:inline-block;padding:16px 30px;color:#FFFFFF;font-size:15.5px;font-weight:600;text-decoration:none;border-radius:99px;' + F + '">Start your application &nbsp;&rarr;</a></td></tr></table></td></tr>' +
    /* sign + link */
    '<tr><td class="i-px" style="' + px + 'padding-top:32px;padding-bottom:8px"><div class="i-sub" style="color:#6B645B;font-size:14.5px;line-height:1.6;' + F + '">If you have any questions, just reply to this email.</div>' +
    signP_(who) +
    "</td></tr></table></td></tr>" +
    /* footer band: a different shade so it reads as secondary */
    '<tr><td class="i-alt" align="center" style="background:#ECE3D6;padding:0"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><tr><td class="i-px" style="' + px + 'padding-top:24px;padding-bottom:26px">' +
    '<div class="i-ft" style="color:#8A8278;font-size:12px;line-height:1.7;' + F + '"><b class="i-ink" style="color:#3D3730">Haritt Group</b> · <a class="i-ft" href="https://haritt.com" style="color:#8A8278;text-decoration:underline">haritt.com</a><br>Behind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001<br>Jaipur · Bharatpur · Remote-first</div>' +
    '<div class="i-ft" style="color:#9A9287;font-size:11.5px;line-height:1.6;margin-top:14px;word-break:break-all;' + F + '">This link is personal to you. Button not working? Open:<br>' + esc(link) + "</div></td></tr></table></td></tr>" +
    "</table></body></html>";
}
function applyInvite_(b) {
  var by = who_(b); if (!by) return { ok: false, error: "login" };
  var name = s_(b.name, 80), email = s_(b.email, 200).toLowerCase(); if (name.length < 2 || !okEmail_(email)) return { ok: false, error: "fields" };
  var pos = b.pos ? posAll_().filter(function (p) { return p.id === b.pos; })[0] : null, link = inviteLink_(name, email, pos ? pos.id : "");
  var who = SENDERS.filter(function (x) { return x.id === b.from; })[0] || SENDERS[0];
  var subj = "Invitation to apply" + (pos ? ": " + pos.full : "") + " · Haritt Group", html = inviteHtml_(name, pos, link, who);
  var sent = mail_(email, subj, "Hi " + name.split(" ")[0] + ",\n\nThank you for your time speaking with us. As discussed, please complete your application using the link below. It takes about 5 minutes, and your details are already filled in.\n\n" + (pos ? "Position: " + pos.full + "\n" : "") + "Apply here: " + link + "\n\n" + who.name + "\n" + who.role + ", Haritt Group",
    { join: true, hr: true, fromA: who.email, ccOnly: (ccPick_(b) || [HR_DESK]).filter(function (x) { return x !== who.email; }), htmlBody: html });
  return { ok: true, mail: sent || null };
}
/* sent email log (Admin > Joining > Sent emails): every mail this script sends, plus recent ones from the Resend account (codes from the edge, other scripts) */
function mlFile_(n) { var it = folder_().getFilesByName(n); return it.hasNext() ? it.next() : null; }
function mlRead_(n, def) { var f = mlFile_(n); if (!f) return def; try { return JSON.parse(f.getBlob().getDataAsString()) || def; } catch (e) { return def; } }
function mlPut_(n, v) { var f = mlFile_(n), t = JSON.stringify(v); if (f) f.setContent(t); else folder_().createFile(n, t, MimeType.PLAIN_TEXT); }
function mlId_() { return "ML-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1296).toString(36).toUpperCase(); }
// "Seen": a 1px image in each HTML email points back to this script (?o=<log id>). First open time, last open and count are saved in mail-log.json.
// Limits: shows only when the reader's app loads images; Apple Mail may load it on delivery (privacy feature), so "Opened" is a strong hint, not proof.
function pixel_(id) { var u = ""; try { u = ScriptApp.getService().getUrl() || ""; } catch (e) {} u = prop_("PIXEL_URL") || u; return u ? '<img src="' + u + "?o=" + id + '" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;opacity:0">' : ""; }
function seen_(id) {
  if (!/^ML-[A-Z0-9]{6,20}$/.test(id)) return; var lock = LockService.getScriptLock(); if (!lock.tryLock(8000)) return;
  try { var l = mlRead_("mail-log.json", []), x = l.filter(function (r) { return r.id === id; })[0], t = now_();
    if (!x) { var m = l.filter(function (r) { return r.cs && r.cs[id]; })[0]; if (!m) return; x = m.cs[id]; } if (!x.seen) x.seen = t; x.seenLast = t; x.seenN = (x.seenN || 0) + 1; mlPut_("mail-log.json", l); ping_("seen"); } catch (e) {} finally { lock.releaseLock(); }
}
function mlog_(r, html, lid) {
  try {
    var id = lid || mlId_(); r.id = id; r.at = now_();
    var l = mlRead_("mail-log.json", []); l.unshift(r); mlPut_("mail-log.json", l.slice(0, 600));
    if (html) { var h = mlRead_("mail-html.json", {}), keep = l.slice(0, 120).map(function (x) { return x.id; }), o = {}; o[id] = html; keep.forEach(function (k) { if (h[k]) o[k] = h[k]; }); mlPut_("mail-html.json", o); }
    ping_("mail");
  } catch (e) {}
}
function mailsList_(b) {
  if (!who_(b)) return { ok: false, error: "login" };
  var l = mlRead_("mail-log.json", []).slice(0, 200), key = prop_("RESEND_KEY"), seen = {}, ev = {};
  if (key) try {
    var r = UrlFetchApp.fetch("https://api.resend.com/emails?limit=100", { headers: { Authorization: "Bearer " + key }, muteHttpExceptions: true });
    if (r.getResponseCode() === 200) (JSON.parse(r.getContentText()).data || []).forEach(function (x) { ev[x.id] = x; });
  } catch (e) {}
  l.forEach(function (x) { if (x.rid) { seen[x.rid] = 1; if (ev[x.rid]) x.status = ev[x.rid].last_event || ""; } if (!x.status) x.status = x.via === "gmail" ? "sent_gmail" : "sent"; x.src = "script"; });
  Object.keys(ev).forEach(function (k) { if (seen[k]) return; var x = ev[k]; l.push({ id: "RS-" + k, rid: k, at: String(x.created_at || "").replace(" ", "T").replace(/\+00$/, "Z"), from: x.from || "", to: (x.to || []).join(", "), cc: (x.cc || []).join(", "), subject: x.subject || "", status: x.last_event || "sent", via: "resend", src: "resend" }); });
  l.sort(function (a, c) { return String(a.at) < String(c.at) ? 1 : -1; });
  return { ok: true, rows: l.slice(0, 250) };
}
function mailView_(b) {
  if (!who_(b)) return { ok: false, error: "login" };
  var id = String(b.id || ""), x = mlRead_("mail-log.json", []).filter(function (r) { return r.id === id; })[0], rid = x ? x.rid : id.indexOf("RS-") === 0 ? id.slice(3) : "";
  var h = x ? mlRead_("mail-html.json", {})[id] : "";
  if (!h && rid && prop_("RESEND_KEY")) try { var r = UrlFetchApp.fetch("https://api.resend.com/emails/" + encodeURIComponent(rid), { headers: { Authorization: "Bearer " + prop_("RESEND_KEY") }, muteHttpExceptions: true }); if (r.getResponseCode() === 200) { var j = JSON.parse(r.getContentText()); h = j.html || (j.text ? "<pre style='white-space:pre-wrap;font:14px/1.6 -apple-system,Segoe UI,Arial'>" + esc(j.text) + "</pre>" : ""); } } catch (e) {}
  if (!h) return { ok: false, error: "gone" };
  return { ok: true, html: h };
}
/* Gmail Sent copy: mails sent by Resend from your own official ID are added to your own Gmail "Sent" folder by the admin page (Gmail API insert, your Google sign-in).
   gmail_pending: last 14 days, from the signed-in person's own IDs, not yet copied; returns the full email (MIME, base64url) without the open-tracking image. gmail_mark: saves which were copied. */
function gmMine_(b) { var by = who_(b); if (!by) return null; var ids = myIds_(by); return SENDERS.filter(function (s) { return ids.indexOf(s.id) >= 0; }).map(function (s) { return s.email; }); }
function gmB64_(t) { return Utilities.base64Encode(Utilities.newBlob(String(t)).getBytes()); }
function gmHdr_(t) { return /^[\x20-\x7e]*$/.test(t) ? t : "=?UTF-8?B?" + gmB64_(t) + "?="; }
function gmAddr_(t) { return String(t || "").replace(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/, function (m, n, e) { return (n ? gmHdr_(n) + " " : "") + "<" + e + ">"; }); }
function gmailPending_(b) {
  var mine = gmMine_(b); if (!mine) return { ok: false, error: "login" };
  var cut = new Date(Date.now() - 14 * 864e5).toISOString(), h = mlRead_("mail-html.json", {}), out = [], wait = 0;
  mlRead_("mail-log.json", []).forEach(function (r) {
    var fe = (String(r.from || "").match(/<([^>]+)>/) || [0, r.from])[1].trim().toLowerCase();
    if (r.gs || r.via !== "resend" || String(r.at) < cut || mine.indexOf(fe) < 0 || !h[r.id]) return;
    wait++; if (out.length >= 15) return;
    var html = String(h[r.id]).replace(/<img[^>]*\?o=ML-[^>]*>/g, ""), d = new Date(r.at);
    var mime = ["From: " + gmAddr_(r.from), "To: " + String(r.to || "").split(/\s*,\s*/).map(gmAddr_).join(", ")].concat(r.cc ? ["Cc: " + String(r.cc).split(/\s*,\s*/).map(gmAddr_).join(", ")] : [])
      .concat(["Subject: " + gmHdr_(r.subject || ""), "Date: " + Utilities.formatDate(d, "GMT", "EEE, dd MMM yyyy HH:mm:ss") + " +0000", "Message-ID: <" + r.id + "@haritt.com>", "MIME-Version: 1.0", "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64", "", gmB64_(html).replace(/(.{76})/g, "$1\r\n")]).join("\r\n");
    out.push({ id: r.id, subject: r.subject || "", at: r.at, att: !!r.att, raw: Utilities.base64EncodeWebSafe(Utilities.newBlob(mime).getBytes()).replace(/=+$/, "") });
  });
  return { ok: true, mine: mine.length, wait: wait, rows: out };
}
function gmailMark_(b) {
  var mine = gmMine_(b); if (!mine) return { ok: false, error: "login" };
  var ids = (b.ids || []).map(String), l = mlRead_("mail-log.json", []), t = now_(), n = 0;
  l.forEach(function (r) { var fe = (String(r.from || "").match(/<([^>]+)>/) || [0, r.from])[1].trim().toLowerCase(); if (ids.indexOf(r.id) >= 0 && mine.indexOf(fe) >= 0 && !r.gs) { r.gs = t; n++; } });
  if (n) mlPut_("mail-log.json", l); return { ok: true, marked: n };
}
/* Team email notice: tells a team member their official @haritt.com ID is ready. Run sendPulkitEmailNotice once from the editor (Run). */
function sendPulkitEmailNotice() { return teamEmailNotice_("Pulkit Soni", "pulkit.soni@haritt.com", "pulkit@haritt.com"); }
function aliasOf_(em) { var r = ""; prop_("ALIAS_MAP").split(",").forEach(function (x) { var p = x.split("="); if (p.length === 2 && p[0].trim().toLowerCase() === em) r = p[1].trim(); }); return r; }
function teamEmailNotice_(name, em, old) {
  var first = esc(name.split(" ")[0]), pers = aliasOf_(em);
  var lbl = function (t, l) { return steps_(l).replace("What happens next", t); };
  var kv = '<table class="e-tile" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;background:#FBF8F5;border:1px solid #EEE7DF;border-radius:14px"><tr><td style="padding:10px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    kv_("Official email", "<b>" + esc(em) + "</b>") + (pers ? kv_("Arrives in", esc(pers)) : "") + (old ? kv_("Old email, still works", esc(old)) : "") + kv_("Name on mails", esc(name)) + "</table></td></tr></table>";
  var inner = txt_("From today, <b>" + esc(em) + "</b> is your official Haritt Group email. This is your one working email for the company.") + kv +
    lbl("Use only this email for work", ["Every email you send on behalf of Haritt Group goes from " + esc(em) + ". Please do not use any personal email ID for company work.", "All conversations with clients, partners, vendors and the team happen on this ID, so the company has a full record.", "Share only this ID on documents, proposals, LinkedIn and anywhere you represent Haritt Group.", (old ? "Your old ID " + esc(old) + " still works, but please share only the new one." : "If someone writes to your personal email about work, reply from this ID.")]) +
    lbl("Keep notifications on", ["Emails to " + esc(em) + " arrive straight in your Gmail" + (pers ? " (" + esc(pers) + ")" : "") + ". Nothing new to open.", "Gmail app on your phone: Settings &gt; your account &gt; <b>Notifications: All</b>. Also allow Gmail notifications in your phone settings.", "Please check and reply quickly, the same day at the latest. We do not want any delay on client or team emails."]) +
    lbl("Send emails as " + esc(em), ["Receiving already works. To also send and reply from " + esc(em) + ", do a one-time setup in Gmail on a laptop (about 10 minutes).", "Open the step-by-step guide below. It has pictures for every step and fills in your details.", "The password for the setup comes to you separately as a WhatsApp message from the team.", "After setup, make " + esc(em) + " your default and always check the From line before sending."]) +
    btn_("https://haritt.com/view/email-setup/?n=" + encodeURIComponent(name) + "&e=" + encodeURIComponent(em) + (pers ? "&g=" + encodeURIComponent(pers) : ""), "Open setup guide") +
    small_("Please reply to this email once you get it, so we know it is working. For any help, write to harsh.goyal@haritt.com.") +
    '<div class="e-t" style="color:#4A4540;font-size:14.5px;line-height:1.6;margin-top:26px"><b class="e-h" style="color:#17140F">Team Haritt Group</b><br><span class="e-s" style="color:#8F877C">team@haritt.com</span></div>';
  var text = "Hi " + name.split(" ")[0] + ",\n\nFrom today, " + em + " is your official Haritt Group email. This is your one working email for the company.\n\nUse only this email for work:\n- Every email you send on behalf of Haritt Group goes from " + em + ". Do not use any personal email ID for company work.\n- All conversations with clients, partners, vendors and the team happen on this ID.\n" + (old ? "- Your old ID " + old + " still works, but please share only the new one.\n" : "") +
    "\nKeep notifications on:\n- Emails arrive straight in your Gmail" + (pers ? " (" + pers + ")" : "") + ".\n- Gmail app: Settings > your account > Notifications: All.\n- Please reply quickly, the same day at the latest.\n\nSend as " + em + ": follow the step-by-step guide: https://haritt.com/view/email-setup/?n=" + encodeURIComponent(name) + "&e=" + encodeURIComponent(em) + "\n\nPlease reply once you get it. For help: harsh.goyal@haritt.com\n\nTeam Haritt Group";
  return mail_(em, "Your official Haritt email: " + em, text, { cc: true, noalias: true, ccOnly: ["hr@haritt.com", "harsh.goyal@haritt.com"], htmlBody: shell_("Team email", "Hi " + first + ", your official email is ready", inner) });
}
// Admin > Onboarding > Emails > New email: any team email in the Haritt Group design (from a desk or a team member's official ID, CC chosen in admin)
var CM_FROM = { team: { name: "Haritt Group", email: "team@haritt.com", sign: "Team Haritt Group" }, hr: { name: "Haritt Group", email: "hr@haritt.com", sign: "HR · Haritt Group" }, join: { name: "Haritt Group", email: "join@haritt.com", sign: "Team Haritt Group" } };
// Which official IDs the signed-in person owns: their Google email is the official ID, or ALIAS_MAP sends that ID to their Gmail
var OWNER_H = "a12e151dbc54e9669ffdf5fc814ac7413e7353541e25e934ba6cb9e8df8ae757";   // SHA-256 of the founder's admin login (no email stored in code)
function sha_(t) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(t || ""), Utilities.Charset.UTF_8).map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join(""); }
function myIds_(by) { var m = {}; prop_("ALIAS_MAP").split(",").forEach(function (x) { var q = x.split("="); if (q.length === 2) m[q[0].trim().toLowerCase()] = q[1].trim().toLowerCase(); }); by = String(by || "").toLowerCase(); var fe = prop_("FOUNDER_EMAIL").toLowerCase(), hh = sha_(by); return SENDERS.filter(function (s) { return s.email === by || m[s.email] === by || (s.id === "harsh" && ((fe && fe === by) || hh === OWNER_H)); }).map(function (s) { return s.id; }); }
function composeFrom_(b) { var by = who_(b); if (!by) return { ok: false, error: "login" }; return { ok: true, from: SENDERS.filter(function (s) { return myIds_(by).indexOf(s.id) >= 0; }).map(function (s) { return { id: s.id, name: s.name, email: s.email }; }) }; }
/* person-to-person "letter" look: white page, small logo, simple text, signature card, light footer (no dark header, no heavy cards) */
function plainHtml_(b, info, secs, f, p, bu) {
  var F = "font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
  var P = function (h) { return '<p class="l-t" style="margin:0 0 14px;color:#2B2724;font-size:15px;line-height:1.7">' + h + "</p>"; }, out = "";
  String(b.intro || "").split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(String).slice(0, 12).forEach(function (x) { out += P(cmTxt_(x)); });
  if (info.length) out += '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;border-left:3px solid #8B0D0D"><tr><td class="l-t" style="padding:2px 0 2px 14px;color:#2B2724;font-size:14.5px;line-height:1.8">' + info.map(function (x) { return '<span class="l-s" style="color:#8F877C">' + cmTxt_(x[0]) + ":</span> <b>" + cmTxt_(x[1]) + "</b>"; }).join("<br>") + "</td></tr></table>";
  secs.forEach(function (x) { out += (x.t ? '<p class="l-r" style="margin:22px 0 8px;color:#8B0D0D;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">' + esc(x.t) + "</p>" : "") + '<ol class="l-t" style="margin:0 0 14px;padding-left:22px;color:#2B2724;font-size:15px;line-height:1.65">' + x.p.map(function (l) { return '<li style="margin:0 0 7px;padding-left:2px">' + cmTxt_(l) + "</li>"; }).join("") + "</ol>"; });
  if (b.bt && bu) out += P('<a href="' + esc(bu) + '" style="color:#8B0D0D;font-weight:700">' + esc(s_(b.bt, 60)) + " &rarr;</a>");
  if (b.note) out += P(cmTxt_(b.note));
  if (b.sign !== false) { var nm = f ? f.sign : p.name, rl = f ? f.email : (p.bare ? p.role : p.role + ", Haritt Group");
    out += '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 0"><tr><td style="padding-right:12px;vertical-align:middle"><img src="https://haritt.com/join/agreement/hg-3d.png" width="40" height="40" alt="Haritt Group" style="display:block;border-radius:50%"></td><td class="l-ft" style="vertical-align:middle;border-left:2px solid #8B0D0D;padding-left:12px"><div class="l-h" style="color:#17140F;font-size:15px;font-weight:700">' + esc(nm) + '</div><div class="l-s" style="color:#8F877C;font-size:13px">' + esc(rl) + '</div><div style="font-size:13px"><a href="https://haritt.com" style="color:#8B0D0D;text-decoration:none;font-weight:600">haritt.com</a></div></td></tr></table>'; }
  out = out.replace(/ class="e-a" style="[^"]*"/g, ' style="color:#8B0D0D;font-weight:700"');
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><style>@media (prefers-color-scheme:dark){.l-bg{background:#121110!important}.l-t,.l-h{color:#EDE8E1!important}.l-s{color:#9C948A!important}.l-r,.l-bg a{color:#F0A0A0!important}.l-ft{color:#7E776E!important;border-top-color:#2A2623!important}}</style></head>' +
    '<body class="l-bg" style="margin:0;padding:0;background:#FFFFFF"><table class="l-bg" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF"><tr><td align="center" style="padding:28px 18px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;' + F + '"><tr><td style="padding:0 0 22px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding-right:10px"><img src="https://haritt.com/join/agreement/hg-3d.png" width="28" height="28" alt="" style="display:block;border-radius:50%"></td><td class="l-h" style="color:#17140F;font-size:12px;font-weight:700;letter-spacing:.28em;text-transform:uppercase">Haritt Group</td></tr></table><div style="height:2px;width:36px;background:#8B0D0D;margin-top:14px;line-height:2px;font-size:0">&nbsp;</div></td></tr>' +
    '<tr><td>' + out + '</td></tr>' +
    '<tr><td style="height:34px;line-height:34px;font-size:0">&nbsp;</td></tr><tr><td class="l-ft" style="padding:16px 0 0;border-top:1px solid #EFE9E2;color:#A39A8F;font-size:12px;line-height:1.6">Haritt Group · Behind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001<br>This is a private message from Haritt Group. Please do not forward it.</td></tr>' +
    "</table></td></tr></table></body></html>";
}
/* Team introduction mail (outbox tpl:"team"): b.greet, b.intro, b.team = [{i,n,r,t,d,e,you}], b.note; one card per person, light + dark */
function teamHtml_(b) {
  var F = "font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;", S = "font-family:Sora,Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;", rows = "";
  (Array.isArray(b.team) ? b.team : []).slice(0, 12).forEach(function (m) {
    var em = m.e && /^[a-z0-9._-]+@haritt\.com$/i.test(m.e) ? '<div style="margin-top:8px;font-size:13.5px;' + F + '"><a class="i-red" href="mailto:' + esc(m.e) + '" style="color:#A70D22;text-decoration:none">' + esc(m.e) + "</a></div>" : "";
    var you = m.you ? ' <span class="i-red" style="color:#A70D22;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">&nbsp;&middot; You</span>' : "";
    rows += '<tr><td class="i-px" style="padding:0 40px 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="i-card i-line" style="background:#FFFFFF;border:1px solid #E3DACE;border-radius:18px"><tr><td width="76" valign="top" style="padding:20px 0 20px 20px"><img src="https://haritt.com/join/mail/team/' + esc(String(m.k || "harsh").replace(/[^a-z]/g, "")) + '.png" width="52" height="52" alt="" style="display:block;width:52px;height:52px;border:0;border-radius:15px"></td><td valign="top" style="padding:18px 20px 18px 8px"><div class="i-ink" style="color:#17140F;font-size:17px;font-weight:600;letter-spacing:-.015em;' + S + '">' + esc(s_(m.n, 60)) + you + '</div><div class="i-red" style="color:#A70D22;font-size:13.5px;font-weight:600;margin-top:3px;' + F + '">' + esc(s_(m.r, 80)) + '</div><div class="i-sub" style="color:#8A8278;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-top:2px;' + F + '">' + esc(s_(m.t, 80)) + '</div><div class="i-sub" style="color:#6B645B;font-size:14.5px;line-height:1.55;margin-top:8px;' + F + '">' + esc(s_(m.d, 200)) + "</div>" + em + "</td></tr></table></td></tr>";
  });
  var head = String(b.intro || "").split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(function (x) { return x && !/^Hi [^,\n]*,$/.test(x); })[0] || "";
  return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(s_(b.subject, 120)) + '</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><link href="https://fonts.googleapis.com/css2?family=Sora:wght@600&display=swap" rel="stylesheet"><style>:root{color-scheme:light dark}@media (max-width:620px){.i-px{padding-left:20px!important;padding-right:20px!important}.i-h{font-size:32px!important}}@media (prefers-color-scheme:dark){.i-bg{background:#12100E!important}.i-alt{background:#1B1814!important}.i-card{background:#1B1814!important;border-color:#2A2622!important}.i-ink{color:#F4F1EC!important}.i-sub{color:#A8A097!important}.i-red{color:#F08A8A!important}.i-av{background:#F08A8A!important;color:#12100E!important}.i-line{border-color:#2A2622!important}.i-ft{color:#7E776E!important}}</style></head>' +
    '<body class="i-bg" style="margin:0;padding:0;background:#F6F1EA"><table class="i-bg" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EA"><tr><td align="center" style="padding:0 0 30px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><tr><td style="padding:22px 22px 18px"><img src="https://haritt.com/join/mail/invite-light.jpg" width="556" alt="Haritt Group" style="display:block;width:100%;height:auto;border:0;border-radius:22px"></td></tr>' +
    '<tr><td class="i-px" style="padding:10px 40px 26px"><div class="i-red" style="color:#A70D22;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;' + F + '">Meet the team</div><div class="i-h i-ink" style="color:#17140F;font-size:36px;line-height:1.1;font-weight:600;letter-spacing:-.035em;margin-top:14px;' + S + '">Hi ' + esc(s_(b.greet, 40)) + ',<br><span class="i-red" style="color:#A70D22">welcome to Haritt Group.</span></div><div class="i-sub" style="color:#6B645B;font-size:16.5px;line-height:1.6;margin-top:18px;' + F + '">' + esc(head) + "</div></td></tr>" + rows +
    '<tr><td class="i-px" style="padding:18px 40px 8px"><div class="i-sub" style="color:#6B645B;font-size:14.5px;line-height:1.6;' + F + '">' + esc(s_(b.note, 300)) + '</div><div class="i-ink" style="color:#17140F;font-size:15px;font-weight:700;margin-top:22px;' + F + '">Team Haritt</div><div class="i-sub" style="color:#6B645B;font-size:13.5px;' + F + '">Haritt Group &middot; team@haritt.com</div></td></tr></table></td></tr>' +
    '<tr><td class="i-alt" align="center" style="background:#ECE3D6;padding:0"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><tr><td class="i-px" style="padding:24px 40px 26px"><div class="i-ft" style="color:#8A8278;font-size:12px;line-height:1.7;' + F + '"><b class="i-ink" style="color:#3D3730">Haritt Group</b><br>Behind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001<br>Jaipur &middot; Bharatpur &middot; Remote-first</div></td></tr></table></td></tr></table></body></html>';
}
function cmTxt_(v) { return esc(String(v || "")).replace(/\[([^\]]+)\]\((https:\/\/[^\s)"<>]+)\)/g, '<a class="e-a" href="$2" style="color:#8B0D0D;font-weight:700;text-decoration:underline">$1</a>').replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>"); }
function cmList_(v, n) { return String(v || "").split(/[\s,;]+/).map(function (x) { return x.trim().toLowerCase(); }).filter(String).slice(0, n); }
function compose_(b, asBy) {
  var by = asBy || who_(b); if (!by) return { ok: false, error: "login" };
  var to = cmList_(b.to, 25); if (!to.length || !to.every(okEmail_)) return { ok: false, error: "to" };
  var sub = s_(b.subject, 200).trim(); if (!sub) return { ok: false, error: "subject" };
  var f = CM_FROM[b.from], p = f ? null : sender_(b.from); if (!f && !p) f = CM_FROM.team;
  if (p && myIds_(by).indexOf(p.id) < 0) return { ok: false, error: "from" };   // a team member's own official ID only, never someone else's
  var fromE = f ? f.email : p.email, fromN = f ? f.name : p.name + " | Haritt Group";
  var okcc = CC_CHOICES.concat(["team@haritt.com"]), cc = (Array.isArray(b.cc) ? b.cc : []).map(function (x) { return String(x).toLowerCase().trim(); }).filter(function (x) { return okcc.indexOf(x) >= 0; });
  var extra = cmList_(b.ccx, 10); if (!extra.every(okEmail_)) return { ok: false, error: "cc" };
  cc = cc.concat(extra).filter(function (x, i, a) { return a.indexOf(x) === i && x !== fromE && to.indexOf(x) < 0; });
  var inner = String(b.intro || "").split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(String).slice(0, 12).map(function (x, i) { return (i ? '<div style="height:14px;line-height:14px;font-size:0">&nbsp;</div>' : "") + txt_(cmTxt_(x)); }).join("");
  var info = String(b.info || "").split("\n").map(function (l) { var i = l.indexOf(":"); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : null; }).filter(function (x) { return x && x[0] && x[1]; }).slice(0, 12);
  if (info.length) inner += '<table class="e-tile" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;background:#FBF8F5;border:1px solid #EEE7DF;border-radius:14px"><tr><td style="padding:10px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + info.map(function (x) { return kv_(cmTxt_(x[0]), cmTxt_(x[1])); }).join("") + "</table></td></tr></table>";
  var secs = (Array.isArray(b.sec) ? b.sec : []).slice(0, 8).map(function (x) { return { t: s_(x && x.t, 120).trim(), p: String((x && x.p) || "").split("\n").map(function (l) { return l.replace(/^\s*(?:[-•]|\*(?!\*)|\d+[.)])\s*/, "").trim(); }).filter(String).slice(0, 15) }; }).filter(function (x) { return x.p.length; });
  var bu0 = String(b.bu || "").trim(); if (b.btop && b.bt && /^https:\/\/[^\s"'<>]+$/.test(bu0)) { inner += btn_(esc(bu0), esc(s_(b.bt, 60))); var btDone = 1; }
  secs.forEach(function (x) { var h = steps_(x.p.map(cmTxt_)); inner += x.t ? h.replace("What happens next", esc(x.t)) : h.replace(/<div class="e-lbl"[^>]*>What happens next<\/div>/, '<div style="height:20px"></div>'); });
  var bu = String(b.bu || "").trim(); if (!btDone && b.bt && /^https:\/\/[^\s"'<>]+$/.test(bu)) inner += btn_(esc(bu), esc(s_(b.bt, 60)));
  if (String(b.note || "").trim()) inner += small_(cmTxt_(String(b.note).trim().slice(0, 1500)));
  var ev = icsEv_(b.ev, sub), orgN = p ? p.name : f.name;
  if (ev) inner += '<div class="e-s" style="color:#8F877C;font-size:13px;line-height:1.6;margin-top:14px">Calendar invite attached. Not seeing it? <a href="' + esc(gcal_(ev)) + '" style="color:#8B0D0D;font-weight:600;text-decoration:underline">Add to Google Calendar</a></div>';
  if (b.sign !== false) inner += f ? '<div class="e-t" style="color:#4A4540;font-size:14.5px;line-height:1.6;margin-top:26px"><b class="e-h" style="color:#17140F">' + esc(f.sign) + '</b><br><span class="e-s" style="color:#8F877C">' + esc(f.email) + "</span></div>" : signHR_(p);
  var html = shell_(esc(s_(b.label, 30).trim() || "Haritt Group"), cmTxt_(s_(b.title, 160).trim() || sub), inner);
  if (b.tpl === "team") html = teamHtml_(b);   // team introduction: welcome + one card per team member
  if (b.plain) html = plainHtml_(b, info, secs, f, p, bu);   // person-to-person look: like a normal Gmail message, no header or cards
  if (b.preview) return { ok: true, html: html, from: fromN + " <" + fromE + ">", to: to.join(", "), cc: cc.join(", ") };
  var text = [s_(b.title, 160), String(b.intro || "")].concat(info.map(function (x) { return x[0] + ": " + x[1]; })).concat(secs.map(function (x) { return (x.t ? x.t + "\n" : "") + x.p.map(function (l, i) { return (i + 1) + ". " + l; }).join("\n"); })).concat(b.bt && bu ? [b.bt + ": " + bu] : []).concat([String(b.note || ""), b.sign !== false ? (f ? f.sign + "\n" + f.email : p.name + "\n" + (p.bare ? p.role : p.role + ", Haritt Group\n" + p.email)) : ""]).map(function (x) { return String(x).replace(/\[([^\]]+)\]\((https:[^)\s]+)\)/g, "$1 ($2)").replace(/\*\*/g, "").trim(); }).filter(String).join("\n\n");
  if (b.each && to.length + cc.length > 1) {   // one private email per person (To and CC alike): nobody sees anyone else's address
    var all = to.concat(cc.filter(function (x) { return to.indexOf(x) < 0; })).map(function (t) { return mail_(t, sub, text, { sendAs: { name: fromN, email: fromE }, noalias: true, cc: false, ccOnly: [], htmlBody: html, kind: "compose", attachments: ev ? [ics_(ev, [t], orgN, fromE)] : undefined }); });
    return { ok: true, mail: all[0], mails: all, each: all.length, by: by };
  }
  var atts = (asBy && Array.isArray(b.att) ? b.att : []).filter(function (x) { return /^apps-script\/att\/[A-Za-z0-9 ._-]+\.pdf$/.test(String(x)); }).slice(0, 3).map(function (x) {   // PDFs from the repo (outbox mails only)
    var g = UrlFetchApp.fetch(OUTBOX_SRC.replace("/main/apps-script/outbox.json", "/" + (b.attSha || "main") + "/" + encodeURI(x)), { muteHttpExceptions: true });
    if (g.getResponseCode() !== 200) throw new Error("attachment " + x); return g.getBlob().setContentType("application/pdf").setName(x.split("/").pop()); });
  if (ev) atts.push(ics_(ev, to.concat(cc), orgN, fromE));
  var r = mail_(to.join(","), sub, text, { sendAs: { name: fromN, email: fromE }, noalias: true, cc: true, ccOnly: cc, htmlBody: html, kind: "compose", attachments: atts.length ? atts : undefined });
  return { ok: true, mail: r, by: by };
}
function apMail_(d) {
  var first = esc(d.a.name.split(" ")[0]);
  var inner = txt_("Hi " + first + ",<br>Thank you so much for applying to Haritt Group. Our team will review your application, and we will contact you soon.") +
    tile_(d.pos.full, "Your application · " + esc(d.id)) +
    steps_(["Our team reviews your application", "If shortlisted, you get an email", "Read and sign your joining agreement", "Start on a Monday"]) +
    small_("You do not need to apply again. If anything changes, just reply to this email.<br>आवेदन करने के लिए धन्यवाद। हमारी टीम आपका आवेदन देखेगी और जल्द ही आपसे संपर्क करेगी।") + signJ_();
  mail_(d.a.email, "Thank you for applying to Haritt Group", "Hi " + d.a.name.split(" ")[0] + ",\n\nThank you so much for applying to Haritt Group. Our team will review your application, and we will contact you soon.\n\nPosition: " + d.pos.full + "\nApplication: " + d.id + "\n\nHaritt Group",
    { join: true, nocc: true, htmlBody: shell_("Application received", "Thank you for applying, " + first, inner) });
}
// Team notifications: one separate email per person, so nobody sees the others' personal addresses.
// TEAM_NOTIFY (script property, optional) = exact list, e.g. "harsh.goyal@haritt.com,pulkit.soni@haritt.com". Otherwise ADMINS, with each Gmail turned into its official ID via ALIAS_MAP (duplicates removed).
function teamTo_() {
  var t = prop_("TEAM_NOTIFY").toLowerCase().split(",").map(function (x) { return x.trim(); }).filter(okEmail_); if (t.length) return t;
  var rev = {}; prop_("ALIAS_MAP").split(",").forEach(function (x) { var q = x.split("="); if (q.length === 2) rev[q[1].trim().toLowerCase()] = q[0].trim().toLowerCase(); });
  return admins_().map(function (x) { return rev[x] || x; }).filter(function (x, i, a) { return okEmail_(x) && a.indexOf(x) === i; });
}
function apTeam_(d) {
  var tl = teamTo_(); if (!tl.length) return;
  var a = d.a, kv = kv_("Name", esc(a.name)) + kv_("Position", esc(d.pos.full)) + kv_("Email", esc(a.email)) + kv_("Phone", esc(a.phone)) + kv_("City", esc(a.city || "-")) + kv_("Background", esc(a.bg || "-")) + kv_("Heard from", esc(a.src || "-"));
  var inner = txt_("A new application came in on haritt.com/join.") +
    '<table class="e-tile" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;background:#FBF8F5;border:1px solid #EEE7DF;border-radius:14px"><tr><td style="padding:10px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + kv + "</table></td></tr></table>" +
    '<div class="e-h" style="color:#17140F;font-size:14px;font-weight:700;margin:22px 0 4px">Why they want to join</div>' + txt_(esc(a.why)) +
    btn_("https://haritt.com/admin/join/?tab=apps&id=" + d.id, "Open in Admin") + small_("From Admin: shortlist and send the agreement, or Not now.");
  tl.forEach(function (to) { try { mail_(to, "New application: " + a.name + " · " + d.pos.full, a.name + " applied for " + d.pos.full + ".\nEmail: " + a.email + "\nPhone: " + a.phone + "\n\nOpen: https://haritt.com/admin/join/?tab=apps&id=" + d.id,
    { htmlBody: shell_("New application", esc(a.name) + " applied", inner) }) } catch (e) {} });
}
function apRow_(d) {
  var r = { id: d.id, created: d.created, status: d.status, pos: d.pos, a: d.a, note: d.note || "", ag: d.ag || "", agStatus: "" };
  if (d.ag) { var st = load_(d.ag); if (st) r.agStatus = status_(st.d); }
  return r;
}
function appsList_(b) {
  if (!who_(b)) return { ok: false, error: "login" };
  return { ok: true, rows: rows_().ap, positions: posAll_(), levels: LEVELS };
}
function appNote_(b) { var by = who_(b); if (!by) return { ok: false, error: "login" }; var st = loadAp_(b.id); if (!st) return { ok: false, error: "not_found" }; st.d.note = s_(b.note, 2000); log_(st.d, "", "note", by); save_(st); return { ok: true }; }
function notNow_(b) {
  var by = who_(b); if (!by) return { ok: false, error: "login" };
  var st = loadAp_(b.id); if (!st) return { ok: false, error: "not_found" }; var d = st.d; if (d.ag) return { ok: false, error: "shortlisted" };
  d.status = "notnow"; log_(d, "", "not_now", by + (b.mail ? " +mail" : ""));
  if (b.mail) {
    var first = esc(d.a.name.split(" ")[0]);
    var inner = txt_("Thank you for your interest in Haritt Group and for the time you took to apply. Right now we are not able to take this forward.") +
      txt_("<br>This is not a judgement of you. We are a small team and we add people slowly. We will keep your details, and we may reach out when there is a better fit.") + small_("Wishing you the best. You can apply again after 3 months.");
    var nw = sender_(b.from), ncp = ccPick_(b), nno = nw ? { join: true, hr: true, fromA: nw.email } : { join: true }; inner += nw ? signHR_(nw) : signJ_();
    if (ncp) nno.ccOnly = ncp.filter(function (x) { return x !== (nw ? nw.email : JOIN_FROM); });
    try { mail_(d.a.email, "Your application to Haritt Group", "Hi " + d.a.name.split(" ")[0] + ",\n\nThank you for your interest in Haritt Group and for the time you took to apply. Right now we are not able to take this forward. We will keep your details, and we may reach out when there is a better fit.\n\nHaritt Group", Object.assign(nno, { htmlBody: shell_("Application update", "Thank you, " + first, inner) })); } catch (e) {}
  }
  save_(st); return { ok: true, row: apRow_(d) };
}
function shortlist_(b) {
  var by = who_(b); if (!by) return { ok: false, error: "login" };
  var fe = prop_("FOUNDER_EMAIL").toLowerCase(); if (!okEmail_(fe)) return { ok: false, error: "founder_email" };
  var st = loadAp_(b.id); if (!st) return { ok: false, error: "not_found" }; var ap = st.d; if (ap.ag) return { ok: false, error: "already" };
  var pos = posAll_().filter(function (p) { return p.id === (b.pos || ap.pos.id); })[0] || ap.pos;
  var m = { name: ap.a.name, email: ap.a.email, phone: ap.a.phone, city: ap.a.city, address: "", role: pos.full, rdesc: pos.sum || "", level: LEVELS.indexOf(b.level) >= 0 ? b.level : (pos.level || LEVELS[1]), app: ap.id };
  var id = newId_(); while (load_(id)) id = newId_();
  var d = { id: id, created: now_(), by: by, m: m, tok: { member: tok_(), founder: tok_() }, final: null, void: null, log: [],
    p: { member: { name: m.name, email: m.email, label: "Joining member" }, founder: { name: FOUNDER_NAME, email: fe, label: FOUNDER_LABEL } } };
  log_(d, "", "created", by + " from " + ap.id);
  folder_().createFile(id + ".json", JSON.stringify(d), MimeType.PLAIN_TEXT); bust_();
  var link = SITE + "?id=" + id + "&t=" + d.tok.member, first = esc(m.name.split(" ")[0]), sent = true;
  var sw = sender_(b.from), cp = ccPick_(b), slo = { join: true, hr: true };
  if (sw) slo.fromA = sw.email; if (cp) slo.ccOnly = cp.filter(function (x) { return x !== (sw ? sw.email : HR_FROM); });
  try {
    var inner = txt_("Your application for <b>" + esc(pos.full) + "</b> at Haritt Group has been shortlisted. The next step is your Step 1 Joining Agreement.") +
      tile_("Step 1 Joining Agreement", esc(pos.full) + " · " + esc(id)) + btn_(link, "Review and sign") +
      steps_(["Confirm it is you with a code", "Check your details", "Read every page and sign", "Start on the Monday after signing"]) +
      small_("Take your time to read it. If anything is unclear, reply to this email before you sign.<br>आपका आवेदन शॉर्टलिस्ट हो गया है। अगला स्टेप: एग्रीमेंट पढ़ें और साइन करें।") + signHR_(sw) +
      small_('This link is personal to you. Please do not share it.<br>Button not working? Copy this address into your browser:<br><span class="e-s" style="color:#6B7280;word-break:break-all">' + esc(link) + "</span>");
    mail_(m.email, "You are shortlisted: " + pos.full + " · Haritt Group", "Hi " + m.name.split(" ")[0] + ",\n\nYour application for " + pos.full + " at Haritt Group has been shortlisted. The next step is your Step 1 Joining Agreement.\nOpen this link, read every page and sign:\n" + link + "\n\n" + (sw ? sw.name + "\n" + sw.role : "Simran Jain\nHR") + ", Haritt Group",
      Object.assign(slo, { htmlBody: shell_("Shortlisted", "Good news, " + first + ". You are shortlisted.", inner) }));
  } catch (e) { sent = false; }
  var ast = load_(id); log_(d, "", "invited", JSON.stringify({ member: sent, shortlist: true })); ast.d = d; save_(ast);
  ap.status = "shortlisted"; ap.ag = id; log_(ap, "", "shortlisted", by); save_(st);
  return { ok: true, row: apRow_(ap), mailed: sent };
}

/* ===== Auto update: no more copy-paste =====
   Every 10 minutes the script checks GitHub (harittgroup/haritt.com, file apps-script/join-esign.gs). If the code changed, it saves the new code
   into this project and deploys it as a New version of the same Web app (same URL). Only people who can push to that GitHub repo can change it.
   One-time setup (after this, never paste again):
     1. https://script.google.com/home/usersettings → "Google Apps Script API" → On.
     2. Project Settings (gear) → tick "Show appsscript.json manifest file" → open appsscript.json → replace it with the manifest from admin/rules.
     3. Pick setupAutoUpdate in the function list → Run → Allow.  Status: script property AUTO_LAST. */
var AUTO_SRC = "https://raw.githubusercontent.com/harittgroup/haritt.com/main/apps-script/join-esign.gs", AUTO_MARK = "Haritt Group joining e-sign";
function setupAutoUpdate() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "autoUpdate") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("autoUpdate").timeBased().everyMinutes(10).create();
  var r = autoUpdate_(true); Logger.log(r); return r;
}
function autoUpdate() { var r = autoUpdate_(false); if (!/^updated/.test(r)) outbox_(); return r; }
/* Instant update: GitHub runs .github/workflows/apps-script-reload.yml after a push to apps-script/, which posts {action:"__reload"} here.
   Anyone may ask; it only installs the official GitHub code when it changed, max once per 20 s. The 10 minute check stays as a backup. */
/* Calendar invite (.ics, METHOD:REQUEST): Gmail, Apple Mail and Outlook show it as an event with Yes / No / Maybe. Times are IST "YYYY-MM-DDTHH:mm". */
function icsAt_(v) { var m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/.exec(String(v || "")); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) - 330 * 60000) : null; }
function icsEv_(e, sub) { if (!e || !icsAt_(e.start) || !icsAt_(e.end)) return null; return { s: icsAt_(e.start), e: icsAt_(e.end), title: s_(e.title || sub, 200), loc: s_(e.loc || "", 300), desc: s_(e.desc || "", 1500), uid: (String(e.uid || "").replace(/[^\w.-]/g, "").slice(0, 80) || "hg-" + Date.now()) + "@haritt.com" }; }
function icsT_(d) { return Utilities.formatDate(d, "UTC", "yyyyMMdd'T'HHmmss'Z'"); }
function icsE_(v) { return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
function icsFold_(l) { var o = []; while (l.length > 73) { o.push(l.slice(0, 73)); l = " " + l.slice(73); } o.push(l); return o.join("\r\n"); }
function ics_(ev, to, orgN, orgE) {
  var L = ["BEGIN:VCALENDAR", "PRODID:-//Haritt Group//Meet//EN", "VERSION:2.0", "CALSCALE:GREGORIAN", "METHOD:REQUEST", "BEGIN:VEVENT", "UID:" + ev.uid, "DTSTAMP:" + icsT_(new Date()),
    "DTSTART:" + icsT_(ev.s), "DTEND:" + icsT_(ev.e), "SUMMARY:" + icsE_(ev.title), "DESCRIPTION:" + icsE_(ev.desc), "LOCATION:" + icsE_(ev.loc), "ORGANIZER;CN=" + icsE_(orgN) + ":mailto:" + orgE]
    .concat(to.map(function (t) { return "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:" + t; }))
    .concat(["SEQUENCE:0", "STATUS:CONFIRMED", "TRANSP:OPAQUE", "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "END:VALARM", "END:VEVENT", "END:VCALENDAR"]);
  return Utilities.newBlob(L.map(icsFold_).join("\r\n") + "\r\n", "text/calendar; charset=UTF-8; method=REQUEST", "invite.ics");
}
function gcal_(ev) { return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(ev.title) + "&dates=" + icsT_(ev.s) + "/" + icsT_(ev.e) + "&details=" + encodeURIComponent(ev.desc) + "&location=" + encodeURIComponent(ev.loc); }
/* Outbox: mails the team queues from GitHub (apps-script/outbox.json). Only people who can push to main can queue one, and each id is sent once.
   "person:Full Name" or "sha:<SHA-256 of the email>" is looked up in the joining records, so no personal email ID sits in the public repo. */
var OUTBOX_SRC = "https://raw.githubusercontent.com/harittgroup/haritt.com/main/apps-script/outbox.json";
function who2_(l) { var R = null; return (l || []).map(function (x) { x = String(x || "").trim();
  if (x.indexOf("sha:") === 0) { R = R || rows_(); var hv = x.slice(4).toLowerCase(), em = R.jn.map(function (r) { return String(r.email || "").toLowerCase(); }).concat(R.ap.map(function (r) { return String((r.a && r.a.email) || "").toLowerCase(); })).filter(function (e) { return e && sha_(e) === hv; })[0]; return em || ""; }
  if (x.indexOf("person:") !== 0) return x.toLowerCase(); R = R || rows_(); var n = x.slice(7).trim().toLowerCase();
  var j = R.jn.filter(function (r) { return String(r.name || "").toLowerCase() === n; })[0]; if (j) return String(j.email || "").toLowerCase();
  var a = R.ap.filter(function (r) { return r.a && String(r.a.name || "").toLowerCase() === n; })[0]; return a ? String(a.a.email || "").toLowerCase() : ""; }).filter(okEmail_); }
function outbox_(sha) {
  var P = PropertiesService.getScriptProperties(), out = [];
  try {
    var g = UrlFetchApp.fetch((sha ? OUTBOX_SRC.replace("/main/", "/" + sha + "/") : OUTBOX_SRC) + "?t=" + Date.now(), { muteHttpExceptions: true }); if (g.getResponseCode() !== 200) return out;
    var list = JSON.parse(g.getContentText() || "[]"); if (!Array.isArray(list) || !list.length) return out;
    var lock = LockService.getScriptLock(); if (!lock.tryLock(20000)) return ["busy"];
    try {
      var done = (P.getProperty("OUTBOX_DONE") || "").split(",").filter(String);
      list.forEach(function (m) {
        if (!m || !m.id || done.indexOf(m.id) >= 0) return;
        if (m.notAfter && new Date(m.notAfter) < new Date()) return;
        if (m.type === "reissue") { done.push(m.id); P.setProperty("OUTBOX_DONE", done.slice(-60).join(",")); var rr = "error"; try { rr = reissueSend_(String(m.doc || "")); } catch (e) { rr = e.message; } out.push(m.id + ": " + rr); return; }
        var s = sender_(m.from) || (CM_FROM[m.from] ? sender_("harsh") : null); if (!s) { out.push(m.id + ": bad from"); return; }
        var b = JSON.parse(JSON.stringify(m)), to = who2_(m.to), cc = who2_(m.cc);
        if (to.length !== (m.to || []).length || cc.length !== (m.cc || []).length) { out.push(m.id + ": a recipient was not found, nothing sent"); return; }
        b.to = to.join(","); b.cc = cc.filter(function (x) { return /@haritt\.com$/.test(x); }); b.ccx = cc.filter(function (x) { return !/@haritt\.com$/.test(x); }).join(",");
        done.push(m.id); P.setProperty("OUTBOX_DONE", done.slice(-60).join(","));   // marked before sending: a mail never goes twice
        b.attSha = sha || "main"; var r = compose_(b, s.email); out.push(m.id + ": " + (r.ok ? "sent to " + (r.each || 1) : r.error));
      });
    } finally { lock.releaseLock(); }
  } catch (e) { out.push("outbox: " + e.message); }
  if (out.length) P.setProperty("OUTBOX_LAST", new Date().toISOString() + " " + out.join("; ").slice(0, 400));
  return out;
}
/* Auto reminders for unsigned agreements (runs inside the 10 minute autoUpdate trigger, checks once an hour, sends only 9 AM to 9 PM IST).
   The person who has to sign next gets a reminder 24 h after the agreement reached them, a second one 48 h after that, then it stops and the team gets one alert. */
var AR_GAPS = [24, 48], AR_ALERT_AFTER = 24;
function autoRemind_() {
  var c = CacheService.getScriptCache(); if (c.get("ar_t")) return []; c.put("ar_t", "1", 3300);
  var h = +Utilities.formatDate(new Date(), "Asia/Kolkata", "H"); if (h < 9 || h >= 21) return [];
  var out = [], it = folder_().searchFiles("title contains 'HG-JN-' and trashed = false");
  while (it.hasNext()) {
    var f = it.next(); if (!/^HG-JN-.*\.json$/.test(f.getName())) continue;
    try {
      var st = { file: f, d: JSON.parse(f.getBlob().getDataAsString()) }, d = st.d; if (d.void || allSigned_(d) || !d.p || !d.tok) continue;
      var role = d.p.member.signedAt ? "founder" : "member", base = role === "member" ? d.created : d.p.member.signedAt; if (!base) continue;
      d.ar = d.ar || {}; var a = d.ar[role] || { n: 0, t: "" }, last = base;
      (d.log || []).forEach(function (l) { if (l.e === "reminded" && l.t > last) last = l.t; }); if (a.t > last) last = a.t;
      var hrs = (Date.now() - new Date(last).getTime()) / 3600000;
      if (a.n < AR_GAPS.length && hrs >= AR_GAPS[a.n]) {
        if (invite_(d, role, true)) { a.n++; a.t = now_(); d.ar[role] = a; log_(d, role, "auto_reminded", String(a.n)); save_(st); out.push(d.id + " " + role + " reminder " + a.n); }
      } else if (a.n >= AR_GAPS.length && !a.alert && hrs >= AR_ALERT_AFTER) {
        var who = role === "member" ? d.m.name : "Founding team", inner = txt_("<b>" + esc(who) + "</b> has not signed the Step 1 Joining Agreement yet, even after " + AR_GAPS.length + " reminders. Automatic reminders have stopped. Please follow up directly.") +
          tile_("Step 1 Joining Agreement", esc(d.m.name) + " · " + esc(d.id)) + btn_("https://haritt.com/admin/join/", "Open Onboarding");
        teamTo_().forEach(function (t) { mail_(t, "Not signed yet: " + d.m.name + " · Step 1 Joining Agreement", who + " has not signed " + d.id + " after " + AR_GAPS.length + " reminders. Please follow up directly.\nhttps://haritt.com/admin/join/", { htmlBody: shell_("Follow up", "Agreement not signed yet", inner), kind: "team" }); });
        a.alert = now_(); d.ar[role] = a; log_(d, role, "auto_alert", ""); save_(st); out.push(d.id + " alert");
      }
    } catch (e) { out.push("remind error " + e.message); }
  }
  if (out.length) PropertiesService.getScriptProperties().setProperty("REMIND_LAST", now_() + " " + out.join("; ").slice(0, 400));
  return out;
}
// GitHub sends the commit id (sha): reading that exact commit skips GitHub's 5 minute file cache, so a push is live in seconds.
function reload_(b) { var c = CacheService.getScriptCache(); if (c.get("reload_t")) return { ok: true, wait: true }; c.put("reload_t", "1", 20); var sha = /^[0-9a-f]{40}$/.test(String((b && b.sha) || "")) ? b.sha : ""; var r = autoUpdate_(false, sha); return { ok: true, result: r, outbox: /^updated/.test(r) ? [] : outbox_(sha) }; }
// Git's id for this file version (same as GitHub's "sha" for the file): the admin Build badge compares it with GitHub to show the email system is current
function gitBlob_(src) { var by = Utilities.newBlob(src).getBytes(), hd = Utilities.newBlob("blob " + by.length + "\u0000").getBytes(); return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, hd.concat(by)).map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join(""); }
function autoUpdate_(force, sha) {
  var P = PropertiesService.getScriptProperties(), res;
  try {
    var g = UrlFetchApp.fetch((sha ? AUTO_SRC.replace("/main/", "/" + sha + "/") : AUTO_SRC) + "?t=" + Date.now(), { muteHttpExceptions: true, headers: { "Cache-Control": "no-cache" } });
    if (g.getResponseCode() !== 200) throw new Error("GitHub " + g.getResponseCode());
    var src = g.getContentText();
    if (src.indexOf(AUTO_MARK) < 0 || src.indexOf("function autoUpdate_") < 0 || src.length < 20000) throw new Error("source looks wrong");
    var h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, src, Utilities.Charset.UTF_8));
    var blob = gitBlob_(src); if (!force && P.getProperty("AUTO_HASH") === h) { if (P.getProperty("AUTO_BLOB") !== blob) P.setProperty("AUTO_BLOB", blob); return "same"; }
    var id = ScriptApp.getScriptId(), A = "https://script.googleapis.com/v1/projects/" + id;
    var call = function (method, path, body) {
      var o = { method: method, muteHttpExceptions: true, headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() } };
      if (body) { o.contentType = "application/json"; o.payload = JSON.stringify(body); }
      var r = UrlFetchApp.fetch(A + path, o), t = r.getContentText(); if (r.getResponseCode() >= 300) throw new Error(method + " " + path + " " + r.getResponseCode() + " " + t.slice(0, 300)); return t ? JSON.parse(t) : {};
    };
    var cur = call("get", "/content"), hit = false;
    var files = (cur.files || []).map(function (f) { var s = f.source; if (f.type === "SERVER_JS" && !hit && s.indexOf(AUTO_MARK) >= 0) { s = src; hit = true; } return { name: f.name, type: f.type, source: s }; });
    if (!hit) throw new Error("code file not found");
    call("put", "/content", { files: files });
    var v = call("post", "/versions", { description: "Auto update " + h.slice(0, 8) });
    var deps = (call("get", "/deployments").deployments || []).filter(function (d) { return d.deploymentConfig && d.deploymentConfig.versionNumber && (d.entryPoints || []).some(function (e) { return e.entryPointType === "WEB_APP"; }); });
    var only = P.getProperty("DEPLOY_ID"); if (only) deps = deps.filter(function (d) { return d.deploymentId === only; });
    deps.forEach(function (d) { call("put", "/deployments/" + d.deploymentId, { deploymentConfig: { scriptId: id, versionNumber: v.versionNumber, manifestFileName: "appsscript", description: "Auto update " + h.slice(0, 8) } }); });
    P.setProperty("AUTO_HASH", h); P.setProperty("AUTO_BLOB", blob); P.setProperty("AUTO_AT", new Date().toISOString()); res = "updated to version " + v.versionNumber + " (" + deps.length + " web app)" + (v.versionNumber >= 180 ? " WARNING: near the 200 version limit, delete old versions in Project History" : "");
  } catch (e) { res = "error: " + e.message; }
  P.setProperty("AUTO_LAST", now_() + " " + res); return res;
}


/* ---------- email addresses (admin > Email addresses): Cloudflare Email Routing. Script properties: CF_TOKEN, CF_ACCOUNT ---------- */
var CFT_ = { t: "", a: "" };
var ADDR_ZONES = ["haritt.com", "thehvverse.com"];
var ADDR_KEEP = ["developers@haritt.com", "join@haritt.com", "hr@haritt.com", "team@haritt.com", "verify@haritt.com", "support@thehvverse.com", "hello@haritt.com", "hello@thehvverse.com"];
function cf_(method, path, body) {
  var j = { success: false, errors: [{ message: "network" }] };
  for (var i = 0; i < 4; i++) {   /* Google sometimes says "Address unavailable" for one call: try again */
    try {
      var r = UrlFetchApp.fetch("https://api.cloudflare.com/client/v4" + path, { method: method, contentType: "application/json", headers: { Authorization: "Bearer " + CFT_.t }, payload: body ? JSON.stringify(body) : null, muteHttpExceptions: true });
      try { j = JSON.parse(r.getContentText()); } catch (e) { j = { success: false, errors: [{ message: "bad response" }] }; }
      return j;
    } catch (e) { Utilities.sleep(500 * (i + 1)); }
  }
  return j;
}
function cfAll_(path) { var out = [], pg = 1; for (;;) { var j = cf_("get", path + (path.indexOf("?") >= 0 ? "&" : "?") + "per_page=50&page=" + pg); if (!j.success) return null; out = out.concat(j.result || []); var ri = j.result_info; if (!ri || pg >= (ri.total_pages || 1)) break; pg++; } return out; }
function addrZone_(name) { var c = CacheService.getScriptCache(), k = "cfz:" + name, v = c.get(k); if (v) return v; var j = cf_("get", "/zones?name=" + encodeURIComponent(name)); var z = j.success && j.result && j.result[0]; if (!z) return ""; c.put(k, z.id, 21600); return z.id; }
function addrRuleOf_(r) { var m = (r.matchers || []).filter(function (x) { return x.type === "literal" && x.field === "to"; })[0], a = (r.actions || []).filter(function (x) { return x.type === "forward"; })[0]; return m && a ? { id: r.tag, from: String(m.value).toLowerCase(), to: a.value || [], enabled: r.enabled !== false } : null; }
function addrApi_(a, b) {
  if (a === "addr_setup") return addrSetup_(b);
  if (a === "addr_done") return addrDone_(b);   /* member opens a personal link, no login */
  if (!who_(b)) return { ok: false, error: "login" };
  if (a === "addr_mark") {   /* admin marks Send as set up or not (no Cloudflare needed) */
    var fm = s_(b.from, 200).toLowerCase(); if (!okEmail_(fm)) return { ok: false, error: "addr_bad" };
    var P0 = PropertiesService.getScriptProperties(), dn = {}; try { dn = JSON.parse(P0.getProperty("ADDR_DONE") || "{}"); } catch (e) {}
    if (b.on) dn[fm] = Date.now(); else delete dn[fm]; P0.setProperty("ADDR_DONE", JSON.stringify(dn)); return { ok: true };
  }
  CFT_.t = String(b.cf_token || prop_("CF_TOKEN") || ""); CFT_.a = String(b.cf_account || prop_("CF_ACCOUNT") || "");
  if (!CFT_.t || !CFT_.a) return { ok: false, error: "cf_missing" };
  var acc = CFT_.a, P = PropertiesService.getScriptProperties();
  var dests = cfAll_("/accounts/" + acc + "/email/routing/addresses"); if (dests === null) return { ok: false, error: "cf_denied" };
  var ver = {}; dests.forEach(function (d) { ver[String(d.email).toLowerCase()] = !!d.verified; });
  var pend = []; try { pend = JSON.parse(P.getProperty("ADDR_PENDING") || "[]"); } catch (e) {}
  function mk(from, to) { var z = addrZone_(from.split("@")[1]); if (!z) return { ok: false, error: "zone" }; var j = cf_("post", "/zones/" + z + "/email/routing/rules", { name: from, enabled: true, matchers: [{ type: "literal", field: "to", value: from }], actions: [{ type: "forward", value: [to] }] }); return j.success ? { ok: true } : { ok: false, error: "cf", msg: JSON.stringify(j.errors || []).slice(0, 160) }; }
  /* addresses waiting for the forward-to Gmail to be confirmed: create them as soon as it is */
  function upd(from, to) { var z = addrZone_(from.split("@")[1]); if (!z) return { ok: false }; var cur = (cfAll_("/zones/" + z + "/email/routing/rules") || []).filter(function (r) { var x = addrRuleOf_(r); return x && x.from === from; })[0]; if (!cur) return { ok: false, error: "not_found" }; var u = cf_("put", "/zones/" + z + "/email/routing/rules/" + cur.tag, { name: from, enabled: cur.enabled !== false, matchers: [{ type: "literal", field: "to", value: from }], actions: [{ type: "forward", value: [to] }] }); return u.success ? { ok: true } : { ok: false, error: "cf", msg: JSON.stringify(u.errors || []).slice(0, 160) }; }
  var keep = [];
  pend.forEach(function (x) { if (ver[x.to]) { var r = x.edit ? upd(x.from, x.to) : mk(x.from, x.to); if (!r.ok) keep.push(x); } else keep.push(x); });
  if (keep.length !== pend.length) { P.setProperty("ADDR_PENDING", JSON.stringify(keep)); pend = keep; }
  if (a === "addr_add") {
    var local = s_(b.local, 40).toLowerCase(), dom = s_(b.domain, 40).toLowerCase(), to = s_(b.to, 200).toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{1,38}[a-z0-9]$/.test(local) || ADDR_ZONES.indexOf(dom) < 0 || !okEmail_(to)) return { ok: false, error: "addr_bad" };
    var from = local + "@" + dom, z0 = addrZone_(dom); if (!z0) return { ok: false, error: "zone" };
    var ex = cfAll_("/zones/" + z0 + "/email/routing/rules") || []; if (ex.some(function (r) { var x = addrRuleOf_(r); return x && x.from === from; })) return { ok: false, error: "addr_exists" };
    if (ver[to]) { var r = mk(from, to); return r.ok ? { ok: true, state: "live" } : r; }
    if (!pend.some(function (x) { return x.from === from; })) { pend.push({ from: from, to: to }); P.setProperty("ADDR_PENDING", JSON.stringify(pend)); }
    if (ver[to] === undefined) { var j = cf_("post", "/accounts/" + acc + "/email/routing/addresses", { email: to }); if (!j.success) return { ok: false, error: "cf", msg: JSON.stringify(j.errors || []).slice(0, 160) }; }
    return { ok: true, state: "pending" };
  }
  if (a === "addr_invite") {   /* a personal setup link for one address (7 days), optionally mailed to that address */
    var fi = s_(b.from, 200).toLowerCase(); if (!okEmail_(fi) || ADDR_ZONES.indexOf(fi.split("@")[1]) < 0) return { ok: false, error: "addr_bad" };
    var inbox = ""; try { var zi = addrZone_(fi.split("@")[1]); (cfAll_("/zones/" + zi + "/email/routing/rules") || []).forEach(function (r) { var x = addrRuleOf_(r); if (x && x.from === fi && x.to[0]) inbox = String(x.to[0]); }); } catch (e) {}
    var t = tok_(), exp = Date.now() + 7 * 864e5; P.setProperty("ADDR_INV_" + t, JSON.stringify({ from: fi, exp: exp, n: 0, kid: "", inbox: inbox, at: Date.now() }));
    try { P.getKeys().filter(function (k) { return k.indexOf("ADDR_INV_") === 0; }).forEach(function (k) { var o = JSON.parse(P.getProperty(k) || "{}"); if (!o.exp || o.exp < Date.now() - 864e5) P.deleteProperty(k); }); } catch (e) {}
    var url = "https://haritt.com/setup/mail/?t=" + t, sent = false;
    if (b.send) { var m = UrlFetchApp.fetch("https://api.resend.com/emails", { method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + prop_("RESEND_KEY") }, muteHttpExceptions: true, payload: JSON.stringify({ from: "Haritt Group <team@haritt.com>", to: [fi], subject: "Set up " + fi + " in Gmail", text: "Hi,\n\nYour Haritt Group email " + fi + " is ready. To send mail from it in Gmail, open this private link and follow the steps (about 30 seconds):\n\n" + url + "\n\nThe link works for 7 days and is only for you. Please do not share it.\n\nHaritt Group", html: "<div style=\"font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1B1A1C;max-width:520px\"><p>Hi,</p><p>Your Haritt Group email <b>" + fi + "</b> is ready. To send mail from it in Gmail, open your private setup page. It takes about 30 seconds.</p><p><a href=\"" + url + "\" style=\"display:inline-block;background:#A70D22;color:#fff;text-decoration:none;font-weight:600;border-radius:10px;padding:11px 20px\">Open setup steps</a></p><p style=\"color:#6b6670;font-size:13px\">The link works for 7 days and is only for you. Please do not share it.</p><p style=\"color:#6b6670;font-size:13px\">Haritt Group</p></div>" }) }); sent = m.getResponseCode() < 300; }
    return { ok: true, url: url, sent: sent };
  }
  if (a === "addr_key") {   /* Gmail "Send as": a sending-only Resend key for this address (shown once, never stored) */
    var fk = s_(b.from, 200).toLowerCase(), dm0 = fk.split("@")[1]; if (!okEmail_(fk) || ADDR_ZONES.indexOf(dm0) < 0) return { ok: false, error: "addr_bad" };
    var H = { Authorization: "Bearer " + String(b.resend_full || prop_("RESEND_FULL_KEY") || prop_("RESEND_KEY")) };
    var dl = UrlFetchApp.fetch("https://api.resend.com/domains", { headers: H, muteHttpExceptions: true, method: "get" }); if (dl.getResponseCode() !== 200) return { ok: false, error: "resend_full" };
    var dom0 = (JSON.parse(dl.getContentText()).data || []).filter(function (x) { return x.name === dm0; })[0]; if (!dom0) return { ok: false, error: "resend_domain" };
    var kr = UrlFetchApp.fetch("https://api.resend.com/api-keys", { method: "post", contentType: "application/json", headers: H, muteHttpExceptions: true, payload: JSON.stringify({ name: "send-as " + fk + " " + Utilities.formatDate(new Date(), "Asia/Kolkata", "d MMM yyyy"), permission: "sending_access", domain_id: dom0.id }) });
    if (kr.getResponseCode() >= 300) return { ok: false, error: "resend_full" };
    var kj = JSON.parse(kr.getContentText());
    return { ok: true, key: kj.token, id: kj.id, host: "smtp.resend.com", port: 465, user: "resend" };
  }
  if (a === "addr_keydel") {   /* discard a Send as key that was made here */
    var kid = s_(b.id, 80); if (!/^[A-Za-z0-9-]{8,60}$/.test(kid)) return { ok: false, error: "addr_bad" };
    var dr = UrlFetchApp.fetch("https://api.resend.com/api-keys/" + kid, { method: "delete", headers: { Authorization: "Bearer " + String(b.resend_full || prop_("RESEND_FULL_KEY") || prop_("RESEND_KEY")) }, muteHttpExceptions: true });
    return dr.getResponseCode() < 300 ? { ok: true } : { ok: false, error: "resend_full" };
  }
  if (a === "addr_edit") {
    var f2 = s_(b.from, 200).toLowerCase(), to2 = s_(b.to, 200).toLowerCase(); if (!okEmail_(to2) || ADDR_ZONES.indexOf(f2.split("@")[1]) < 0) return { ok: false, error: "addr_bad" };
    if (ver[to2]) { var e1 = upd(f2, to2); return e1.ok ? { ok: true, state: "live" } : e1; }
    pend = pend.filter(function (x) { return x.from !== f2; }); pend.push({ from: f2, to: to2, edit: 1 }); P.setProperty("ADDR_PENDING", JSON.stringify(pend));
    if (ver[to2] === undefined) { var j2 = cf_("post", "/accounts/" + acc + "/email/routing/addresses", { email: to2 }); if (!j2.success) return { ok: false, error: "cf", msg: JSON.stringify(j2.errors || []).slice(0, 160) }; }
    return { ok: true, state: "pending" };
  }
  var rows = [];
  ADDR_ZONES.forEach(function (dn) {
    var z = addrZone_(dn); if (!z) return;
    (cfAll_("/zones/" + z + "/email/routing/rules") || []).forEach(function (r) { var x = addrRuleOf_(r); if (x) rows.push({ id: x.id, from: x.from, domain: dn, to: x.to, enabled: x.enabled, verified: x.to.every(function (t) { return ver[String(t).toLowerCase()] !== false; }), keep: ADDR_KEEP.indexOf(x.from) >= 0 }); });
  });
  if (a === "addr_set" || a === "addr_del") {
    var row = rows.filter(function (r) { return r.id === b.id; })[0]; if (!row) return { ok: false, error: "not_found" };
    var z2 = addrZone_(row.domain), path = "/zones/" + z2 + "/email/routing/rules/" + row.id;
    if (a === "addr_del") { if (row.keep) return { ok: false, error: "addr_keep" }; var d = cf_("delete", path); return d.success ? { ok: true } : { ok: false, error: "cf" }; }
    var u = cf_("put", path, { name: row.from, enabled: !!b.enabled, matchers: [{ type: "literal", field: "to", value: row.from }], actions: [{ type: "forward", value: row.to }] });
    return u.success ? { ok: true } : { ok: false, error: "cf", msg: JSON.stringify(u.errors || []).slice(0, 160) };
  }
  /* every address the system has sent from (Resend sent log), so new send-only addresses show up by themselves */
  var dg = { emails: 0, nmails: 0, keys: 0, nkeys: 0, log: 0 }, snd = {}, conf = {}, logd = {}; try { mlRead_("mail-log.json", []).forEach(function (x) { dg.log++; if (x.rid) logd[x.rid] = 1; }); } catch (e) {}
  try { var rr = UrlFetchApp.fetch("https://api.resend.com/emails?limit=100", { headers: { Authorization: "Bearer " + String(b.resend_full || prop_("RESEND_FULL_KEY") || prop_("RESEND_KEY")) }, muteHttpExceptions: true });
    dg.emails = rr.getResponseCode(); if (rr.getResponseCode() === 200) (JSON.parse(rr.getContentText()).data || []).forEach(function (m) { dg.nmails++; var f = String(m.from || "").toLowerCase(), mm = f.match(/<([^>]+)>/), ad = mm ? mm[1] : f.trim(); if (ADDR_ZONES.indexOf(ad.split("@")[1]) >= 0) { var o = snd[ad] = snd[ad] || { from: ad, n: 0, last: m.created_at }; o.n++; if (!logd[m.id] && (!conf[ad] || String(m.created_at) > conf[ad])) conf[ad] = String(m.created_at); } }); } catch (e) {}
  var inv = {}; try { P.getKeys().filter(function (k) { return k.indexOf("ADDR_INV_") === 0; }).forEach(function (k) { var o = JSON.parse(P.getProperty(k) || "{}"); if (o.from && (!inv[o.from] || (o.at || 0) > (inv[o.from].at || 0))) inv[o.from] = o; }); } catch (e) {}
  var done = {}; try { done = JSON.parse(P.getProperty("ADDR_DONE") || "{}"); } catch (e) {}
  var kuse = {};   /* Send as keys are named "send-as <address> <date>"; last_used_at tells us Gmail really connected with it */
  try { var kl = UrlFetchApp.fetch("https://api.resend.com/api-keys?limit=100", { headers: { Authorization: "Bearer " + String(b.resend_full || prop_("RESEND_FULL_KEY") || prop_("RESEND_KEY")) }, muteHttpExceptions: true });
    dg.keys = kl.getResponseCode(); if (kl.getResponseCode() === 200) (JSON.parse(kl.getContentText()).data || []).forEach(function (k) { dg.nkeys++; var mm = String(k.name || "").match(/^send-as (\S+@\S+) /); if (!mm) return; var o = kuse[mm[1].toLowerCase()] = kuse[mm[1].toLowerCase()] || { made: 0, used: "" }; o.made = Math.max(o.made, Date.parse(k.created_at) || 0); if (k.last_used_at && String(k.last_used_at) > o.used) o.used = String(k.last_used_at); }); } catch (e) {}
  rows.forEach(function (r) { var o = inv[r.from], k = kuse[r.from]; r.sa = done[r.from] ? { s: "connected", at: done[r.from] } : k ? { s: "key", at: k.made } : o ? { s: o.n > 0 ? "opened" : "sent", at: o.at || 0, exp: o.exp < Date.now() } : { s: "none" }; });
  var have = {}; rows.forEach(function (r) { have[r.from] = 1; });
  var senders = Object.keys(snd).filter(function (k) { return !have[k]; }).map(function (k) { return snd[k]; });
  rows.sort(function (x, y) { return x.domain === y.domain ? (x.from < y.from ? -1 : 1) : (x.domain < y.domain ? -1 : 1); });
  return { ok: true, rows: rows, pending: pend, domains: ADDR_ZONES, senders: senders, diag: dg };
}

/* member side of the setup link: shows the steps and makes the Send as key (one live key per link; opening again replaces it) */
function addrSetup_(b) {
  var P = PropertiesService.getScriptProperties(), t = s_(b.t, 64); if (!/^[A-Za-z0-9]{20,40}$/.test(t)) return { ok: false, error: "link" };
  var o; try { o = JSON.parse(P.getProperty("ADDR_INV_" + t) || "null"); } catch (e) { o = null; }
  if (!o || o.exp < Date.now()) return { ok: false, error: "link" };
  if (o.n >= 6) return { ok: false, error: "used" };
  var H = { Authorization: "Bearer " + String(b.resend_full || prop_("RESEND_FULL_KEY") || prop_("RESEND_KEY")) }, dm = o.from.split("@")[1];
  if (o.kid) UrlFetchApp.fetch("https://api.resend.com/api-keys/" + o.kid, { method: "delete", headers: H, muteHttpExceptions: true });
  var dl = UrlFetchApp.fetch("https://api.resend.com/domains", { headers: H, muteHttpExceptions: true }); if (dl.getResponseCode() !== 200) return { ok: false, error: "server" };
  var d0 = (JSON.parse(dl.getContentText()).data || []).filter(function (x) { return x.name === dm; })[0]; if (!d0) return { ok: false, error: "server" };
  var kr = UrlFetchApp.fetch("https://api.resend.com/api-keys", { method: "post", contentType: "application/json", headers: H, muteHttpExceptions: true, payload: JSON.stringify({ name: "send-as " + o.from + " " + Utilities.formatDate(new Date(), "Asia/Kolkata", "d MMM yyyy"), permission: "sending_access", domain_id: d0.id }) });
  if (kr.getResponseCode() >= 300) return { ok: false, error: "server" };
  var kj = JSON.parse(kr.getContentText()); o.n++; o.kid = kj.id; P.setProperty("ADDR_INV_" + t, JSON.stringify(o));
  return { ok: true, addr: o.from, inbox: o.inbox || "", key: kj.token, host: "smtp.resend.com", port: 465, user: "resend", left: 6 - o.n };
}

function addrDone_(b) {   /* member pressed "I've added it" on the setup page */
  var P = PropertiesService.getScriptProperties(), t = s_(b.t, 64); if (!/^[A-Za-z0-9]{20,40}$/.test(t)) return { ok: false, error: "link" };
  var o; try { o = JSON.parse(P.getProperty("ADDR_INV_" + t) || "null"); } catch (e) { o = null; } if (!o) return { ok: false, error: "link" };
  var dn = {}; try { dn = JSON.parse(P.getProperty("ADDR_DONE") || "{}"); } catch (e) {} dn[o.from] = Date.now(); P.setProperty("ADDR_DONE", JSON.stringify(dn)); return { ok: true };
}
