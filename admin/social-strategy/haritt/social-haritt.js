/* Social Strategy (Haritt admin): data and behaviour for the Haritt Group page. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- platforms ---------- */
  var PF = {
    li: { n: "LinkedIn", ab: "in", bg: "#0A66C2", c: "#3B8FE0" },
    ig: { n: "Instagram", ab: "IG", bg: "linear-gradient(135deg,#F58529,#DD2A7B 55%,#8134AF)", c: "#DD2A7B" },
    yt: { n: "YouTube", ab: "YT", bg: "#FF0000", c: "#FF4D4D" },
    x: { n: "X", ab: "X", bg: "#222", c: "#C3C3CF" },
    fb: { n: "Facebook", ab: "f", bg: "#1877F2", c: "#5B9BFF" }
  };
  var badge = function (k) { var p = PF[k]; return '<span class="pf"><i style="background:' + p.bg + (k === "x" ? ";box-shadow:inset 0 0 0 1px #444" : "") + '">' + p.ab + "</i>" + p.n + "</span>"; };

  var VERDICT = [
    ["li", "Authority and trust: our journey, how the ventures fit, practical AI, Playbooks", "p1", "Primary", "Professionals, founders, small-business owners, partners, future team", "3 page posts a week, team reshares"],
    ["ig", "The friendly face: behind the scenes, the group in one picture, Playbooks as visuals", "p2", "Supporting", "Professionals and people who found us through a venture", "2 posts a week + stories"],
    ["yt", "Depth over time: Playbooks as videos and short explainers", "p2", "Supporting", "People searching how-to topics, people curious about Haritt", "1 Short a week, 1 long video a month"],
    ["x", "Shipping log: what we released, short plain opinions, replies", "p3", "Light", "Builders, startup and AI people", "3 short posts a week"],
    ["fb", "Hold the page and look alive; share the Instagram posts", "p4", "Hold", "Wider community, people who check a company page", "1 share a week, no extra work"]
  ];
  $("verdict").innerHTML = VERDICT.map(function (r) {
    return "<tr><td>" + badge(r[0]) + '</td><td data-l="Role">' + esc(r[1]) + '</td><td data-l="Priority"><span class="pr ' + r[2] + '">' + r[3] + '</span></td><td data-l="Main audience">' + esc(r[4]) + '</td><td data-l="How often">' + esc(r[5]) + "</td></tr>";
  }).join("");

  var MIND = [
    ["li", "\"Show me you know your work.\"", "Professional, thoughtful, story-led."],
    ["ig", "\"Who is behind this?\"", "Calm visuals, one short idea per post."],
    ["yt", "\"Explain it properly.\"", "Search, watch, trust. Depth wins."],
    ["x", "\"What did you ship?\"", "Short, specific, dated. Replies matter."],
    ["fb", "\"Is this a real company?\"", "Presence and proof. Nothing fancy."]
  ];
  $("mind").innerHTML = MIND.map(function (m) { return "<div>" + badge(m[0]) + '<b class="q">' + esc(m[1]) + "</b><span>" + esc(m[2]) + "</span></div>"; }).join("");

  var PB = {
    li: {
      purpose: "Be the group page that professionals and founders trust: clear thinking about useful technology, honest about our journey, and clear about what each venture does.",
      aud: "Professionals, founders and small-business owners, partners and startup programs, future team members.",
      post: ["Journey posts: started 2020, relaunched 2026, what we learned", "Plain-language explainers on AI, apps and tools for small teams", "How the ventures fit: HV Verse for individuals, Haritt Developers for businesses", "Playbooks articles as posts and PDF carousels", "What we shipped, with a real screen"],
      avoid: ["Reposting a venture's post with no new point", "Press-release words: \"thrilled to announce\", \"excited to share\"", "Claims or numbers we cannot show", "Hashtag walls and engagement bait"],
      freq: "3 page posts a week. Team members reshare with one line of their own.",
      out: "Right-fit comments, profile views, followers who work in startups, partner and program enquiries, clicks to the ventures.",
      ex: [["Page post", "Started in a coaching class in 2020. Relaunched in 2026.", "The true story in 150 words, ends with a question."], ["Page post", "Useful technology, made simple: what we mean", "The mission in plain words, with three examples from our own apps."], ["Document carousel", "One group, two ventures", "5-page PDF: who HV Verse is for, who Haritt Developers is for, where to follow each."], ["Page post", "AI should do the work. And ask first.", "How HV AI confirms before it changes anything."], ["Document carousel", "From the Playbooks: how to organise a job search", "One article turned into a 6-page PDF."]]
    },
    ig: {
      purpose: "Put a calm, human face on Haritt for people who found us through a venture or a Playbooks article. Explain the group in pictures, not slogans.",
      aud: "Professionals and curious followers of HV Verse or Haritt Developers who want to know who is behind them.",
      post: ["Carousels that explain one idea (the group, how AI asks first)", "Short reels: the timeline, behind the scenes, a shipped change", "Stories: polls, questions, a day of building", "Collab posts with @thehvverse and @harittdevelopers"],
      avoid: ["Copying venture posts onto the group feed", "Stock photos and generic motivation", "Long paragraphs on images", "Trend audio with nothing to learn"],
      freq: "1 carousel + 1 reel a week, stories 2 to 3 days a week",
      out: "Saves, shares, follows and profile visits. Taps on the bio link to haritt.com.",
      ex: [["Carousel", "Haritt in one picture: one group, two ventures", "6 slides: who we are, HV Verse, Haritt Developers, where to follow."], ["Reel", "Started 2020. Relaunched 2026.", "20-second motion timeline of the real story."], ["Carousel", "AI that asks first: how HV AI works in 5 steps", "Say it, AI reads it, picks an action, you confirm, the app updates."], ["Stories", "What should we explain next?", "Poll: AI, apps, or small-business tech."]]
    },
    yt: {
      purpose: "Be found in search for years with clear explanations, and give Playbooks articles a second life as video.",
      aud: "People searching \"how to organise a job search\" or \"what is an AI agent\", and people curious about Haritt.",
      post: ["Shorts: one idea in 20 to 30 seconds", "Playbooks as videos: the article, explained on screen", "A channel trailer: Haritt in 60 seconds", "Explainers on AI that asks first"],
      avoid: ["Duplicating the venture channels' videos", "Long intros before the point", "Ad-style brand films only", "Clickbait thumbnails"],
      freq: "1 Short a week, 1 long video a month",
      out: "Search views, watch time, subscribers per video, clicks to Playbooks and the ventures.",
      ex: [["Short", "AI that asks first, in 30 seconds", "HV AI asks before it changes anything."], ["Long video", "How to organise a job search: the 5-step system", "The Playbooks article, walked through on screen."], ["Short", "Started 2020, relaunched 2026", "The timeline reel as a Short."], ["Long video", "Haritt in 60 seconds (channel trailer)", "One group, two ventures, one mission."]]
    },
    x: {
      purpose: "A public shipping log and short plain opinions. Keep the handle active with little effort.",
      aud: "Builders, startup and AI people, early adopters, some customers of the ventures.",
      post: ["What shipped this week, with a short clip", "One-line opinions in plain words", "Threads that compress a LinkedIn lesson", "Replies on AI and small-business threads"],
      avoid: ["Arguments and politics", "Posting the same carousel image", "Threads longer than 6 posts", "Link-only posts"],
      freq: "3 short posts a week, replies when there is time",
      out: "Conversations with builders and early adopters. Not a main growth channel.",
      ex: [["Post", "Useful technology, made simple.", "One line, one clean image."], ["Post", "AI suggests. You approve.", "One line on how HV AI works."], ["Thread", "One group, two ventures", "4 posts: group, HV Verse, Haritt Developers, where to follow."], ["Poll", "What would you hand to AI first: planning, tracking or reminders?", "Replies feed the next Playbooks article."]]
    },
    fb: {
      purpose: "Hold the page so it looks real when someone checks us. No extra work now.",
      aud: "Wider community and anyone checking that Haritt is a real company.",
      post: ["Share the week's best Instagram post", "Pin the group carousel", "Event and Playbooks link posts"],
      avoid: ["Designing anything only for Facebook now", "Posting to random groups", "Boosting posts before we have a baseline"],
      freq: "1 share a week",
      out: "A page that looks active and complete.",
      ex: [["Share", "Haritt in one picture", "Same carousel as Instagram."], ["Pinned post", "One group, two ventures", "Pin to the top of the page."], ["Link post", "New in the Playbooks", "Article title and link, no extra design."]]
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
  pBody("li");

  /* ---------- pillars ---------- */
  var PIL = [
    ["Simple technology", 25, "#E5485D", "Plain-language explainers: what a tool does, why it is simpler than it looks.", "Mission"],
    ["Practical AI", 20, "#FF9F7A", "AI that does the work and asks first. Where it helps, where it does not.", "AI at Haritt"],
    ["Our ventures", 20, "#D4A24C", "HV Verse and Haritt Developers introduced in one picture, then pointed to their own accounts.", "HV Verse, Haritt Developers"],
    ["Playbooks", 20, "#8FB8A8", "Practical guides on work, careers and building things, turned into posts and videos.", "haritt.com/playbooks"],
    ["Journey", 15, "#B9B2D8", "Started 2020, relaunched 2026. What we ship, change and learn, with real material only.", "Trust"]
  ];
  $("mixbar").innerHTML = PIL.map(function (p) { return '<div style="width:' + p[1] + "%;background:" + p[2] + ';color:#17161A">' + p[1] + "%</div>"; }).join("");
  $("pillars").innerHTML = PIL.map(function (p) { return '<div class="mini"><div class="h"><span style="width:12px;height:12px;border-radius:4px;background:' + p[2] + '"></span><h4>' + esc(p[0]) + "</h4></div><p>" + esc(p[3]) + '</p><div class="chips"><span>' + esc(p[4]) + "</span></div></div>"; }).join("") +
    '<div class="mini" style="box-shadow:inset 0 0 0 1.5px var(--a2)"><h4>The 70 / 30 rule</h4><p>Seven of every ten posts teach something useful on their own. Three can be about Haritt itself: a venture, a release, our journey. Venture posts point to the venture accounts, never copy them.</p></div>';

  /* ---------- first posts ---------- */
  var FP = {
    li: [
      { m: "li", t: "Started in a coaching class in 2020. Relaunched in 2026.", f: "Page post, text only", pil: "Journey", obj: "Introduce who we are with a true story", pc: "#E5485D",
        hook: "Haritt began in a coaching class in 2020. Then it paused. Here is why we came back.", lbl: "Post",
        slides: ["Haritt began in a coaching class in 2020, where we were learning web development.", "We called it Haritt Development and built websites for people until July 2021.", "Then the project paused. In 2026 we started again.", "This time with one idea: simple, useful products that ordinary people and small businesses can use without an expert.", "Today: HV Verse for individuals, Haritt Developers for businesses.", "Question: if you restarted something, what made you come back?"],
        vis: "Text only, or one clean timeline image on warm off-white: 2020, July 2021, 2026.",
        cap: "Haritt began in 2020, in a coaching class where we were learning web development.\n\nWe called it Haritt Development and built websites for people until July 2021. Then the project paused.\n\nIn 2026 we started again, with one idea: build simple, useful products that ordinary people and small businesses can use without an expert.\n\nWe are still early. Today there are two ventures: HV Verse, free apps for personal and career growth, and Haritt Developers, a studio for businesses.\n\nIf you stopped something and restarted it, what made you come back?" },
      { m: "li", t: "Powerful technology is built for experts. We want that to change.", f: "Page post, text + 1 image", pil: "Simple technology", obj: "Explain the mission in plain words", pc: "#E5485D",
        hook: "Powerful technology is everywhere. Most of it is built for experts.", lbl: "Post",
        slides: ["Powerful technology is everywhere. Most of it is built for experts.", "Our mission: make useful technology simple and accessible for everyone, from individuals to growing businesses.", "What that means for us: plain language, clean screens, no learning curve.", "And when AI is involved, it suggests and you approve.", "Question: what is one tool you use that still needs an expert to explain it?"],
        vis: "One quote image: the mission line in Source Serif on warm off-white, a small red rule, the Haritt badge.",
        cap: "Powerful technology is everywhere. Most of it is built for experts.\n\nOur mission is to make useful technology simple and accessible for everyone, from individuals to growing businesses.\n\nIn practice, that means plain language, clean screens and no learning curve. And when AI is involved, it suggests and you approve.\n\nWhat is one tool you use that still needs an expert to explain it?" },
      { m: "li", t: "One group, two ventures", f: "Document carousel, 5 pages", pil: "Our ventures", obj: "Clarify what each venture does and who it is for", pc: "#D4A24C",
        hook: "One group. Two ventures. Two different people we help.", lbl: "Pages",
        slides: ["One group. Two ventures.", "HV Verse: free, AI-powered apps for personal and career growth (HV Reset, HV Hunt, HV Assess, with HV AI inside).", "Haritt Developers: websites, software, branding, marketing, lead generation and AI for businesses.", "Why two brands: each speaks to a different person, so each has its own voice and look.", "Follow each one: @thehvverse and @harittdevelopers."],
        vis: "PDF carousel on warm off-white, serif titles, the two venture logos shown small on pages 2 and 3, each on its own page.",
        cap: "One group, two ventures.\n\nHV Verse builds free apps for personal and career growth. Haritt Developers builds digital products and marketing for businesses.\n\nWe keep them as separate brands because they speak to different people.\n\nSwipe for who each one is for, and where to follow." },
      { m: "li", t: "AI should do the work. And ask first.", f: "Page post, text + 1 image", pil: "Practical AI", obj: "Show a clear point of view on AI", pc: "#FF9F7A",
        hook: "AI should do the work, not just the talking. And it should ask first.", lbl: "Post",
        slides: ["AI should do the work, not just the talking.", "In HV Verse you say what you need in English, Hindi or Hinglish. HV AI turns it into an action.", "Nothing changes until you confirm.", "Our rule for any AI feature: AI suggests, you approve.", "Question: which task would you hand to AI if it always asked first?"],
        vis: "Image: the 5-step loop (say it, AI reads it, picks an action, you confirm, the app updates) as five simple steps.",
        cap: "AI should do the work, not just the talking.\n\nIn HV Verse you say what you need, in English, Hindi or Hinglish, and HV AI turns it into an action in the app.\n\nBut nothing changes until you confirm. AI suggests, you approve.\n\nWhich task would you hand to AI if it always asked first?" },
      { m: "li", t: "From the Playbooks: how to organise a job search", f: "Document carousel, 6 pages", pil: "Playbooks", obj: "Send readers to haritt.com/playbooks", pc: "#8FB8A8",
        hook: "Job searches stall because of organisation, not effort.", lbl: "Pages",
        slides: ["Job searches stall because of organisation, not effort.", "A simple 5-step system, from the Playbooks.", "Pages 3 to 5: one step each. Copy the step titles and one line each from the article before posting.", "Why it works: every application, day and follow-up has a place.", "Read it free: haritt.com/playbooks"],
        vis: "PDF carousel, one step per page, big serif numbers in red.",
        cap: "Job searches often stall because of poor organisation, not lack of effort.\n\nOur Playbooks guide lays out a simple 5-step system for tracking applications, planning your days and following up on time.\n\nRead it free: haritt.com/playbooks" }
    ],
    ig: [
      { m: "car", t: "Haritt in one picture: one group, two ventures", f: "Carousel, 6 slides", pil: "Our ventures", obj: "Pinned intro post for the profile", pc: "#A70D22",
        hook: "One group. Two ventures.", lbl: "Slides",
        slides: ["One group. Two ventures.", "Haritt Group: useful technology, made simple.", "HV Verse: free apps for your day, your job search and your growth.", "Haritt Developers: websites, software, branding and AI for businesses.", "Each has its own look and its own account.", "Follow @thehvverse and @harittdevelopers. Read the Playbooks at haritt.com."],
        vis: "Warm off-white, serif headlines, one red rule per slide. Venture logos appear small on slides 3 and 4 only.",
        cap: "One group. Two ventures.\n\nHV Verse builds free apps for personal and career growth. Haritt Developers builds digital products and marketing for businesses.\n\nHaritt Group is the home behind both.\n\nSave this to explain us to a friend.\n\n#haritt #usefultechnology #madeinindia" },
      { m: "reel", t: "Started 2020. Relaunched 2026.", f: "Reel, 20 seconds, motion graphics", pil: "Journey", obj: "Tell the real story in 20 seconds", pc: "#A70D22",
        hook: "2020. A coaching class. A web development project.", lbl: "Shot list",
        slides: ["0 to 4 s: \"2020. A coaching class. A web development project.\"", "4 to 8 s: \"We built websites for people, until July 2021.\"", "8 to 12 s: \"Then it paused.\"", "12 to 17 s: \"2026. We started again.\" The two ventures appear.", "17 to 20 s: \"Useful technology, made simple.\" + @harittgroup"],
        vis: "Deep red gradient from the logo, serif type, a simple timeline line drawing across the screen. No stock footage.",
        cap: "Started in a coaching class in 2020. Paused in 2021. Relaunched in 2026.\n\nStill building simple, useful technology.\n\n#haritt #startupjourney #madeinindia" },
      { m: "car", t: "AI that asks first: how HV AI works in 5 steps", f: "Carousel, 7 slides", pil: "Practical AI", obj: "Saves and shares from people curious about AI", pc: "#FF9F7A",
        hook: "AI should do the work. And ask first.", lbl: "Slides",
        slides: ["AI should do the work. And ask first.", "Step 1: you say or type what you need, in English, Hindi or Hinglish.", "Step 2: HV AI reads what you mean.", "Step 3: it picks an action the app supports.", "Step 4: it shows you a card. You confirm, edit or cancel.", "Step 5: the app updates. Nothing changed before you said yes.", "See it work: HV Verse, free at thehvverse.com."],
        vis: "Five steps as five numbered cards, serif numerals in red. Slide 7 shows a small real HV AI card.",
        cap: "AI should do the work, not just the talking. And it should ask first.\n\nThis is how HV AI works inside HV Verse, in 5 steps.\n\nSave this the next time someone says AI will change things without asking.\n\n#ai #practicalai #haritt" },
      { m: "car", t: "Stories: what should we explain next?", f: "Story poll, 3 frames", pil: "Simple technology", obj: "Replies and research for the next Playbooks article", pc: "#E5485D",
        hook: "What should we explain next?", lbl: "Frames",
        slides: ["Frame 1: \"What should we explain next?\"", "Frame 2: poll: AI, apps, or small-business tech", "Frame 3: \"We will answer it in the Playbooks.\""],
        vis: "Warm off-white frames with the serif question and the native poll sticker.",
        cap: "Story poll, no caption needed." }
    ],
    yt: [
      { m: "short", t: "AI that asks first, in 30 seconds", f: "Short, 30 seconds", pil: "Practical AI", obj: "Views from the Shorts feed", pc: "#FF9F7A",
        hook: "AI should do the work. And ask first.", lbl: "Shot list",
        slides: ["0 to 3 s: \"AI should do the work. And ask first.\"", "3 to 15 s: real HV AI screen: a request, then the card with Confirm, Edit, Cancel", "15 to 25 s: \"AI suggests. You approve.\"", "25 to 30 s: \"Useful technology, made simple.\" + haritt.com"],
        vis: "Vertical screen recording with burned-in captions. End card on the deep red gradient.",
        cap: "Title: AI that asks before it changes anything #shorts\nDescription: HV AI turns what you say into actions inside HV Verse, but nothing changes until you confirm. More at haritt.com" },
      { m: "thumb", t: "How to organise a job search: the 5-step system", f: "Long video, 6 to 8 minutes", pil: "Playbooks", obj: "Search views for years: \"how to organise a job search\"", pc: "#8FB8A8",
        hook: "Thumbnail: \"ORGANISE YOUR JOB SEARCH\"", lbl: "Chapters",
        slides: ["0:00 Why job searches stall: organisation, not effort", "0:40 Step 1 (title from the article)", "1:30 Step 2 (title from the article)", "2:30 Step 3 (title from the article)", "3:30 Step 4 (title from the article)", "4:30 Step 5 (title from the article)", "5:30 Where to read the full guide: haritt.com/playbooks"],
        vis: "Thumbnail: 3 to 4 words in serif on warm off-white, one red rule, the Haritt badge small. No face needed.",
        cap: "Title: How to Organise a Job Search: A Simple 5-Step System\nDescription: A walk-through of the Haritt Playbooks guide on organising a job search: tracking applications, scheduling your days and following up on time. Read the article: haritt.com/playbooks. Chapters below." },
      { m: "short", t: "Started 2020, relaunched 2026", f: "Short, 20 seconds", pil: "Journey", obj: "Share the brand story as a Short", pc: "#B9B2D8",
        hook: "2020. A coaching class. A web development project.", lbl: "Shot list",
        slides: ["The same 20-second timeline as the Instagram reel, exported as 9:16 with captions."],
        vis: "Same as the Instagram reel.",
        cap: "Title: A coaching-class project, paused in 2021, relaunched in 2026 #shorts\nDescription: The short story of Haritt. Useful technology, made simple. haritt.com" }
    ],
    x: [
      { m: "x", t: "Useful technology, made simple.", f: "Post + clean image", pil: "Simple technology", obj: "Pinned post for the profile", pc: "#E5485D", hook: "Useful technology, made simple.", lbl: "Post",
        slides: ["Useful technology, made simple.", "Haritt Group: HV Verse and Haritt Developers. haritt.com"], vis: "Image: the tagline in Source Serif on warm off-white, the Haritt badge.", cap: "Useful technology, made simple.\n\nHaritt Group is the home of HV Verse and Haritt Developers.\n\nharitt.com" },
      { m: "x", t: "AI suggests. You approve.", f: "Post", pil: "Practical AI", obj: "Reposts and replies", pc: "#FF9F7A", hook: "AI suggests. You approve.", lbl: "Post",
        slides: ["AI suggests. You approve.", "That is the whole rule for AI in our apps."], vis: "Text only.", cap: "AI suggests. You approve.\n\nThat is the rule for AI in our apps. Nothing changes until you confirm." },
      { m: "x", t: "One group, two ventures", f: "Thread, 4 posts", pil: "Our ventures", obj: "Clarify the structure and send followers to each venture", pc: "#D4A24C", hook: "One group. Two ventures. A short thread:", lbl: "Thread",
        slides: ["One group. Two ventures. A short thread:", "1. HV Verse: free apps for personal and career growth. @thehvverse", "2. Haritt Developers: websites, software, branding, marketing and AI for businesses. @harittdeveloper", "3. Haritt Group is the home behind both. haritt.com"], vis: "Text thread.", cap: "One group. Two ventures. A short thread:\n\n1. HV Verse: free apps for personal and career growth. @thehvverse\n2. Haritt Developers: websites, software, branding, marketing and AI for businesses. @harittdeveloper\n3. Haritt Group is the home behind both. haritt.com" },
      { m: "x", t: "New in the Playbooks", f: "Post + link", pil: "Playbooks", obj: "Clicks to haritt.com/playbooks", pc: "#8FB8A8", hook: "New in the Playbooks: how to organise a job search.", lbl: "Post",
        slides: ["New in the Playbooks: how to organise a job search.", "A simple 5-step system. 4 minutes to read. haritt.com/playbooks"], vis: "Optional: the article cover.", cap: "New in the Playbooks: how to organise a job search.\n\nA simple 5-step system. 4 minutes to read.\n\nharitt.com/playbooks" },
      { m: "x", t: "What would you hand to AI first?", f: "Poll", pil: "Practical AI", obj: "Replies and research for the next article", pc: "#FF9F7A", hook: "If AI always asked first, what would you hand to it?", lbl: "Poll",
        slides: ["Planning my day", "Tracking my tasks or jobs", "Reminders", "Something else (reply)"], vis: "Native poll.", cap: "If AI always asked first, what would you hand to it?" }
    ],
    fb: [
      { m: "car", t: "Haritt in one picture", f: "Share of the Instagram carousel", pil: "Our ventures", obj: "Keep the page active", pc: "#A70D22", hook: "One group. Two ventures.", lbl: "Plan", slides: ["Share the Instagram carousel natively, same caption."], vis: "Same as Instagram.", cap: "Same caption as Instagram." },
      { m: "reel", t: "Started 2020. Relaunched 2026.", f: "Reel share, then pin", pil: "Journey", obj: "Pin to the top of the page", pc: "#A70D22", hook: "Same reel as Instagram", lbl: "Plan", slides: ["Share the Instagram reel and pin it to the top of the page."], vis: "Same as Instagram.", cap: "Same caption as Instagram." }
    ]
  };
  var LOGO = "/admin/academy/img/haritt.png";
  function fpMock(p) {
    if (p.m === "car" || p.m === "reel" || p.m === "short") {
      var v = p.m !== "car";
      return '<div class="pm hg ' + (v ? "p916 dark" : "p45") + '" style="--pc:' + p.pc + '"><div class="tp"><img src="' + LOGO + '" alt="">HARITT GROUP' + (v ? "" : "<em>1/6</em>") + "</div><h5" + (v ? ' style="top:28%;font-size:16px"' : "") + ">" + esc(p.hook) + "</h5>" + (v ? '<div class="play" style="top:74%"></div>' : '<div class="bar"></div><div class="ft">Swipe</div>') + "</div>";
    }
    if (p.m === "thumb") return '<div class="pm hg p169 thumb"><div class="ttl">' + esc(p.hook.replace(/^Thumbnail: |"/g, "")) + '</div><div class="shot2" style="width:26%;bottom:10%;right:8%"></div><img class="badge" src="' + LOGO + '" alt=""></div>';
    if (p.m === "x") return '<div class="xc"><div class="who"><img src="' + LOGO + '" alt=""><div><b>Haritt Group</b><small>@harittgroup</small></div></div><p>' + esc(p.cap).replace(/\n/g, "<br>") + "</p></div>";
    return '<div class="lip hg"><div class="who"><span class="av"><img src="' + LOGO + '" alt=""></span><div><b>Haritt Group</b><small>Company page · harittgroup</small></div></div><p><b>' + esc(p.hook) + "</b></p><p>" + esc(p.slides.slice(1, 3).join(" ")) + "</p></div>";
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
  renderFP("li");

  /* ---------- 30-day calendar ---------- */
  var C = [
    [["li", "Page post", "Started in a coaching class in 2020. Relaunched in 2026.", "Journey", "LinkedIn 1"], ["x", "Post", "Useful technology, made simple.", "Simple technology", "X 1"]],
    [["ig", "Carousel", "Haritt in one picture: one group, two ventures", "Our ventures", "Instagram 1"], ["fb", "Share", "Haritt in one picture", "Our ventures", "Facebook 1"]],
    [["li", "Page post", "Powerful technology is built for experts. We want that to change.", "Simple technology", "LinkedIn 2"], ["yt", "Short", "AI that asks first, in 30 seconds", "Practical AI", "YouTube 1"], ["x", "Post", "AI suggests. You approve.", "Practical AI", "X 2"]],
    [["ig", "Reel", "Started 2020. Relaunched 2026.", "Journey", "Instagram 2"], ["ig", "Stories", "What should we explain next?", "Simple technology", "Instagram 4"]],
    [["li", "Document carousel", "One group, two ventures", "Our ventures", "LinkedIn 3"], ["x", "Thread", "One group, two ventures", "Our ventures", "X 3"]],
    [["yt", "Short", "Started 2020, relaunched 2026", "Journey", "YouTube 3"]],
    [],
    [["li", "Page post", "AI should do the work. And ask first.", "Practical AI", "LinkedIn 4"], ["x", "Post", "Plain English: what an AI agent is", "Practical AI"]],
    [["ig", "Carousel", "AI that asks first: how HV AI works in 5 steps", "Practical AI", "Instagram 3"]],
    [["li", "Document carousel", "From the Playbooks: how to organise a job search", "Playbooks", "LinkedIn 5"], ["yt", "Short", "One tip from the job search guide", "Playbooks"], ["x", "Post", "New in the Playbooks", "Playbooks", "X 4"]],
    [["ig", "Reel", "What a small team can hand to AI today", "Practical AI"], ["fb", "Share", "What a small team can hand to AI", "Practical AI"]],
    [["li", "Page post", "Why we keep two ventures with two voices", "Our ventures"], ["x", "Post", "Shipped: this week's real release", "Journey"]],
    [["yt", "Long video", "How to organise a job search: the 5-step system", "Playbooks", "YouTube 2"], ["ig", "Stories", "Behind the scenes: making the video", "Playbooks"]],
    [],
    [["li", "Page post", "Plain English: one tech term in two sentences", "Simple technology"], ["x", "Post", "Plain English: one tech term", "Simple technology"]],
    [["ig", "Carousel", "5 questions to ask before you buy any business software", "Simple technology"], ["x", "Poll", "What would you hand to AI first?", "Practical AI", "X 5"]],
    [["li", "Page post", "What Haritt Developers learns from building HV Verse", "Our ventures"], ["yt", "Short", "What building our own apps taught us", "Our ventures"]],
    [["ig", "Reel", "Where AI helps a small business, where it does not", "Practical AI"], ["fb", "Share", "Where AI helps a small business", "Practical AI"]],
    [["li", "Document carousel", "Playbook: a one-page plan for your first website", "Playbooks"], ["x", "Post", "Shipped: this week's real release", "Journey"]],
    [["ig", "Stories", "Poll: which Playbook next?", "Playbooks"], ["yt", "Short", "Haritt in 60 seconds (teaser)", "Our ventures"]],
    [],
    [["li", "Page post", "The cost of too many tools, and how to cut them", "Simple technology"], ["x", "Post", "Too many tools is a tax on attention", "Simple technology"]],
    [["ig", "Carousel", "Plain English: 6 tech words, explained", "Simple technology"]],
    [["li", "Page post", "AI for small teams: what we are thinking about next", "Practical AI"], ["yt", "Short", "AI for small teams, in plain words", "Practical AI"], ["x", "Post", "Plain English: what an API is", "Simple technology"]],
    [["ig", "Reel", "How we decide what to build", "Journey"], ["fb", "Share", "How we decide what to build", "Journey"]],
    [["li", "Page post", "How we decide what to build (and what we say no to)", "Journey"], ["x", "Thread", "How we decide what to build", "Journey"]],
    [["yt", "Long video", "Haritt in 60 seconds (channel trailer)", "Our ventures"], ["ig", "Stories", "Behind the scenes: the team workspace", "Journey"]],
    [],
    [["li", "Page post", "One month of posting: what we learned (real numbers only)", "Journey"], ["x", "Post", "Month 1 notes", "Journey"]],
    [["ig", "Carousel", "Month 1: the 3 most saved ideas (by real saves)", "Simple technology"], ["fb", "Share", "Month 1 recap", "Journey"]]
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

  /* ---------- growth playbook (authority) ---------- */
  var HOOKS = [
    ["State the plain truth", "\"Powerful technology is everywhere. Most of it is built for experts.\"", "LinkedIn post"],
    ["Name the old way", "\"Most software asks you to learn it. Ours should not.\"", "LinkedIn or X"],
    ["Start with the date", "\"In 2020 we built websites in a coaching class. Here is what stayed the same.\"", "Reel or post"],
    ["Ask before you act", "\"AI should do the work. And it should ask first.\"", "Carousel or Short"],
    ["One group, two audiences", "\"Why we keep two ventures with two different voices\"", "Carousel"],
    ["Show the receipt", "\"This is what we shipped this week.\" Only when it is real.", "X or LinkedIn"],
    ["Plain English", "\"What is an AI agent? Two sentences.\"", "Short or post"],
    ["Honest limits", "\"Three things AI cannot do for your small business yet\"", "Carousel or post"]
  ];
  $("hooks").innerHTML = HOOKS.map(function (h, i) { return '<div class="hk"><span class="hn">' + (i + 1) + "</span><div><b>" + esc(h[0]) + '</b><p>' + esc(h[1]) + '</p><small>' + esc(h[2]) + "</small></div></div>"; }).join("");

  var SERIES = [
    ["Plain English", "Every Monday", "#E5485D", "One tech or AI word explained in two sentences and one everyday example. No jargon, ever.", "Saves and shares", "Simple technology"],
    ["From the Playbooks", "Every Wednesday", "#8FB8A8", "One Playbooks article, turned into a carousel, a Short or a LinkedIn post, always ending with the link.", "Clicks to Playbooks", "Playbooks"],
    ["Shipped", "Every Friday", "#D4A24C", "What actually shipped across the ventures that week, with a real screen. If nothing shipped, skip the week.", "Trust and replies", "Journey"],
    ["Why we built it", "Every second Tuesday", "#FF9F7A", "One product or business decision explained honestly: what we chose, what we dropped, why.", "Comments from professionals", "Practical AI or Journey"]
  ];
  $("series").innerHTML = SERIES.map(function (s) { return '<div class="mini sr" style="--sc:' + s[2] + '"><div class="h"><span class="sd"></span><h4>' + esc(s[0]) + '</h4><span class="chip">' + esc(s[1]) + "</span></div><p>" + esc(s[3]) + '</p><div class="chips"><span>Gets: ' + esc(s[4]) + "</span><span>" + esc(s[5]) + "</span></div></div>"; }).join("");

  var TB = [
    ["Simple technology", "Powerful technology is built for experts. We want that to change", "Page post", "Trust", "The mission in plain words"],
    ["Simple technology", "Plain English: what is a browser app, and why nothing needs installing", "Carousel", "Save", "Ties to HV Verse running in any browser"],
    ["Simple technology", "5 questions to ask before you buy any business software", "Carousel", "Save", "Useful to small-business owners"],
    ["Simple technology", "The cost of too many tools", "Page post", "Reply", "Opinion, with one honest example"],
    ["Simple technology", "Plain English: what an API is", "Short", "Save", "Two sentences and an example"],
    ["Simple technology", "Why plain language is a feature, not a style", "Page post", "Reply", "Why our screens avoid jargon"],
    ["Simple technology", "Plain English: 6 tech words, explained", "Carousel", "Save", "A glossary people keep"],
    ["Practical AI", "AI should do the work. And ask first", "Page post", "Reply", "How HV AI confirms before changing anything"],
    ["Practical AI", "How HV AI works in 5 steps", "Carousel", "Save", "From the AI at Haritt page"],
    ["Practical AI", "Where AI helps a small business, where it does not", "Reel", "Send", "Honest limits, practical examples"],
    ["Practical AI", "Plain English: what an AI agent is", "Short", "Save", "Two sentences"],
    ["Practical AI", "Why our AI speaks Hinglish", "Page post", "Reply", "Built around how people in India speak and type"],
    ["Practical AI", "What we will not let AI do without asking", "Page post", "Reply", "The confirm-first rule"],
    ["Practical AI", "AI for small teams: what we are thinking about next", "Page post", "Follow", "Only what is already on the public roadmap"],
    ["Our ventures", "One group, two ventures", "Carousel", "Save", "Pinned intro"],
    ["Our ventures", "HV Verse in 60 seconds, from the Group's point of view", "Reel", "Follow", "Points to @thehvverse"],
    ["Our ventures", "Haritt Developers: what a business can ask us to build", "Page post", "Follow", "Points to @harittdevelopers"],
    ["Our ventures", "What Haritt Developers learns from building HV Verse", "Page post", "Reply", "Real lessons only"],
    ["Our ventures", "Why we keep two brands with two voices", "Carousel", "Reply", "Our reading: each audience needs its own tone"],
    ["Our ventures", "Haritt in 60 seconds", "Long video", "Follow", "Channel trailer"],
    ["Playbooks", "How to organise a job search: a simple 5-step system", "Document carousel", "Save", "The existing Playbooks article"],
    ["Playbooks", "Playbook: a one-page plan for your first website", "Document carousel", "Save", "New article needed first"],
    ["Playbooks", "Playbook: how to choose your first 3 tools", "Page post", "Save", "New article needed first"],
    ["Playbooks", "A weekly review in 15 minutes", "Carousel", "Save", "New article needed first"],
    ["Playbooks", "What we learned from the first Playbook readers", "Page post", "Follow", "Only after real readership data exists"],
    ["Journey", "Started in a coaching class in 2020. Relaunched in 2026", "Page post", "Trust", "The real story"],
    ["Journey", "Why we paused in 2021, and what changed", "Page post", "Reply", "Team to confirm the facts first"],
    ["Journey", "Shipped: this week's release", "X post", "Follow", "Only when something shipped"],
    ["Journey", "How we decide what to build (and what we say no to)", "Page post", "Reply", "Real decisions, no names"],
    ["Journey", "One month of posting: what we learned", "Page post", "Follow", "Real numbers only"]
  ];
  var PC = { "Simple technology": "#E5485D", "Practical AI": "#FF9F7A", "Our ventures": "#D4A24C", "Playbooks": "#8FB8A8", "Journey": "#B9B2D8" }, TF = "All";
  function renderTB() {
    $("tbank").innerHTML = TB.map(function (t, i) { return { t: t, i: i }; }).filter(function (o) { return TF === "All" || o.t[0] === TF; }).map(function (o) {
      var t = o.t; return '<div class="tb"><span class="tp2" style="background:' + PC[t[0]] + '"></span><div><b id="tb' + o.i + '">' + esc(t[1]) + '</b><p>' + esc(t[4]) + '</p><div class="meta"><span class="chip">' + esc(t[2]) + '</span><span class="chip">Gets: ' + esc(t[3]) + '</span><span class="chip">' + esc(t[0]) + '</span></div></div><button class="cpb" type="button" data-cp="tb' + o.i + '">Copy</button></div>';
    }).join("");
  }
  $("tseg").innerHTML = ["All"].concat(Object.keys(PC)).map(function (k, i) { return '<button type="button" data-f="' + k + '"' + (i ? "" : ' class="on"') + ">" + k + "</button>"; }).join("");
  $("tseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; TF = b.dataset.f; [].forEach.call($("tseg").children, function (x) { x.classList.toggle("on", x === b); }); renderTB(); });
  renderTB();

  var YR = [
    ["Jan", "New year plans; National Startup Day (16 January)"], ["Feb", "Union Budget season: small-business and tech talk"], ["Mar", "Financial year end for many businesses"],
    ["Apr", "New financial year: fresh budgets, tool reviews"], ["May", "Mid-year planning, internship and hiring conversations"], ["Jun", "Half-year review: what to keep, what to cut"],
    ["Jul", "Mid-year reviews; good time for a 'what we learned' post"], ["Aug", "Independence Day (15 August): built in India"], ["Sep", "Festive-season preparation for small businesses"],
    ["Oct", "Festive season; HV Verse launched on 1 October 2026"], ["Nov", "Year-end budgets and tool decisions"], ["Dec", "Year in review: what shipped, what we learned"]
  ];
  $("year").innerHTML = YR.map(function (y) { return '<div><b>' + y[0] + '</b><span>' + esc(y[1]) + "</span></div>"; }).join("");

  /* ---------- promotion ---------- */
  var PR2 = [
    ["LinkedIn", "Yes", "y", "Every page post; team members reshare with one line", "No poster dumps, no engagement bait"],
    ["Instagram", "Yes", "y", "Carousel, reel and stories; collab posts with the venture accounts", "One idea per post"],
    ["YouTube", "Yes", "y", "Shorts and Playbooks videos; trailer pinned", "Titles people actually search"],
    ["Venture accounts (@thehvverse, @harittdevelopers)", "Yes, both ways", "y", "Collab posts and mentions; the Group introduces, the venture explains", "Never repost without a new point"],
    ["haritt.com Playbooks", "Yes", "y", "Every article gets a post, a carousel and a Short", "Link in the last slide"],
    ["Startup programs and communities", "Yes, carefully", "m", "Share what we shipped and learned; see the Startup programs page in the admin", "Read each program's rules first"],
    ["GitHub (harittgroup)", "Light", "m", "Pin a profile README that links to the ventures", "Only real, public work"],
    ["X", "Light", "m", "Shipping log and replies", "Not a growth channel for us"],
    ["Quora and Reddit", "Yes, carefully", "m", "Full answers to AI and small-business tool questions; link only when it helps", "Read each community's rules first"],
    ["Facebook and Threads", "Hold", "n", "Share Instagram posts only", "No extra design time"],
    ["Pinterest", "Skip", "n", "Admin-only account for now", "Not a priority for a B2B and trust brand"],
    ["Mass WhatsApp forwards", "No", "n", "Do not forward to groups", "Spam hurts the brand"]
  ];
  $("promo").innerHTML = PR2.map(function (r) { return "<tr><td>" + esc(r[0]) + '</td><td data-l="Promote?"><span class="pz ' + r[2] + '">' + esc(r[1]) + '</span></td><td data-l="How">' + esc(r[3]) + '</td><td data-l="Rule">' + esc(r[4]) + "</td></tr>"; }).join("");

  var LOOP = [["Write once", "One Playbooks article or one idea"], ["LinkedIn", "Page post or PDF carousel"], ["Instagram", "Carousel on the same idea"], ["YouTube", "A Short, then a long video when the idea earns it"], ["X", "A thread or one sharp line"], ["Playbooks", "The article stays the home for all of it"]];
  $("loopx").innerHTML = LOOP.map(function (l, i) { return '<div><i>' + (i + 1) + "</i><b>" + esc(l[0]) + "</b><small>" + esc(l[1]) + "</small></div>"; }).join("");

  var OWN = [
    ["Venture sites", "HV Verse and Haritt Developers already link back to haritt.com. Keep one clear 'part of Haritt Group' link on each, nothing more.", "Keep"],
    ["Playbooks", "Add a small 'Follow Haritt Group on LinkedIn' line at the end of every article.", "Proposed"],
    ["Email signature", "Add the LinkedIn page and YouTube channel to the contact@haritt.com signature.", "Proposed"],
    ["Team profiles", "Everyone in the team adds Haritt Group as their workplace on LinkedIn and reshares page posts.", "Quick fix"],
    ["Venture accounts", "@thehvverse and @harittdevelopers follow @harittgroup, and tag it only when a post is truly about the group.", "Quick fix"],
    ["About page", "The About page says 'Founded in 2026'. Our story is 'Started 2020, relaunched 2026'. Decide which line we use everywhere.", "Gap"]
  ];
  $("own").innerHTML = OWN.map(function (o) { return '<div class="mini"><span class="st ' + (o[2] === "Proposed" ? "bd" : o[2] === "Gap" ? "gp" : "ok") + '">' + esc(o[2]) + "</span><h4>" + esc(o[0]) + "</h4><p>" + esc(o[1]) + "</p></div>"; }).join("");

  /* ---------- AI prompts ---------- */
  var BRIEF = "You are the social media writer for Haritt Group.\n\nAbout Haritt Group: an independent technology company from India. Tagline: \"Useful technology, made simple.\" Mission: make useful technology simple and accessible for everyone, from individuals to growing businesses. Vision: become India's most trusted home for simple, useful products people rely on every day. Story: started in 2020 as a web development project in a coaching class (Haritt Development, which built websites until July 2021), relaunched in 2026.\nTwo ventures, each with its own brand and accounts: (1) HV Verse (thehvverse.com, @thehvverse): free AI-powered apps for personal and career growth: HV Reset, HV Hunt, HV Assess, with HV AI inside. HV AI understands English, Hindi and Hinglish and nothing changes until the user confirms. (2) Haritt Developers (developers.haritt.com, @harittdevelopers): a digital studio for websites, software, branding, marketing, lead generation, AI and automation, e-commerce and consulting. Playbooks at haritt.com/playbooks: practical guides on work, careers and building things.\n\nAudience: professionals, founders and small-business owners, partners and startup programs, future team members. Individuals and students are served by HV Verse, so do not speak to them directly.\nVoice: plain, friendly, direct. Short sentences, everyday words, no jargon, no hype. Write as \"we\" (the Haritt team). Never name individual people.\nFormat rules: group content explains and introduces, it does not copy a venture's posts; send people to the venture accounts for details. No emojis. At most 3 hashtags. Max one question at the end.\nHard rules: never invent numbers, users, customers, clients, awards or testimonials. Use only the facts above or facts I paste. Do not describe four company principles as confirmed. Do not say 'founded in 2026'; say 'started in 2020, relaunched in 2026'.";
  var PR = [
    ["B", "Brand brief", "Paste this first in every chat", BRIEF],
    ["Li", "LinkedIn page post", "In the Haritt team's voice", "Write a LinkedIn post for the Haritt Group company page about: [[lesson, story or decision]].\nPillar: [[Simple technology / Practical AI / Our ventures / Playbooks / Journey]].\nShape: a first line that states the plain truth, 2 or 3 short paragraphs, one concrete example from our own work, one honest closing question.\n120 to 220 words, short paragraphs, no hashtag wall (max 3), no emojis, no 'excited to announce'. Use only facts I give you: [[facts]]. Give 2 versions with different first lines."],
    ["Ca", "Instagram caption", "For a carousel or reel", "Write an Instagram caption for the Haritt Group account for this post: [[topic]].\nPillar: [[pillar]]. Format: [[carousel / reel / story]].\nStructure: a hook line, 2 to 4 short lines with the idea, one line pointing to [[haritt.com / @thehvverse / @harittdevelopers / Playbooks]] only if it fits, then one call to action (save, share or follow).\nUnder 100 words. Max 3 hashtags. Give 3 versions with different hooks."],
    ["Cr", "Carousel or PDF", "5 to 7 slides, one idea each", "Plan a [[Instagram carousel / LinkedIn PDF]] on: [[topic]].\nGive [[6]] slides. For each slide: a serif headline under 8 words, one support line under 15 words, and a simple visual note (line icon, diagram, or a real screen from a venture shown in its own frame).\nSlide 1 is the hook. The last slide has one action: [[follow / read the article / visit the venture]].\nThen write the caption using the caption rules."],
    ["Re", "Reel or Short script", "15 to 30 seconds", "Write a [[20]]-second vertical video script on: [[topic]].\nGive a table with: time, on-screen text (under 7 words), what we show (motion graphics, a simple timeline, or a real screen recording; [[no one on camera / presenter allowed]]), and optional voice-over.\nThe first 2 seconds state the plain truth or the problem. End with one line and the Haritt Group badge. Also give a cover headline under 6 words and 3 alternative hooks."],
    ["Yt", "YouTube video", "6 to 8 minute explainer", "Plan a YouTube video for the Haritt Group channel: [[title]].\nGoal: a viewer who searched \"[[search phrase]]\" understands it by the end.\nGive: 3 title options under 60 characters, thumbnail text under 5 words, chapters with timestamps, a full script with screen directions, a description with chapters and a tracked link placeholder, and a pinned comment.\nNo long intro: show the answer in the first 20 seconds. If the video is based on a Playbooks article, follow the article and mark where I must paste its real steps."],
    ["X", "X post or thread", "Short and sharp", "Write 5 X posts for @harittgroup about: [[topic]].\nEach under 240 characters. One clear idea, plain words, no hashtags or one at most. Mix: 2 plain explanations, 1 opinion, 1 'shipped' update (only if I give you the real update: [[update]]), 1 question.\nThen write the same idea as a 4-post thread."],
    ["Gd", "Graphic design", "For Canva, Figma or an image tool", "Design a [[1080 x 1350 Instagram carousel slide / 1280 x 720 YouTube thumbnail / 1080 x 1920 reel cover]] for Haritt Group.\nStyle: calm, editorial, premium. Background warm off-white #F5F4EF (cards #FBFAF7), or a deep red gradient #5E0010 to #9E0A1C to #C8102E for reel covers only. Headline in Source Serif 4 Medium (500), ink #17161A, tight letter spacing. Support text in Inter, muted #6E6A60. One accent: red #A70D22 (a single rule, a number or an italic word). Thin line colour #DDDAD0.\n80 px margins. Small circular Haritt badge top left, slide number top right.\nText: headline \"[[headline]]\", support \"[[line]]\".\nNo emojis, no stock photos of people, no gradients except the red cover, no extra decoration, no fake numbers. Venture screens only inside a plain frame, in their own look."],
    ["Hk", "Authority hooks", "10 hooks for one idea", "Write 10 hooks for a [[LinkedIn post / carousel / reel]] about: [[topic]].\nAudience: professionals, founders and small-business owners in India. Use these patterns: state the plain truth, name the old way, start with a date, ask before you act, one group two audiences, show the receipt, plain English, honest limits.\nEach hook under 14 words, no clickbait the post can't deliver, no fake numbers. Mark the best 2 and say why."],
    ["Rp", "Repurpose a Playbook", "One article, every platform", "Turn this Playbooks article into versions for every platform: [[paste the article text]].\nGive: a LinkedIn PDF carousel outline (6 pages), an Instagram carousel outline (7 slides), a Short script (25 s), a YouTube long-video outline with chapters, an X thread (4 posts) and a one-line Facebook share.\nKeep every fact the same. Do not add steps, tips or numbers that are not in the article. End each with a link to haritt.com/playbooks."],
    ["An", "Animation and motion", "For reels, intros and timelines", "Plan a [[6]]-second motion graphic for Haritt Group: [[what it shows, e.g. the 2020 to 2026 timeline]].\nLook: warm off-white #F5F4EF or the deep red gradient, Source Serif headlines, red #A70D22 as the only accent.\nMotion: calm and smooth, ease-out, 300 to 500 ms per move, no bouncing or spinning. Text appears line by line. A thin line draws across the screen for timelines.\nGive a shot-by-shot timeline (time, what moves, text on screen) and export settings: 1080 x 1920, 30 fps, MP4."],
    ["Wr", "Weekly review", "Turn numbers into next week's plan", "Here are this week's numbers for Haritt Group: [[paste the Friday report: saves, shares, comments, profile visits, link clicks by platform]].\nTell me: (1) which post did best and what it had in common with the others; (2) one thing to do more of; (3) one thing to stop; (4) three post ideas for next week that fit our five pillars. Do not guess missing numbers. If data is missing, tell me what to record."]
  ];
  var hl = function (s) { return esc(s).replace(/\[\[(.*?)\]\]/g, "<mark>$1</mark>"); };
  $("plist").innerHTML = PR.map(function (p, i) {
    return '<details class="pc reveal"' + (i ? "" : " open") + '><summary><span class="ic">' + p[0] + "</span><span><b>" + esc(p[1]) + "</b><small>" + esc(p[2]) + '</small></span><span class="ar">›</span></summary><div class="bd"><pre id="pr' + i + '">' + hl(p[3]) + '</pre><div><button class="cpb" type="button" data-cp="pr' + i + '">Copy prompt</button></div></div></details>';
  }).join("");

  /* ---------- features ---------- */
  var FT = [
    ["li", ["Document (PDF) carousels for explainers and Playbooks", "Team members reshare page posts with one line of their own", "Polls for real questions, not bait", "A newsletter later, after 2 months of steady posts"]],
    ["ig", ["Collab posts with @thehvverse and @harittdevelopers", "Highlights: Start here, Ventures, Playbooks", "Story polls and question boxes", "Pinned posts: the group carousel first"]],
    ["yt", ["A 60-second channel trailer", "Playlists: Playbooks, AI explained, Our journey", "Chapters on every long video", "Pinned comment with the tracked link"]]
  ];
  $("feat").innerHTML = FT.map(function (f) { return '<div class="mini">' + badge(f[0]) + '<ul class="slides">' + f[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("");

  /* ---------- workflow nodes ---------- */
  var WF = [["Idea", "from Playbooks, DMs"], ["Write", "AI prompt"], ["Design", "template"], ["Check", "second person"], ["Schedule", "LI, IG, YT"], ["Publish", "on time"], ["Engage", "first hour"], ["Measure", "every Friday"]];
  $("wfn").innerHTML = WF.map(function (w, i) {
    var x = 95 + i * 127.1;
    return '<g><rect class="n-box" x="' + (x - 56) + '" y="48" width="112" height="64" rx="14"/><text x="' + x + '" y="76" text-anchor="middle" class="n-t" style="font-size:15px">' + w[0] + '</text><text x="' + x + '" y="96" text-anchor="middle" class="n-d" style="font-size:11.5px">' + w[1] + '</text><text x="' + x + '" y="34" text-anchor="middle" class="n-k" fill="#FF9F7A">' + (i + 1) + "</text></g>";
  }).join("");
  $("wfl").innerHTML = WF.map(function (w, i) { return "<li><i>" + (i + 1) + "</i><span><b>" + w[0] + "</b><small>" + w[1] + "</small></span></li>"; }).join("");

  /* ---------- UTM builder ---------- */
  function utm() {
    var c = ($("u3").value || "").toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    $("uo").textContent = $("u2").value + "?utm_source=" + $("u1").value + "&utm_medium=social&utm_campaign=" + (c || "campaign");
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
