/* Haritt Group · Step 1 Joining Agreement · e-sign flow
   Link from email: ?id=HG-JN-YYMM-XXXXXX&t=<personal token>
   Member: confirm with email code > fill details > read > sign. Founding team: code > read > sign.
   When both have signed, the browser of the last signer makes the A4 PDF and the server emails it to both. */
(function () {
  var Qs = new URLSearchParams(location.search), API = window.JOIN_API || "", HTML = document.documentElement, B = document.body;
  var CAP = Qs.get("cap") === "1", DID = (Qs.get("id") || "").trim().toUpperCase(), TK = (Qs.get("t") || "").trim();
  var INK = "#1d2b6b";
  var hi = function () { return B.classList.contains("hi"); };
  var L = function (en, h) { return hi() ? h : en; };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function ist(iso) {
    var d = new Date(new Date(iso).getTime() + 330 * 60000), H = d.getUTCHours(), m = String(d.getUTCMinutes()).padStart(2, "0"), ap = H < 12 ? "AM" : "PM"; H = H % 12 || 12;
    return d.getUTCDate() + " " + MO[d.getUTCMonth()] + " " + d.getUTCFullYear() + ", " + H + ":" + m + " " + ap + " IST";
  }

  /* ---------- styles ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".sig .sgn img{display:block;max-height:62px;max-width:100%;margin-bottom:-6px}",
    ".sig .fsd{display:block;font-style:normal;font-size:12.5px;color:var(--faint)}",
    "html.cap .vb,html.cap .smp,html.cap .lmsg,html.cap .esbar,html.cap .esg{display:none!important}",
    "html.cap body{background:#fff}html.cap .pages{padding:0;gap:0;align-items:flex-start}",
    "html.cap .sheet{box-shadow:none;border-radius:0;max-width:none;width:794px;height:1123px;min-height:0;padding:15mm 16mm 11mm;zoom:1}",
    "html.cap .sheet{width:882px;height:1247px}",
    "html.cap .d-b .top1{margin:-15mm -16mm 22px;padding:14mm 16mm 12mm}",
    "body.gate .pages,body.gate .smp{display:none}",
    ".esg{max-width:560px;margin:34px auto 60px;padding:0 16px}",
    ".esc{background:#fff;border:1px solid #E6DFD5;border-radius:18px;box-shadow:0 18px 50px rgba(40,25,10,.10);padding:26px 26px 24px;font:14.5px/1.6 Inter,system-ui,sans-serif;color:#17140F}",
    ".esh{display:flex;align-items:center;gap:12px;padding-bottom:18px;border-bottom:1px solid #EFE9E1;margin-bottom:20px}.esh img{width:40px;height:40px}",
    ".esh b{display:block;font:700 15px Montserrat}.esh span{display:block;font-size:12.5px;color:#8F877C}",
    ".esp{display:flex;gap:6px;margin-bottom:20px}.esp div{flex:1;font:600 11.5px Inter;color:#A59D92;padding-top:8px;border-top:3px solid #EFE9E1}",
    ".esp div.on{color:#8B0D0D;border-color:#8B0D0D}.esp div.ok{color:#1F7A4D;border-color:#1F7A4D}",
    ".esc h2{font:700 21px/1.3 Montserrat;margin:0 0 8px}.esc p{color:#5A534A;margin:0 0 14px}",
    ".esw{background:#FBF6F2;border:1px solid #F0E3DA;border-radius:14px;padding:16px 18px;margin:0 0 20px}.esw b{display:block;font:700 16px Montserrat;color:#8B0D0D;margin-bottom:4px}.esw p{margin:0;font-size:14px}",
    ".esf{display:grid;gap:13px}.esf label{display:block;font:600 12.5px Inter;color:#3D3730}.esf label small{font-weight:500;color:#9A9187}",
    ".esf input,.esf textarea,.esi{width:100%;margin-top:5px;font:500 15px Inter;color:#17140F;background:#fff;border:1px solid #DCD3C8;border-radius:11px;padding:11px 13px;outline:none;transition:border .15s,box-shadow .15s}",
    ".esf textarea{resize:vertical;min-height:70px}.esf input:focus,.esf textarea:focus,.esi:focus{border-color:#8B0D0D;box-shadow:0 0 0 3px rgba(139,13,13,.10)}",
    ".esf input[readonly]{background:#F7F4F0;color:#6B635A}",
    ".esr{display:flex;gap:8px;flex-wrap:wrap}.esr span{font:600 12px Inter;background:#F4EFE9;border-radius:99px;padding:5px 11px;color:#4A433B}",
    ".esb{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#8B0D0D;color:#fff;border:0;border-radius:12px;padding:13px 20px;font:700 14.5px Inter;cursor:pointer;transition:transform .12s,opacity .15s,background .15s}",
    ".esb:hover{background:#760A0A}.esb:active{transform:scale(.98)}.esb[disabled]{opacity:.55;cursor:default}.esb.w{width:100%}",
    ".esb.g{background:#fff;color:#3D3730;border:1px solid #DCD3C8}.esb.g:hover{background:#F7F4F0}",
    ".eso{display:flex;gap:10px}.eso .esi{font:700 22px Inter;letter-spacing:.35em;text-align:center;margin:0}",
    ".ese{color:#B42318;font:600 13px Inter;margin-top:10px;min-height:1px}.ese:empty{display:none}",
    ".esl{background:none;border:0;color:#8B0D0D;font:600 13px Inter;cursor:pointer;padding:0;margin-top:12px}",
    ".esn{font-size:12.5px;color:#9A9187;margin-top:14px}",
    ".esbar{position:fixed;left:0;right:0;bottom:0;z-index:30;background:#1B1814;color:#fff;box-shadow:0 -10px 30px rgba(0,0,0,.18)}",
    ".esbar .in{max-width:900px;margin:0 auto;padding:12px 16px calc(12px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:14px}",
    ".esbar .tx{flex:1;font:500 13.5px/1.45 Inter;color:#D9D2C8}.esbar .tx b{display:block;color:#fff;font-weight:700;font-size:14px}",
    ".esbar .esb{padding:11px 18px;white-space:nowrap}.esbar i.ok{color:#5BD08F}",
    "body.hasbar .pages{padding-bottom:110px}",
    "body.cansign #sigM .sgn,body.fcansign #sigF .sgn{cursor:pointer;border:1.5px dashed #C9A9A9;border-radius:8px;background:#FBF4F4;justify-content:center;align-items:center}",
    "body.cansign #sigM .sgn:after,body.fcansign #sigF .sgn:after{content:attr(data-h);font:600 13px Inter;color:#8B0D0D}",
    ".esm{position:fixed;inset:0;z-index:50;background:rgba(20,16,12,.55);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .18s}",
    ".esm.on{opacity:1}.esm .bx{background:#fff;border-radius:18px;width:100%;max-width:560px;max-height:calc(100vh - 32px);overflow:auto;padding:22px 22px 20px;font:14px/1.55 Inter;color:#17140F;transform:translateY(10px);transition:transform .2s}",
    ".esm.on .bx{transform:none}.esm h3{font:700 18px Montserrat;margin:0 0 4px}.esm .sub{color:#7A7268;font-size:13px;margin-bottom:14px}",
    ".est{display:flex;background:#F4EFE9;border-radius:11px;padding:4px;margin-bottom:12px}.est button{flex:1;border:0;background:none;border-radius:8px;padding:8px;font:600 13.5px Inter;color:#6B635A;cursor:pointer}.est button.on{background:#fff;color:#17140F;box-shadow:0 1px 3px rgba(0,0,0,.08)}",
    ".esd{position:relative;border:1px solid #DCD3C8;border-radius:13px;background:#fff;height:190px;touch-action:none;overflow:hidden}",
    ".esd canvas{position:absolute;inset:0;width:100%;height:100%;cursor:crosshair}",
    ".esd .bl{position:absolute;left:22px;right:22px;bottom:46px;border-bottom:1.5px solid #E2DAD0;pointer-events:none}",
    ".esd .hn{position:absolute;left:0;right:0;top:44%;text-align:center;font:500 14px Inter;color:#B7AEA3;pointer-events:none;transition:opacity .2s}",
    ".esd .x{position:absolute;left:24px;bottom:50px;font:600 15px Inter;color:#C9BFB3;pointer-events:none}",
    ".esk{display:flex;align-items:center;gap:10px;margin:10px 0 2px;flex-wrap:wrap}.esk .sp{flex:1}",
    ".esk button{border:1px solid #DCD3C8;background:#fff;border-radius:9px;padding:6px 11px;font:600 12.5px Inter;color:#4A433B;cursor:pointer;display:inline-flex;gap:6px;align-items:center}",
    ".tg{display:inline-flex;align-items:center;gap:8px;font:600 12.5px Inter;color:#3D3730;cursor:pointer;user-select:none}",
    ".tg input{display:none}.tg i{width:34px;height:20px;border-radius:99px;background:#D8CFC4;position:relative;transition:background .15s}.tg i:after{content:'';position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s;box-shadow:0 1px 2px rgba(0,0,0,.2)}",
    ".tg input:checked+i{background:#1F7A4D}.tg input:checked+i:after{transform:translateX(14px)}",
    ".esy{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}.esy button{border:1px solid #DCD3C8;background:#fff;border-radius:11px;height:64px;font-size:27px;color:" + INK + ";cursor:pointer;overflow:hidden;white-space:nowrap;padding:0 6px}.esy button.on{border-color:#8B0D0D;box-shadow:0 0 0 3px rgba(139,13,13,.10)}",
    ".esa{display:flex;gap:10px;align-items:flex-start;background:#FAF7F3;border:1px solid #EEE7DE;border-radius:12px;padding:12px 13px;margin:14px 0 4px;font-size:13.3px;color:#3D3730;cursor:pointer}",
    ".esa input{width:18px;height:18px;accent-color:#8B0D0D;flex:none;margin-top:2px}",
    ".esm .ft{display:flex;gap:10px;margin-top:16px}.esm .ft .esb{flex:1}",
    "@media screen and (max-width:760px){.esg{margin-top:16px}.esc{padding:20px 18px}.esm{align-items:flex-end;padding:0}.esm .bx{border-radius:18px 18px 0 0;max-height:94vh;padding:18px 16px calc(16px + env(safe-area-inset-bottom))}.esbar .in{gap:10px}.esbar .tx{font-size:12.5px}.esbar .tx b{font-size:13px}.esy{grid-template-columns:1fr}.esy button{font-size:26px;height:54px}}",
    "@media print{.esbar,.esg,.esm{display:none!important}body.cansign #sigM .sgn,body.fcansign #sigF .sgn{border:0;background:none}body.cansign #sigM .sgn:after,body.fcansign #sigF .sgn:after{content:''}}"
  ].join("\n");
  document.head.appendChild(css);
  var fl = document.createElement("link"); fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Great+Vibes&display=swap"; document.head.appendChild(fl);

  /* ---------- state ---------- */
  var S = { doc: null, role: "", v: "", step: "", err: "", sent: false, busy: false, pdfBlob: null };
  window.ES = S;

  window.paintSigs = function () {
    var d = S.doc; if (!d) return;
    var put = function (id, p) { var bx = document.getElementById(id); if (!bx) return; var s = bx.querySelector(".sgn"); s.innerHTML = p.sig ? '<img alt="" src="' + p.sig + '">' : ""; s.setAttribute("data-h", L("Tap to sign here", "साइन करने के लिए यहाँ टैप करें")); };
    put("sigM", d.member); put("sigF", d.founder);
    var f = document.getElementById("sigF");
    if (f) { f.querySelector("b").textContent = d.founder.name; f.querySelector(".fsd").textContent = d.founder.signedAt ? L("Signed ", "साइन किया: ") + ist(d.founder.signedAt) : L("Signs after the member", "सदस्य के बाद साइन करेंगे"); }
    B.classList.toggle("unsigned", !(d.member.signedAt && d.founder.signedAt));
  };

  function setDoc(doc) {
    S.doc = doc;
    var m = doc.m || {};
    REC = { id: doc.id, name: m.name, email: m.email, phone: m.phone, city: m.city, address: m.address, role: m.role, rdesc: m.rdesc || "", level: m.level, issued: doc.created, memberSigned: !!doc.member.signedAt };
    T0 = doc.member.signedAt ? new Date(doc.member.signedAt) : new Date();
    calcDT(); fillD(); drawQR();
  }

  /* ---------- server ---------- */
  function api(action, body) {
    return fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ action: action, id: DID, t: TK }, body || {})) })
      .then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: "network" }; });
  }
  var PK = "hgjv:" + DID + ":" + TK.slice(0, 8);
  function getProof() { try { var o = JSON.parse(sessionStorage.getItem(PK) || "null"); if (o && Date.now() - o.at < 50 * 60000) return o.v; } catch (e) {} return ""; }
  function setProof(v) { try { sessionStorage.setItem(PK, JSON.stringify({ v: v, at: Date.now() })); } catch (e) {} }
  function errText(e) {
    var M = {
      network: ["No internet connection, or the server did not answer. Please try again.", "इंटरनेट नहीं है या सर्वर ने जवाब नहीं दिया। फिर से कोशिश करें।"],
      bad_code: ["That code is not right. Check the latest email and try again.", "कोड सही नहीं है। नया ईमेल देखकर फिर से डालें।"],
      locked: ["Too many wrong tries. Ask for a new code after some time.", "बहुत बार गलत कोड डाला गया। थोड़ी देर बाद नया कोड मँगाएँ।"],
      wait: ["Too many codes asked. Please wait an hour and try again.", "बहुत सारे कोड मँगाए गए। एक घंटे बाद फिर कोशिश करें।"],
      fields: ["Please fill every field. Phone needs at least 10 digits.", "हर जानकारी भरें। फ़ोन नंबर में कम से कम 10 अंक हों।"],
      sig: ["Please add your signature first.", "पहले अपना साइन करें।"],
      agree: ["Please tick the box to confirm.", "पुष्टि के लिए बॉक्स पर टिक करें।"],
      member_first: ["The member has not signed yet. You can sign after them.", "सदस्य ने अभी साइन नहीं किया है। उनके बाद आप साइन कर पाएँगे।"],
      already: ["This was already signed.", "यह पहले ही साइन हो चुका है।"],
      server: ["Something went wrong on our side. Please try again.", "हमारी तरफ़ कुछ गड़बड़ हुई। फिर से कोशिश करें।"]
    };
    var t = M[e] || M.server; return L(t[0], t[1]);
  }
  function fail(kind) {
    var M = {
      setup: ["Signing is not switched on yet", "The founding team is still setting this up. Please try again a little later.", "साइन करना अभी चालू नहीं हुआ है", "फ़ाउंडिंग टीम इसे सेट कर रही है। थोड़ी देर बाद फिर से कोशिश करें।"],
      link: ["This link does not work", "Open the link exactly as it came in your email. If it still does not work, ask the founding team for a new link.", "यह लिंक काम नहीं कर रहा", "ईमेल में आया लिंक ही खोलें। फिर भी न चले तो फ़ाउंडिंग टीम से नया लिंक माँगें।"],
      not_found: ["Agreement not found", "Open the link exactly as it came in your email, or ask the founding team for a new link.", "एग्रीमेंट नहीं मिला", "ईमेल में आया लिंक ही खोलें या फ़ाउंडिंग टीम से नया लिंक माँगें।"],
      void: ["This agreement was cancelled", "The founding team cancelled this agreement. Please talk to them if you think this is a mistake.", "यह एग्रीमेंट रद्द कर दिया गया है", "फ़ाउंडिंग टीम ने यह एग्रीमेंट रद्द कर दिया है। गलती लगे तो उनसे बात करें।"],
      network: ["Could not load the agreement", "Check your internet connection and reload this page.", "एग्रीमेंट लोड नहीं हुआ", "इंटरनेट चेक करें और पेज फिर से खोलें।"]
    };
    var t = M[kind] || M.not_found, el = document.getElementById("lmsg");
    HTML.classList.remove("ld"); B.classList.add("bad"); B.classList.remove("gate");
    el.hidden = false; el.innerHTML = "<b>" + esc(L(t[0], t[2])) + "</b>" + esc(L(t[1], t[3]));
    S.step = "fail:" + kind;
  }

  /* ---------- screens ---------- */
  var G, BAR;
  function first(n) { return String(n || "").trim().split(/\s+/)[0] || ""; }
  function head() {
    return '<div class="esh"><img src="hg-3d.png" alt=""><div><b>' + esc(L("Step 1 Joining Agreement", "स्टेप 1 जॉइनिंग एग्रीमेंट")) + "</b><span>Haritt Group · " + esc(S.doc.id) + "</span></div></div>";
  }
  function prog(at) {
    var st = S.role === "member" ? [L("Confirm", "पुष्टि"), L("Your details", "आपकी जानकारी"), L("Read and sign", "पढ़ें और साइन करें")] : [L("Confirm", "पुष्टि"), L("Read and sign", "पढ़ें और साइन करें")];
    return '<div class="esp">' + st.map(function (t, i) { return '<div class="' + (i < at ? "ok" : i == at ? "on" : "") + '">' + (i + 1) + ". " + esc(t) + "</div>"; }).join("") + "</div>";
  }
  function showGate(html) { B.classList.add("gate"); G.innerHTML = '<div class="esc">' + html + "</div>"; G.hidden = false; hideBar(); window.scrollTo(0, 0); }
  function hideGate() { B.classList.remove("gate"); G.hidden = true; G.innerHTML = ""; }
  function bar(html) { BAR.innerHTML = '<div class="in">' + html + "</div>"; BAR.hidden = false; B.classList.add("hasbar"); }
  function hideBar() { BAR.hidden = true; B.classList.remove("hasbar"); }

  function render() {
    var d = S.doc; if (!d) return;
    var me = d[S.role], both = d.member.signedAt && d.founder.signedAt;
    B.classList.remove("cansign", "fcansign");
    if (both) { hideGate(); return barDone(); }
    if (me.signedAt) { hideGate(); return bar('<div class="tx"><b><i class="ph ph-check-circle ok"></i> ' + esc(L("You have signed", "आपने साइन कर दिया है")) + "</b>" + esc(L("The founding team signs next. Once both sides sign, the signed PDF comes to your email.", "अब फ़ाउंडिंग टीम साइन करेगी। दोनों के साइन होते ही साइन किया हुआ PDF आपके ईमेल पर आ जाएगा।")) + "</div>"); }
    if (S.role === "founder" && !d.member.signedAt) {
      hideGate(); return bar('<div class="tx"><b>' + esc(L("Waiting for the member", "सदस्य का इंतज़ार")) + "</b>" + esc(L(first(d.m.name) + " has not signed yet. You will get an email when it is your turn.", first(d.m.name) + " ने अभी साइन नहीं किया है। आपकी बारी आने पर ईमेल आएगा।")) + "</div>");
    }
    if (!S.v) return scrCode();
    if (S.role === "member" && (!d.m.filled || S.step == "details")) return scrDetails();
    return scrRead();
  }

  function scrCode() {
    S.step = "code";
    var h = head() + prog(0) + "<h2>" + esc(L("Confirm it is you", "पुष्टि करें कि यह आप ही हैं")) + "</h2>";
    if (!S.sent) {
      h += "<p>" + esc(L("Hi " + first(S.doc[S.role].name) + ". To keep this agreement safe, we will send a 6-digit code to ", "नमस्ते " + first(S.doc[S.role].name) + "। इस एग्रीमेंट को सुरक्षित रखने के लिए हम 6 अंकों का कोड भेजेंगे: ")) + "<b>" + esc(S.doc.email) + "</b></p>" +
        '<button class="esb w" id="esSend"><i class="ph ph-paper-plane-tilt"></i>' + esc(L("Send code", "कोड भेजें")) + '</button><div class="ese" id="esErr">' + esc(S.err) + "</div>";
    } else {
      h += "<p>" + esc(L("We sent a 6-digit code to ", "हमने 6 अंकों का कोड भेजा है: ")) + "<b>" + esc(S.doc.email) + "</b>. " + esc(L("It works for 15 minutes.", "यह 15 मिनट तक चलेगा।")) + "</p>" +
        '<div class="eso"><input class="esi" id="esCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="······"><button class="esb" id="esChk">' + esc(L("Confirm", "पुष्टि करें")) + "</button></div>" +
        '<div class="ese" id="esErr">' + esc(S.err) + '</div><button class="esl" id="esSend">' + esc(L("Send a new code", "नया कोड भेजें")) + '</button><div class="esn">' + esc(L("Not in your inbox? Check Spam or Promotions.", "इनबॉक्स में नहीं दिखा? Spam या Promotions देखें।")) + "</div>";
    }
    showGate(h);
    var sb = document.getElementById("esSend"), cb = document.getElementById("esChk"), ci = document.getElementById("esCode");
    sb.onclick = function () {
      if (S.busy || S.sending) return; S.sending = true; S.err = ""; var was = S.sent;
      S.sent = true; scrCode(); var c0 = document.getElementById("esCode"); if (c0) c0.focus();  // show the code box at once; the email is on its way
      api("otp_send").then(function (r) { S.sending = false; if (r.ok && r.ot) S.ot = r.ot; if (!r.ok) { S.sent = was; S.err = errText(r.error); scrCode(); } });
    };
    if (cb) {
      var go = function () {
        var code = ci.value.replace(/\D/g, ""); if (code.length != 6) { document.getElementById("esErr").textContent = L("Enter the 6-digit code.", "6 अंकों का कोड डालें।"); return; }
        if (S.busy) return; S.busy = true; cb.disabled = true; cb.innerHTML = '<i class="ph ph-circle-notch"></i>';
        api("otp_check", { code: code, ot: S.ot || "" }).then(function (r) {
          S.busy = false;
          if (r.ok) { S.v = r.v; setProof(r.v); S.err = ""; render(); } else { S.err = errText(r.error); scrCode(); }
        });
      };
      cb.onclick = go; ci.onkeydown = function (e) { if (e.key == "Enter") go(); };
      ci.oninput = function () { ci.value = ci.value.replace(/\D/g, "").slice(0, 6); if (ci.value.length == 6) go(); };
    }
  }

  function scrDetails() {
    S.step = "details";
    var m = S.doc.m;
    var h = head() + prog(1) +
      '<div class="esw"><b>' + esc(L("Welcome to Haritt, " + first(m.name) + ".", "Haritt में आपका स्वागत है, " + first(m.name) + "।")) + "</b><p>" +
      esc(L("We are glad you are here. Haritt is built by people who care about real, useful work and who own what they do. In your first 10 days you will learn how we work, try real tasks and find where you fit best. Ask anything, be honest, and grow with us.",
        "हमें खुशी है कि आप हमारे साथ हैं। Haritt ऐसे लोगों से बन रहा है जो असली और काम की चीज़ें बनाते हैं और अपने काम की ज़िम्मेदारी लेते हैं। पहले 10 दिनों में आप सीखेंगे कि हम कैसे काम करते हैं, असली काम करके देखेंगे और जानेंगे कि आप कहाँ सबसे अच्छे से फ़िट होते हैं। कुछ भी पूछें, ईमानदार रहें और हमारे साथ आगे बढ़ें।")) + "</p></div>" +
      "<h2>" + esc(L("Your details", "आपकी जानकारी")) + "</h2><p>" + esc(L("These go into your agreement exactly as you type them.", "जो आप लिखेंगे, वही आपके एग्रीमेंट में आएगा।")) + "</p>" +
      '<div class="esf">' +
      "<label>" + esc(L("Full name", "पूरा नाम")) + " <small>" + esc(L("as it should appear in the agreement", "जैसा एग्रीमेंट में आना चाहिए")) + '</small><input id="fN" autocomplete="name" maxlength="80" value="' + esc(m.name) + '"></label>' +
      "<label>" + esc(L("Email", "ईमेल")) + ' <small>' + esc(L("confirmed", "पुष्टि हो चुकी")) + '</small><input readonly value="' + esc(m.email) + '"></label>' +
      "<label>" + esc(L("Phone number", "फ़ोन नंबर")) + '<input id="fP" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="+91 98765 43210" value="' + esc(m.phone || "") + '"></label>' +
      "<label>" + esc(L("City and state", "शहर और राज्य")) + '<input id="fC" autocomplete="address-level2" maxlength="60" placeholder="' + esc(L("Jaipur, Rajasthan", "जयपुर, राजस्थान")) + '" value="' + esc(m.city || "") + '"></label>' +
      "<label>" + esc(L("Full address", "पूरा पता")) + '<textarea id="fA" autocomplete="street-address" maxlength="200" placeholder="' + esc(L("House number, street, area, PIN code", "मकान नंबर, गली, इलाका, पिन कोड")) + '">' + esc(m.address || "") + "</textarea></label>" +
      "<div><label>" + esc(L("Set by the founding team", "फ़ाउंडिंग टीम ने तय किया")) + '</label><div class="esr" style="margin-top:6px"><span>' + esc(m.role) + "</span><span>" + esc(m.level) + "</span></div></div>" +
      '</div><div class="ese" id="esErr"></div><button class="esb w" id="esSave" style="margin-top:18px">' + esc(L("Save and read the agreement", "सेव करें और एग्रीमेंट पढ़ें")) + ' <i class="ph ph-arrow-right"></i></button>';
    showGate(h);
    var sv = document.getElementById("esSave");
    sv.onclick = function () {
      var x = { name: fN.value.trim(), phone: fP.value.trim(), city: fC.value.trim(), address: fA.value.trim() }, er = document.getElementById("esErr");
      if (x.name.length < 2 || x.phone.replace(/\D/g, "").length < 10 || x.city.length < 2 || x.address.length < 6) { er.textContent = errText("fields"); return; }
      if (S.busy) return; S.busy = true; sv.disabled = true;
      api("details", { v: S.v, data: x }).then(function (r) {
        S.busy = false; sv.disabled = false;
        if (r.ok) { setDoc(r.doc); S.step = "read"; render(); }
        else if (r.error == "verify") { S.v = ""; S.sent = false; S.err = L("Your session ended. Please confirm again.", "सेशन ख़त्म हो गया। फिर से पुष्टि करें।"); render(); }
        else er.textContent = errText(r.error);
      });
    };
    var fN = document.getElementById("fN"), fP = document.getElementById("fP"), fC = document.getElementById("fC"), fA = document.getElementById("fA");
  }

  function scrRead() {
    S.step = "read"; hideGate();
    var mem = S.role === "member";
    B.classList.add(mem ? "cansign" : "fcansign");
    bar('<div class="tx"><b>' + esc(mem ? L("Read every page, then sign", "हर पेज पढ़ें, फिर साइन करें") : L(first(S.doc.m.name) + " has signed. Your turn.", first(S.doc.m.name) + " ने साइन कर दिया है। अब आपकी बारी।")) + "</b>" +
      esc(mem ? L("Your signature goes on the last page.", "आपका साइन आख़िरी पेज पर आएगा।") : L("Check the details, then sign for Haritt Group.", "जानकारी देखें, फिर Haritt Group की तरफ़ से साइन करें।")) + "</div>" +
      (mem ? '<button class="esb g" id="esEdit" title="' + esc(L("Edit details", "जानकारी बदलें")) + '"><i class="ph ph-pencil-simple"></i></button>' : "") +
      '<button class="esb" id="esGo"><i class="ph ph-signature"></i>' + esc(L("Sign", "साइन करें")) + "</button>");
    document.getElementById("esGo").onclick = openSign;
    var ed = document.getElementById("esEdit"); if (ed) ed.onclick = function () { S.step = "details"; scrDetails(); };
  }
  document.addEventListener("click", function (e) {
    var s = e.target.closest && e.target.closest(".sgn"); if (!s || !S.doc || S.step !== "read") return;
    var bx = s.closest(".sig"); if ((S.role == "member" && bx.id == "sigM") || (S.role == "founder" && bx.id == "sigF")) openSign();
  });

  function showDl() { var dl = document.querySelector(".vb .dl"); if (!dl) return; dl.removeAttribute("onclick"); dl.onclick = download; dl.style.display = ""; }
  function barDone() {
    S.step = "done";
    var d = S.doc, txt;
    if (d.final) txt = L("Signed by both sides. The signed PDF was emailed to both.", "दोनों तरफ़ से साइन हो गया। साइन किया हुआ PDF दोनों के ईमेल पर भेज दिया गया है।");
    else txt = L("Signed by both sides. Preparing the signed PDF and emailing it to both…", "दोनों तरफ़ से साइन हो गया। साइन किया हुआ PDF बनाकर दोनों को ईमेल किया जा रहा है…");
    bar('<div class="tx"><b><i class="ph ph-seal-check ok"></i> ' + esc(L("Agreement complete", "एग्रीमेंट पूरा हुआ")) + "</b>" + esc(txt) + '</div>');
    showDl();
    if (!d.final && !S.finalRun) sendFinal();
  }

  /* ---------- signing ---------- */
  var pad;
  function openSign() {
    if (document.querySelector(".esm")) return;
    var d = S.doc, me = d[S.role], mem = S.role === "member";
    var w = document.createElement("div"); w.className = "esm";
    w.innerHTML = '<div class="bx" role="dialog" aria-modal="true"><h3>' + esc(L("Add your signature", "अपना साइन करें")) + '</h3><div class="sub">' + esc(L("Signing as ", "साइन करने वाले: ")) + "<b>" + esc(me.name) + "</b> · " + esc(d.email) + "</div>" +
      '<div class="est"><button data-t="d" class="on"><i class="ph ph-pen-nib"></i> ' + esc(L("Draw", "हाथ से")) + '</button><button data-t="y"><i class="ph ph-text-aa"></i> ' + esc(L("Type", "टाइप करें")) + "</button></div>" +
      '<div id="tD"><div class="esd"><canvas></canvas><div class="bl"></div><div class="x">×</div><div class="hn">' + esc(L("Sign here with your finger or mouse", "यहाँ अंगुली या माउस से साइन करें")) + "</div></div>" +
      '<div class="esk"><label class="tg"><input type="checkbox" id="esAc" checked><i></i>' + esc(L("Auto-correct lines", "लाइनें अपने आप सीधी करें")) + '</label><span class="sp"></span><button id="esUn"><i class="ph ph-arrow-counter-clockwise"></i>' + esc(L("Undo", "वापस")) + '</button><button id="esCl"><i class="ph ph-eraser"></i>' + esc(L("Clear", "मिटाएँ")) + "</button></div></div>" +
      '<div id="tY" hidden><input class="esi" id="esTn" maxlength="60" value="' + esc(me.name) + '"><div class="esy"></div></div>' +
      '<label class="esa"><input type="checkbox" id="esAg"><span>' + esc(mem ? L("I have read all " + document.querySelectorAll(".sheet").length + " pages myself. I agree to everything in this agreement, including the 6 confirmations in section 19, and I sign it of my own free will.", "मैंने सभी " + document.querySelectorAll(".sheet").length + " पेज ख़ुद पढ़े हैं। मैं इस एग्रीमेंट की हर बात से सहमत हूँ, सेक्शन 19 की 6 पुष्टियों समेत, और अपनी मर्ज़ी से साइन कर रहा/रही हूँ।")
        : L("I have checked the member's details and this agreement, and I sign it for Haritt Group.", "मैंने सदस्य की जानकारी और यह एग्रीमेंट देख लिया है, और Haritt Group की तरफ़ से साइन कर रहा हूँ।")) + "</span></label>" +
      '<div class="esn" style="margin-top:8px">' + esc(L("Your signature, the time, your confirmed email and device are recorded with Document ID " + d.id + ".", "आपका साइन, समय, पुष्टि किया गया ईमेल और डिवाइस, डॉक्यूमेंट ID " + d.id + " के साथ रिकॉर्ड होते हैं।")) + "</div>" +
      '<div class="ese" id="esSErr"></div><div class="ft"><button class="esb g" id="esX">' + esc(L("Cancel", "रद्द करें")) + '</button><button class="esb" id="esOk"><i class="ph ph-signature"></i>' + esc(L("Sign agreement", "एग्रीमेंट साइन करें")) + "</button></div></div>";
    document.body.appendChild(w); requestAnimationFrame(function () { w.classList.add("on"); });
    var mode = "d", font = 0, FONTS = [[600, "'Dancing Script'"], [400, "'Great Vibes'"], [600, "Caveat"]];
    pad = Pad(w.querySelector(".esd"), w.querySelector("#esAc"));
    w.querySelector("#esUn").onclick = function () { pad.undo(); };
    w.querySelector("#esCl").onclick = function () { pad.clear(); };
    w.querySelectorAll(".est button").forEach(function (b) { b.onclick = function () { mode = b.dataset.t; w.querySelectorAll(".est button").forEach(function (x) { x.classList.toggle("on", x == b); }); w.querySelector("#tD").hidden = mode != "d"; w.querySelector("#tY").hidden = mode != "y"; if (mode == "d") pad.fit(); }; });
    var tn = w.querySelector("#esTn"), ty = w.querySelector(".esy");
    var drawTy = function () { ty.innerHTML = FONTS.map(function (f, i) { return '<button data-i="' + i + '" class="' + (i == font ? "on" : "") + '" style="font-weight:' + f[0] + ';font-family:' + f[1].replace(/'/g, "&quot;") + '">' + esc(tn.value || me.name) + "</button>"; }).join(""); ty.querySelectorAll("button").forEach(function (b) { b.onclick = function () { font = +b.dataset.i; drawTy(); }; }); };
    tn.oninput = drawTy; drawTy();
    var close = function () { w.classList.remove("on"); setTimeout(function () { w.remove(); }, 180); };
    w.querySelector("#esX").onclick = close; w.onclick = function (e) { if (e.target == w) close(); };
    var ok = w.querySelector("#esOk"), er = w.querySelector("#esSErr");
    ok.onclick = function () {
      er.textContent = "";
      var sig = mode == "d" ? pad.png() : typed(tn.value.trim(), FONTS[font]);
      if (!sig) { er.textContent = errText("sig"); return; }
      if (!w.querySelector("#esAg").checked) { er.textContent = errText("agree"); return; }
      if (S.busy) return; S.busy = true; ok.disabled = true; ok.innerHTML = '<i class="ph ph-circle-notch"></i>' + esc(L("Signing…", "साइन हो रहा है…"));
      api("sign", { v: S.v, sig: sig, agree: true, ua: navigator.userAgent.slice(0, 200), lang: hi() ? "hi" : "en" }).then(function (r) {
        S.busy = false;
        if (r.ok) { close(); setDoc(r.doc); render(); var el = document.getElementById(S.role == "member" ? "sigM" : "sigF"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
        ok.disabled = false; ok.innerHTML = '<i class="ph ph-signature"></i>' + esc(L("Sign agreement", "एग्रीमेंट साइन करें"));
        if (r.error == "verify") { close(); S.v = ""; S.sent = false; S.err = L("Your session ended. Please confirm again.", "सेशन ख़त्म हो गया। फिर से पुष्टि करें।"); render(); }
        else er.textContent = errText(r.error);
      });
    };
  }

  function typed(name, font) {
    if (name.length < 2) return "";
    var c = document.createElement("canvas"), x = c.getContext("2d"), px = 92;
    var fs = function (n) { return font[0] + " " + n + "px " + font[1]; }; x.font = fs(px); var w = Math.ceil(x.measureText(name).width) + 40;
    c.width = Math.min(w, 1400); c.height = 150; x = c.getContext("2d");
    var sc = c.width < w ? c.width / w : 1; x.font = fs(Math.floor(px * sc)); x.fillStyle = INK; x.textBaseline = "alphabetic"; x.fillText(name, 20, 108);
    return c.toDataURL("image/png");
  }

  /* Signature pad. Raw strokes are kept; auto-correct smooths shaky curves and turns near-straight parts into clean straight lines. */
  function Pad(box, ac) {
    var cv = box.querySelector("canvas"), hn = box.querySelector(".hn"), cx = cv.getContext("2d"), S2 = [], cur = null, dpr = Math.max(1, window.devicePixelRatio || 1), W = 0, H = 0;
    function fit() { var r = box.getBoundingClientRect(); if (!r.width) return; W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; draw(); }
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener("pointerdown", function (e) { e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = [pos(e)]; S2.push(cur); hn.style.opacity = 0; draw(); });
    cv.addEventListener("pointermove", function (e) { if (!cur) return; e.preventDefault(); var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; evs.forEach(function (v) { var p = pos(v), l = cur[cur.length - 1]; if (Math.hypot(p.x - l.x, p.y - l.y) > .6) cur.push(p); }); draw(); });
    var end = function () { if (!cur) return; cur = null; draw(); };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    ac.onchange = function () { draw(); };
    window.addEventListener("resize", fit);
    function paths() { return S2.map(function (s) { return s === cur || !ac.checked ? soft(s, 0) : correct(s); }); }
    function draw() {
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      stroke(cx, paths(), 2.6);
      hn.style.opacity = S2.length ? 0 : 1;
    }
    setTimeout(fit, 30);
    return {
      fit: fit, clear: function () { S2 = []; draw(); }, undo: function () { S2.pop(); draw(); },
      png: function () {
        var P = paths().filter(function (p) { return p.length; }); if (!P.length) return "";
        var len = 0; S2.forEach(function (s) { for (var i = 1; i < s.length; i++) len += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y); });
        if (len < 40) return "";
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; P.forEach(function (p) { p.forEach(function (q) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }); });
        var pd = 6, k = 2, c = document.createElement("canvas"); c.width = Math.ceil((x1 - x0 + pd * 2) * k); c.height = Math.ceil((y1 - y0 + pd * 2) * k);
        var g = c.getContext("2d"); g.setTransform(k, 0, 0, k, (pd - x0) * k, (pd - y0) * k); stroke(g, P, 2.6);
        return c.toDataURL("image/png");
      }
    };
  }
  function stroke(g, P, w) {
    g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
    P.forEach(function (p) {
      if (p.length == 1) { g.beginPath(); g.arc(p[0].x, p[0].y, w * .7, 0, 7); g.fill(); return; }
      g.beginPath(); g.moveTo(p[0].x, p[0].y);
      for (var i = 1; i < p.length - 1; i++) { var mx = (p[i].x + p[i + 1].x) / 2, my = (p[i].y + p[i + 1].y) / 2; g.quadraticCurveTo(p[i].x, p[i].y, mx, my); }
      g.lineTo(p[p.length - 1].x, p[p.length - 1].y); g.stroke();
    });
  }
  function soft(s, n) { return s.slice(); }
  function dseg(p, a, b) { var dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy; if (!l) return Math.hypot(p.x - a.x, p.y - a.y); var t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l)); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); }
  function rdpI(P, lo, hi, eps, out) { var m = 0, k = -1; for (var i = lo + 1; i < hi; i++) { var d = dseg(P[i], P[lo], P[hi]); if (d > m) { m = d; k = i; } } if (m > eps) { rdpI(P, lo, k, eps, out); out.push(k); rdpI(P, k, hi, eps, out); } }
  function corners(P, eps) { var o = [0]; rdpI(P, 0, P.length - 1, eps, o); o.push(P.length - 1); return o; }
  function chaikin(P, it) { for (var n = 0; n < it; n++) { if (P.length < 3) return P; var Q = [P[0]]; for (var i = 0; i < P.length - 1; i++) { var a = P[i], b = P[i + 1]; Q.push({ x: .75 * a.x + .25 * b.x, y: .75 * a.y + .25 * b.y }, { x: .25 * a.x + .75 * b.x, y: .25 * a.y + .75 * b.y }); } Q.push(P[P.length - 1]); P = Q; } return P; }
  function correct(s) {
    if (s.length < 3) return s.slice();
    /* 1. calm the hand shake (moving average, ends fixed) */
    var P = s.map(function (p, i) { if (i == 0 || i == s.length - 1) return p; var a = s[Math.max(0, i - 2)], b = s[i - 1], c = s[i + 1], d = s[Math.min(s.length - 1, i + 2)]; return { x: (a.x + b.x + 2 * p.x + c.x + d.x) / 6, y: (a.y + b.y + 2 * p.y + c.y + d.y) / 6 }; });
    var len = 0; for (var i = 1; i < P.length; i++) len += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
    if (len < 6) return [P[0]];
    /* 2. find corners, then make each near-straight part a clean straight line */
    var K = corners(P, Math.max(2.5, Math.min(7, len * .045))), out = [P[0]], straightAll = true;
    for (var k = 0; k < K.length - 1; k++) {
      var a = P[K[k]], b = P[K[k + 1]], L2 = Math.hypot(b.x - a.x, b.y - a.y), dev = 0;
      for (var j = K[k] + 1; j < K[k + 1]; j++) dev = Math.max(dev, dseg(P[j], a, b));
      if (dev <= Math.max(1.6, L2 * .06)) { out.push(b, b); }
      else { straightAll = false; var seg = chaikin(P.slice(K[k], K[k + 1] + 1).filter(function (q, i2, A) { return i2 % 2 == 0 || i2 == A.length - 1; }), 2); for (var t = 1; t < seg.length; t++) out.push(seg[t]); }
    }
    /* 3. a single straight stroke close to flat or upright is made exactly flat or upright (like the bars of an H) */
    if (straightAll && K.length == 2) {
      var A = out[0], Bp = out[out.length - 1], ang = Math.atan2(Bp.y - A.y, Bp.x - A.x) * 180 / Math.PI, ab = Math.abs(ang), mx = (A.x + Bp.x) / 2, my = (A.y + Bp.y) / 2, h2 = Math.hypot(Bp.x - A.x, Bp.y - A.y) / 2;
      if (ab < 9 || ab > 171) { var sg = ab < 9 ? 1 : -1; return [{ x: mx - sg * h2, y: my }, { x: mx + sg * h2, y: my }]; }
      if (Math.abs(ab - 90) < 9) { var sv = ang > 0 ? 1 : -1; return [{ x: mx, y: my - sv * h2 }, { x: mx, y: my + sv * h2 }]; }
      return [A, Bp];
    }
    return out;
  }

  /* ---------- signed PDF: same A4 layout as print, made in a hidden frame at desktop width ---------- */
  function loadJs(w, src) { return new Promise(function (ok, no) { var s = w.document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; w.document.head.appendChild(s); }); }
  function makePdf() {
    return new Promise(function (ok, no) {
      var f = document.createElement("iframe");
      f.style.cssText = "position:fixed;left:-12000px;top:0;width:900px;height:1300px;border:0;visibility:hidden";
      f.src = location.pathname + "?cap=1"; document.body.appendChild(f);
      f.onload = function () {
        var w = f.contentWindow, base = new URL("../vendor/", location.href).href;
        Promise.all([loadJs(w, base + "html2canvas.min.js"), loadJs(w, base + "jspdf.umd.min.js")]).then(function () {
          return w.esCapture(S.doc, hi() ? "hi" : "en");
        }).then(function (blob) { f.remove(); ok(blob); }).catch(function (e) { f.remove(); no(e); });
      };
    });
  }
  function b64(blob) { return new Promise(function (ok) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(",")[1]); }; r.readAsDataURL(blob); }); }
  function sendFinal() {
    S.finalRun = true;
    makePdf().then(function (blob) { S.pdfBlob = blob; return b64(blob); }).then(function (data) { return api("final", { pdf: data }); }).then(function (r) {
      if (r.ok) { S.doc.final = { at: new Date().toISOString() }; if (S.step == "done") barDone(); }
      else { S.finalRun = false; var t = BAR.querySelector(".tx"); if (t) t.lastChild.textContent = L("Signed by both sides. The PDF email did not go yet; reload this page to try again.", "दोनों तरफ़ से साइन हो गया। PDF ईमेल अभी नहीं गया; दोबारा कोशिश के लिए पेज फिर से खोलें।"); }
    }).catch(function () { S.finalRun = false; });
  }
  function download() {
    var b = document.querySelector(".vb .dl"), save = function (blob) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = TTL() + ".pdf"; document.body.appendChild(a); a.click(); a.remove(); };
    if (S.pdfBlob) return save(S.pdfBlob);
    b.disabled = true; b.innerHTML = '<i class="ph ph-circle-notch"></i>' + esc(L("Making PDF…", "PDF बन रहा है…"));
    makePdf().then(function (blob) { S.pdfBlob = blob; save(blob); }).catch(function () { print(); }).then(function () { b.disabled = false; b.innerHTML = '<i class="ph ph-download-simple"></i>PDF'; });
  }

  /* inside the hidden frame */
  if (CAP) {
    HTML.classList.add("cap");
    window.esCapture = function (doc, lang) {
      S.doc = doc; setDoc(doc); setL(lang == "hi" ? "hi" : "en"); paintSigs(); B.classList.remove("unsigned"); B.classList.add("real");
      var toData = function (url) { return fetch(url).then(function (r) { return r.blob(); }).then(function (bl) { return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { ok(fr.result); }; fr.readAsDataURL(bl); }); }); };
      return document.fonts.ready.then(function () { return toData("flame-wm.png"); }).then(function (du) {
        document.querySelectorAll("#qr image").forEach(function (im) { im.setAttribute("href", du); });
        return new Promise(function (r) { setTimeout(r, 120); });
      }).then(function () {
        var J = window.jspdf.jsPDF, pdf = new J({ unit: "mm", format: "a4", compress: true }), sh = [].slice.call(document.querySelectorAll(".sheet")), i = 0;
        pdf.setProperties({ title: TTL(), subject: "Step 1 Joining Agreement " + doc.id, author: "Haritt Group", creator: "Haritt Group" });
        var next = function () {
          if (i >= sh.length) return Promise.resolve(pdf.output("blob"));
          var el = sh[i];
          return html2canvas(el, { scale: 1.6, backgroundColor: el.classList.contains("dark") ? "#141110" : "#ffffff", useCORS: true, logging: false, windowWidth: 900 }).then(function (c) {
            if (i) pdf.addPage("a4");
            pdf.addImage(c.toDataURL("image/jpeg", .86), "JPEG", 0, 0, 210, 297, undefined, "FAST"); i++; return next();
          });
        };
        return next();
      });
    };
    return;
  }

  /* ---------- start ---------- */
  if (!DID) return; /* sample preview, nothing to load */
  G = document.createElement("div"); G.className = "esg"; G.id = "esg"; G.hidden = true;
  document.getElementById("lmsg").after(G);
  BAR = document.createElement("div"); BAR.className = "esbar"; BAR.hidden = true; document.body.appendChild(BAR);
  var dl = document.querySelector(".vb .dl"); if (dl) dl.style.display = "none";
  if (!API || /PENDING/.test(API)) return fail("setup");
  if (!TK) return fail("link");
  api("view").then(function (r) {
    if (!r.ok) return fail(r.error == "link" || r.error == "void" || r.error == "network" ? r.error : "not_found");
    S.role = r.doc.role; S.v = getProof();
    setDoc(r.doc); B.classList.add("real"); HTML.classList.remove("ld");
    if (r.doc.member.signedAt && r.doc.founder.signedAt && dl) { showDl(); }
    render();
  });
  /* language switch: redraw the current screen in the new language */
  var lastHi = hi();
  new MutationObserver(function () { if (hi() === lastHi) return; lastHi = hi(); if (S.step.indexOf("fail:") == 0) return fail(S.step.slice(5)); if (S.doc) { if (S.step == "details") scrDetails(); else render(); } }).observe(B, { attributes: true, attributeFilter: ["class"] });
})();
