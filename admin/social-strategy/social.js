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
  /* ---------- first posts, platform by platform ---------- */
  var FP = {
    ig: [
      { m: "car", t: "\"Kal se pakka padhunga\" is not a plan.", f: "Carousel, 7 slides", pil: "Study and focus", obj: "Sends and saves: the post every student sends to a friend", pc: "#4A72C8",
        hook: "\"Kal se pakka padhunga.\" Said it last night too?", lbl: "Slides",
        slides: ["\"Kal se pakka padhunga.\" Said it last night too?", "Kal kabhi aata nahi. Here's why: tomorrow-you is just as tired.", "Fix 1: Start with a 2-minute task. Not 2 hours.", "Fix 2: Give it a time. \"7:00 to 7:30, Chapter 4 questions.\"", "Fix 3: Missed it? Move it. Don't cancel the whole day.", "This is literally what HV Reset does (real running-late screen)", "Send this to the friend who said \"kal se pakka\" today."],
        vis: "Slide 1 big Sora quote in ink on light background, a small HV Reset blue underline. Slide 6 is the real running-late screen. Last slide has a big send icon.",
        cap: "\"Kal se pakka padhunga\"\n\nTomorrow-you will be just as tired as today-you. So don't wait for tomorrow.\n\n1. Start with a 2-minute task\n2. Give it a time, not a wish\n3. Missed it? Move it, don't cancel the day\n\nHV Reset does step 3 for you. Free at thehvverse.com\n\nSend this to the friend who said \"kal se pakka\" today.\n\n#studytips #studymotivation #boardexams" },
      { m: "reel", t: "Topper ka timetable copy kiya. 2 din chala.", f: "Reel, 20 seconds, motion graphics", pil: "Study and focus", obj: "Reach: relatable hook, then the fix", pc: "#4A72C8",
        hook: "Topper ka timetable copy kiya. 2 din chala.", lbl: "Shot list",
        slides: ["0 to 2 s: text slams in: \"Topper ka timetable copy kiya.\"", "2 to 4 s: \"2 din chala.\" A timetable cracks and falls apart.", "4 to 12 s: \"Kyunki woh unka din tha, tumhara nahi.\" Your real day appears: college, travel, tuition.", "12 to 18 s: HV Reset builds a plan around your real day, one task at a time (screen recording).", "18 to 20 s: \"Apna plan. Apna din.\" + @thehvverse"],
        vis: "Fast text animation on the logo gradient, then a calm switch to the light HV Reset screen. Trending-style beat but no lyrics.",
        cap: "Topper ka timetable copy karne se topper nahi bante.\n\nApne din ke hisaab se plan banao: college, travel, tuition sab count karo.\n\nHV Reset mein bolo \"kal 6 se 8 maths, phir dinner\" aur plan ready.\n\nFree, thehvverse.com\n\n#studywithme #studytips #hinglish" },
      { m: "car", t: "Your friend copies your notes and scores more. What do you do?", f: "Carousel, 6 slides (What would you do?)", pil: "Know yourself", obj: "Comments: people argue A vs C in the comments", pc: "#127A4F",
        hook: "Your friend copies your notes. Scores more than you. What do you do?", lbl: "Slides",
        slides: ["Your friend copies your notes. Scores more than you. What do you do?", "A. Stop sharing notes. Forever.", "B. Tell everyone they copied.", "C. Talk to them privately and set a rule.", "D. Feel bad but say nothing.", "Comment A, B, C or D. Tomorrow's reel shows what each choice says about you."],
        vis: "HV Assess green. Each option on its own slide with a big letter. Real-life situation style, like the HV Assess questions.",
        cap: "Real situation. No right answer, but your choice says a lot about you.\n\nA, B, C or D? Be honest\n\nTomorrow we explain each one. Want your full picture? HV Assess, 10 minutes, free, no login.\n\n#whatwouldyoudo #selfawareness #collegelife" },
      { m: "car", t: "Applied to 100 jobs. 0 replies. Check these 5 things.", f: "Carousel, 7 slides", pil: "Career start", obj: "Saves and sends among freshers", pc: "#A87A22",
        hook: "Applied to 100 jobs. 0 replies. It's probably one of these 5.", lbl: "Slides",
        slides: ["Applied to 100 jobs. 0 replies. It's probably one of these 5.", "1. Same resume for every role", "2. Applying after the post is weeks old", "3. No follow-up, ever", "4. Your first resume line is a duty, not a result", "5. You don't know where you applied (so you can't follow up)", "Fix #5 in 2 minutes: HV Hunt keeps every application on one board. Free."],
        vis: "HV Hunt gold. Slide 1 big red 0 next to 100 as typography (an illustration, not a real stat). Slide 7 shows the real HV Hunt board.",
        cap: "100 applications, 0 replies? It's not always you. It's often the process.\n\nCheck these 5 before you apply again. Number 3 is the one almost everyone skips.\n\nSave this for placement season.\n\n#freshers #jobsearch #placements" },
      { m: "reel", t: "Plan toot gaya. Khud ko jaana nahi. Job ka reply nahi.", f: "Reel, 25 seconds, motion graphics", pil: "Build in public", obj: "Introduce HV Verse: 3 problems, 3 free apps", pc: "#7C5CE0",
        hook: "Plan toot gaya. Khud ko jaana nahi. Job ka reply nahi.", lbl: "Shot list",
        slides: ["0 to 3 s: three lines type in, one by one: \"Plan toot gaya.\" \"Khud ko jaana nahi.\" \"Job ka reply nahi.\"", "3 to 6 s: \"Sound familiar?\"", "6 to 20 s: each line turns into its app icon, then a 3-second real screen: HV Reset, HV Assess, HV Hunt", "20 to 25 s: \"3 problems. 3 free apps.\" + thehvverse.com"],
        vis: "Logo gradient, Sora type, real screen recordings in rounded frames. This becomes the pinned reel on the profile.",
        cap: "Plan subah banta hai, dopahar tak toot jaata hai?\nKhud ko sach mein jaante ho?\nJob search screenshots mein kho jaata hai?\n\nIsliye humne banaye 3 free apps: HV Reset, HV Assess aur HV Hunt, with HV AI inside.\n\nSab free, thehvverse.com par. Next kya banayein? Comment karo." }
    ],
    yt: [
      { m: "short", t: "Plan toot gaya? Kal ka wait mat karo.", f: "Short, 25 seconds", pil: "Study and focus", obj: "Views from the Shorts feed", pc: "#4A72C8",
        hook: "Missed your 6 PM study block? Watch this.", lbl: "Shot list",
        slides: ["0 to 2 s: \"Missed your 6 PM study block?\"", "2 to 10 s: HV Reset shows \"Running late\" with a live count", "10 to 20 s: tap \"Start now\", the rest of the evening shifts to fit", "20 to 25 s: \"Late is fine. Restarting tomorrow isn't.\""],
        vis: "Vertical screen recording with big captions. Title card on the logo gradient.",
        cap: "Title: Missed your study plan? Don't restart tomorrow #shorts\nDescription: Start late? HV Reset moves the rest of your day so you don't have to start over. Free at thehvverse.com" },
      { m: "thumb", t: "Exam in 7 days? Build the full plan in 10 minutes", f: "Long video, 8 to 10 minutes", pil: "How-tos", obj: "Search views for years: \"7 day exam plan\"", pc: "#4A72C8",
        hook: "Thumbnail: \"7 DAYS LEFT?\"", lbl: "Chapters",
        slides: ["0:00 The finished 7-day plan (show the result first)", "0:40 List subjects and weak chapters", "2:00 Split days: new topics, revision, mock", "4:00 Build it in HV Reset (or ask HV AI in Hinglish)", "6:30 What to do when you fall behind on day 3", "8:00 The night before the exam"],
        vis: "Thumbnail: \"7 DAYS LEFT?\" in yellow Sora on the logo gradient, a phone with the HV Reset plan on the right. No face.",
        cap: "Title: Exam in 7 Days? Make the Full Study Plan in 10 Minutes (Free)\nDescription: A step-by-step 7-day exam plan you can actually follow, with revision and mock days. Built live in HV Reset. Chapters below." },
      { m: "short", t: "\"Kal 6 se 8 maths\" bolo, plan ready.", f: "Short, 20 seconds", pil: "How-tos", obj: "Shares: the Hinglish AI hook", pc: "#6D4FD6",
        hook: "Maine AI se Hinglish mein bola, aur...", lbl: "Shot list",
        slides: ["0 to 3 s: hold the mic in HV AI, say \"Kal 6 se 8 maths, phir dinner, phir science\"", "3 to 12 s: the plan appears with times", "12 to 17 s: tap Confirm, it lands in HV Reset", "17 to 20 s: \"Hinglish chalega.\""],
        vis: "Real HV AI screen recording, captions burned in, voice audio on.",
        cap: "Title: I planned my whole evening by speaking Hinglish to AI #shorts\nDescription: HV AI understands English, Hindi and Hinglish, and asks before it changes anything. Free inside HV Reset." },
      { m: "thumb", t: "Track 100 job applications without a spreadsheet", f: "Long video, 10 to 12 minutes", pil: "Career start", obj: "Search views: \"job application tracker\"", pc: "#A87A22",
        hook: "Thumbnail: \"100 APPLICATIONS?\"", lbl: "Chapters",
        slides: ["0:00 The finished board (show the result first)", "0:45 Why spreadsheets fail after 20 applications", "2:00 Set up HV Hunt in 2 minutes", "4:30 Add a job by pasting the job post", "6:30 Follow-ups: when and what to write", "9:00 Tell HV AI \"interview done\" and watch the board update"],
        vis: "Thumbnail: \"100 APPLICATIONS?\" in gold Sora, the real HV Hunt board on a laptop. No face.",
        cap: "Title: How to Track 100 Job Applications (Free Tracker, No Spreadsheet)\nDescription: A simple system for freshers: every job, follow-up and interview on one board. Built in HV Hunt. Chapters below." },
      { m: "short", t: "Mature ho ya nahi? 1 situation, 4 choices.", f: "Short, 20 seconds", pil: "Know yourself", obj: "Comments and replays", pc: "#127A4F",
        hook: "Only mature people pick C. Which one are you?", lbl: "Shot list",
        slides: ["0 to 3 s: \"Someone criticises your plan in front of everyone.\"", "3 to 12 s: A, B, C, D appear one by one", "12 to 17 s: \"Comment your letter.\"", "17 to 20 s: \"Full test: HV Assess, 10 minutes, free.\""],
        vis: "HV Assess green, big letters, quiz-show style motion.",
        cap: "Title: Are you mature? 1 situation, 4 choices #shorts\nDescription: Comment your answer. Take the full Maturity Assessment free at thehvverse.com (personal growth, not a diagnosis)." }
    ],
    li: [
      { m: "li", t: "We built a planner that hides your to-do list. On purpose.", f: "Page post, text + 1 image", pil: "Build in public", obj: "Comments from people who think differently about productivity", pc: "#4A72C8",
        hook: "We built a planner that hides your to-do list. On purpose.", lbl: "Post",
        slides: ["We built a planner that hides your to-do list. On purpose.", "A list of 12 tasks tells you nothing about the next 30 minutes. It just makes you anxious.", "So HV Reset shows one task, a timer, and what comes next.", "And when you run late, it moves the rest of your day instead of asking you to start over.", "Small product decision. Big difference on a bad day.", "Would you use a planner that shows only one task?"],
        vis: "One clean image: the HV Reset one-task screen on a light background.",
        cap: "We built a planner that hides your to-do list. On purpose.\n\nA list of 12 tasks tells you nothing about the next 30 minutes. It mostly makes you anxious.\n\nSo HV Reset shows one task, a timer, and what comes next. When you run late, it moves the rest of your day instead of asking you to start over.\n\nSmall product decision. Big difference on a bad day.\n\nWould you use a planner that shows only one task?" },
      { m: "li", t: "Most freshers don't fail interviews. They never get one.", f: "Document carousel, 6 pages", pil: "Career start", obj: "Saves and reshares by freshers and mentors", pc: "#A87A22",
        hook: "Most freshers don't fail interviews. They never get one.", lbl: "Pages",
        slides: ["Most freshers don't fail interviews. They never get one.", "Mistake 1: one resume for every role", "Mistake 2: applying weeks late", "Mistake 3: no follow-up after 5 to 7 days", "Mistake 4: no record of where they applied", "Fix: one board for every application (HV Hunt, free)"],
        vis: "PDF carousel in HV Hunt gold, one mistake per page, big Sora numbers.",
        cap: "Most freshers don't fail interviews. They never get one.\n\n4 quiet mistakes we keep seeing in job searches, and the simple fix for each. Page 5 is the one most people skip.\n\nIf you mentor freshers, share this with them." },
      { m: "li", t: "Why we said no to a login screen.", f: "Page post, text", pil: "Build in public", obj: "Trust: how we think about users", pc: "#127A4F",
        hook: "Why we said no to a login screen.", lbl: "Post",
        slides: ["Why we said no to a login screen.", "HV Assess is a 10-minute self-assessment. Asking for an account first felt wrong.", "So there's no login. Open the link, answer 28 to 30 real-life situations, get your score and two PDFs.", "Every scorecard still gets its own ID and QR, so anyone can check it's real.", "Less friction, same trust."],
        vis: "Optional image: the HV Assess scorecard with the QR.",
        cap: "Why we said no to a login screen.\n\nHV Assess is a 10-minute self-assessment. Asking people to create an account before they even start felt wrong.\n\nSo there is no login. You answer 28 to 30 real-life situations and get your score, a full report and a 30-day plan.\n\nEvery scorecard still has its own ID and QR, so anyone can check it is real.\n\nLess friction. Same trust." },
      { m: "li", t: "Your QR code is now more trusted than your certificate.", f: "Page post, text + image", pil: "Know yourself", obj: "Discussion among educators and recruiters", pc: "#127A4F",
        hook: "Anyone can make a certificate in Canva. Not anyone can fake a QR that checks out.", lbl: "Post",
        slides: ["Anyone can make a certificate in Canva.", "That's why every HV Assess scorecard has an ID and a QR.", "Scan it, and you see the original record: the name, the score and the date it was issued.", "Results you can verify beat results you have to trust.", "Should more results work like this?"],
        vis: "Image: phone scanning the scorecard QR, the check page showing \"This is a genuine HV Assess scorecard\".",
        cap: "Anyone can make a certificate in Canva.\n\nThat's why every HV Assess scorecard has its own ID and QR. Scan it and you see the original record, exactly as it was issued.\n\nResults you can verify beat results you have to trust.\n\nShould more results work like this?" },
      { m: "li", t: "10 days. Real products. No fake internship tasks.", f: "Page post, text + Beta Lab poster", pil: "Build in public", obj: "Beta Lab applications", pc: "#7C5CE0",
        hook: "10 days. Real products. No fake internship tasks.", lbl: "Post",
        slides: ["10 days. Real products. No fake internship tasks.", "In HV Verse Beta Lab, students test our live apps and HV AI.", "They write real bug reports and build dashboards for their portfolio.", "Flexible hours, any field of study.", "Apply: thehvverse.com/beta"],
        vis: "The Beta Lab poster.",
        cap: "10 days. Real products. No fake internship tasks.\n\nIn HV Verse Beta Lab, students test our live apps and HV AI, write real bug reports, and build dashboards they can show in interviews.\n\nFlexible hours. Any field of study.\n\nApply at thehvverse.com/beta" }
    ],
    x: [
      { m: "x", t: "A to-do list is a wish list. A plan has times.", f: "Post + clean image", pil: "Study and focus", obj: "Reposts", pc: "#4A72C8", hook: "A to-do list is a wish list. A plan has times.", lbl: "Post",
        slides: ["A to-do list is a wish list.", "A plan has times."], vis: "Image: the same two lines in Sora on a light background.", cap: "A to-do list is a wish list.\nA plan has times." },
      { m: "x", t: "Unpopular opinion: missing your plan is fine.", f: "Post", pil: "Study and focus", obj: "Replies", pc: "#4A72C8", hook: "Unpopular opinion: missing your plan is fine.", lbl: "Post",
        slides: ["Unpopular opinion: missing your plan is fine.", "Restarting it \"tomorrow\" is the real problem."], vis: "Text only.", cap: "Unpopular opinion: missing your plan is fine.\n\nRestarting it \"tomorrow\" is the real problem." },
      { m: "x", t: "Shipped: start late and the day moves with you.", f: "Post + 10-second clip", pil: "Build in public", obj: "Build-in-public followers", pc: "#4A72C8", hook: "Shipped: start late, and HV Reset moves the rest of your day.", lbl: "Post",
        slides: ["Shipped: start late, and HV Reset moves the rest of your day.", "You don't start over. You just continue."], vis: "10-second screen clip of the running-late screen.", cap: "Shipped: start late, and HV Reset moves the rest of your day.\n\nYou don't start over. You just continue." },
      { m: "x", t: "Things freshers learn too late", f: "Thread, 4 posts", pil: "Career start", obj: "Bookmarks and reposts", pc: "#A87A22", hook: "Things freshers learn too late:", lbl: "Thread",
        slides: ["Things freshers learn too late:", "1. A follow-up after 5 to 7 days is normal, not desperate.", "2. Track every application, or you can't follow up at all.", "3. Your first resume line should be a result, not a duty."], vis: "Text thread.", cap: "Things freshers learn too late:\n\n1. A follow-up after 5 to 7 days is normal, not desperate.\n2. Track every application, or you can't follow up at all.\n3. Your first resume line should be a result, not a duty." },
      { m: "x", t: "What breaks your study plan most?", f: "Poll", pil: "Study and focus", obj: "Replies and research for next posts", pc: "#4A72C8", hook: "What breaks your study plan most?", lbl: "Poll",
        slides: ["Phone", "Late start", "Too many tasks", "Friends and family"], vis: "Native poll.", cap: "What breaks your study plan most?" }
    ],
    fb: [
      { m: "reel", t: "\"Kal se pakka padhunga\" reel", f: "Reel share", pil: "Study and focus", obj: "Keep the page active", pc: "#4A72C8", hook: "Same reel as Instagram", lbl: "Plan", slides: ["Share the Instagram reel natively, same caption."], vis: "Same as Instagram.", cap: "Same caption as Instagram." },
      { m: "reel", t: "\"Plan toot gaya\" intro reel", f: "Reel share", pil: "Build in public", obj: "Pin to the page", pc: "#7C5CE0", hook: "Same reel as Instagram", lbl: "Plan", slides: ["Share and pin to the top of the page."], vis: "Same as Instagram.", cap: "Same caption as Instagram." },
      { m: "li", t: "Beta Lab applications open", f: "Link post", pil: "Build in public", obj: "Beta Lab applications", pc: "#7C5CE0", hook: "10 days. Real products.", lbl: "Post", slides: ["Short post with the Beta Lab poster and the link."], vis: "The Beta Lab poster.", cap: "10 days. Real products. Students test our live apps and build real portfolio work. Apply: thehvverse.com/beta" }
    ]
  };
  var LOGO = '/admin/academy/img/hv-world.svg';
  function fpMock(p) {
    if (p.m === "car" || p.m === "reel" || p.m === "short") {
      var v = p.m !== "car";
      return '<div class="pm ' + (v ? "p916 dark" : "p45") + '" style="--pc:' + p.pc + '"><div class="tp"><img src="' + LOGO + '" alt="">HV VERSE' + (v ? "" : "<em>1/7</em>") + "</div><h5" + (v ? ' style="top:28%;font-size:16px"' : "") + ">" + esc(p.hook) + "</h5>" + (v ? '<div class="play" style="top:74%"></div>' : '<div class="bar"></div><div class="ft">Swipe</div>') + "</div>";
    }
    if (p.m === "thumb") return '<div class="pm p169" style="background:linear-gradient(120deg,#1C2A6B,#4A46C9)"><div class="ttl">' + esc(p.hook.replace(/^Thumbnail: |"/g, "")) + '</div><div class="shot2" style="width:30%;bottom:10%;right:8%;--pc:' + p.pc + '"></div></div>';
    if (p.m === "x") return '<div class="xc"><div class="who"><img src="' + LOGO + '" alt=""><div><b>HV Verse</b><small>@thehvverse</small></div></div><p>' + esc(p.cap).replace(/\n/g, "<br>") + "</p></div>";
    return '<div class="lip"><div class="who"><span class="av" style="background:none"><img src="' + LOGO + '" alt="" style="width:30px;height:30px;border-radius:8px"></span><div><b>HV Verse</b><small>Company page · @thehvverse</small></div></div><p><b>' + esc(p.hook) + "</b></p><p>" + esc(p.slides.slice(1, 3).join(" ")) + "</p></div>";
  }
  function renderFP(k) {
    $("fposts").innerHTML = FP[k].map(function (p, i) {
      var id = "fp" + k + i;
      return '<article class="cc"><div class="cch"><span class="cn">' + PF[k].n + " " + (i + 1) + "</span><h3>" + esc(p.t) + '</h3></div><div class="fp"><div>' + fpMock(p) + '</div><div class="ww">' +
        '<div class="hookline"><span class="k2">Hook</span>' + esc(p.hook) + "</div>" +
        '<div class="meta"><span class="chip">' + esc(p.f) + '</span><span class="chip">Pillar: ' + esc(p.pil) + '</span><span class="chip">Goal: ' + esc(p.obj) + "</span></div>" +
        "<p><b>" + esc(p.lbl) + '</b></p><ol class="slides">' + p.slides.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        "<p><b>Visual</b>" + esc(p.vis) + "</p>" +
        '<div style="display:flex;justify-content:space-between;align-items:center"><span class="k2">' + (k === "yt" ? "Title and description" : "Caption") + '</span><button class="cpb" type="button" data-cp="' + id + '">Copy</button></div><div class="cap" id="' + id + '">' + esc(p.cap) + "</div></div></div></article>";
    }).join("");
  }
  $("fseg").innerHTML = Object.keys(FP).map(function (k, i) { return '<button type="button" data-k="' + k + '"' + (i ? "" : ' class="on"') + ">" + PF[k].n + " · " + FP[k].length + "</button>"; }).join("");
  $("fseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; [].forEach.call($("fseg").children, function (x) { x.classList.toggle("on", x === b); }); renderFP(b.dataset.k); });
  renderFP("ig");

  /* ---------- 30-day calendar ---------- */
  var C = [
    [["ig", "Carousel", "\"Kal se pakka padhunga\" is not a plan", "Study and focus", "Instagram post 1"], ["yt", "Short", "Plan toot gaya? Kal ka wait mat karo.", "Study and focus", "YouTube 1"], ["li", "Page post", "We built a planner that hides your to-do list. On purpose.", "Build in public", "LinkedIn 1"], ["x", "Post", "A to-do list is a wish list. A plan has times.", "Study and focus", "X 1"]],
    [["ig", "Reel", "Topper ka timetable copy kiya. 2 din chala.", "Study and focus", "Instagram post 2"], ["fb", "Reel share", "Topper ka timetable reel", "Study and focus"]],
    [["ig", "Story poll", "What breaks your study plan most?", "Study and focus"], ["yt", "Short", "Move your day, don't restart it", "How-tos"], ["li", "Page post", "What HV Verse is: free apps with HV AI inside", "Build in public"], ["x", "Post", "Building in public: week 1", "Build in public"]],
    [["ig", "Carousel", "Your friend copies your notes and scores more. What do you do?", "Know yourself", "Instagram post 3"], ["li", "Page post", "Why HV AI understands Hinglish", "Build in public"]],
    [["ig", "Reel", "Plan toot gaya. Khud ko jaana nahi. Job ka reply nahi.", "Build in public", "Instagram post 5"], ["yt", "Short", "3 problems. 3 free apps.", "Build in public"], ["x", "Post", "Shipped: HV Reset moves your day when you run late", "How-tos"], ["fb", "Reel share", "3 problems. 3 free apps.", "Build in public"]],
    [["ig", "Stories", "Behind the scenes: how this week's motion graphics were made", "Build in public"]],
    [],
    [["ig", "Carousel", "Applied to 100 jobs. 0 replies. Check these 5 things.", "Career start", "Instagram post 4"], ["yt", "Short", "The 4-column job search board", "Career start"], ["li", "Page post", "3 mistakes freshers make in a job search", "Career start"], ["x", "Post", "Follow up after 5 days. Most people never do.", "Career start"]],
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
      (ev.length ? ev.map(function (e) { return '<div class="row2"><div>' + badge(e[0]) + '</div><div><b>' + esc(e[2]) + '</b><div class="sub">' + esc(e[1]) + " · Pillar: " + esc(e[3]) + (e[4] ? " · " + esc(e[4]) + " in First posts" : "") + "</div></div></div>"; }).join("")
        : '<p class="sub">Rest day. Check this week\'s numbers, fill the Friday report if you missed it, and plan next week.</p>');
  }
  $("cseg").innerHTML = '<button type="button" class="on" data-f="all">All</button>' + Object.keys(PF).map(function (k) { return '<button type="button" data-f="' + k + '">' + PF[k].n + "</button>"; }).join("");
  $("clg").innerHTML = Object.keys(PF).map(function (k) { return '<span><i style="background:' + PF[k].c + '"></i>' + PF[k].n + "</span>"; }).join("");
  $("cseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; FL = b.dataset.f; [].forEach.call($("cseg").children, function (x) { x.classList.toggle("on", x === b); }); renderCal(); });
  $("cal").addEventListener("click", function (e) { var b = e.target.closest(".d"); if (!b) return; SEL = +b.dataset.i; [].forEach.call($("cal").querySelectorAll(".d"), function (x) { x.classList.toggle("on", x === b); }); showDay(SEL); if (window.innerWidth < 860) $("dayd").scrollIntoView({ behavior: "smooth", block: "nearest" }); });
  renderCal();

  /* ---------- viral playbook ---------- */
  var HOOKS = [
    ["Call out the exact struggle", "\"Padhai shuru karne mein hi 2 ghante lag jaate hain?\"", "Reel"],
    ["Nobody tells you", "\"Things nobody tells you before your first job search\"", "Carousel"],
    ["Before vs after", "\"Your resume line vs what recruiters want to read\"", "Carousel"],
    ["Number + promise", "\"Exam in 7 days? Here is the day-by-day plan\"", "Carousel"],
    ["Situation quiz", "\"Your friend copies your notes and scores more. What do you do?\"", "Reel or carousel"],
    ["Send-to-a-friend", "\"Send this to the friend who says 'kal se pakka'\"", "Reel"],
    ["Myth vs truth", "\"6 hours of study a day is not the goal. This is.\"", "Carousel"],
    ["POV", "\"POV: you followed your plan for 7 days straight\"", "Reel"]
  ];
  $("hooks").innerHTML = HOOKS.map(function (h, i) { return '<div class="hk"><span class="hn">' + (i + 1) + "</span><div><b>" + esc(h[0]) + '</b><p>' + esc(h[1]) + '</p><small>' + esc(h[2]) + "</small></div></div>"; }).join("");

  var SERIES = [
    ["What would you do?", "Every Wednesday", "#127A4F", "A real-life situation with 4 choices, in the style of HV Assess. People comment A, B, C or D; next day a reel explains the mature answer.", "Comments and shares", "HV Assess"],
    ["Sunday Reset", "Every Sunday", "#4A72C8", "Plan the week in 10 minutes: one carousel or reel with a template, then the same plan shown in HV Reset.", "Saves", "HV Reset"],
    ["Rate my plan", "Every Thursday", "#6D4FD6", "Followers DM their study or job-search plan (shared with permission, name hidden). We fix it on screen and show the better version.", "DMs and follows", "HV Reset and HV AI"],
    ["Fresher Fix", "Every Monday", "#A87A22", "One job-search mistake and the fix: resume lines, follow-ups, interview prep, LinkedIn profile.", "Saves and shares", "HV Hunt"]
  ];
  $("series").innerHTML = SERIES.map(function (s) { return '<div class="mini sr" style="--sc:' + s[2] + '"><div class="h"><span class="sd"></span><h4>' + esc(s[0]) + '</h4><span class="chip">' + esc(s[1]) + "</span></div><p>" + esc(s[3]) + '</p><div class="chips"><span>Gets: ' + esc(s[4]) + "</span><span>" + esc(s[5]) + "</span></div></div>"; }).join("");

  var TB = [
    ["Study and focus", "Topper timetable vs real timetable", "Carousel", "Relatable", "Pick the 3 parts of a topper plan that actually work"],
    ["Study and focus", "Padhai shuru karne mein 2 ghante? Try the 2-minute start", "Reel", "Relatable", "Start a timer for one tiny task, shown in HV Reset"],
    ["Study and focus", "Exam in 7 days: the day-by-day plan", "Carousel", "Save", "Seasonal: before boards and semester exams"],
    ["Study and focus", "Phone ko door rakhne ka sabse easy tarika", "Reel", "Send", "Phone in another room plus one-task timer"],
    ["Study and focus", "Why you remember nothing after 5 hours of study", "Carousel", "Save", "Active recall and short blocks"],
    ["Study and focus", "Missed the whole day? The 3-step reset", "Carousel", "Save", "HV Reset moves the rest of the day"],
    ["Study and focus", "Types of students in exam week (which one are you?)", "Reel", "Reply", "One tip for each type"],
    ["Study and focus", "Send this to the friend who says 'kal se pakka'", "Reel", "Send", "Why tomorrow never comes, and what to do today"],
    ["Career start", "Things nobody tells you about your first job search", "Carousel", "Save", "Honest list for freshers"],
    ["Career start", "Applied to 100 jobs, zero replies? Check these 5 things", "Carousel", "Send", "Resume, role fit, follow-ups, timing, tracking"],
    ["Career start", "The follow-up message that gets replies", "Carousel", "Save", "Copy-paste template, then track it in HV Hunt"],
    ["Career start", "Resume lines: before vs after", "Carousel", "Save", "Tasks to results, one line at a time"],
    ["Career start", "Placement season survival kit", "Carousel", "Save", "Seasonal: start of placement season"],
    ["Career start", "Interview tomorrow? The 1-hour prep plan", "Reel", "Save", "Plan the hour with HV AI"],
    ["Career start", "Internship in 30 days: a realistic plan", "Carousel", "Save", "Seasonal: internship hiring months"],
    ["Know yourself", "What would you do? (situation quiz)", "Reel", "Reply", "Weekly series from HV Assess-style situations"],
    ["Know yourself", "Mature vs immature reaction: same situation", "Reel", "Send", "Split-screen motion graphic"],
    ["Know yourself", "5 habits of people who stay calm in exams", "Carousel", "Save", "Calm is a skill you can practise"],
    ["Know yourself", "Red flags in yourself you can fix this month", "Carousel", "Reply", "Ends with the HV Assess 30-day plan"],
    ["Know yourself", "Do you react or respond? Take this 10-second test", "Reel", "Reply", "Quick self-check, then the full assessment"],
    ["Build in public", "We built this feature because a student asked", "Reel", "Follow", "Only when it really happened"],
    ["Build in public", "What 10 days in Beta Lab look like", "Carousel", "Follow", "Real tester work, with permission"],
    ["Build in public", "How we make a reel in one hour (no camera)", "Reel", "Follow", "Our motion-graphic process"],
    ["How-tos", "Plan your whole day by speaking Hinglish to HV AI", "Reel", "Send", "Real screen recording"],
    ["How-tos", "Turn your exam date into a daily plan in 60 seconds", "Reel", "Save", "Tell HV AI the subjects and the date"],
    ["How-tos", "Your job search on one board in 2 minutes", "Reel", "Save", "HV Hunt pipeline tour"],
    ["How-tos", "A scorecard anyone can check with a QR", "Reel", "Send", "Why verifiable results matter"],
    ["Study and focus", "Expectation vs reality: my study day", "Reel", "Send", "Then the plan that fixes it"],
    ["Study and focus", "POV: you followed your plan for 7 days", "Reel", "Send", "The calm version of you"],
    ["Career start", "LinkedIn headline for freshers: 3 formulas", "Carousel", "Save", "Fill-in-the-blank formulas"]
  ];
  var PC = { "Study and focus": "#4A72C8", "Career start": "#A87A22", "Know yourself": "#127A4F", "Build in public": "#7C5CE0", "How-tos": "#6D4FD6" }, TF = "All";
  function renderTB() {
    $("tbank").innerHTML = TB.map(function (t, i) { return { t: t, i: i }; }).filter(function (o) { return TF === "All" || o.t[0] === TF; }).map(function (o) {
      var t = o.t; return '<div class="tb"><span class="tp2" style="background:' + PC[t[0]] + '"></span><div><b id="tb' + o.i + '">' + esc(t[1]) + '</b><p>' + esc(t[4]) + '</p><div class="meta"><span class="chip">' + esc(t[2]) + '</span><span class="chip">Gets: ' + esc(t[3]) + '</span><span class="chip">' + esc(t[0]) + '</span></div></div><button class="cpb" type="button" data-cp="tb' + o.i + '">Copy</button></div>';
    }).join("");
  }
  $("tseg").innerHTML = ["All"].concat(Object.keys(PC)).map(function (k, i) { return '<button type="button" data-f="' + k + '"' + (i ? "" : ' class="on"') + ">" + k + "</button>"; }).join("");
  $("tseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; TF = b.dataset.f; [].forEach.call($("tseg").children, function (x) { x.classList.toggle("on", x === b); }); renderTB(); });
  renderTB();

  var YR = [
    ["Jan", "New year plans, JEE Main (session 1), internship hiring starts"], ["Feb", "Board exams begin, internship applications"], ["Mar", "Board exams, semester exams, results stress"],
    ["Apr", "JEE Main (session 2), semester exams, summer plans"], ["May", "NEET, CUET, board results, choosing a college"], ["Jun", "Summer break routines, internships, fresh starts"],
    ["Jul", "New semester, college freshers, new routines"], ["Aug", "Placement season begins in many colleges"], ["Sep", "Mid-semester tests, placement prep"],
    ["Oct", "Placements, festive season focus"], ["Nov", "Semester exams, Diwali break plans"], ["Dec", "Year-end reviews, winter internships, new year plans"]
  ];
  $("year").innerHTML = YR.map(function (y) { return '<div><b>' + y[0] + '</b><span>' + esc(y[1]) + "</span></div>"; }).join("");

  /* ---------- promotion ---------- */
  var PR2 = [
    ["Instagram", "Yes", "y", "Every post, stories, collabs, bio link with UTM", "Value first, one call to action"],
    ["YouTube", "Yes", "y", "Shorts link to long videos; tutorials in search", "Titles people actually search"],
    ["LinkedIn", "Yes", "y", "HV Verse page posts, team reshares, fresher career posts", "No poster dumps"],
    ["WhatsApp Channel", "Yes", "y", "Weekly digest: best tip, one new post, one app link", "Once or twice a week, never spam"],
    ["Reddit", "Yes, carefully", "m", "Full answers in student and career communities; link only when asked or truly helpful", "Read each community's rules first"],
    ["Quora", "Yes", "y", "Detailed answers to study-plan and job-search questions", "Answer fully, link at the end"],
    ["Telegram study groups", "Yes, carefully", "m", "Share free templates and plans with the admin's permission", "Ask the admin first"],
    ["Pinterest", "Yes, later", "m", "Pin carousels as study-plan and planner pins; people search these for years", "Start after month 1"],
    ["Product Hunt", "Once", "m", "One launch day for HV Verse with the motion-graphic video", "Plan it, do it once well"],
    ["X", "Light", "m", "Build-in-public updates and replies", "Not a growth channel for us"],
    ["Facebook", "Hold", "n", "Share reels only", "No extra design time"],
    ["Random WhatsApp forwards", "No", "n", "Do not mass-forward to groups", "Spam hurts the brand"]
  ];
  $("promo").innerHTML = PR2.map(function (r) { return "<tr><td>" + esc(r[0]) + '</td><td data-l="Promote?"><span class="pz ' + r[2] + '">' + esc(r[1]) + '</span></td><td data-l="How">' + esc(r[3]) + '</td><td data-l="Rule">' + esc(r[4]) + "</td></tr>"; }).join("");

  var LOOP = [["Make once", "One idea as a carousel and a reel"], ["Instagram", "Carousel Mon, reel Tue"], ["YouTube", "Same reel as a Short, link to the long video"], ["LinkedIn", "Carousel as a PDF post"], ["Reddit and Quora", "The same tip as a full written answer"], ["WhatsApp Channel", "The best post in the weekly digest"]];
  $("loopx").innerHTML = LOOP.map(function (l, i) { return '<div><i>' + (i + 1) + "</i><b>" + esc(l[0]) + "</b><small>" + esc(l[1]) + "</small></div>"; }).join("");

  var OWN = [
    ["Website short links", "Point /ig, /yt, /li, /x and /fb to the @thehvverse profiles and add social icons to the footer.", "Quick fix"],
    ["Inside the apps", "A small \"Follow us for study and career tips\" line with @thehvverse in HV Reset, HV Assess and HV Hunt.", "Proposed"],
    ["PDF reports", "End the HV Reset report and HV Assess PDFs with \"More tips: @thehvverse\".", "Proposed"],
    ["Share cards", "A ready Instagram story image of the HV Assess scorecard, with @thehvverse on it.", "Proposed"],
    ["Beta Lab testers", "Testers add @thehvverse in their bio and share one honest post about their work.", "Ask, never force"],
    ["Team profiles", "Everyone in the HV Verse team adds @thehvverse to their LinkedIn and Instagram bios.", "Quick fix"]
  ];
  $("own").innerHTML = OWN.map(function (o) { return '<div class="mini"><span class="st ' + (o[2] === "Proposed" ? "bd" : "ok") + '">' + esc(o[2]) + "</span><h4>" + esc(o[0]) + "</h4><p>" + esc(o[1]) + "</p></div>"; }).join("");

  /* ---------- AI prompts ---------- */
  var BRIEF = "You are the social media writer for HV Verse.\n\nAbout HV Verse: free, AI-powered web apps for personal and career growth, made in India by the HV Verse team (Haritt Group). Website: thehvverse.com. Apps: HV Reset (daily planner: one task at a time, moves your day when you run late, dashboard and PDF reports), HV Assess (10-minute self-assessment: score out of 100 across 10 areas, report and 30-day plan PDFs, scorecard with an ID and QR; for personal growth, not a diagnosis), HV Hunt (job-search tracker: pipeline board, follow-ups, resume vault), HV AI (the built-in assistant; English, Hindi and Hinglish, typed or spoken; asks before it changes anything). Everything is free.\n\nAudience: students 16 to 24 and freshers 21 to 26 in India.\nVoice: the HV Verse team, writing as \"we\", like a helpful older friend. Short sentences, specific steps and examples. Language: English, or natural Hinglish in Roman script when asked.\nFormat rules: faceless brand. No people on camera; use motion graphics and real app screen recordings. Organic only, no ad copy.\nRules: 80% useful on its own, 20% product. No hype words (revolutionary, life-changing, guaranteed). No made-up numbers, users or testimonials. No emojis unless asked. At most 3 hashtags. Only claim features listed above.";
  var PR = [
    ["B", "Brand brief", "Paste this first in every chat", BRIEF],
    ["Ca", "Instagram caption", "For a carousel or reel", "Write an Instagram caption for this post: [[topic]].\nPillar: [[pillar]]. Format: [[carousel or reel]]. Language: [[English / Hinglish]].\nStructure: a hook line that names the problem, 2 to 4 short lines or a numbered list with the method, one line linking it to [[app]] only if it fits, then one call to action (save, share or comment a specific answer).\nUnder 120 words. Max 3 relevant hashtags at the end. Give 3 versions with different hooks."],
    ["Cr", "Carousel", "6 to 8 slides, one idea each", "Plan an Instagram carousel on: [[topic]].\nPillar: [[pillar]]. Product colour: [[HV Reset blue / HV Assess green / HV Hunt gold]].\nGive 7 slides. For each slide: a Sora headline under 8 words, one support line under 15 words, and a simple visual note (line icon, real app screen, or diagram).\nSlide 1 is the hook. Slide 7 is one action. Only one slide may show the product, using a real screen.\nThen write the caption using the caption rules."],
    ["Re", "Reel or Short script", "15 to 35 seconds", "Write a [[20]]-second vertical video script on: [[topic]]. Language: [[English / Hinglish]].\nGive a table with: time, on-screen text (under 7 words), what we show (motion graphics, real app screen recording, or simple text; never a person on camera), and optional voice-over.\nThe first 2 seconds must state the problem. End with one line and the HV Verse logo. Also give a cover headline under 6 words and 3 alternative hooks."],
    ["Yt", "YouTube long video", "6 to 12 minute tutorial", "Plan a YouTube tutorial: [[title]].\nGoal: a viewer who searched \"[[search phrase]]\" solves it by the end, using [[app]].\nGive: 3 title options under 60 characters, a thumbnail text under 5 words, chapters with timestamps, a full script with screen directions (screen recording and motion graphics, voice-over or captions, no one on camera), the description with chapters and a tracked link placeholder, and a pinned comment.\nNo long intro: show the result in the first 20 seconds."],
    ["Li", "LinkedIn page post", "In the HV Verse team's voice", "Write a LinkedIn post for the HV Verse company page, in the team's voice (\"we\"), about: [[lesson or decision]].\nShape: a first line that makes a professional stop scrolling, a short story or reason, what he learned, and an open question at the end.\n120 to 220 words, short paragraphs, no hashtag wall (max 3), no emojis, no engagement bait. Use only facts I give you: [[facts]]."],
    ["X", "X post", "Short and sharp", "Write 5 X posts about: [[topic]]. Language: [[English / Hinglish]].\nEach under 240 characters. One clear idea, plain words, no hashtags or one at most. Mix: 2 tips, 1 opinion, 1 build-in-public update, 1 question. Only claim facts from the brand brief."],
    ["Gd", "Graphic design", "For Canva, Figma or an image tool", "Design a [[1080 x 1350 Instagram carousel slide / 1280 x 720 YouTube thumbnail]] for HV Verse.\nStyle: clean, premium, Apple-like. Background #F9F9FB (or the logo gradient #1C2A6B to #4A46C9 to #7C5CE0 for covers). Headline in Sora Bold, ink #1D1D1F, tight letter spacing. Support text in Inter. One accent colour only: [[#4A72C8 HV Reset / #127A4F HV Assess / #A87A22 HV Hunt / #6D4FD6 HV AI]].\n80 px margins. Small HV Verse mark top left, slide number top right.\nText: headline \"[[headline]]\", support \"[[line]]\".\nNo emojis, no stock photos of people, no extra decoration, no fake numbers."],
    ["Hk", "Viral hooks", "10 hooks for one idea", "Write 10 hooks for a [[reel / carousel]] about: [[topic]]. Language: [[English / Hinglish]].\nAudience: Indian students or freshers. Use these patterns: call out the exact struggle, nobody tells you, before vs after, number + promise, situation quiz, send-to-a-friend, myth vs truth, POV.\nEach hook under 12 words, no clickbait the post can't deliver, no fake numbers. Mark the best 2 and say why."],
    ["Rp", "Repurpose one post", "One idea, every platform", "Turn this post into versions for every platform: [[paste the carousel or reel script]].\nGive: an Instagram reel script (20 s, motion graphics), a YouTube Shorts title and description, a LinkedIn page post (team voice, 150 words), an X post, a Reddit or Quora answer (full, helpful, link only at the end) and a WhatsApp Channel line.\nKeep every fact the same. Language per platform: English for LinkedIn, YouTube and Reddit; [[English / Hinglish]] for Instagram and WhatsApp."],
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

  $("wfl").innerHTML = WF.map(function (w, i) { return "<li><i>" + (i + 1) + "</i><span><b>" + w[0] + "</b><small>" + w[1] + "</small></span></li>"; }).join("");

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
  var top = document.querySelector(".atop");
  function setHH() { var b = top ? top.getBoundingClientRect().bottom : 120; document.documentElement.style.setProperty("--hh", Math.round(Math.max(b, 60) + 14) + "px"); return b; }
  function onScroll() {
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    $("prog").style.width = (p * 100).toFixed(1) + "%";
    var line = (top ? top.getBoundingClientRect().bottom : 120) + 40, cur = null;
    parts.forEach(function (s) { if (s.getBoundingClientRect().top < line) cur = s.id; });
    if (h.scrollTop + h.clientHeight >= h.scrollHeight - 4) cur = parts[parts.length - 1].id;
    links.forEach(function (a) { var on = a.getAttribute("href") === "#" + cur; a.classList.toggle("cur", on); if (on && a.dataset.v !== "1") { links.forEach(function (x) { x.dataset.v = ""; }); a.dataset.v = "1"; a.parentNode.scrollTo({ left: a.offsetLeft - 40, behavior: "smooth" }); } });
  }
  setHH(); window.addEventListener("resize", setHH); window.addEventListener("load", setHH); setTimeout(setHH, 1500);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  document.querySelectorAll(".cell,.cc").forEach(function (el) { el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--x", e.clientX - r.left + "px"); el.style.setProperty("--y", e.clientY - r.top + "px"); }); });
})();
