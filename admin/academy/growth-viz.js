/* Marketing Academy, Growth unit: visual layer. Adds one diagram or chart to the top of each concept card
   (looked up by card id), a system map under the hero, and a "Read more" clamp on the long text.
   Charts show shapes and definitions only. Anything numeric is labelled as an example or rule of thumb. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function st(i) { return ' style="--i:' + i + '"'; }

  /* ---------- renderers ---------- */
  var R = {};

  /* numbered stepper */
  R.flow = function (d) {
    return '<ol class="vz-flow" style="--n:' + d.s.length + '">' + d.s.map(function (x, i) {
      return '<li' + st(i) + '><span class="n">' + (i + 1) + '</span><b>' + esc(x[0]) + '</b>' + (x[1] ? '<small>' + esc(x[1]) + '</small>' : '') + '</li>';
    }).join('') + '</ol>';
  };

  /* narrowing funnel (shape only) */
  R.funnel = function (d) {
    var n = d.s.length;
    return '<div class="vz-fun">' + d.s.map(function (x, i) {
      var w = Math.round(100 - i * (56 / Math.max(1, n - 1)));
      return '<div class="fu" style="--i:' + i + ';--w:' + w + '%"><b>' + esc(x[0]) + '</b>' + (x[1] ? '<small>' + esc(x[1]) + '</small>' : '') + '</div>';
    }).join('') + '</div>';
  };

  /* horizontal bars, values 0-100, optional marker */
  R.bars = function (d) {
    return '<div class="vz-bars">' + d.s.map(function (x, i) {
      return '<div class="br"' + st(i) + '><span class="l">' + esc(x[0]) + '</span><span class="tr"><i style="--v:' + x[1] + '%"></i>' + (d.mark != null ? '<u style="left:' + d.mark + '%"></u>' : '') + '</span><span class="v">' + esc(x[2] || x[1] + '%') + '</span></div>';
    }).join('') + '</div>';
  };

  /* circular loop */
  R.cycle = function (d) {
    var n = d.s.length;
    var nodes = d.s.map(function (x, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return '<div class="cy" style="--i:' + i + ';left:' + (50 + 34 * Math.cos(a)).toFixed(1) + '%;top:' + (50 + 38 * Math.sin(a)).toFixed(1) + '%"><span class="n">' + (i + 1) + '</span><b>' + esc(x[0]) + '</b>' + (x[1] ? '<small>' + esc(x[1]) + '</small>' : '') + '</div>';
    }).join('');
    return '<div class="vz-cyc"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="50" rx="34" ry="38" vector-effect="non-scaling-stroke"/></svg><div class="mid">' + esc(d.c || '') + '</div>' + nodes + '</div>';
  };

  /* 2x2 matrix, dots x/y 0-100 (y up) */
  R.matrix = function (d) {
    var q = d.q || [];
    return '<div class="vz-mx"><div class="plot">' +
      '<span class="q qa">' + esc(q[0] || '') + '</span><span class="q qb">' + esc(q[1] || '') + '</span><span class="q qc">' + esc(q[2] || '') + '</span><span class="q qd">' + esc(q[3] || '') + '</span>' +
      d.s.map(function (x, i) { return '<span class="dot" style="--i:' + i + ';left:' + x[1] + '%;bottom:' + x[2] + '%"><i></i><em>' + esc(x[0]) + '</em></span>'; }).join('') +
      '</div><div class="ax x">' + esc(d.x) + ' →</div><div class="ax y">' + esc(d.y) + ' →</div></div>';
  };

  /* tiles */
  R.tiles = function (d) {
    return '<div class="vz-tiles">' + d.s.map(function (x, i) {
      return '<div class="tl"' + st(i) + '><span class="n">' + String.fromCharCode(65 + i) + '</span><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></div>';
    }).join('') + '</div>';
  };

  /* two columns compare */
  R.vs = function (d) {
    function col(c, k) { return '<div class="vc ' + k + '"><h5>' + esc(c[0]) + '</h5><ul>' + c[1].map(function (t, i) { return '<li' + st(i) + '>' + esc(t) + '</li>'; }).join('') + '</ul></div>'; }
    return '<div class="vz-vs">' + col(d.a, 'a') + '<span class="vsb">vs</span>' + col(d.b, 'b') + '</div>';
  };

  /* line curves: series [{n,c,y:[0..100]}] */
  R.curve = function (d) {
    var W = 600, H = 170, L = 10, B = 12, T = 10, Rr = 8;
    function pts(y) {
      var n = y.length;
      return y.map(function (v, i) { return [(L + i * (W - L - Rr) / (n - 1)).toFixed(1), (H - B - (v / 100) * (H - B - T)).toFixed(1)]; });
    }
    var paths = d.s.map(function (s, k) {
      var p = pts(s.y);
      var dd = 'M' + p.map(function (a) { return a.join(' '); }).join(' L');
      return '<path d="' + dd + '" pathLength="1" class="ln" style="--c:' + s.c + ';--i:' + k + '"/>';
    }).join('');
    var grid = [25, 50, 75].map(function (v) { var y = (H - B - (v / 100) * (H - B - T)).toFixed(1); return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" class="gr"/>'; }).join('');
    var mark = d.mark ? '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + (H - B - (d.mark[0] / 100) * (H - B - T)).toFixed(1) + '" y2="' + (H - B - (d.mark[0] / 100) * (H - B - T)).toFixed(1) + '" class="mk"/><text x="' + (W - Rr - 2) + '" y="' + (H - B - (d.mark[0] / 100) * (H - B - T) - 4).toFixed(1) + '" text-anchor="end" class="mt">' + esc(d.mark[1]) + '</text>' : '';
    return '<div class="vz-cur"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(d.t) + '">' + grid + '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" class="axl"/><line x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + (H - B) + '" class="axl"/>' + mark + paths + '</svg>' +
      '<div class="lab"><span>' + esc(d.x) + ' →</span><span>↑ ' + esc(d.y) + '</span></div>' +
      '<div class="leg">' + d.s.map(function (s) { return '<span><i style="background:' + s.c + '"></i>' + esc(s.n) + '</span>'; }).join('') + '</div></div>';
  };

  /* formula rows: each row is array of strings (operators) and [key, sub] chips */
  R.eq = function (d) {
    return '<div class="vz-eq">' + d.s.map(function (row, r) {
      return '<div class="er"' + st(r) + '>' + (row.cap ? '<span class="cap">' + esc(row.cap) + '</span>' : '') + row.p.map(function (p) {
        return typeof p === 'string' ? '<span class="op">' + esc(p) + '</span>' : '<span class="ch' + (p[2] ? ' hi' : '') + '"><b>' + esc(p[0]) + '</b>' + (p[1] ? '<small>' + esc(p[1]) + '</small>' : '') + '</span>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  };

  /* wireframe blocks */
  R.blocks = function (d) {
    return '<div class="vz-wire"><div class="chrome"><i></i><i></i><i></i></div>' + d.s.map(function (x, i) {
      return '<div class="wb ' + (x[2] || '') + '"' + st(i) + '><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></div>';
    }).join('') + '</div>';
  };

  /* ranges: three-band cards */
  R.ranges = function (d) {
    return '<div class="vz-rg">' + d.s.map(function (x, i) {
      return '<div class="rc"' + st(i) + '><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small><div class="band"><span class="g"><em>Good</em>' + esc(x[2]) + '</span><span class="m"><em>Needs work</em>' + esc(x[3]) + '</span><span class="p"><em>Poor</em>' + esc(x[4]) + '</span></div></div>';
    }).join('') + '</div>';
  };

  /* concentric rings with legend */
  R.rings = function (d) {
    var cols = ['rgba(255,255,255,.05)', 'rgba(255,255,255,.09)', 'var(--a1)'];
    var rad = [46, 31, 16];
    return '<div class="vz-rings"><svg viewBox="0 0 100 100" aria-hidden="true">' + rad.map(function (r, i) {
      return '<circle cx="50" cy="50" r="' + r + '" class="rg r' + i + '" style="--i:' + i + '"/>';
    }).join('') + '<text x="50" y="52" text-anchor="middle" class="rt">' + esc(d.c || '') + '</text></svg><ol>' + d.s.map(function (x, i) {
      return '<li' + st(i) + '><span class="n">' + (i + 1) + '</span><div><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></div></li>';
    }).join('') + '</ol></div>';
  };

  /* annotated URL */
  R.url = function (d) {
    var cols = ['#FF4D6D', '#FF9F43', '#8B7BFF', '#2DD4BF', '#FBBF24'];
    var u = '<span class="base">' + esc(d.base) + '</span><span class="q">?</span>' + d.p.map(function (p, i) {
      return '<span class="pm" style="--c:' + cols[i % 5] + ';--i:' + i + '">' + esc(p[0]) + '=<b>' + esc(p[1]) + '</b></span>' + (i < d.p.length - 1 ? '<span class="q">&amp;</span>' : '');
    }).join('');
    return '<div class="vz-url"><div class="code">' + u + '</div><ul>' + d.p.map(function (p, i) {
      return '<li' + st(i) + '><i style="background:' + cols[i % 5] + '"></i><b>' + esc(p[0]) + '</b><span>' + esc(p[2]) + '</span></li>';
    }).join('') + '</ul></div>';
  };

  /* heat table: cols, rows [label, values] */
  R.heat = function (d) {
    return '<div class="vz-heat tw"><table><tr><th></th>' + d.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>' + d.s.map(function (r, i) {
      return '<tr><th>' + esc(r[0]) + '</th>' + r[1].map(function (v, j) {
        return v == null ? '<td></td>' : '<td><span class="hc" style="--i:' + (i + j) + ';--h:' + (v / 100).toFixed(2) + '">' + esc(v) + (d.unit || '') + '</span></td>';
      }).join('') + '</tr>';
    }).join('') + '</table></div>';
  };

  /* radar: axes labels, polygon values 0-100 */
  R.radar = function (d) {
    var n = d.s.length, cx = 150, cy = 118, r = 82;
    function pt(i, v) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [(cx + r * v / 100 * Math.cos(a)).toFixed(1), (cy + r * v / 100 * Math.sin(a)).toFixed(1)]; }
    var rings = [25, 50, 75, 100].map(function (v) { return '<polygon class="rr" points="' + d.s.map(function (_, i) { return pt(i, v).join(','); }).join(' ') + '"/>'; }).join('');
    var spokes = d.s.map(function (_, i) { var p = pt(i, 100); return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" class="sp"/>'; }).join('');
    var poly = '<polygon class="pl" points="' + d.s.map(function (x, i) { return pt(i, x[1]).join(','); }).join(' ') + '"/>';
    var labs = d.s.map(function (x, i) {
      var p = pt(i, 118), anc = p[0] < cx - 10 ? 'end' : (p[0] > cx + 10 ? 'start' : 'middle');
      return '<text x="' + p[0] + '" y="' + (+p[1] + 3) + '" text-anchor="' + anc + '" class="rl">' + esc(x[0]) + '</text>';
    }).join('');
    return '<div class="vz-rad"><svg viewBox="0 0 300 236" role="img" aria-label="' + esc(d.t) + '">' + rings + spokes + poly + labs + '</svg></div>';
  };

  /* ---------- specs, by card id ---------- */
  var V = {
    'gr-vs-brand': { t: 'Two jobs, one business', n: 'Brand builds the memory, growth turns it into action', type: 'vs',
      a: ['Brand marketing', ['Builds memory and preference', 'Slow, works over years', 'Seen in search demand, recall, trust', 'Reaches everyone who might buy']],
      b: ['Growth marketing', ['Drives a measurable action now', 'Fast loops, weekly tests', 'Seen in signups, conversion, CAC', 'Focuses on people ready to act']] },
    'gr-funnel': { t: 'The customer journey as a funnel', n: 'Shape only: every stage loses people', type: 'funnel',
      s: [['Aware', 'They see you exist'], ['Interested', 'They look closer'], ['Consider', 'They compare options'], ['Act', 'Signup, enquiry or purchase'], ['Retain', 'They come back'], ['Advocate', 'They tell others']] },
    'gr-aarrr': { t: 'Pirate metrics, one question per stage', n: 'Dave McClure, 2007', type: 'flow',
      s: [['Acquisition', 'Where do they come from?'], ['Activation', 'Do they get a first win?'], ['Retention', 'Do they come back?'], ['Referral', 'Do they tell others?'], ['Revenue', 'Do they pay?']] },
    'gr-northstar': { t: 'One North Star, a few inputs', n: 'Fix the inputs and the star moves', type: 'flow',
      s: [['North Star', 'The one number that shows value delivered'], ['Reach', 'How many new people arrive'], ['Activation', 'How many get the first win'], ['Frequency', 'How often they return'], ['Efficiency', 'What each result costs']] },
    'gr-pmf': { t: 'Is the product wanted?', n: 'Sean Ellis survey rule of thumb: 40% "very disappointed"', type: 'bars', mark: 40,
      s: [['Very disappointed', 40, 'target 40%+'], ['Somewhat disappointed', 35, ''], ['Not disappointed', 25, '']] },
    'gr-loops': { t: 'A loop feeds itself', n: 'A funnel needs new input every time; a loop creates its own', type: 'cycle', c: 'Growth loop',
      s: [['User gets value', ''], ['Shares or creates', ''], ['New visitor sees it', ''], ['Visitor joins', '']] },
    'gr-icp': { t: 'Describe one buyer clearly', n: 'Work left to right before choosing channels', type: 'flow',
      s: [['Segment', 'Who exactly'], ['Job to be done', 'What they hire you for'], ['Pain', 'What goes wrong today'], ['Trigger', 'What makes them act now'], ['Where they are', 'Where to reach them']] },
    'gr-offer': { t: 'Why an offer feels worth it', n: 'A mental model, not a measured number', type: 'eq',
      s: [{ p: [['Perceived value', '', 1], '=', ['Outcome', 'the result they want'], '×', ['Likelihood', 'they believe it works'], '÷', ['Cost', 'time, effort, price, risk']] }] },
    'gr-leads': { t: 'From stranger to customer', n: 'Names vary by company; stages narrow', type: 'funnel',
      s: [['Lead', 'Left contact details'], ['MQL', 'Marketing says fit and interested'], ['SQL', 'Sales agrees to follow up'], ['Opportunity', 'A real deal is open'], ['Customer', 'Paid']] },
    'gr-channels': { t: 'The Bullseye, outside to inside', n: 'Weinberg and Mares, Traction (2014)', type: 'rings', c: 'Focus',
      s: [['Outer ring', 'Brainstorm one idea for each of the 19 channels'], ['Middle ring', 'Rank the most promising few'], ['Inner ring', 'Test cheaply, then focus on the one that works']] },
    'gr-seo': { t: 'How a page reaches the results page', n: 'Three steps inside every search engine', type: 'flow',
      s: [['Crawl', 'Bots fetch the page'], ['Index', 'The page is stored and understood'], ['Rank', 'Ordered for each query'], ['Click', 'The searcher chooses you']] },
    'gr-local': { t: 'What Google weighs for local results', n: 'Google Business Profile help', type: 'tiles',
      s: [['Relevance', 'How well the profile matches the search'], ['Distance', 'How far you are from the searcher'], ['Prominence', 'How well known you are, reviews, links, mentions']] },
    'gr-content': { t: 'The content cycle', n: 'Content that is never refreshed slowly decays', type: 'cycle', c: 'Content',
      s: [['Idea', 'From real questions'], ['Create', ''], ['Distribute', ''], ['Measure', ''], ['Refresh', '']] },
    'gr-social': { t: 'From a post to a signup', n: 'Shape only: each step loses most people', type: 'funnel',
      s: [['Post seen', 'Reach'], ['Profile visit', 'Curiosity'], ['Link click', 'Intent'], ['Signup', 'Action']] },
    'gr-email': { t: 'The email lifecycle', n: 'Owned list: no algorithm in between', type: 'flow',
      s: [['Capture', 'Form with a clear promise'], ['Welcome', 'First email, set expectations'], ['Nurture', 'Useful, regular'], ['Convert', 'A clear next step'], ['Re-engage', 'Win back the quiet ones']] },
    'gr-community': { t: 'How word of mouth compounds', n: 'The loop that costs the least', type: 'cycle', c: 'Community',
      s: [['Member gets value', ''], ['Talks about it', ''], ['Friend joins', ''], ['Group grows', '']] },
    'gr-pr': { t: 'Why mentions help search', n: 'Backlinks are votes of trust', type: 'flow',
      s: [['Listing', 'Directory or profile'], ['Mention', 'Someone writes about you'], ['Backlink', 'A link to your site'], ['Authority', 'Search trusts you more'], ['Ranking', 'Easier to be found']] },
    'gr-sem': { t: 'What happens when someone searches', n: 'Paid search auction, simplified', type: 'flow',
      s: [['Query', 'Someone searches'], ['Auction', 'Bid and quality compete'], ['Ad shown', 'If you win'], ['Click', 'You pay per click'], ['Landing page', 'Where it is won or lost']] },
    'gr-paidsocial': { t: 'Three audiences, three jobs', n: 'Match the message to how warm they are', type: 'funnel',
      s: [['Cold', 'Never heard of you: introduce'], ['Warm', 'Engaged or visited: persuade'], ['Hot', 'Almost there: remind and reassure']] },
    'gr-influencer': { t: 'Two ways to pay for reach', n: 'Choose by what you can measure', type: 'vs',
      a: ['Influencer', ['Usually a flat fee', 'Reach and trust of one person', 'Hard to measure exactly', 'Good for awareness']],
      b: ['Affiliate', ['Paid per sale or signup', 'Risk sits with the partner', 'Tracked with a link or code', 'Good for performance']] },
    'gr-paidmetrics': { t: 'The paid metrics chain', n: 'Each metric is one division', type: 'eq',
      s: [{ p: [['CTR', 'click-through rate', 1], '=', ['Clicks', ''], '÷', ['Impressions', '']] }, { p: [['CPC', 'cost per click', 1], '=', ['Spend', ''], '÷', ['Clicks', '']] }, { p: [['CPA', 'cost per acquisition', 1], '=', ['Spend', ''], '÷', ['Conversions', '']] }] },
    'gr-cro': { t: 'The CRO loop', n: 'Conversion rate optimisation, run again and again', type: 'cycle', c: 'CRO',
      s: [['Research', 'Where do people drop?'], ['Hypothesis', 'Why, and what to change'], ['Test', ''], ['Learn', 'Keep or drop']] },
    'gr-landing': { t: 'Anatomy of a landing page', n: 'Top to bottom, one goal', type: 'blocks',
      s: [['Hero', 'Headline, one line of proof, one button', 'big'], ['Proof', 'Logos, numbers, reviews', ''], ['Benefits', 'What changes for them', ''], ['How it works', 'Three simple steps', ''], ['Objections', 'FAQ and guarantees', ''], ['Final call to action', 'Repeat the one button', 'big']] },
    'gr-forms': { t: 'More fields, fewer finishers', n: 'Shape only: ask for what you need now', type: 'curve', x: 'Number of fields', y: 'Forms completed',
      s: [{ n: 'Completion', c: '#FF4D6D', y: [92, 78, 62, 46, 34, 24, 18] }] },
    'gr-copy': { t: 'A button should promise a result', n: 'Example wording', type: 'vs',
      a: ['Weak', ['Submit', 'Click here', 'Learn more', 'Says nothing about the gain']],
      b: ['Strong', ['Get my free audit', 'See pricing', 'Start the 5-minute setup', 'Says what happens next']] },
    'gr-trust': { t: 'Six kinds of proof', n: 'Use the ones you can truthfully show', type: 'tiles',
      s: [['Numbers', 'Real counts and results'], ['Names', 'Clients, logos, partners'], ['Reviews', 'Quotes from real users'], ['Guarantees', 'Reduce the risk of trying'], ['Authority', 'Press, awards, credentials'], ['Openness', 'Show how you work and who is behind it']] },
    'gr-speed': { t: 'Core Web Vitals thresholds', n: 'Google, measured at the 75th percentile', type: 'ranges',
      s: [['LCP', 'Largest Contentful Paint: how fast the main content loads', '≤ 2.5 s', '2.5 to 4 s', '> 4 s'], ['INP', 'Interaction to Next Paint: how fast it reacts', '≤ 200 ms', '200 to 500 ms', '> 500 ms'], ['CLS', 'Cumulative Layout Shift: how much it jumps', '≤ 0.1', '0.1 to 0.25', '> 0.25']] },
    'gr-plan': { t: 'Measure backwards from the goal', n: 'Write the plan before opening any tool', type: 'flow',
      s: [['Business goal', 'What must grow'], ['Conversion', 'The action that proves it'], ['Events', 'Steps leading to it'], ['Parameters', 'Details to record'], ['Reports', 'Who reads what']] },
    'gr-ga4': { t: 'How GA4 sees your site', n: 'Everything is an event', type: 'flow',
      s: [['Data stream', 'Web or app source'], ['Events', 'page_view, click, sign_up'], ['Key events', 'The ones that matter'], ['Reports', 'Standard views'], ['Explorations', 'Your own questions']] },
    'gr-utm': { t: 'Anatomy of a tagged link', n: 'Example link', type: 'url', base: 'https://example.com/signup',
      p: [['utm_source', 'instagram', 'Where the click came from'], ['utm_medium', 'social', 'The kind of channel'], ['utm_campaign', 'launch_oct', 'The named push'], ['utm_content', 'reel_a', 'Which version of the creative']] },
    'gr-attr': { t: 'Same journey, four ways to share the credit', n: 'Share of credit for one sale, by model', type: 'heat', unit: '%',
      cols: ['Last click', 'First click', 'Linear', 'Position-based'],
      s: [['1. Instagram post', [0, 100, 25, 40]], ['2. Search ad', [0, 0, 25, 10]], ['3. Email', [0, 0, 25, 10]], ['4. Direct visit', [100, 0, 25, 40]]] },
    'gr-dash': { t: 'A dashboard has layers', n: 'Few numbers on top, detail below', type: 'funnel',
      s: [['North Star', 'One number'], ['Key results', '3 to 5 KPIs'], ['Diagnostics', 'Channel and page detail'], ['Raw data', 'For digging in']] },
    'gr-cohorts': { t: 'Reading a cohort table', n: 'Example numbers, not real data', type: 'heat', unit: '%',
      cols: ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4'],
      s: [['Cohort 1', [100, 42, 31, 27, 25]], ['Cohort 2', [100, 45, 34, 30, null]], ['Cohort 3', [100, 51, 38, null, null]], ['Cohort 4', [100, 55, null, null, null]]] },
    'gr-privacy': { t: 'Privacy by habit', n: 'The order of good practice', type: 'flow',
      s: [['Tell people', 'Plain notice'], ['Ask consent', 'Where it is needed'], ['Collect less', 'Only what you use'], ['Protect it', 'Access and storage'], ['Honour requests', 'Delete, correct, opt out']] },
    'gr-hyp': { t: 'A test starts as a sentence', n: 'Fill each blank before building', type: 'flow',
      s: [['Because', 'the evidence we saw'], ['We change', 'one thing'], ['For', 'this audience'], ['So that', 'this behaviour moves'], ['We will know by', 'one metric']] },
    'gr-ab': { t: 'Small effects need many visitors', n: 'Shape only: sample size rises fast as the lift you look for shrinks', type: 'curve', x: 'Size of lift you want to detect (large to small)', y: 'Visitors needed',
      s: [{ n: 'Visitors per variant', c: '#FF9F43', y: [4, 7, 12, 22, 40, 70, 100] }] },
    'gr-ice': { t: 'Pick the quick wins first', n: 'Example ideas, placed by judgement', type: 'matrix', x: 'Effort', y: 'Impact', q: ['Big bets', 'Plan carefully', 'Quick wins', 'Fill-ins'],
      s: [['Shorter form', 18, 72], ['Clear button text', 12, 58], ['New paid channel', 78, 76], ['Rebuild site', 88, 30], ['Footer tweak', 20, 14]] },
    'gr-small': { t: 'When traffic is small', n: 'Change the method, not the ambition', type: 'tiles',
      s: [['Bigger changes', 'Test bold ideas, not button colours'], ['Longer windows', 'Wait for enough weeks'], ['Before and after', 'Compare periods, with care'], ['Talk to people', 'Five interviews beat a thin test']] },
    'gr-cac': { t: 'The unit economics in three lines', n: 'Definitions', type: 'eq',
      s: [{ p: [['CAC', 'customer acquisition cost', 1], '=', ['Sales and marketing spend', ''], '÷', ['New customers', '']] }, { p: [['LTV', 'lifetime value', 1], '=', ['Average revenue', ''], '×', ['Gross margin', ''], '×', ['Customer lifetime', '']] }, { p: [['Payback', 'months to recover CAC', 1], '=', ['CAC', ''], '÷', ['Monthly margin per customer', '']] }] },
    'gr-math': { t: 'Funnel maths in one line', n: 'Example numbers', type: 'eq',
      s: [{ p: [['1,000', 'visitors'], '×', ['3%', 'become leads'], '×', ['10%', 'become customers'], '=', ['3', 'customers', 1]] }] },
    'gr-budget': { t: 'Splitting a small budget', n: 'A common 70-20-10 rule of thumb, not a law', type: 'bars',
      s: [['Proven channels', 70, '70%'], ['Promising', 20, '20%'], ['Experiments', 10, '10%']] },
    'gr-activation': { t: 'From signup to habit', n: 'Shorten the time to the first win', type: 'flow',
      s: [['Signup', 'They arrive'], ['Aha moment', 'They see the value'], ['First win', 'They finish a key action'], ['Habit', 'They return on their own']] },
    'gr-retention': { t: 'Retention curves', n: 'Shape only: a flat tail means a product people keep', type: 'curve', x: 'Time since signup', y: 'Users still active',
      s: [{ n: 'Leaks to zero', c: '#F87171', y: [100, 55, 34, 22, 14, 8, 4] }, { n: 'Flattens', c: '#4ADE80', y: [100, 62, 46, 40, 38, 37, 37] }] },
    'gr-lifecycle': { t: 'A message for every stage', n: 'Channels: email, push, WhatsApp', type: 'flow',
      s: [['Welcome', 'Right after signup'], ['Onboard', 'Guide to the first win'], ['Engage', 'Useful reasons to return'], ['At risk', 'Quiet users get a nudge'], ['Win back', 'A last, honest ask']] },
    'gr-referral': { t: 'The referral loop', n: 'Make sharing part of the product', type: 'cycle', c: 'Referral',
      s: [['Happy user', ''], ['Invites a friend', ''], ['Friend signs up', ''], ['Both get value', '']] },
    'gr-monetise': { t: 'Good, better, best', n: 'Three tiers make choosing easy', type: 'tiles',
      s: [['Free', 'Prove value, collect users'], ['Paid', 'The plan most people pick'], ['Premium', 'For heavy or business use']] },
    'gr-pipeline': { t: 'A pipeline narrows', n: 'Track every deal in one place', type: 'funnel',
      s: [['New lead', ''], ['Contacted', ''], ['Qualified', 'Budget, need, timing'], ['Proposal', ''], ['Won', 'Or lost, with a reason']] },
    'gr-outbound': { t: 'Respectful outreach', n: 'Few, relevant, personal', type: 'flow',
      s: [['Research', 'Who and why now'], ['Personalise', 'One real detail'], ['Send', 'Short and clear'], ['Follow up', 'Twice, then stop'], ['Book a call', 'Or part as friends']] },
    'gr-team': { t: 'The weekly growth rhythm', n: 'Small team, steady loop', type: 'cycle', c: 'Weekly loop',
      s: [['Review', 'Last week\'s numbers'], ['Choose', 'The next tests'], ['Ship', ''], ['Learn', 'Write it down']] },
    'gr-ethics': { t: 'Growth that lasts', n: 'Short-term tricks cost trust', type: 'vs',
      a: ['Do', ['Tell the truth in ads', 'Ask before tracking', 'Follow platform rules', 'Make opting out easy']],
      b: ['Do not', ['Fake reviews or scarcity', 'Buy followers', 'Send to bought lists', 'Hide the price or terms']] },
    'gr-audit': { t: 'Growth scorecard shape', n: 'Example shape: a lopsided shape shows where to work', type: 'radar',
      s: [['Positioning', 70], ['Channels', 45], ['Conversion', 55], ['Measurement', 35], ['Testing', 25], ['Retention', 40], ['Economics', 30], ['Pipeline', 50]] }
  };

  function render(id, d) {
    var fn = R[d.type]; if (!fn) return '';
    return '<figure class="vz vzf-' + d.type + '"><figcaption><b>' + esc(d.t) + '</b><span>' + esc(d.n) + '</span></figcaption>' + fn(d) + '</figure>';
  }


  var TABKEY = 'hv-gv-all';
  function restructure(card) {
    if (card.dataset.rs) return; card.dataset.rs = '1';
    var ww = card.querySelector('.ww'), at = card.querySelector('.at'), act = card.querySelector('.act'), tbl = card.querySelector(':scope > .tw'), two = card.querySelector(':scope > .two');
    if (!ww || !act) return;
    var st = act.querySelector('.st'), now = act.querySelector('.now'), rec = act.querySelector('.op.rec') || act.querySelector('.op');
    var logo = at && at.querySelector('.atl img'), lab = at && at.querySelector('.atl');
    var vz = card.querySelector('.vz');
    /* snapshot */
    var snap = document.createElement('div'); snap.className = 'vz-snap';
    snap.innerHTML = '<div class="sn1">' + (logo ? '<img src="' + logo.getAttribute('src') + '" alt="">' : '') + '<span class="k">' + esc(lab ? lab.textContent : 'Now') + '</span>' + (st ? '<span class="st ' + st.className.replace('st', '').trim() + '">' + esc(st.textContent) + '</span>' : '') + '</div>' +
      '<p>' + esc(now ? now.textContent : '') + '</p>' +
      (rec ? '<div class="sn2"><span class="k">Next move</span><b>' + esc((rec.querySelector('b') ? rec.querySelector('b').firstChild.textContent : '').trim()) + '</b>' + (rec.querySelector('.bud') ? '<span class="bud">' + esc(rec.querySelector('.bud').textContent) + '</span>' : '') + '</div>' : '');
    /* panes */
    var panes = [['concept', 'Concept', [ww]]];
    if (at) panes.push(['brand', 'At ' + (lab ? lab.textContent.replace(/^At\s+/, '') : 'brand'), [at]]);
    if (tbl) panes.push(['table', 'Compare', [tbl]]);
    panes.push(['do', 'Approaches and how', [act]]);
    var bar = document.createElement('div'); bar.className = 'vz-tabs'; bar.setAttribute('role', 'tablist');
    var wrap = document.createElement('div'); wrap.className = 'vz-panes';
    panes.forEach(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.k = p[0]; b.textContent = p[1];
      bar.appendChild(b);
      var d = document.createElement('div'); d.className = 'vz-pane'; d.dataset.k = p[0]; d.setAttribute('role', 'tabpanel');
      p[2].forEach(function (n) { d.appendChild(n); }); wrap.appendChild(d);
    });
    function show(k) {
      [].forEach.call(bar.children, function (b) { var on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      [].forEach.call(wrap.children, function (d) { d.hidden = d.dataset.k !== k; });
    }
    bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(b.dataset.k); });
    card.vzShow = show;
    if (two) two.remove();
    (vz || card.querySelector('.cch')).insertAdjacentElement('afterend', snap);
    snap.insertAdjacentElement('afterend', bar); bar.insertAdjacentElement('afterend', wrap);
    show('concept');
    var tools = card.querySelectorAll(':scope > .tool, :scope > .grid2, :scope > .grid3, :scope > .score, :scope > .dec');
    wrap.after.apply(wrap, [].slice.call(tools));
  }

  function buildMap() {
    var hero = document.querySelector('.bento'); if (!hero || document.querySelector('.vz-state')) return;
    var cards = [].slice.call(document.querySelectorAll('article.cc'));
    var parts = {}, tiles = '', cnt = { ok: 0, bd: 0, gp: 0 };
    cards.forEach(function (c) {
      var s = c.querySelector('.vz-snap .st'); var k = s ? (s.classList.contains('ok') ? 'ok' : s.classList.contains('gp') ? 'gp' : 'bd') : 'bd';
      cnt[k]++;
      var pid = c.closest('section.part').id;
      (parts[pid] = parts[pid] || { t: c.closest('section.part').getAttribute('data-t'), i: [] }).i.push([c.id, c.querySelector('.cn').textContent, c.querySelector('h3').textContent, k]);
    });
    var n = cards.length;
    var html = '<section class="sec vz-state"><div class="k">Where the brand stands</div><h3>All ' + n + ' growth areas at a glance</h3>' +
      '<div class="meter">' + ['ok', 'bd', 'gp'].map(function (k) { return '<i class="' + k + '" style="--w:' + (cnt[k] / n * 100).toFixed(1) + '%"></i>'; }).join('') + '</div>' +
      '<div class="flt" role="group" aria-label="Filter"><button class="on" data-f="all">All ' + n + '</button><button data-f="ok"><i class="ok"></i>Strong ' + cnt.ok + '</button><button data-f="bd"><i class="bd"></i>Building ' + cnt.bd + '</button><button data-f="gp"><i class="gp"></i>Gap ' + cnt.gp + '</button></div>' +
      '<div class="pg">' + Object.keys(parts).map(function (pid, pi) {
        return '<div class="pp"><a class="ph" href="#' + pid + '">' + String(pi + 1).padStart(2, '0') + ' ' + esc(parts[pid].t) + '</a><div class="tl2">' + parts[pid].i.map(function (x, j) {
          return '<a href="#' + x[0] + '" class="t ' + x[3] + '" data-s="' + x[3] + '" data-id="' + x[0] + '" style="--i:' + (pi * 3 + j) + '" title="' + esc(x[2]) + '"><span>' + esc(x[1]) + '</span><em>' + esc(x[2]) + '</em></a>';
        }).join('') + '</div></div>';
      }).join('') + '</div><p class="hint">Colour shows the state of each area for this brand. Tap one to open it.</p></section>';
    var anchor = document.querySelector('.vz-map') || hero;
    anchor.insertAdjacentHTML('afterend', html);
    var box = document.querySelector('.vz-state');
    box.querySelector('.flt').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      [].forEach.call(box.querySelectorAll('.flt button'), function (x) { x.classList.toggle('on', x === b); });
      var f = b.dataset.f; [].forEach.call(box.querySelectorAll('.t'), function (t) { t.classList.toggle('dim', f !== 'all' && t.dataset.s !== f); });
    });
    box.addEventListener('click', function (e) {
      var t = e.target.closest('.t'); if (!t) return; var c = document.getElementById(t.dataset.id); if (c && c.vzShow) c.vzShow('brand');
    });
    if ('IntersectionObserver' in window) { var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { box.classList.add('in'); o.disconnect(); } }); }, { threshold: .1 }); o.observe(box); } else box.classList.add('in');
  }

  function mount() {
    Object.keys(V).forEach(function (id) {
      var card = document.getElementById(id); if (!card || card.querySelector('.vz')) return;
      var head = card.querySelector('.cch'); if (!head) return;
      head.insertAdjacentHTML('afterend', render(id, V[id]));
    });

    /* system map under the hero */
    var bento = document.querySelector('.bento');
    if (bento && !document.querySelector('.vz-map')) {
      var parts = [].slice.call(document.querySelectorAll('section.part'));
      var html = '<section class="sec vz-map reveal"><div class="k">The whole system on one screen</div><h3>Ten parts, one growth engine</h3><ol>' + parts.map(function (p, i) {
        return '<li' + st(i) + '><a href="#' + p.id + '"><span class="n">' + String(i + 1).padStart(2, '0') + '</span><b>' + esc(p.getAttribute('data-t')) + '</b></a></li>';
      }).join('') + '</ol><p>Foundations and customers set the direction, channels bring people in, conversion and measurement turn visits into results, experiments and economics keep it honest, retention and operations make it last.</p></section>';
      bento.insertAdjacentHTML('afterend', html);
      var m = document.querySelector('.vz-map');
      if ('IntersectionObserver' in window) { var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { m.classList.add('in'); o.disconnect(); } }); }, { threshold: .1 }); o.observe(m); } else m.classList.add('in');
    }
  }
  function all() { mount(); document.querySelectorAll('article.cc').forEach(restructure); buildMap(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', all); else all();
})();
