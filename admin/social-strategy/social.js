/* Social Strategy (Haritt admin): data and behaviour for the HV Verse page. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- platforms ---------- */
  var PF = {
    ig: { n: "Instagram", ab: "IG", bg: "linear-gradient(135deg,#F58529,#DD2A7B 55%,#8134AF)", c: "#DD2A7B" },
    yt: { n: "YouTube", ab: "YT", bg: "#FF0000", c: "#FF4D4D" },
    li: { n: "LinkedIn", ab: "in", bg: "#0A66C2", c: "#3B8FE0" },
    x: { n: "X", ab: "X", bg: "#222", c: "#C3C3CF" },
    fb: { n: "Facebook", ab: "f", bg: "#1877F2", c: "#5B9BFF" }
  };
  var badge = function (k) { var p = PF[k]; return '<span class="pf"><i style="background:' + p.bg + (k === "x" ? ";box-shadow:inset 0 0 0 1px #444" : "") + '">' + p.ab + "</i>" + p.n + "</span>"; };

  var VERDICT = [
    ["ig", "Discovery and community: where students find us and save our tips", "p1", "Primary", "Students 16 to 24, freshers", "4 posts + stories a week"],
    ["yt", "Search and depth: tutorials people find for years", "p2", "Essential", "Students and freshers searching how-to", "3 Shorts a week, 2 long videos a month"],
    ["li", "Trust: how the team builds, career insights for freshers, institutes later", "p2", "Essential", "Freshers, professionals, educators, partners", "3 page posts a week"],
    ["x", "Conversation: build in public, product updates, replies", "p3", "Light", "Builders, tech and edtech people", "3 short posts a week, mostly replies"],
    ["fb", "Reach parents and smaller towns later; hold the page now", "p4", "Hold", "Parents, coaching owners", "Share reels 2 times a week, no extra work"]
  ];
  $("verdict").innerHTML = VERDICT.map(function (r) {
    return "<tr><td>" + badge(r[0]) + '</td><td data-l="Role">' + esc(r[1]) + '</td><td data-l="Priority"><span class="pr ' + r[2] + '">' + r[3] + '</span></td><td data-l="Main audience">' + esc(r[4]) + '</td><td data-l="How often">' + esc(r[5]) + "</td></tr>";
  }).join("");

  var MIND = [
    ["ig", "\"Teach me something in 30 seconds.\"", "Scroll, stop, save. Visual first."],
    ["yt", "\"Show me how to do this.\"", "Search, watch, come back. Depth wins."],
    ["li", "\"Help me grow my career.\"", "Professional, thoughtful, story-led."],
    ["x", "\"What's new? What do you think?\"", "Fast, short, opinionated, replies."],
    ["fb", "\"Is this useful for my family?\"", "Community, groups, parents."]
  ];
  $("mind").innerHTML = MIND.map(function (m) { return "<div>" + badge(m[0]) + '<b class="q">' + esc(m[1]) + "</b><span>" + esc(m[2]) + "</span></div>"; }).join("");

  var PB = {
    ig: {
      purpose: "Get discovered by students and freshers, and give them tips worth saving. Every post makes HV Verse the page they trust for study and career habits.",
      aud: "Students 16 to 24 and freshers, mostly on phone, often at night.",
      post: ["Carousels with one clear method (study plans, focus, interviews)", "Reels: 15 to 30 second tips and real app demos", "Stories: polls, questions, behind the scenes", "Collab posts with student creators and Beta Lab testers"],
      avoid: ["\"Download now\" posters", "Long paragraphs on images", "Stock photos of smiling students", "Trend audio with no tip in it"],
      freq: "2 carousels + 2 reels a week, stories 3 to 5 days a week",
      out: "Saves, shares and follows. Bio link taps to the apps.",
      ex: [["Carousel", "Missed your plan? Don't restart tomorrow", "7 slides: the 3-step reset, ends with HV Reset moving a day."], ["Reel", "Your to-do list is the problem", "20 seconds: long list vs one task, real HV Reset screen."], ["Carousel", "Track every job application in one place", "The 4-column system, then HV Hunt's board."], ["Story", "What breaks your study plan most?", "Poll: phone, late start, too many tasks. Next week's post answers it."], ["Reel", "Ask HV AI in Hinglish", "\"Kal 6 se 8 maths\" turns into a plan on screen."]]
    },
    yt: {
      purpose: "Be found in search for years. Shorts bring new viewers; long videos turn them into users.",
      aud: "Students and freshers searching \"how to plan study\", \"job tracker\", \"interview follow-up\".",
      post: ["Shorts: the same reels, with a link to a long video", "Tutorials: one real problem solved with an HV app, 6 to 12 minutes", "Explainers: what a maturity score measures, how to read your report", "Motion-graphic explainers and build-in-public videos, once a month"],
      avoid: ["Talking-head videos (we stay faceless)", "Ad-style launch videos only", "Long intros before the point", "Clickbait thumbnails that the video doesn't deliver"],
      freq: "3 Shorts a week, 2 long videos a month",
      out: "Search views, watch time, subscribers per video, clicks to the apps.",
      ex: [["Long video", "Plan an exam week in 10 minutes", "Screen-along tutorial with HV Reset, chapters for each step."], ["Long video", "Job search tracker setup in 12 minutes", "HV Hunt from empty board to first follow-up."], ["Short", "Move your day, don't restart it", "Running late screen in 25 seconds."], ["Long video", "What your maturity score really means", "The 10 areas, the levels and the 30-day plan."]]
    },
    li: {
      purpose: "Build trust in the team and the thinking behind HV Verse. Not a place for posters.",
      aud: "Freshers, early professionals, educators, coaching owners, partners and future hires.",
      post: ["Team lessons from building HV Verse (wins and mistakes)", "Career insights for freshers: resumes, follow-ups, interviews", "Product decisions explained: why one task at a time, why a QR on scorecards", "Beta Lab stories and what testers learn"],
      avoid: ["Only promotional posts", "Reposting Instagram graphics with no context", "Engagement bait (\"Comment YES\")", "Hashtag walls"],
      freq: "3 posts a week on the HV Verse page, team members reshare",
      out: "Comments from the right people, profile views, partner and institute enquiries, Beta Lab applications.",
      ex: [["Page post", "Why HV Reset shows one task at a time", "The thinking behind a product decision, 150 words, no image needed."], ["Document carousel", "3 mistakes freshers make in a job search", "PDF carousel, 6 pages, ends with HV Hunt."], ["Page post", "Month 1 of building in public: real numbers", "Only actual figures from our dashboards."], ["Page post", "Scorecards you can verify", "Why every HV Assess scorecard has an ID and QR."]]
    },
    x: {
      purpose: "Join conversations and share building in public. Keep the handle active with little effort.",
      aud: "Builders, tech and edtech people, some students.",
      post: ["Short build-in-public updates", "One-line tips with an image", "Replies to study and career threads"],
      avoid: ["Arguments", "Posting the same carousel image", "Threads longer than 6 posts"],
      freq: "3 short posts a week, replies when there is time",
      out: "Conversations with builders and early adopters. Not a main growth channel.",
      ex: [["Post", "A to-do list is a wish list. A plan has times.", "One line, one clean image."], ["Post", "Shipped: run late and HV Reset moves your day", "Short update with a 10-second clip."], ["Reply", "Helpful reply on a student productivity thread", "Add value first; link only if asked."]]
    },
    fb: {
      purpose: "Hold the page and reach parents and smaller towns later, without extra work now.",
      aud: "Parents, coaching centre owners, smaller-town audiences.",
      post: ["Share Instagram reels", "Parent-friendly posts later (how to help your child plan study)", "Beta Lab and event updates"],
      avoid: ["Spending design time only for Facebook now", "Posting to random groups"],
      freq: "Share 2 reels a week",
      out: "A page that looks active when parents or institutes check us.",
      ex: [["Reel share", "Your to-do list is the problem", "Same reel as Instagram."], ["Post, later", "How parents can help a child plan study", "When the institute goal starts."], ["Event", "Beta Lab applications open", "Simple link post."]]
    }
  };
  function pBody(k) {
    var p = PB[k];
    $("pbody").innerHTML =
      '<div class="pd"><div class="mini"><span class="k2">Purpose</span><p>' + esc(p.purpose) + '</p></div><div class="mini"><span class="k2">Audience</span><p>' + esc(p.aud) + '</p></div><div class="mini"><span class="k2">How often</span><p><b>' + esc(p.freq) + '</b></p><span class="k2" style="margin-top:6px">Expected outcome</span><p>' + esc(p.out) + "</p></div></div>" +
      '<div class="two"><div class="ok2"><b>Post</b><ul class="slides">' + p.post.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul></div><div class="no"><b>Avoid</b><ul class="slides">' + p.avoid.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></div>" +
      '<span class="k2">Example posts</span><div class="ex">' + p.ex.map(function (e) { return '<div class="exc"><span class="fm">' + esc(e[0]) + "</span><b>" + esc(e[1]) + "</b><span>" + esc(e[2]) + "</span></div>"; }).join("") + "</div>";
  }
  $("pseg").innerHTML = Object.keys(PB).map(function (k, i) { return '<button type="button" role="tab" data-k="' + k + '"' + (i ? "" : ' class="on"') + ">" + PF[k].n + "</button>"; }).join("");
  $("pseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; [].forEach.call($("pseg").children, function (x) { x.classList.toggle("on", x === b); }); pBody(b.dataset.k); });
  pBody("ig");

  /* ---------- pillars ---------- */
  var PIL = [
    ["Study and focus", 35, "#4A72C8", "Plans, focus, beating the phone, exam weeks.", "HV Reset"],
    ["Career start", 20, "#A87A22", "Job search, resumes, follow-ups, interviews.", "HV Hunt"],
    ["Know yourself", 15, "#127A4F", "Self-awareness, habits, handling people and pressure.", "HV Assess"],
    ["Build in public", 15, "#7C5CE0", "The team, how the apps are made, Beta Lab.", "Trust"],
    ["How-tos", 15, "#6D4FD6", "Short demos of a feature solving a real problem.", "HV AI and all apps"]
  ];
  $("mixbar").innerHTML = PIL.map(function (p) { return '<div style="width:' + p[1] + "%;background:" + p[2] + '">' + p[1] + "%</div>"; }).join("");
  $("pillars").innerHTML = PIL.map(function (p) { return '<div class="mini"><div class="h"><span style="width:12px;height:12px;border-radius:4px;background:' + p[2] + '"></span><h4>' + esc(p[0]) + "</h4></div><p>" + esc(p[3]) + '</p><div class="chips"><span>' + esc(p[4]) + "</span></div></div>"; }).join("") +
    '<div class="mini" style="box-shadow:inset 0 0 0 1.5px var(--a2)"><h4>The 80 / 20 rule</h4><p>Four of every five posts teach something useful on their own. Only one in five is mainly about the product, and even then it solves a problem on screen.</p></div>';

  /* ---------- first posts ---------- */
  var FP = [
    { t: "Missed your plan? Don't restart tomorrow.", f: "Carousel, 7 slides", pil: "Study and focus", obj: "Saves and shares; introduce the reset idea", pc: "#4A72C8", dark: false,
      slides: ["Missed your plan? Don't restart tomorrow.", "Why \"from tomorrow\" never works", "Step 1: Note what's left, no guilt", "Step 2: Keep only the next task", "Step 3: Move the rest of today", "This is what HV Reset does when you run late (real screen)", "Save this for your next bad day. Free at thehvverse.com"],
      vis: "Light background, Sora headlines, HV Reset blue accent. Slide 6 shows the real running-late screen in a rounded frame.",
      cap: "Missed your study plan today?\n\nDon't wait for tomorrow to restart. Move the rest of today instead.\n\n1. Note what's left, without guilt\n2. Keep only the next task\n3. Move everything else to fit the time you have\n\nWe built HV Reset to do step 3 for you. It's free, no login needed to start.\n\nSave this for your next bad day.\n\n#studytips #studyplan #productivity" },
    { t: "Your to-do list is the problem.", f: "Reel, 20 seconds", pil: "How-tos", obj: "Reach and follows; show the product working", pc: "#4A72C8", dark: true,
      slides: ["0 to 2 s: \"Your to-do list is the problem.\" on screen", "2 to 8 s: a list of 12 tasks scrolls past", "8 to 16 s: HV Reset shows one task and a timer", "16 to 20 s: \"One task. Then the next.\" + logo"],
      vis: "Reel cover on the logo gradient. Screen recording of HV Reset on a phone, calm music, no voice needed.",
      cap: "A list of 12 things doesn't tell you what to do in the next 30 minutes.\n\nOne task does.\n\nHV Reset shows only the task that matters right now, with a timer. Free at thehvverse.com\n\n#focus #studywithme #productivitytips" },
    { t: "5 signs you're more mature than you think", f: "Carousel, 7 slides", pil: "Know yourself", obj: "Shares and comments; introduce HV Assess", pc: "#127A4F", dark: false,
      slides: ["5 signs you're more mature than you think", "1. You can wait before replying when angry", "2. You admit your part in a problem", "3. You keep small promises", "4. You can disagree without fighting", "5. You think about next year, not just today", "Want your real score? HV Assess, 10 minutes, free. Not a diagnosis, a mirror."],
      vis: "Light background, HV Assess green. Each sign on its own slide with a simple line icon.",
      cap: "Maturity isn't about age. It shows up in small moments.\n\nHow many of these are you?\n\nIf you want a clearer picture, HV Assess gives you a score across 10 areas and a 30-day plan in about 10 minutes. Free, no login.\n\nIt's for personal growth, not a diagnosis.\n\n#selfgrowth #selfawareness #personaldevelopment" },
    { t: "3 problems. 3 free apps.", f: "Reel, 25 seconds, motion graphics", pil: "Build in public", obj: "Introduce all the apps without anyone on camera", pc: "#7C5CE0", dark: true,
      slides: ["0 to 3 s: text animates in: \"3 problems. 3 free apps.\"", "3 to 12 s: the problems, one line each: plans that break by noon, not knowing yourself, a job search lost in screenshots", "12 to 22 s: each line turns into its app icon, then a real screen: HV Reset, HV Assess, HV Hunt", "22 to 25 s: \"All free. thehvverse.com\" on the logo gradient"],
      vis: "Motion graphics on the logo gradient, Sora text, real app screen recordings in rounded frames. Calm music, captions only, no one on camera.",
      cap: "Plan subah banta hai, dopahar tak toot jaata hai?\nKhud ko sach mein jaante ho?\nJob search screenshots mein kho jaata hai?\n\nIsliye humne banaye 3 free apps: HV Reset, HV Assess aur HV Hunt, with HV AI inside.\n\nSab free, thehvverse.com par.\nNext kya banayein? Comment mein batao." },
    { t: "Track every job application in one place", f: "Carousel, 7 slides", pil: "Career start", obj: "Saves; introduce HV Hunt to freshers", pc: "#A87A22", dark: false,
      slides: ["Applied to 40 jobs and lost track?", "The 4-column system", "Saved: jobs you like", "Applied: with the date", "Interview: with the next step", "Follow up after 5 days if there's no reply", "HV Hunt does this board for you. Free at thehvverse.com"],
      vis: "Light background, HV Hunt gold. A simple 4-column board drawn in line style, then the real HV Hunt board.",
      cap: "If your job search lives in screenshots and memory, try 4 columns:\n\nSaved, Applied, Interview, Follow-up.\n\nAdd the date to every application and follow up after 5 days if there's no reply.\n\nHV Hunt gives you this board, and HV AI updates it when you tell it what happened.\n\nSave this before your next application.\n\n#jobsearch #freshers #careertips" }
  ];
  $("fposts").innerHTML = FP.map(function (p, i) {
    var mock = '<div class="pm ' + (p.f.indexOf("Reel") === 0 ? "p916" : "p45") + (p.dark ? " dark" : "") + '" style="--pc:' + p.pc + '"><div class="tp"><img src="/admin/academy/img/hv-world.svg" alt="">HV VERSE' + (p.f.indexOf("Reel") === 0 ? "" : "<em>1/7</em>") + "</div><h5" + (p.f.indexOf("Reel") === 0 ? ' style="top:30%;font-size:17px"' : "") + ">" + esc(p.t) + "</h5>" + (p.f.indexOf("Reel") === 0 ? '<div class="play" style="top:72%"></div>' : '<div class="bar"></div><div class="ft">Swipe</div>') + "</div>";
    return '<article class="cc reveal"><div class="cch"><span class="cn">Post ' + (i + 1) + "</span><h3>" + esc(p.t) + '</h3></div><div class="fp"><div>' + mock + '</div><div class="ww">' +
      '<div class="meta"><span class="chip">' + esc(p.f) + '</span><span class="chip">Pillar: ' + esc(p.pil) + '</span><span class="chip">Goal: ' + esc(p.obj) + "</span></div>" +
      "<p><b>" + (p.f.indexOf("Reel") === 0 ? "Shot list" : "Slides") + '</b></p><ol class="slides">' + p.slides.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
      "<p><b>Visual</b>" + esc(p.vis) + "</p>" +
      '<div style="display:flex;justify-content:space-between;align-items:center"><span class="k2">Caption</span><button class="cpb" type="button" data-cp="fp' + i + '">Copy caption</button></div><div class="cap" id="fp' + i + '">' + esc(p.cap) + "</div></div></div></article>";
  }).join("");

  /* ---------- 30-day calendar ---------- */
  var C = [
    [["ig", "Carousel", "Missed your plan? Don't restart tomorrow", "Study and focus", "First post 1"], ["yt", "Short", "Your to-do list is the problem", "How-tos"], ["li", "Page post", "Why we built HV Verse", "Build in public"], ["x", "Post", "A to-do list is a wish list. A plan has times.", "Study and focus"]],
    [["ig", "Reel", "Your to-do list is the problem", "How-tos", "First post 2"], ["fb", "Reel share", "Your to-do list is the problem", "How-tos"]],
    [["ig", "Story poll", "What breaks your study plan most?", "Study and focus"], ["yt", "Short", "Move your day, don't restart it", "How-tos"], ["li", "Page post", "What HV Verse is: free apps with HV AI inside", "Build in public"], ["x", "Post", "Building in public: week 1", "Build in public"]],
    [["ig", "Carousel", "5 signs you're more mature than you think", "Know yourself", "First post 3"], ["li", "Page post", "Why HV AI understands Hinglish", "Build in public"]],
    [["ig", "Reel", "3 problems. 3 free apps.", "Build in public", "First post 4"], ["yt", "Short", "3 problems. 3 free apps.", "Build in public"], ["x", "Post", "Shipped: HV Reset moves your day when you run late", "How-tos"], ["fb", "Reel share", "3 problems. 3 free apps.", "Build in public"]],
    [["ig", "Stories", "Behind the scenes: how this week's motion graphics were made", "Build in public"]],
    [],
    [["ig", "Carousel", "Track every job application in one place", "Career start", "First post 5"], ["yt", "Short", "The 4-column job search board", "Career start"], ["li", "Page post", "3 mistakes freshers make in a job search", "Career start"], ["x", "Post", "Follow up after 5 days. Most people never do.", "Career start"]],
    [["ig", "Reel", "Tell HV AI what happened, watch the board update", "How-tos"], ["fb", "Reel share", "HV AI updates the board", "How-tos"]],
    [["ig", "Story quiz", "Which column is your job search stuck in?", "Career start"], ["yt", "Short", "A follow-up email in 20 seconds", "Career start"], ["li", "Page post", "How to write a follow-up after an interview", "Career start"], ["x", "Post", "Reply to a job-search thread with a tip", "Career start"]],
    [["ig", "Carousel", "Study 2 hours without your phone", "Study and focus"], ["li", "Page post", "What we cut from HV Reset, and why", "Build in public"]],
    [["ig", "Reel", "Exam week plan in 60 seconds with HV AI", "How-tos"], ["yt", "Short", "Exam week plan in 60 seconds", "How-tos"], ["x", "Post", "One task, one timer, one break", "Study and focus"], ["fb", "Reel share", "Exam week plan in 60 seconds", "How-tos"]],
    [["yt", "Long video", "Plan an exam week in 10 minutes (HV Reset)", "How-tos"], ["ig", "Stories", "Poll: what should the next long video be?", "Build in public"]],
    [],
    [["ig", "Carousel", "What a maturity score measures: the 10 areas", "Know yourself"], ["yt", "Short", "10 areas of maturity in 30 seconds", "Know yourself"], ["li", "Page post", "Why we built a self-assessment, not a personality quiz", "Know yourself"], ["x", "Post", "Self-awareness is a skill you can practise", "Know yourself"]],
    [["ig", "Reel", "Take the 10-minute assessment with me", "How-tos"], ["fb", "Reel share", "Take the assessment with me", "How-tos"]],
    [["ig", "Story questions", "Ask us anything about exams or jobs", "Career start"], ["yt", "Short", "Scorecards you can check with a QR", "Know yourself"], ["li", "Page post", "Why every HV Assess scorecard has an ID and QR", "Know yourself"], ["x", "Post", "Results you can verify beat results you have to trust", "Know yourself"]],
    [["ig", "Carousel", "4 ways people handle conflict. Which is yours?", "Know yourself"], ["li", "Page post", "Feedback that changed a feature", "Build in public"]],
    [["ig", "Reel", "Your 30-day plan, built from your answers", "How-tos"], ["yt", "Short", "A 30-day plan from your own answers", "How-tos"], ["x", "Post", "Personal plans beat generic advice", "Know yourself"], ["fb", "Reel share", "Your 30-day plan", "How-tos"]],
    [["ig", "Stories", "Behind the scenes: a Beta Lab day", "Build in public"]],
    [],
    [["ig", "Carousel", "From bug report to fix: how a feature ships", "Build in public"], ["yt", "Short", "How a bug report becomes a fix", "Build in public"], ["li", "Page post", "How we decide what to build next", "Build in public"], ["x", "Post", "Changelog: what shipped this week", "Build in public"]],
    [["ig", "Reel", "Beta Lab: 10 days, real products", "Build in public"], ["fb", "Post", "Beta Lab applications open", "Build in public"]],
    [["ig", "Story poll", "Would you try a 10-day Beta Lab?", "Build in public"], ["yt", "Short", "What Beta Lab testers learn", "Build in public"], ["li", "Page post", "Beta Lab: what testers learn about real product work", "Build in public"], ["x", "Post", "Looking for student testers", "Build in public"]],
    [["ig", "Carousel", "Your first resume line: from tasks to results", "Career start"], ["li", "Page post", "Resume lines that get noticed", "Career start"]],
    [["ig", "Reel", "Running late? Watch the day move", "How-tos"], ["yt", "Short", "Running late? Watch the day move", "How-tos"], ["x", "Post", "Late is fine. Restarting tomorrow isn't.", "Study and focus"], ["fb", "Reel share", "Watch the day move", "How-tos"]],
    [["yt", "Long video", "Job search tracker setup: HV Hunt in 12 minutes", "How-tos"]],
    [],
    [["ig", "Carousel", "Month 1's most saved tips (by real saves)", "Study and focus"], ["yt", "Short", "Best tip of month 1", "Study and focus"], ["li", "Page post", "What month 1 taught us about posting", "Build in public"], ["x", "Post", "Month 1 recap", "Build in public"]],
    [["ig", "Reel", "Ask HV AI in Hinglish", "How-tos"], ["fb", "Reel share", "Ask HV AI in Hinglish", "How-tos"]]
  ];
  var DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], FL = "all", SEL = 0;
  function renderCal() {
    var h = DN.map(function (d) { return '<div class="dh">' + d + "</div>"; }).join("");
    for (var i = 0; i < 35; i++) {
      if (i >= C.length) { h += '<div class="pad"></div>'; continue; }
      var ev = C[i];
      h += '<button type="button" class="d' + (ev.length ? "" : " rest") + (i === SEL ? " on" : "") + '" data-i="' + i + '"><span class="n">Day ' + (i + 1) + "<small>Week " + (Math.floor(i / 7) + 1) + " · " + DN[i % 7] + "</small></span>" +
        (ev.length ? ev.map(function (e) { return '<span class="ev' + (FL === e[0] ? " sh" : "") + '"><i style="background:' + PF[e[0]].c + '"></i><span>' + esc(e[1]) + "<em> · " + esc(e[2]) + "</em></span></span>"; }).join("") : '<span class="ev sh"><span>Rest, plan next week</span></span>') + "</button>";
    }
    $("cal").innerHTML = h; $("cal").classList.toggle("f", FL !== "all");
    showDay(SEL);
  }
  function showDay(i) {
    var ev = C[i];
    $("dayd").innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap"><h4 style="font-size:20px">Day ' + (i + 1) + " · " + DN[i % 7] + '</h4><span class="sub">Week ' + (Math.floor(i / 7) + 1) + "</span></div>" +
      (ev.length ? ev.map(function (e) { return '<div class="row2"><div>' + badge(e[0]) + '</div><div><b>' + esc(e[2]) + '</b><div class="sub">' + esc(e[1]) + " · Pillar: " + esc(e[3]) + (e[4] ? " · " + esc(e[4]) + " (full copy above)" : "") + "</div></div></div>"; }).join("")
        : '<p class="sub">Rest day. Check this week\'s numbers, fill the Friday report if you missed it, and plan next week.</p>');
  }
  $("cseg").innerHTML = '<button type="button" class="on" data-f="all">All</button>' + Object.keys(PF).map(function (k) { return '<button type="button" data-f="' + k + '">' + PF[k].n + "</button>"; }).join("");
  $("clg").innerHTML = Object.keys(PF).map(function (k) { return '<span><i style="background:' + PF[k].c + '"></i>' + PF[k].n + "</span>"; }).join("");
  $("cseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; FL = b.dataset.f; [].forEach.call($("cseg").children, function (x) { x.classList.toggle("on", x === b); }); renderCal(); });
  $("cal").addEventListener("click", function (e) { var b = e.target.closest(".d"); if (!b) return; SEL = +b.dataset.i; [].forEach.call($("cal").querySelectorAll(".d"), function (x) { x.classList.toggle("on", x === b); }); showDay(SEL); if (window.innerWidth < 860) $("dayd").scrollIntoView({ behavior: "smooth", block: "nearest" }); });
  renderCal();

  /* ---------- AI prompts ---------- */
  var BRIEF = "You are the social media writer for HV Verse.\n\nAbout HV Verse: free, AI-powered web apps for personal and career growth, made in India by Harsh Goyal (Haritt Group). Website: thehvverse.com. Apps: HV Reset (daily planner: one task at a time, moves your day when you run late, dashboard and PDF reports), HV Assess (10-minute self-assessment: score out of 100 across 10 areas, report and 30-day plan PDFs, scorecard with an ID and QR; for personal growth, not a diagnosis), HV Hunt (job-search tracker: pipeline board, follow-ups, resume vault), HV AI (the built-in assistant; English, Hindi and Hinglish, typed or spoken; asks before it changes anything). Everything is free.\n\nAudience: students 16 to 24 and freshers 21 to 26 in India.\nVoice: the HV Verse team, writing as \"we\", like a helpful older friend. Short sentences, specific steps and examples. Language: English, or natural Hinglish in Roman script when asked.\nFormat rules: faceless brand. No people on camera; use motion graphics and real app screen recordings. Organic only, no ad copy.\nRules: 80% useful on its own, 20% product. No hype words (revolutionary, life-changing, guaranteed). No made-up numbers, users or testimonials. No emojis unless asked. At most 3 hashtags. Only claim features listed above.";
  var PR = [
    ["B", "Brand brief", "Paste this first in every chat", BRIEF],
    ["Ca", "Instagram caption", "For a carousel or reel", "Write an Instagram caption for this post: [[topic]].\nPillar: [[pillar]]. Format: [[carousel or reel]]. Language: [[English / Hinglish]].\nStructure: a hook line that names the problem, 2 to 4 short lines or a numbered list with the method, one line linking it to [[app]] only if it fits, then one call to action (save, share or comment a specific answer).\nUnder 120 words. Max 3 relevant hashtags at the end. Give 3 versions with different hooks."],
    ["Cr", "Carousel", "6 to 8 slides, one idea each", "Plan an Instagram carousel on: [[topic]].\nPillar: [[pillar]]. Product colour: [[HV Reset blue / HV Assess green / HV Hunt gold]].\nGive 7 slides. For each slide: a Sora headline under 8 words, one support line under 15 words, and a simple visual note (line icon, real app screen, or diagram).\nSlide 1 is the hook. Slide 7 is one action. Only one slide may show the product, using a real screen.\nThen write the caption using the caption rules."],
    ["Re", "Reel or Short script", "15 to 35 seconds", "Write a [[20]]-second vertical video script on: [[topic]]. Language: [[English / Hinglish]].\nGive a table with: time, on-screen text (under 7 words), what we show (motion graphics, real app screen recording, or simple text; never a person on camera), and optional voice-over.\nThe first 2 seconds must state the problem. End with one line and the HV Verse logo. Also give a cover headline under 6 words and 3 alternative hooks."],
    ["Yt", "YouTube long video", "6 to 12 minute tutorial", "Plan a YouTube tutorial: [[title]].\nGoal: a viewer who searched \"[[search phrase]]\" solves it by the end, using [[app]].\nGive: 3 title options under 60 characters, a thumbnail text under 5 words, chapters with timestamps, a full script with screen directions (screen recording and motion graphics, voice-over or captions, no one on camera), the description with chapters and a tracked link placeholder, and a pinned comment.\nNo long intro: show the result in the first 20 seconds."],
    ["Li", "LinkedIn page post", "In the HV Verse team's voice", "Write a LinkedIn post for the HV Verse company page, in the team's voice (\"we\"), about: [[lesson or decision]].\nShape: a first line that makes a professional stop scrolling, a short story or reason, what he learned, and an open question at the end.\n120 to 220 words, short paragraphs, no hashtag wall (max 3), no emojis, no engagement bait. Use only facts I give you: [[facts]]."],
    ["X", "X post", "Short and sharp", "Write 5 X posts about: [[topic]]. Language: [[English / Hinglish]].\nEach under 240 characters. One clear idea, plain words, no hashtags or one at most. Mix: 2 tips, 1 opinion, 1 build-in-public update, 1 question. Only claim facts from the brand brief."],
    ["Gd", "Graphic design", "For Canva, Figma or an image tool", "Design a [[1080 x 1350 Instagram carousel slide / 1280 x 720 YouTube thumbnail]] for HV Verse.\nStyle: clean, premium, Apple-like. Background #F9F9FB (or the logo gradient #1C2A6B to #4A46C9 to #7C5CE0 for covers). Headline in Sora Bold, ink #1D1D1F, tight letter spacing. Support text in Inter. One accent colour only: [[#4A72C8 HV Reset / #127A4F HV Assess / #A87A22 HV Hunt / #6D4FD6 HV AI]].\n80 px margins. Small HV Verse mark top left, slide number top right.\nText: headline \"[[headline]]\", support \"[[line]]\".\nNo emojis, no stock photos of people, no extra decoration, no fake numbers."],
    ["An", "Animation and motion", "For reels, intros and app demos", "Plan a [[6]]-second motion graphic for HV Verse: [[what it shows]].\nLook: light background #F9F9FB or the logo gradient, Sora headlines, one accent colour [[colour]].\nMotion: calm and smooth, ease-out, 300 to 500 ms per move, no bouncing or spinning. Text appears line by line. App screens slide up in a rounded frame with a soft shadow.\nGive a shot-by-shot timeline (time, what moves, text on screen) and the export settings: 1080 x 1920, 30 fps, MP4."]
  ];
  var hl = function (s) { return esc(s).replace(/\[\[(.*?)\]\]/g, "<mark>$1</mark>"); };
  $("plist").innerHTML = PR.map(function (p, i) {
    return '<details class="pc reveal"' + (i ? "" : " open") + '><summary><span class="ic">' + p[0] + "</span><span><b>" + esc(p[1]) + "</b><small>" + esc(p[2]) + '</small></span><span class="ar">›</span></summary><div class="bd"><pre id="pr' + i + '">' + hl(p[3]) + '</pre><div><button class="cpb" type="button" data-cp="pr' + i + '">Copy prompt</button></div></div></details>';
  }).join("");

  /* ---------- features ---------- */
  var FT = [
    ["ig", ["Collab posts: one post on two profiles", "Story polls, quizzes and question boxes", "Highlights: Start here, Apps, Beta Lab", "Trial reels to test a hook with non-followers", "Broadcast channel once we have regular followers"]],
    ["yt", ["Link each Short to its long video", "Chapters on every long video", "Playlists by app and by problem", "Pinned comment with the tracked link", "Community posts once the channel unlocks them"]],
    ["li", ["Document (PDF) carousels", "Team members reshare page posts with one line of their own", "Polls for real questions, not bait", "A newsletter later, after 2 months of posts"]]
  ];
  $("feat").innerHTML = FT.map(function (f) { return '<div class="mini">' + badge(f[0]) + '<ul class="slides">' + f[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("");

  /* ---------- workflow nodes ---------- */
  var WF = [["Idea", "from DMs, data"], ["Write", "AI prompt"], ["Design", "template"], ["Check", "second person"], ["Schedule", "Meta, YT, LI"], ["Publish", "on time"], ["Engage", "first hour"], ["Measure", "every Friday"]];
  $("wfn").innerHTML = WF.map(function (w, i) {
    var x = 95 + i * 127.1;
    return '<g><rect class="n-box" x="' + (x - 56) + '" y="48" width="112" height="64" rx="14"/><text x="' + x + '" y="76" text-anchor="middle" class="n-t" style="font-size:15px">' + w[0] + '</text><text x="' + x + '" y="96" text-anchor="middle" class="n-d" style="font-size:11.5px">' + w[1] + '</text><text x="' + x + '" y="34" text-anchor="middle" class="n-k" fill="#C3B1FF">' + (i + 1) + "</text></g>";
  }).join("");

  /* ---------- UTM builder ---------- */
  function utm() {
    var c = ($("u3").value || "").toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    $("uo").textContent = "https://thehvverse.com/" + $("u2").value + "?utm_source=" + $("u1").value + "&utm_medium=social&utm_campaign=" + (c || "campaign");
  }
  ["u1", "u2", "u3"].forEach(function (id) { $(id).addEventListener("input", utm); $(id).addEventListener("change", utm); });
  utm();

  /* ---------- copy buttons ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".cpb"); if (!b) return;
    var txt = b.id === "ucp" ? $("uo").textContent : ($(b.dataset.cp) || {}).textContent;
    if (!txt) return;
    var done = function () { var o = b.textContent; b.textContent = "Copied"; b.classList.add("ok"); setTimeout(function () { b.textContent = o; b.classList.remove("ok"); }, 1400); };
    try { navigator.clipboard.writeText(txt).then(done, done); } catch (er) { done(); }
  });

  /* ---------- reveal, progress, part nav ---------- */
  var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  var parts = [].slice.call(document.querySelectorAll("main .part")), links = [].slice.call(document.querySelectorAll("#partnav a"));
  function onScroll() {
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    $("prog").style.width = (p * 100).toFixed(1) + "%";
    var cur = null; parts.forEach(function (s) { if (s.getBoundingClientRect().top < 160) cur = s.id; });
    links.forEach(function (a) { var on = a.getAttribute("href") === "#" + cur; a.classList.toggle("cur", on); if (on && a.scrollIntoView && a.dataset.v !== "1") { links.forEach(function (x) { x.dataset.v = ""; }); a.dataset.v = "1"; a.parentNode.scrollTo({ left: a.offsetLeft - 40, behavior: "smooth" }); } });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  document.querySelectorAll(".cell,.cc").forEach(function (el) { el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--x", e.clientX - r.left + "px"); el.style.setProperty("--y", e.clientY - r.top + "px"); }); });
})();
