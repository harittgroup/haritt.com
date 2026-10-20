/* Social Strategy (Haritt admin): data and behaviour for the Haritt Developers page. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- platforms ---------- */
  var PF = {
    li: { n: "LinkedIn", ab: "in", bg: "#0A66C2", c: "#3B8FE0" },
    ig: { n: "Instagram", ab: "IG", bg: "linear-gradient(135deg,#F58529,#DD2A7B 55%,#8134AF)", c: "#DD2A7B" },
    fb: { n: "Facebook", ab: "f", bg: "#1877F2", c: "#5B9BFF" },
    yt: { n: "YouTube", ab: "YT", bg: "#FF0000", c: "#FF4D4D" },
    x: { n: "X", ab: "X", bg: "#222", c: "#C3C3CF" }
  };
  var badge = function (k) { var p = PF[k]; return '<span class="pf"><i style="background:' + p.bg + (k === "x" ? ";box-shadow:inset 0 0 0 1px #444" : "") + '">' + p.ab + "</i>" + p.n + "</span>"; };
  var BRAND = "/admin/academy/img/haritt-developers.png";

  var VERDICT = [
    ["li", "Trust: how we think, what we have built, and how we work. Where owners, founders and referrers check a studio.", "p1", "Primary", "Business owners, founders, referrers", "3 posts a week"],
    ["ig", "Visual proof and plain tips: checklists, process, our own screens. People save what they will use.", "p1", "Primary", "Local business owners, founders", "3 posts + stories a week"],
    ["fb", "Local small-business owners and groups. Short, helpful posts and shared carousels.", "p2", "Essential", "Small-business owners outside the startup crowd", "2 posts a week"],
    ["yt", "Search and depth: how-to and checking videos people find for years.", "p3", "Supporting", "Owners searching for how to fix a site or get enquiries", "1 Short a week, 1 long video every 2 weeks"],
    ["x", "Short build notes and technical credibility. Light, mostly replies.", "p4", "Light", "Founders, developers, tech people", "2 to 3 short posts a week"]
  ];
  $("verdict").innerHTML = VERDICT.map(function (r) {
    return "<tr><td>" + badge(r[0]) + '</td><td data-l="Role">' + esc(r[1]) + '</td><td data-l="Priority"><span class="pr ' + r[2] + '">' + r[3] + '</span></td><td data-l="Main audience">' + esc(r[4]) + '</td><td data-l="How often">' + esc(r[5]) + "</td></tr>";
  }).join("");

  var MIND = [
    ["li", "\"Is this studio serious and sensible?\"", "Thoughtful, professional, story-led."],
    ["ig", "\"Show me something I can use.\"", "Scroll, stop, save. Visual first."],
    ["fb", "\"Who can help my business, near me?\"", "Plain, local, community and groups."],
    ["yt", "\"Show me how to fix this.\"", "Search, watch, trust. Depth wins."],
    ["x", "\"What are builders thinking today?\"", "Short, technical, honest, replies."]
  ];
  $("mind").innerHTML = MIND.map(function (m) { return "<div>" + badge(m[0]) + '<b class="q">' + esc(m[1]) + "</b><span>" + esc(m[2]) + "</span></div>"; }).join("");

  var PB = {
    li: {
      purpose: "Be the studio an owner or founder trusts after reading three posts. Explain the thinking, show the process, and be honest about what we have and have not built yet.",
      aud: "Business owners, founders, startup teams and referrers such as accountants, designers and consultants.",
      post: ["Plain-language lessons on websites, branding, enquiries and AI", "How we work: the seven stages, with one example per post", "Build notes from our own products, including mistakes", "Document carousels: checklists an owner can use alone"],
      avoid: ["\"We are excited to announce\" posts", "Claiming clients, results or testimonials we do not have", "Reposting Instagram graphics with no context", "Hashtag walls and engagement bait"],
      freq: "3 page posts a week; team members reshare with one line of their own",
      out: "Comments from the right people, profile views, messages, referral and partnership conversations, enquiries.",
      ex: [["Page post", "Your website should have one job", "180 words: the question we ask first, and why it changes the page."], ["Document", "5 checks for your homepage", "PDF carousel, 6 pages, one check per page, ends with how to contact us."], ["Page post", "Why we sometimes tell a client to build less", "Smaller first project: easier to test, cheaper to fix."], ["Page post", "What we built, honestly", "HV Verse is our own build. No client case studies yet; they come when approved."]]
    },
    ig: {
      purpose: "Make complicated digital things look simple. Visual checklists and process posts that owners save and send to a partner.",
      aud: "Local business owners and founders, mostly on phone, in the evening.",
      post: ["Carousels with one clear checklist", "Reels: 20 to 30 second explainers in motion graphics, our own screens", "Stories: polls, questions, behind the scenes of our work", "Process posts: Discover to Improve, one stage at a time"],
      avoid: ["\"Get a website for X\" price-style posters", "Stock photos of laptops and handshakes", "Paragraphs on images", "Fake before and after of work we did not do"],
      freq: "3 posts a week (2 carousels, 1 reel) and stories 3 days a week",
      out: "Saves, shares, profile visits, messages. Link taps to the contact page.",
      ex: [["Carousel", "Your site gets visits. Where are the enquiries?", "7 slides: 5 homepage checks."], ["Reel", "Is your website doing a job?", "20 seconds: three jobs, pick one."], ["Carousel", "Our 7 stages: Discover to Improve", "One slide per stage with a plain example."], ["Story", "What does your website do for you today?", "Poll with 3 options. Next week's post answers it."]]
    },
    fb: {
      purpose: "Reach owners who are not on LinkedIn. Be the helpful, local, easy-to-message studio.",
      aud: "Small-business owners, shop and clinic owners, community and trade groups.",
      post: ["Shared carousels from Instagram", "Short tip posts in plain words, sometimes Hinglish", "Helpful answers in business groups (no link unless asked)", "Notice when we publish a new video or checklist"],
      avoid: ["Posting links in groups with no help", "Spamming many groups", "Copying text from LinkedIn", "Paid boosts before enquiry tracking works"],
      freq: "2 posts a week: one carousel share, one native tip",
      out: "Messages from local owners, shares, enquiries.",
      ex: [["Carousel share", "Five things to check on your homepage", "Same carousel as Instagram."], ["Tip post", "Does your business show up on Google Maps?", "Checklist of what to fill in on a business profile."], ["Group answer", "Helpful reply to \"who can make me a website?\"", "Explain what to ask any studio, no link unless asked."], ["Tip post", "A 10-minute website brief", "Six questions to answer before talking to any developer."]]
    },
    yt: {
      purpose: "Be found by owners searching for answers. A good video keeps working for years.",
      aud: "Owners and founders searching \"why is my website not getting enquiries\", \"how to check my website\", \"website for my business\".",
      post: ["Shorts: one check or one idea in 25 seconds", "Long videos: screen-along checks and explainers, 8 to 12 minutes", "Process explainers: what happens at each of the seven stages", "Build notes on our own products, once a month"],
      avoid: ["Long intros", "Clickbait thumbnails the video does not deliver", "Talking about services with no teaching", "Judging a named business's site on camera"],
      freq: "1 Short a week and 1 long video every 2 weeks",
      out: "Search views, watch time, clicks from the description to the contact page.",
      ex: [["Long video", "Check your own homepage in 15 minutes", "Chapters for each of 5 checks, using our own site as the example."], ["Short", "One button, one job", "25 seconds, show a homepage with 1 clear button."], ["Long video", "What is a lead funnel? For shop owners", "Visit, enquiry, follow-up, explained with a simple diagram."]]
    },
    x: {
      purpose: "Show technical credibility and join founder and builder conversations with little effort.",
      aud: "Founders, developers, indie builders and tech people.",
      post: ["Short build notes from our own products", "One-line opinions with a diagram", "Replies to founders asking about landing pages and AI"],
      avoid: ["Arguments", "Posting the same carousel image", "Threads longer than 6 posts", "Hype about AI"],
      freq: "2 to 3 short posts a week, replies when there is time (handle @harittdeveloper)",
      out: "Conversations with founders and developers. Not a main source of enquiries.",
      ex: [["Post", "Most homepages have six jobs. A good one has one.", "One line, one clean image."], ["Thread", "Why we picked HTML/JS, React, Firebase and the Gemini API for HV Verse", "4 posts: one decision each, with the trade-off."], ["Reply", "Helpful reply to a founder asking for a landing page tip", "Add value first; link only if asked."]]
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
    ["Websites and software", 25, "#E5263A", "What a good site does, mistakes to avoid, web apps and tools explained simply.", "Development and software"],
    ["Branding that holds together", 15, "#FF9A3D", "One look, one voice, one message across site, social and print.", "Branding and creative strategy"],
    ["More enquiries", 25, "#24AA6E", "Being found, the path from visit to enquiry, follow-up and tracking.", "Marketing, SEO, lead generation"],
    ["Practical AI and automation", 15, "#A3A7B3", "Where AI helps a business, where it does not, and small automations.", "AI and automation"],
    ["How we work", 20, "#FF5A3C", "The seven stages, honest scoping, build notes from our own products.", "Approach and proof"]
  ];
  $("mixbar").innerHTML = PIL.map(function (p) { return '<div style="width:' + p[1] + "%;background:" + p[2] + ';color:#07080C">' + p[1] + "%</div>"; }).join("");
  $("pillars").innerHTML = PIL.map(function (p) { return '<div class="mini"><div class="h"><span style="width:12px;height:12px;border-radius:4px;background:' + p[2] + '"></span><h4>' + esc(p[0]) + "</h4></div><p>" + esc(p[3]) + '</p><div class="chips"><span>' + esc(p[4]) + "</span></div></div>"; }).join("") +
    '<div class="mini" style="box-shadow:inset 0 0 0 1.5px var(--a2)"><h4>The help-first rule</h4><p>Most posts teach something an owner can use without hiring us. Only some show our work, and even then they explain a decision. The percentages are a planning guide, not data.</p></div>';

  /* ---------- first posts ---------- */
  var FP = {
    li: [
      { m: "li", t: "Your website should have one job", f: "Page post, text + 1 image", pil: "Websites and software", obj: "Comments from owners and founders on what their site is for", pc: "#E5263A",
        hook: "Most business websites try to do six jobs. A good one does one.", lbl: "Post",
        slides: ["Most business websites try to do six jobs. A good one does one.", "Before we design anything, we ask: what is the one thing a visitor should do?", "Call you. Send an enquiry. Book a visit. Buy. Read. Sign in.", "Pick one. Make it obvious in 5 seconds. Everything else supports it.", "What is the one job of your website?"],
        vis: "One clean image: a homepage wireframe on a dark card with one gradient button.",
        cap: "Most business websites try to do six jobs. A good one does one.\n\nBefore we design anything, we ask a single question: what is the one thing a visitor should do?\n\nCall you. Send an enquiry. Book a visit. Buy. Sign in.\n\nPick one. Make it obvious within 5 seconds. Everything else on the page supports it.\n\nWhat is the one job of your website?" },
      { m: "li", t: "Why we sometimes tell a client to build less", f: "Page post, text", pil: "How we work", obj: "Trust: the studio that says no to a bigger project", pc: "#FF5A3C",
        hook: "Sometimes the right advice is to build less.", lbl: "Post",
        slides: ["Sometimes the right advice is to build less.", "A smaller first project is easier to test and cheaper to fix.", "We start with the problem, not the feature list.", "If a simple page solves it, we say so.", "Bigger can come later, when you know what works."],
        vis: "Text only, or one image: a small box growing into a larger one in three steps.",
        cap: "Sometimes the right advice is to build less.\n\nA smaller first project is easier to test, cheaper to fix, and tells both of us what actually matters.\n\nSo we start with the problem, not the feature list. If a simple page solves it, we say so. Bigger can come later, once you know what works.\n\nThat is how we try to work at Haritt Developers: honest scope first." },
      { m: "li", t: "5 checks for your homepage", f: "Document carousel, 6 pages", pil: "More enquiries", obj: "Saves and reshares by owners and referrers", pc: "#24AA6E",
        hook: "Your site gets visits but no enquiries? Check these 5 things.", lbl: "Pages",
        slides: ["Your site gets visits but no enquiries? Check these 5 things.", "1. Can a stranger tell what you do in 5 seconds?", "2. Is there one clear button for the next step?", "3. Does it work well on a phone?", "4. Is your phone number or form easy to find?", "5. Does the form go to a person who replies the same day?"],
        vis: "PDF carousel, dark cards, one check per page, big Sora numbers, last page with the contact email.",
        cap: "Your site gets visits but no enquiries? Check these 5 things before changing anything else.\n\nPage 5 is the one most people skip: the form that goes nowhere.\n\nIf you want a second pair of eyes, we are happy to look: developers@haritt.com" },
      { m: "li", t: "Where do your enquiries go after the form?", f: "Page post, text + image", pil: "More enquiries", obj: "Discussion about follow-up with owners", pc: "#24AA6E",
        hook: "A website enquiry is worth little if nobody follows it up.", lbl: "Post",
        slides: ["A website enquiry is worth little if nobody follows it up.", "Who gets the email? Who replies, and when?", "A simple follow-up routine beats a new design.", "Track each enquiry: where it came from, who replied, what happened.", "How fast do you reply to a new enquiry?"],
        vis: "Image: three boxes in a row: Enquiry, Reply, Follow-up, with the middle one highlighted in the brand gradient.",
        cap: "A website enquiry is worth little if nobody follows it up.\n\nWho receives the email? Who replies, and when? Is it written down anywhere?\n\nA simple follow-up routine often does more than a new design.\n\nHow fast do you reply to a new enquiry?" },
      { m: "li", t: "What we have built, honestly", f: "Page post, text + screens", pil: "How we work", obj: "Credibility: real work, honestly described", pc: "#FF5A3C",
        hook: "We are a young studio. Here is what we have built so far.", lbl: "Post",
        slides: ["We are a young studio. Here is what we have built so far.", "HV Verse: planning, job tracking and self-assessment with an AI assistant, in one place.", "Built with HTML/JS, React, Firebase and the Gemini API. Live at thehvverse.com.", "No client case studies yet. We will add them when projects are finished and the clients approve.", "If you want to see how we think, start there."],
        vis: "Two real screens from HV Verse in rounded frames on a dark card. No fake client logos.",
        cap: "We are a young studio. Here is what we have built so far.\n\nHV Verse is our own suite of everyday apps: planning, job tracking and self-assessment, with an AI assistant that understands English, Hindi and Hinglish. Built with HTML/JS, React, Firebase and the Gemini API.\n\nWe do not have client case studies yet. We will add them when projects are finished and the clients approve.\n\nUntil then, this is the honest picture." }
    ],
    ig: [
      { m: "car", t: "Your site gets visits. Where are the enquiries?", f: "Carousel, 7 slides", pil: "More enquiries", obj: "Saves and sends: the checklist an owner forwards to a partner", pc: "#24AA6E",
        hook: "Your site gets visits. Where are the enquiries?", lbl: "Slides",
        slides: ["Your site gets visits. Where are the enquiries?", "Check 1: Can a stranger tell what you do in 5 seconds?", "Check 2: One clear button for the next step", "Check 3: Does it work well on a phone?", "Check 4: Is your phone number or form easy to find?", "Check 5: Does the form reach someone who replies the same day?", "Save this. Want a second pair of eyes? Message us."],
        vis: "Dark slides, Sora headlines, one gradient word per slide. Slide 7 shows the contact email.",
        cap: "Your site gets visits but no enquiries?\n\nBefore spending on ads, check these 5 things on your homepage. Most fixes are small.\n\nSave this and check your own site tonight.\n\nWant a second pair of eyes? Message us or write to developers@haritt.com\n\n#smallbusiness #website #digitalmarketing #leadgeneration" },
      { m: "reel", t: "Is your website doing a job?", f: "Reel, 20 seconds, motion graphics", pil: "Websites and software", obj: "Reach: a simple question, then the answer", pc: "#E5263A",
        hook: "Your website. What is its one job?", lbl: "Shot list",
        slides: ["0 to 2 s: \"Your website. What is its one job?\"", "2 to 6 s: six options appear: call, enquire, book, buy, read, sign in", "6 to 12 s: five fade out, one stays", "12 to 18 s: the page rearranges around the one button", "18 to 20 s: \"One job. Done well.\" + Haritt Developers"],
        vis: "Dark background, Sora text, a single gradient button. Calm motion, no music peaks.",
        cap: "Your website. What is its one job?\n\nMost sites try to do six. Pick one, make it obvious, let the rest support it.\n\nWhat is yours? Tell us in the comments.\n\n#website #smallbusiness #webdesign" },
      { m: "car", t: "Our 7 stages: Discover to Improve", f: "Carousel, 8 slides", pil: "How we work", obj: "Trust: show how we work, in plain words", pc: "#FF5A3C",
        hook: "How a project works with us, in 7 plain steps.", lbl: "Slides",
        slides: ["How a project works with us, in 7 plain steps.", "Discover: understand the business and the real problem", "Position: decide what to say and to whom", "Build: websites, apps and tools", "Launch: go live with tracking in place", "Attract: bring the right people", "Convert and Improve: turn visits into enquiries, then keep fixing", "Many projects need only some stages. Tell us yours."],
        vis: "One stage per slide with a simple line icon, stage number in the gradient.",
        cap: "How a project works with us, in 7 plain steps: Discover, Position, Build, Launch, Attract, Convert, Improve.\n\nMany projects need only some of them. We say which.\n\nTell us where you are stuck and we will tell you which stage matters first.\n\n#webdevelopment #branding #marketing" },
      { m: "car", t: "Our own site, audited", f: "Carousel, 7 slides", pil: "How we work", obj: "Proof by honesty: we review ourselves first", pc: "#FF5A3C",
        hook: "We audited our own website. Here is what we would fix.", lbl: "Slides",
        slides: ["We audited our own website. Here is what we would fix.", "What is working: (use real findings)", "What is confusing: (use real findings)", "What we are changing first", "Why we picked that first", "How you can do the same in 15 minutes", "Want us to look at yours?"],
        vis: "Real screenshots of developers.haritt.com in rounded frames. Fill with real findings before posting; do not publish placeholders.",
        cap: "We audited our own website. Here is what we found and what we are fixing first.\n\nYou can do the same in 15 minutes. Slide 6 shows how.\n\nWant a second pair of eyes on yours? developers@haritt.com" },
      { m: "reel", t: "Plain English: what is a lead funnel?", f: "Reel, 25 seconds", pil: "More enquiries", obj: "Shares: jargon explained simply", pc: "#24AA6E",
        hook: "\"Lead funnel\" sounds hard. It is three steps.", lbl: "Shot list",
        slides: ["0 to 3 s: \"Lead funnel\" appears, then crosses out", "3 to 10 s: Visit. Enquiry. Follow-up. Three boxes appear", "10 to 18 s: the form, who gets it, who replies", "18 to 25 s: \"Fix the weakest step first.\""],
        vis: "Dark cards, simple diagram, the weakest step highlighted with the gradient.",
        cap: "A lead funnel sounds hard. It is three steps: someone visits, someone sends an enquiry, someone follows up.\n\nFix the weakest step first.\n\nWhich of the three is weakest in your business?\n\n#digitalmarketing #leadgeneration #smallbusiness" }
    ],
    fb: [
      { m: "fb", t: "Five things to check on your homepage", f: "Carousel share", pil: "More enquiries", obj: "Shares and messages from local owners", pc: "#24AA6E", hook: "Five things to check on your homepage before you spend on ads.", lbl: "Plan",
        slides: ["Share the Instagram carousel natively, same slides.", "Add a one-line intro in plain words.", "Reply to every comment."], vis: "Same carousel as Instagram.", cap: "Before you spend on ads, check these five things on your homepage. Most fixes are small and free.\n\nSwipe through, and tell us which one you missed." },
      { m: "fb", t: "Does your business show up on Google Maps?", f: "Tip post with image", pil: "More enquiries", obj: "Helps local owners; messages", pc: "#24AA6E", hook: "Search your business name on your phone. What do you see?", lbl: "Post",
        slides: ["Search your business name on your phone.", "Is the phone number right? Are the hours right?", "Are there photos? Is your category correct?", "Fix these first. They cost nothing."], vis: "Simple image: a search result card with four ticks, dark with one gradient tick.", cap: "Search your business name on your phone. What do you see?\n\nIs the phone number right? Are the hours right? Are there photos? Is the category correct?\n\nFix these first. They cost nothing and they decide whether people call you." },
      { m: "fb", t: "A 10-minute website brief", f: "Tip post", pil: "How we work", obj: "Saves, messages", pc: "#FF5A3C", hook: "Answer these 6 questions before you talk to any developer.", lbl: "Post",
        slides: ["What does your business do, in one sentence?", "Who is your best customer?", "What should a visitor do on your site?", "What sites do you like, and why?", "What do you already have: logo, photos, text?", "What is the deadline and what is the budget range?"], vis: "Text on a dark card, six numbered lines.", cap: "Answer these 6 questions before you talk to any developer, any studio, anyone:\n\n1. What does your business do, in one sentence?\n2. Who is your best customer?\n3. What should a visitor do on your site?\n4. Which sites do you like, and why?\n5. What do you already have: logo, photos, text?\n6. What is the deadline and the budget range?\n\nIf you want help with the answers, message us." },
      { m: "fb", t: "Helpful reply to \"who can make me a website?\"", f: "Group comment, no link", pil: "Websites and software", obj: "Trust in the community", pc: "#E5263A", hook: "Here is what to ask any studio first.", lbl: "Reply",
        slides: ["Ask what the one job of the site will be.", "Ask who replies to the enquiries.", "Ask what happens after launch.", "Offer more help only if they ask."], vis: "Text reply. No image.", cap: "A few things to ask any studio first: what will the site's one job be, who replies to enquiries, and what happens after launch. Happy to answer questions here." }
    ],
    yt: [
      { m: "thumb", t: "Check your own homepage in 15 minutes", f: "Long video, 10 to 12 minutes", pil: "More enquiries", obj: "Search views for years: \"check my website\"", pc: "#E5263A", hook: "Thumbnail: \"CHECK YOUR SITE\"", lbl: "Chapters",
        slides: ["0:00 What we will check and why", "0:40 Check 1: what you do in 5 seconds", "2:30 Check 2: the one button", "4:30 Check 3: phone view", "6:30 Check 4: contact path", "8:30 Check 5: where the form goes", "10:00 What to fix first"],
        vis: "Thumbnail: \"CHECK YOUR SITE\" in white Sora with one gradient word, a homepage wireframe on the right. No face.",
        cap: "Title: How to Check Your Own Website in 15 Minutes (5 Simple Checks)\nDescription: Five checks that show why a business website is not getting enquiries. Uses our own site as the example. Chapters below. Questions: developers@haritt.com" },
      { m: "short", t: "One button, one job", f: "Short, 25 seconds", pil: "Websites and software", obj: "Views from the Shorts feed", pc: "#E5263A", hook: "Your homepage has one job. What is it?", lbl: "Shot list",
        slides: ["0 to 3 s: \"Your homepage has one job.\"", "3 to 12 s: a homepage with five buttons, four fade out", "12 to 20 s: the remaining button grows and moves above the fold", "20 to 25 s: \"One button. One job.\""],
        vis: "Vertical motion graphic with big captions, dark cards, one gradient button.",
        cap: "Title: One button, one job (fix your homepage) #shorts\nDescription: Pick one job for your homepage and make it obvious. More at developers.haritt.com" },
      { m: "thumb", t: "What is a lead funnel? Explained for shop owners", f: "Long video, 8 to 10 minutes", pil: "More enquiries", obj: "Search views: \"what is a lead funnel\"", pc: "#24AA6E", hook: "Thumbnail: \"LEAD FUNNEL?\"", lbl: "Chapters",
        slides: ["0:00 The three steps in one diagram", "1:00 Step 1: getting visits", "3:00 Step 2: turning a visit into an enquiry", "5:30 Step 3: following up", "7:30 How to find your weakest step"],
        vis: "Thumbnail: \"LEAD FUNNEL?\" in white Sora, a simple three-box diagram. No face.",
        cap: "Title: What Is a Lead Funnel? Plain-English Guide for Business Owners\nDescription: Three steps, no jargon: visit, enquiry, follow-up. How to find the weakest step in your own business. Chapters below." }
    ],
    x: [
      { m: "x", t: "Most homepages have six jobs. A good one has one.", f: "Post + clean image", pil: "Websites and software", obj: "Reposts and replies from founders", pc: "#E5263A", hook: "Most homepages have six jobs. A good one has one.", lbl: "Post",
        slides: ["Most homepages have six jobs.", "A good one has one."], vis: "Image: the same two lines in Sora on a dark background.", cap: "Most homepages have six jobs.\nA good one has one." },
      { m: "x", t: "Why we picked HTML/JS, React, Firebase and Gemini", f: "Thread, 4 posts", pil: "How we work", obj: "Credibility with founders and developers", pc: "#FF5A3C", hook: "How we picked the tools for HV Verse, one decision at a time:", lbl: "Thread",
        slides: ["How we picked the tools for HV Verse, one decision at a time:", "1. Simple pages in HTML/JS where nothing fancy is needed.", "2. React where the app has real interaction.", "3. Firebase for sign-in and sync. Gemini API for the assistant."], vis: "Text thread, optional diagram.", cap: "How we picked the tools for HV Verse, one decision at a time:\n\n1. Simple pages in HTML/JS where nothing fancy is needed.\n2. React where the app has real interaction.\n3. Firebase for sign-in and sync, and the Gemini API for the assistant.\n\nEach choice had a trade-off. Happy to share them." },
      { m: "x", t: "Smaller first projects are usually better", f: "Post", pil: "How we work", obj: "Replies from founders", pc: "#FF5A3C", hook: "Smaller first projects are usually better.", lbl: "Post",
        slides: ["Smaller first projects are usually better.", "You learn faster and fix cheaper."], vis: "Text only.", cap: "Smaller first projects are usually better.\n\nYou learn faster and fix cheaper." }
    ]
  };
  function fpMock(p) {
    var tag = '<div class="tp"><img src="' + BRAND + '" alt="">HARITT DEVELOPERS';
    if (p.m === "car" || p.m === "reel" || p.m === "short") {
      var v = p.m !== "car";
      return '<div class="pm dv ' + (v ? "p916" : "p45") + '">' + tag + (v ? "" : "<em>1/7</em>") + "</div><h5" + (v ? ' style="top:28%;font-size:16px"' : "") + ">" + esc(p.hook) + "</h5>" + (v ? '<div class="play" style="top:74%"></div>' : '<div class="bar"></div><div class="ft">Swipe</div>') + "</div>";
    }
    if (p.m === "thumb") return '<div class="pm dv p169"><div class="ttl">' + esc(p.hook.replace(/^Thumbnail: |"/g, "")) + '</div><div class="scr big"><i></i><i></i><b></b></div></div>';
    if (p.m === "x") return '<div class="xc"><div class="who"><img src="' + BRAND + '" alt=""><div><b>Haritt Developers</b><small>@harittdeveloper</small></div></div><p>' + esc(p.cap).replace(/\n/g, "<br>") + "</p></div>";
    if (p.m === "fb") return '<div class="fbp"><div class="who"><span class="av"><img src="' + BRAND + '" alt=""></span><div><b>Haritt Developers</b><small>Software company</small></div></div><p>' + esc(p.hook) + '</p><div class="fbi"><h5>' + esc(p.t) + "</h5></div></div>";
    return '<div class="lip"><div class="who"><span class="av" style="background:none"><img src="' + BRAND + '" alt="" style="width:30px;height:30px;border-radius:8px"></span><div><b>Haritt Developers</b><small>Company page · Software company</small></div></div><p><b>' + esc(p.hook) + "</b></p><p>" + esc(p.slides.slice(1, 3).join(" ")) + "</p></div>";
  }
  function renderFP(k) {
    $("fposts").innerHTML = FP[k].map(function (p, i) {
      var id = "fp" + k + i;
      return '<article class="cc"><div class="cch"><span class="cn">' + PF[k].n + " " + (i + 1) + "</span><h3>" + esc(p.t) + '</h3></div><div class="fp"><div>' + fpMock(p) + '</div><div class="ww">' +
        '<div class="hookline"><span class="k2">Hook</span>' + esc(p.hook) + "</div>" +
        '<div class="meta"><span class="chip">' + esc(p.f) + '</span><span class="chip">Pillar: ' + esc(p.pil) + '</span><span class="chip">Goal: ' + esc(p.obj) + "</span></div>" +
        "<p><b>" + esc(p.lbl) + '</b></p><ol class="slides">' + p.slides.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        "<p><b>Visual</b> " + esc(p.vis) + "</p>" +
        '<div style="display:flex;justify-content:space-between;align-items:center"><span class="k2">' + (k === "yt" ? "Title and description" : "Caption") + '</span><button class="cpb" type="button" data-cp="' + id + '">Copy</button></div><div class="cap" id="' + id + '">' + esc(p.cap) + "</div></div></div></article>";
    }).join("");
  }
  $("fseg").innerHTML = Object.keys(FP).map(function (k, i) { return '<button type="button" data-k="' + k + '"' + (i ? "" : ' class="on"') + ">" + PF[k].n + " · " + FP[k].length + "</button>"; }).join("");
  $("fseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; [].forEach.call($("fseg").children, function (x) { x.classList.toggle("on", x === b); }); renderFP(b.dataset.k); });
  renderFP("li");

  /* ---------- 30-day calendar ---------- */
  /* [platform, format, title, pillar, optional First posts reference] */
  var C = [
    [["li", "Page post", "Your website should have one job", "Websites and software", "LinkedIn 1"], ["x", "Post", "Most homepages have six jobs. A good one has one.", "Websites and software", "X 1"]],
    [["ig", "Carousel", "Your site gets visits. Where are the enquiries?", "More enquiries", "Instagram 1"], ["fb", "Carousel share", "Five things to check on your homepage", "More enquiries", "Facebook 1"]],
    [["li", "Document", "5 checks for your homepage", "More enquiries", "LinkedIn 3"], ["ig", "Story poll", "What does your website do for you today?", "Websites and software"], ["x", "Post", "A website is not a brochure", "Websites and software"]],
    [["ig", "Reel", "Is your website doing a job?", "Websites and software", "Instagram 2"], ["fb", "Tip post", "Does your business show up on Google Maps?", "More enquiries", "Facebook 2"]],
    [["li", "Page post", "Why we sometimes tell a client to build less", "How we work", "LinkedIn 2"], ["ig", "Carousel", "Our 7 stages: Discover to Improve", "How we work", "Instagram 3"], ["yt", "Short", "One button, one job", "Websites and software", "YouTube 2"], ["x", "Post", "Smaller first projects are usually better", "How we work", "X 3"]],
    [["ig", "Stories", "Behind the scenes: planning a homepage", "How we work"], ["yt", "Long video", "Check your own homepage in 15 minutes", "More enquiries", "YouTube 1"]],
    [],
    [["li", "Page post", "Where do your enquiries go after the form?", "More enquiries", "LinkedIn 4"], ["x", "Post", "A form that goes nowhere is a lost customer", "More enquiries"]],
    [["ig", "Reel", "Plain English: what is a lead funnel?", "More enquiries", "Instagram 5"], ["fb", "Tip post", "A 10-minute website brief", "How we work", "Facebook 3"]],
    [["li", "Document", "The 7 stages, one line each", "How we work"], ["ig", "Story question", "Which step do you find hardest: visits, enquiries or follow-up?", "More enquiries"], ["x", "Post", "Follow-up is the cheapest improvement", "More enquiries"]],
    [["ig", "Carousel", "Our own site, audited", "How we work", "Instagram 4"], ["fb", "Carousel share", "Our own site, audited", "How we work"]],
    [["li", "Page post", "What a good brand is made of (and what a logo is not)", "Branding that holds together"], ["yt", "Short", "A logo is not a brand", "Branding that holds together"], ["x", "Post", "One look, one voice, one message", "Branding that holds together"]],
    [["ig", "Stories", "Behind the scenes: choosing colours and fonts", "Branding that holds together"], ["yt", "Long video", "What is a lead funnel? Explained for shop owners", "More enquiries", "YouTube 3"]],
    [],
    [["li", "Page post", "What we have built, honestly", "How we work", "LinkedIn 5"], ["x", "Thread", "Why we picked HTML/JS, React, Firebase and Gemini", "How we work", "X 2"]],
    [["ig", "Carousel", "5 signs your branding is inconsistent", "Branding that holds together"], ["fb", "Carousel share", "5 signs your branding is inconsistent", "Branding that holds together"]],
    [["li", "Document", "A one-page brand checklist", "Branding that holds together"], ["ig", "Story poll", "How many fonts does your business use?", "Branding that holds together"], ["x", "Post", "Three fonts is two too many", "Branding that holds together"]],
    [["ig", "Reel", "Where AI helps a small business (and where it does not)", "Practical AI and automation"], ["fb", "Tip post", "Three tasks you can hand to automation tomorrow", "Practical AI and automation"]],
    [["li", "Page post", "When we say no to adding AI", "Practical AI and automation"], ["yt", "Short", "Do you need a chatbot?", "Practical AI and automation"], ["x", "Post", "AI is a tool. Start with the task.", "Practical AI and automation"]],
    [["ig", "Stories", "Behind the scenes: our weekly plan", "How we work"], ["yt", "Long video", "AI for a small business: where to start", "Practical AI and automation"]],
    [],
    [["li", "Page post", "How a Discover call goes", "How we work"], ["x", "Post", "The first call is for listening", "How we work"]],
    [["ig", "Carousel", "A 10-minute website brief", "How we work"], ["fb", "Carousel share", "A 10-minute website brief", "How we work"]],
    [["li", "Document", "What to ask any studio before you hire", "How we work"], ["ig", "Story question", "What would you ask a studio first?", "How we work"], ["x", "Post", "Ask who replies after launch", "How we work"]],
    [["ig", "Reel", "Three signs a website needs a rebuild, not a fix", "Websites and software"], ["fb", "Tip post", "Fix or rebuild? A simple test", "Websites and software"]],
    [["li", "Page post", "Fix or rebuild: how we decide", "Websites and software"], ["ig", "Carousel", "Fix or rebuild: a simple test", "Websites and software"], ["yt", "Short", "Fix or rebuild?", "Websites and software"], ["x", "Post", "Rebuild only when the foundation is the problem", "Websites and software"]],
    [["ig", "Stories", "Behind the scenes: our own site updates", "How we work"], ["yt", "Long video", "Fix or rebuild: how to decide", "Websites and software"]],
    [],
    [["li", "Page post", "30 days of posting: what we learned (real numbers only)", "How we work"], ["x", "Post", "30-day notes", "How we work"]],
    [["ig", "Carousel", "The 5 checks, one more time", "More enquiries"], ["fb", "Carousel share", "The 5 checks, one more time", "More enquiries"]]
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

  /* ---------- lead playbook ---------- */
  var HOOKS = [
    ["Name the exact problem", "\"Your website gets visits but no enquiries?\"", "Carousel or reel"],
    ["Nobody tells you", "\"Things nobody tells you before you hire a web developer\"", "Carousel"],
    ["Myth vs truth", "\"You do not need an app. You need a better page.\"", "Carousel or X"],
    ["Number + promise", "\"5 checks for your homepage. 15 minutes. No tools.\"", "Carousel or video"],
    ["Honest advice", "\"When we tell a client to build less\"", "LinkedIn post"],
    ["Plain English", "\"Lead funnel: it is three steps\"", "Reel"],
    ["Question for the owner", "\"What is the one job of your website?\"", "Any"],
    ["Behind the work", "\"We audited our own website first\"", "Carousel"]
  ];
  $("hooks").innerHTML = HOOKS.map(function (h, i) { return '<div class="hk"><span class="hn">' + (i + 1) + "</span><div><b>" + esc(h[0]) + '</b><p>' + esc(h[1]) + '</p><small>' + esc(h[2]) + "</small></div></div>"; }).join("");

  var SERIES = [
    ["Homepage Check", "Every Tuesday", "#24AA6E", "One check an owner can do in 5 minutes, as a carousel: what to look for, a good and a weak example, how to fix it.", "Saves and shares", "More enquiries"],
    ["Plain English", "Every Thursday", "#FF9A3D", "One jargon word explained in 25 seconds: SEO, CRM, funnel, API, hosting. No acronym without its meaning.", "Shares and comments", "All pillars"],
    ["Build Notes", "Every Monday", "#FF5A3C", "One real decision from our own products: what we chose, what we gave up. Written for owners, not developers.", "Comments from founders", "How we work"],
    ["Smaller First", "Every Friday", "#E5263A", "One project idea and the smaller first version we would build instead. Always an example, never a client.", "Conversations", "Websites and software"]
  ];
  $("series").innerHTML = SERIES.map(function (s) { return '<div class="mini sr" style="--sc:' + s[2] + '"><div class="h"><span class="sd"></span><h4>' + esc(s[0]) + '</h4><span class="chip">' + esc(s[1]) + "</span></div><p>" + esc(s[3]) + '</p><div class="chips"><span>Gets: ' + esc(s[4]) + "</span><span>" + esc(s[5]) + "</span></div></div>"; }).join("");

  var TB = [
    ["Websites and software", "5 signs your website is outdated", "Carousel", "Save", "Checklist an owner can use alone"],
    ["Websites and software", "Fix or rebuild: a simple test", "Carousel", "Save", "Three questions that decide it"],
    ["Websites and software", "Why a slow website loses visitors", "Reel", "Share", "Show a load, in motion graphics, no invented timings"],
    ["Websites and software", "Does your site work on a phone?", "Carousel", "Save", "A 2-minute phone check"],
    ["Websites and software", "Do you need an app or a better website?", "Page post", "Comments", "Honest decision guide"],
    ["Websites and software", "What is hosting? In plain English", "Reel", "Share", "Plain English series"],
    ["Branding that holds together", "A logo is not a brand", "Page post", "Comments", "What a brand is actually made of"],
    ["Branding that holds together", "5 signs your branding is inconsistent", "Carousel", "Save", "Check your own cards, site and social"],
    ["Branding that holds together", "One look, one voice, one message", "X post", "Reposts", "Short rule with a diagram"],
    ["Branding that holds together", "How many fonts does your business use?", "Story poll", "Replies", "Gentle audit of the audience"],
    ["Branding that holds together", "Colours: pick two, not five", "Carousel", "Save", "Simple colour rules"],
    ["More enquiries", "Your site gets visits. Where are the enquiries?", "Carousel", "Save", "The 5 homepage checks"],
    ["More enquiries", "Where does your enquiry go after the form?", "Page post", "Comments", "Follow-up routine"],
    ["More enquiries", "Does your business show up on Google Maps?", "Facebook post", "Messages", "Profile checklist"],
    ["More enquiries", "What is a lead funnel?", "Reel", "Share", "Visit, enquiry, follow-up"],
    ["More enquiries", "The cheapest improvement: reply faster", "X post", "Reposts", "Same-day reply rule"],
    ["More enquiries", "A contact form that people finish", "Carousel", "Save", "Fewer fields, clearer button"],
    ["Practical AI and automation", "Where AI helps a small business (and where it does not)", "Reel", "Share", "Balanced, no hype"],
    ["Practical AI and automation", "Three tasks you can automate tomorrow", "Carousel", "Save", "Reminders, replies, reports"],
    ["Practical AI and automation", "Do you need a chatbot?", "Short", "Comments", "A short decision test"],
    ["Practical AI and automation", "When we say no to adding AI", "Page post", "Comments", "Honest scoping"],
    ["Practical AI and automation", "AI is a tool: start with the task", "X post", "Reposts", "One-line principle"],
    ["How we work", "Our 7 stages: Discover to Improve", "Carousel", "Save", "Process in plain words"],
    ["How we work", "How a Discover call goes", "Page post", "Comments", "What we ask and why"],
    ["How we work", "A 10-minute website brief", "Carousel", "Save", "Six questions to answer first"],
    ["How we work", "What to ask any studio before you hire", "Document", "Save", "Referrers will share it"],
    ["How we work", "Our own site, audited", "Carousel", "Share", "Needs real findings"],
    ["How we work", "What we have built, honestly", "Page post", "Trust", "Young studio, real work, no fake proof"],
    ["How we work", "Why we picked HTML/JS, React, Firebase and Gemini", "X thread", "Reposts", "One trade-off per post"],
    ["How we work", "Smaller first projects are usually better", "X post", "Replies", "Honest scoping"]
  ];
  var PC = { "Websites and software": "#E5263A", "Branding that holds together": "#FF9A3D", "More enquiries": "#24AA6E", "Practical AI and automation": "#A3A7B3", "How we work": "#FF5A3C" }, TF = "All";
  function renderTB() {
    $("tbank").innerHTML = TB.map(function (t, i) { return { t: t, i: i }; }).filter(function (o) { return TF === "All" || o.t[0] === TF; }).map(function (o) {
      var t = o.t; return '<div class="tb"><span class="tp2" style="background:' + PC[t[0]] + '"></span><div><b id="tb' + o.i + '">' + esc(t[1]) + '</b><p>' + esc(t[4]) + '</p><div class="meta"><span class="chip">' + esc(t[2]) + '</span><span class="chip">Gets: ' + esc(t[3]) + '</span><span class="chip">' + esc(t[0]) + '</span></div></div><button class="cpb" type="button" data-cp="tb' + o.i + '">Copy</button></div>';
    }).join("");
  }
  $("tseg").innerHTML = ["All"].concat(Object.keys(PC)).map(function (k, i) { return '<button type="button" data-f="' + k + '"' + (i ? "" : ' class="on"') + ">" + k + "</button>"; }).join("");
  $("tseg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; TF = b.dataset.f; [].forEach.call($("tseg").children, function (x) { x.classList.toggle("on", x === b); }); renderTB(); });
  renderTB();

  var YR = [
    ["Jan", "New-year plans: owners review their website and budget; Republic Day sales"], ["Feb", "Planning for the financial year end, last-quarter spending"], ["Mar", "Financial year end: budgets, tools and last orders"],
    ["Apr", "New financial year: fresh budgets, new projects start"], ["May", "Summer slowdown for some trades: good time to fix the website"], ["Jun", "Mid-year review, startup launches"],
    ["Jul", "Planning the festive-season push"], ["Aug", "Independence Day sales; festive prep begins"], ["Sep", "Festive-season prep: pages, offers and tracking ready"],
    ["Oct", "Festive season: enquiries peak for many businesses"], ["Nov", "After the festivals: review what worked, plan the year"], ["Dec", "Year-end review, new-year planning"]
  ];
  $("year").innerHTML = YR.map(function (y) { return '<div><b>' + y[0] + '</b><span>' + esc(y[1]) + "</span></div>"; }).join("");

  /* ---------- promotion ---------- */
  var PR2 = [
    ["LinkedIn", "Yes", "y", "Page posts, team reshares, comments on owners' and founders' posts", "No poster dumps, no engagement bait"],
    ["Instagram", "Yes", "y", "Carousels, reels, stories, bio link with UTM", "Value first, one call to action"],
    ["Facebook page and groups", "Yes, carefully", "m", "Page posts; helpful answers in local business groups", "Read each group's rules; link only when asked"],
    ["Google Business Profile", "Yes", "y", "Posts, photos, accurate category and service area, answer reviews", "Real reviews only, never ask for fake ones"],
    ["Justdial listing", "Yes", "y", "Keep details and photos current", "Same name, phone and email everywhere"],
    ["YouTube", "Yes", "y", "Shorts and how-to videos, link in the description", "Titles people really search"],
    ["Local and business communities", "Yes", "y", "Chambers of commerce, trade associations, startup hubs, coworking spaces: talks, checklists", "Offer help, never a hard pitch"],
    ["Referrer partnerships", "Yes", "y", "Accountants, designers, photographers, printers, consultants: a shareable checklist and a clear referral path", "Agree it in writing"],
    ["Quora", "Yes", "y", "Full answers to \"why is my website not getting enquiries\" questions", "Answer fully, link at the end"],
    ["WhatsApp Business", "Light", "m", "Replying to enquiries; sharing a brochure PDF when asked", "Never mass-message people"],
    ["X", "Light", "m", "Build notes and replies", "Not a growth channel for us"],
    ["GitHub", "Light", "m", "Tidy profile and README for credibility", "Only code we are happy to show"],
    ["Threads, Pinterest, Reddit", "No", "n", "Names are claimed; no posting for now", "Revisit after 90 days"],
    ["Paid ads", "Not yet", "n", "Decide after 90 days with enquiry tracking in place", "See decisions"],
    ["Cold messages and mass emails", "No", "n", "Do not message strangers with a pitch", "Spam hurts the brand"]
  ];
  $("promo").innerHTML = PR2.map(function (r) { return "<tr><td>" + esc(r[0]) + '</td><td data-l="Promote?"><span class="pz ' + r[2] + '">' + esc(r[1]) + '</span></td><td data-l="How">' + esc(r[3]) + '</td><td data-l="Rule">' + esc(r[4]) + "</td></tr>"; }).join("");

  var LOOP = [["Make once", "One idea as a carousel and a short text"], ["Instagram", "Carousel Tue, reel Thu"], ["Facebook", "Same carousel, shorter intro"], ["LinkedIn", "Carousel as a PDF, plus a text post"], ["YouTube", "Reel as a Short, long video later"], ["Google Business", "One short post with a button"]];
  $("loopx").innerHTML = LOOP.map(function (l, i) { return '<div><i>' + (i + 1) + "</i><b>" + esc(l[0]) + "</b><small>" + esc(l[1]) + "</small></div>"; }).join("");

  var OWN = [
    ["developers.haritt.com", "Link the Work page to the HV Verse build with real screens. Add client work only when approved.", "Quick fix"],
    ["Contact page", "Say who replies and how soon, and what happens next. The site already promises honest next steps.", "Proposed"],
    ["Google Business Profile", "Fill every field, add the photos, post weekly with a button to the contact page.", "Quick fix"],
    ["Justdial", "Same name, phone, email and photos as the Business Profile.", "Quick fix"],
    ["Email signature", "Name, Haritt Developers, developers.haritt.com and one link to the Approach page.", "Quick fix"],
    ["GitHub profile", "A short README on harittdevelopers that says who we are and links to the site.", "Proposed"]
  ];
  $("own").innerHTML = OWN.map(function (o) { return '<div class="mini"><span class="st ' + (o[2] === "Proposed" ? "bd" : "ok") + '">' + esc(o[2]) + "</span><h4>" + esc(o[0]) + "</h4><p>" + esc(o[1]) + "</p></div>"; }).join("");

  /* ---------- AI prompts ---------- */
  var BRIEF = "You are the social media writer for Haritt Developers.\n\nAbout Haritt Developers: a digital studio in India, part of Haritt Group. \"We build digital experiences that help businesses grow.\" One connected team across technology, brand and marketing. Services: development and software (websites, web apps, dashboards, custom tools), branding and creative strategy, digital marketing strategy (content, SEO, campaigns), lead generation and conversion (forms, follow-ups, tracking), AI and automation (only where there is a clear business purpose), e-commerce solutions, consulting and support. We solve: outdated websites, inconsistent branding, low discoverability, few enquiries, disconnected tools, repetitive manual work, unclear AI adoption. Our seven stages: Discover, Position, Build, Launch, Attract, Convert, Improve (adapted to each project). Contact: developers@haritt.com, developers.haritt.com. Our own proof today is the HV Verse app suite (HTML/JS, React, Firebase, Gemini API). We have no client case studies, testimonials, prices or packages yet.\n\nAudience: small and growing business owners, founders and startups in India, and referrers such as accountants, designers and consultants.\nVoice: the Haritt Developers team, writing as \"we\". Plain, direct, measured and honest. Short sentences, everyday words, explain any jargon in a few words. Recommend a smaller scope when it is right. Language: English, with simple Hinglish touches only on Instagram and Facebook.\n\nRules: never invent clients, testimonials, results, numbers, prices or screenshots. Never promise rankings, leads or sales. No hype words (best, leading, revolutionary, skyrocket, guaranteed). No emojis. Never mention Haritt Group inside posts unless the post is about the group. Use only facts from this brief or that I give you. If a fact is missing, ask me.";
  var PR = [
    ["B", "Brand brief", "Paste this first in every chat", BRIEF],
    ["Ca", "Instagram or Facebook caption", "For a carousel, reel or tip post", "Write a caption for this post: [[topic]].\nPlatform: [[Instagram / Facebook]]. Pillar: [[pillar]]. Format: [[carousel / reel / tip post]]. Language: [[English / English with light Hinglish]].\nStructure: a hook line that names the owner's problem, 2 to 4 short lines or a numbered list with the useful part, then one call to action (save, share, comment a specific answer, or message us). Mention a service only if it fits naturally.\nUnder 120 words. Max 3 relevant hashtags at the end. No emojis. Give 3 versions with different hooks."],
    ["Cr", "Carousel", "6 to 8 slides, one idea each", "Plan an Instagram or LinkedIn carousel on: [[topic]].\nPillar: [[pillar]]. Audience: [[small business owners / founders / referrers]].\nGive 7 slides. For each slide: a Sora headline under 8 words, one support line under 15 words, and a simple visual note (diagram, line icon, or a real screen of our own work). Mark the single word in each headline that gets the red-to-orange gradient.\nSlide 1 is the hook. Slide 7 is one action (save, or discuss your project at developers@haritt.com).\nOnly use real screens we provide. Then write the caption using the caption rules."],
    ["Re", "Reel or Short script", "15 to 35 seconds", "Write a [[25]]-second vertical video script on: [[topic]]. Language: [[English / light Hinglish]].\nGive a table with: time, on-screen text (under 7 words), what we show (motion graphics or a real screen recording; no stock footage), and optional voice-over.\nThe first 2 seconds state the owner's problem. End with one line and the Haritt Developers logo. Also give a cover headline under 6 words and 3 alternative hooks."],
    ["Yt", "YouTube long video", "8 to 12 minute explainer", "Plan a YouTube explainer: [[title]].\nGoal: a business owner who searched \"[[search phrase]]\" gets a clear answer and a next step by the end.\nGive: 3 title options under 60 characters, a thumbnail text under 5 words, chapters with timestamps, a full script with screen directions (screen recording, diagrams, voice-over, no stock footage), the description with chapters and a tracked link placeholder, and a pinned comment.\nShow the answer in the first 20 seconds. Use our own site or example businesses clearly labelled as examples."],
    ["Li", "LinkedIn page post", "In the team's voice", "Write a LinkedIn post for the Haritt Developers company page about: [[lesson, decision or question]].\nShape: a first line that makes an owner or founder stop scrolling, a short reason or story from our own work or an example clearly labelled as an example, what we learned or recommend, and an honest open question at the end.\n120 to 220 words, short paragraphs, max 3 hashtags, no emojis, no engagement bait, no sales pitch. Use only facts I give you: [[facts]]."],
    ["X", "X post", "Short and sharp", "Write 5 X posts about: [[topic]]. They go out from @harittdeveloper.\nEach under 240 characters. One clear idea, plain words, no hashtags or one at most. Mix: 2 tips, 1 opinion, 1 build note from our own products, 1 question. Only claim facts from the brand brief."],
    ["Gd", "Graphic design", "For Canva, Figma or an image tool", "Design a [[1080 x 1350 Instagram carousel slide / 1280 x 720 YouTube thumbnail / 1200 x 900 Google Business post]] for Haritt Developers.\nStyle: dark, premium and calm. Background #07080C, cards #12141C, text #F4F5F8, support text #A3A7B3. Headline in Sora Bold, tight letter spacing. Body in Inter. One gradient only, linear-gradient(100deg,#E5263A,#FF5A3C 45%,#FF9A3D), used on one word, one bar or one button.\n80 px margins. Small Haritt Developers logo top left, slide number top right.\nText: headline \"[[headline]]\", support \"[[line]]\".\nNo emojis, no stock photos of people or handshakes, no glow effects, no fake dashboards, no more than 25 words."],
    ["Hk", "Hooks", "10 hooks for one idea", "Write 10 hooks for a [[reel / carousel / LinkedIn post]] about: [[topic]].\nAudience: small business owners and founders in India. Use these patterns: name the exact problem, nobody tells you, myth vs truth, number + promise, honest advice, plain English, question for the owner, behind the work.\nEach hook under 14 words, no clickbait the post cannot deliver, no invented numbers or promises. Mark the best 2 and say why."],
    ["Rp", "Repurpose one post", "One idea, every platform", "Turn this idea into versions for every platform: [[paste the carousel, post or script]].\nGive: an Instagram carousel outline (7 slides), a LinkedIn post (150 to 200 words), a Facebook tip post (under 100 words, light Hinglish allowed), a YouTube Short script (25 s), an X post, and a Google Business Profile post (under 120 words with a button label).\nKeep every fact the same. Each must feel native to its platform: do not copy text between them."],
    ["An", "Animation and motion", "For reels, intros and explainers", "Plan a [[8]]-second motion graphic for Haritt Developers: [[what it explains]].\nLook: dark background #07080C, cards #12141C, Sora headlines, one red-to-orange gradient element.\nMotion: calm and smooth, ease-out, 300 to 500 ms per move, one element moving at a time, no bouncing, spinning or glow. Text appears line by line. Diagrams draw on from left to right.\nGive a shot-by-shot timeline (time, what moves, text on screen) and export settings: 1080 x 1920, 30 fps, MP4."],
    ["En", "Reply to an enquiry", "Honest next steps", "Draft a reply to this enquiry: [[paste the message]].\nTone: plain, warm and direct. Thank them, restate their need in one sentence, ask the 2 or 3 questions we need answered, say what happens next and when we will reply, and suggest a smaller first step if one makes sense. No prices unless I provide them. No promises about results. Under 150 words. Sign as the Haritt Developers team."]
  ];
  var hl = function (s) { return esc(s).replace(/\[\[(.*?)\]\]/g, "<mark>$1</mark>"); };
  $("plist").innerHTML = PR.map(function (p, i) {
    return '<details class="pc reveal"' + (i ? "" : " open") + '><summary><span class="ic">' + p[0] + "</span><span><b>" + esc(p[1]) + "</b><small>" + esc(p[2]) + '</small></span><span class="ar">›</span></summary><div class="bd"><pre id="pr' + i + '">' + hl(p[3]) + '</pre><div><button class="cpb" type="button" data-cp="pr' + i + '">Copy prompt</button></div></div></details>';
  }).join("");

  /* ---------- features ---------- */
  var FT = [
    ["li", ["Document (PDF) carousels", "Team members reshare page posts with one line of their own", "Comment as the page on owners' and founders' posts", "A newsletter later, after 2 months of posts"]],
    ["ig", ["Collab posts with local partners", "Story polls and question boxes", "Highlights: Services, Process, FAQ", "Pinned posts: who we help, how we work"]],
    ["fb", ["Meta Business Suite to schedule Facebook and Instagram together", "Page messaging with saved replies", "Group posts (helpful answers only)", "Pinned post: how to contact us"]],
    ["yt", ["Chapters on every long video", "Playlists by topic: websites, enquiries, AI", "Pinned comment with the tracked link", "Shorts that link to the long video"]],
    ["x", ["Pinned post that says who we help", "Lists of founders and developers to follow", "Short clips of build notes"]]
  ];
  $("feat").innerHTML = FT.map(function (f) { return '<div class="mini">' + badge(f[0]) + '<ul class="slides">' + f[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("");

  /* ---------- workflow nodes ---------- */
  var WF = [["Idea", "from enquiries"], ["Write", "AI prompt"], ["Design", "template"], ["Check", "second person"], ["Schedule", "Meta, YT, LI"], ["Publish", "on time"], ["Engage", "first hour"], ["Measure", "every Friday"]];
  $("wfn").innerHTML = WF.map(function (w, i) {
    var x = 95 + i * 127.1;
    return '<g><rect class="n-box" x="' + (x - 56) + '" y="48" width="112" height="64" rx="14"/><text x="' + x + '" y="76" text-anchor="middle" class="n-t" style="font-size:15px">' + w[0] + '</text><text x="' + x + '" y="96" text-anchor="middle" class="n-d" style="font-size:11.5px">' + w[1] + '</text><text x="' + x + '" y="34" text-anchor="middle" class="n-k" fill="#FF9A3D">' + (i + 1) + "</text></g>";
  }).join("");
  $("wfl").innerHTML = WF.map(function (w, i) { return "<li><i>" + (i + 1) + "</i><span><b>" + w[0] + "</b><small>" + w[1] + "</small></span></li>"; }).join("");

  /* ---------- UTM builder ---------- */
  function utm() {
    var c = ($("u3").value || "").toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    $("uo").textContent = "https://developers.haritt.com/" + $("u2").value + "?utm_source=" + $("u1").value + "&utm_medium=social&utm_campaign=" + (c || "campaign");
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
