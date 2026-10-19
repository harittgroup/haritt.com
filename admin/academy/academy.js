/* Marketing Academy (Haritt admin): shared behaviour for the three branding pages.
   Each page sets window.AC = {key, pp, pm, ap, am, mx} before loading this file. */
(function () {
  var AC = window.AC || {};
  var LS = 'hvacad_' + (AC.key || 'x') + '_';
  function get(k) { try { return localStorage.getItem(LS + k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(LS + k, v); } catch (e) {} }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- glossary: terms and full forms (shared by all three pages) ---------- */
  var GL = [
    ['AMA', 'American Marketing Association', 'The US professional body whose definition of "brand" is the one most textbooks quote.'],
    ['AI', 'Artificial Intelligence', 'Software that understands language, images or patterns. HV AI is Haritt\'s assistant.'],
    ['B2B', 'Business-to-Business', 'Selling to companies. Longer decisions, several people involved, trust and proof matter most.'],
    ['B2C', 'Business-to-Consumer', 'Selling or giving products to individual people.'],
    ['BAV', 'Brand Asset Valuator', 'A brand research model by Young &amp; Rubicam: differentiation, relevance, esteem and knowledge.'],
    ['BX', 'Brand Experience', 'Everything a person feels and does while using the brand, not only what they see.'],
    ['CAC', 'Customer Acquisition Cost', 'What it costs, in money or time, to win one new customer or user.'],
    ['CBBE', 'Customer-Based Brand Equity', 'Keller\'s model: equity is the different response a brand gets because of what people know about it.'],
    ['CEP', 'Category Entry Point', 'A moment or need that starts a buyer thinking about a category (Romaniuk, Sharp).'],
    ['CMYK', 'Cyan, Magenta, Yellow, Key (black)', 'Colour values for print.'],
    ['CTA', 'Call to Action', 'The button or line that asks the visitor to do one thing, such as "Start a project".'],
    ['CX', 'Customer Experience', 'The whole journey a customer has with the company, across every touchpoint.'],
    ['DBA', 'Distinctive Brand Asset', 'A colour, shape, sound or character that triggers the brand without the name.'],
    ['EVP', 'Employee Value Proposition', 'Why a good person should work here instead of somewhere else.'],
    ['GBP', 'Google Business Profile', 'The free business listing that shows in Google Search and Maps.'],
    ['HEX', 'Hexadecimal colour code', 'Colour written as six characters, like #A70D22. Used on screens.'],
    ['HSL', 'Hue, Saturation, Lightness', 'A way of writing colour that is easy to adjust by hand.'],
    ['ICP', 'Ideal Customer Profile', 'A precise description of the client you serve best and most want more of.'],
    ['IMC', 'Integrated Marketing Communications', 'Planning every channel (site, social, email, ads, PR) so they send one consistent message.'],
    ['IP', 'Intellectual Property', 'Legal ownership of names, logos, designs and content. A trademark is one type.'],
    ['KPI', 'Key Performance Indicator', 'The few numbers that show whether a goal is being met.'],
    ['LTV', 'Lifetime Value', 'The total value one customer brings over the whole relationship. Also written CLV.'],
    ['MBA', 'Master of Business Administration', 'The business degree where brand management is taught as its own course.'],
    ['MQL', 'Marketing Qualified Lead', 'An enquiry that fits your target and is worth a sales conversation.'],
    ['NPS', 'Net Promoter Score', '"How likely are you to recommend us, 0 to 10?" Promoters minus detractors (Reichheld, 2003).'],
    ['OG', 'Open Graph', 'The title, text and image a link shows when shared on WhatsApp, LinkedIn or X.'],
    ['PoD', 'Point of Difference', 'An association customers value that only your brand delivers (Keller).'],
    ['PoP', 'Point of Parity', 'An association every credible brand in the category must have (Keller).'],
    ['RGB', 'Red, Green, Blue', 'Colour values for screens.'],
    ['RTB', 'Reason to Believe', 'The proof behind a claim: a fact, a product, a result, a history.'],
    ['SaaS', 'Software as a Service', 'Software used in the browser on a subscription instead of installed.'],
    ['SEO', 'Search Engine Optimisation', 'Work that helps the right pages show up in Google for the right searches.'],
    ['SOV', 'Share of Voice', 'Your share of all the advertising or attention in a category.'],
    ['ESOV', 'Excess Share of Voice', 'Share of voice minus share of market. Positive ESOV tends to predict growth (Binet &amp; Field).'],
    ['SOM', 'Share of Market', 'Your share of all sales or users in a category.'],
    ['SQL', 'Sales Qualified Lead', 'A lead the sales side has confirmed is a real opportunity.'],
    ['STP', 'Segmentation, Targeting, Positioning', 'The core strategy sequence: split the market, choose who to serve, decide how to be seen.'],
    ['UI', 'User Interface', 'The screens, buttons and layout a person uses.'],
    ['URL', 'Uniform Resource Locator', 'A web address. Keller counts the domain name as a brand element.'],
    ['IPA', 'Institute of Practitioners in Advertising', 'The UK body whose effectiveness databank Binet and Field analysed.'],
    ['ISO', 'International Organization for Standardization', 'Sets global standards. ISO 10668 covers brand valuation.'],
    ['USP', 'Unique Selling Proposition', 'The one claim competitors can\'t or don\'t make (Rosser Reeves, 1961).'],
    ['UVP', 'Unique Value Proposition', 'A modern version of the USP: the full value only you deliver.'],
    ['UX', 'User Experience', 'How easy and pleasant something is to use.'],
    ['WCAG', 'Web Content Accessibility Guidelines', 'The standard for making sites usable by people with disabilities, including colour contrast.'],
    ['Brand equity', 'term', 'The extra preference, trust or price a brand earns just from its name.'],
    ['Brand salience', 'term', 'How often and how easily a brand comes to mind. The base of Keller\'s pyramid.'],
    ['Brand resonance', 'term', 'The top of Keller\'s pyramid: loyalty, attachment, community and active engagement.'],
    ['Brand associations', 'term', 'Everything linked to the brand in memory. Judged by strength, favourability and uniqueness.'],
    ['Perceived quality', 'term', 'How good people think the brand is, whether or not that is true. One of Aaker\'s equity assets.'],
    ['Frame of reference', 'term', 'The category and competitors you choose to be compared with in a positioning.'],
    ['Brand promise', 'term', 'What people can expect every time they deal with the brand.'],
    ['Brand mantra', 'term', 'A 3 to 5 word internal phrase that captures the brand\'s heart (Keller).'],
    ['Tagline', 'term', 'A short public line used with the logo. Also called a slogan or strapline.'],
    ['Messaging hierarchy', 'term', 'The order of messages: promise first, then pillars, then proof points.'],
    ['Brand architecture', 'term', 'How a company\'s brands relate: branded house, sub-brand, endorsed brand or house of brands.'],
    ['Branded house', 'term', 'One master brand over everything (Google Maps, Google Pay). Also called a masterbrand strategy.'],
    ['House of brands', 'term', 'Separate brands with the parent in the background (HUL with Surf Excel and Dove).'],
    ['Endorsed brand', 'term', 'A brand with its own name plus a visible "by parent" (Courtyard by Marriott).'],
    ['Sub-brand', 'term', 'The parent name plus a descriptor (Tata Motors).'],
    ['Brand portfolio', 'term', 'All the brands a company owns, each with a role.'],
    ['Brand hierarchy', 'term', 'The levels of naming from corporate brand down to product and modifier.'],
    ['Brand extension', 'term', 'Using an existing brand name to launch a new product. Line extension stays in the category; category extension moves out of it.'],
    ['Brand dilution', 'term', 'When extensions or misuse weaken what the brand stands for.'],
    ['Cannibalisation', 'term', 'When a new product takes users or sales from your own existing product.'],
    ['Co-branding', 'term', 'Two brands appearing together so each borrows the other\'s trust.'],
    ['Ingredient branding', 'term', 'A brand shown as a part inside another product ("Intel Inside").'],
    ['Brand licensing', 'term', 'Letting another company use your brand for a fee.'],
    ['Rebrand', 'term', 'A change of name, positioning or identity. A refresh only updates the look.'],
    ['Brand revitalisation', 'term', 'Bringing a fading brand back to relevance (Keller: managing brands over time).'],
    ['Brand personality', 'term', 'Human traits linked to a brand. Aaker: sincerity, excitement, competence, sophistication, ruggedness.'],
    ['Brand archetype', 'term', 'One of 12 character types, from Jung, used to keep a brand consistent (Mark &amp; Pearson).'],
    ['Brand identity prism', 'term', 'Kapferer\'s six facets: physique, personality, culture, relationship, reflection, self-image.'],
    ['Brand voice', 'term', 'The brand\'s constant personality in words.'],
    ['Tone of voice', 'term', 'How the voice adjusts to the moment: launch, error, apology, help.'],
    ['Brand elements', 'term', 'The trademarkable parts of a brand: name, logo, symbol, character, tagline, jingle, packaging, URL (Keller).'],
    ['Wordmark', 'term', 'A logo made only of the name in a set typeface. Also called a logotype.'],
    ['Logomark', 'term', 'A logo symbol without the name. Also called a brand mark or symbol.'],
    ['Lockup', 'term', 'A fixed arrangement of logomark and wordmark together.'],
    ['Clear space', 'term', 'The empty area that must stay around the logo.'],
    ['Favicon', 'term', 'The small icon in a browser tab, usually 16 to 32 pixels.'],
    ['Typeface', 'term', 'A type design (Inter). A font is one file or weight of it (Inter Semibold).'],
    ['Type scale', 'term', 'The fixed set of text sizes a brand uses for headings and body.'],
    ['Colour palette', 'term', 'The brand\'s fixed colours with roles: primary, secondary, neutral, accent, state.'],
    ['60-30-10 rule', 'term', 'A design habit: about 60% neutral, 30% secondary, 10% accent colour.'],
    ['Design tokens', 'term', 'Named values (colours, sizes, radii) shared by design and code, like --hg-red.'],
    ['Brand guidelines', 'term', 'The rulebook for using the brand. Also called a brand book or style guide.'],
    ['Touchpoint', 'term', 'Any place a person meets the brand.'],
    ['Customer journey', 'term', 'The stages a person goes through: aware, consider, try, use, return, recommend.'],
    ['Mental availability', 'term', 'How likely the brand is to come to mind in buying moments (Sharp).'],
    ['Physical availability', 'term', 'How easy the brand is to find and buy or use (Sharp).'],
    ['Brand building', 'term', 'Long-term work that creates memory and preference.'],
    ['Activation', 'term', 'Short-term marketing that turns people who are ready now into sign-ups, enquiries or sales. Also called performance marketing.'],
    ['Aided awareness', 'term', '"Have you heard of X?" Recognition when prompted.'],
    ['Unaided awareness', 'term', '"Name a brand that does Y." Recall without prompting. Top-of-mind is the first one named.'],
    ['Brand tracking', 'term', 'Asking the same brand questions at regular intervals to see change.'],
    ['Brand loyalty', 'term', 'Repeat choice of the brand. Behavioural (they come back) and attitudinal (they prefer it).'],
    ['Brand community', 'term', 'Users who connect with each other around the brand.'],
    ['Brand advocate', 'term', 'A customer who recommends the brand without being paid.'],
    ['Brand ambassador', 'term', 'A person, often paid or on staff, who represents the brand in public.'],
    ['Brand valuation', 'term', 'Putting a money value on a brand (Interbrand, Brand Finance methods).'],
    ['Brand audit', 'term', 'A structured check of where the brand stands: inventory plus exploratory research (Keller).'],
    ['Employer brand', 'term', 'How the company looks as a place to work (Ambler &amp; Barrow, 1996).'],
    ['Internal branding', 'term', 'Making sure the team understands and lives the brand.'],
    ['Founder brand', 'term', 'The public reputation of the founders, which a young company borrows.']
  ];
  var GM = {}; GL.forEach(function (g) { if (g[1] !== 'term') GM[g[0]] = g[1]; });

  /* MBA brand-management map: modules follow Keller, Strategic Brand Management, the standard course textbook */
  var MB = [
    ['1', 'Brands and brand management', 'What a brand is, identity and image, promise, customer journey'],
    ['2', 'Brand purpose and story', 'Mission, vision, values, brand story (taught with corporate strategy)'],
    ['3', 'Customer-based brand equity and positioning', 'STP, frame of reference, PoP and PoD, mantra, value proposition'],
    ['4', 'Branding architecture, extensions and managing brands over time', 'Architecture, portfolio, hierarchy, extensions, co-branding, revitalisation'],
    ['5', 'Brand personality and identity', 'Aaker personality, archetypes, Kapferer prism, voice'],
    ['6', 'Choosing brand elements', 'Name, logo, colour, typography, imagery, distinctive assets, guidelines'],
    ['7', 'Integrated marketing communications and growth', 'IMC, mental availability, brand building vs activation'],
    ['8', 'Measuring brand equity', 'CBBE pyramid, Aaker assets, associations, BAV, valuation, tracking, loyalty'],
    ['9', 'Brand management in the organisation', 'Founder brand, employer and internal branding, brand audit']
  ];

  /* ---------- numbering, cross references, counters ---------- */
  var cards = $$('article.cc');
  cards.forEach(function (c, i) { var n = $('.cn', c); if (n) n.textContent = (i < 9 ? '0' : '') + (i + 1); c.dataset.n = i + 1; });
  $$('.cref').forEach(function (a) { var t = document.getElementById((a.getAttribute('href') || '').slice(1)); a.textContent = t ? 'card ' + t.dataset.n : 'card'; });
  $$('[data-c="auto"]').forEach(function (el) { el.dataset.c = cards.length; });

  /* abbreviations: full form after the first use on the page, tooltip on every use */
  var seen = {};
  $$('abbr.ab').forEach(function (a) {
    var k = a.textContent.trim(), f = GM[k]; if (!f) return;
    a.title = f.replace(/&amp;/g, '&');
    if (!seen[k] && !a.hasAttribute('data-nf')) { seen[k] = 1; var s = document.createElement('span'); s.className = 'ff'; s.innerHTML = ' (' + f + ')'; a.after(s); }
  });

  /* glossary table */
  var gb = $('#gloss');
  if (gb) {
    var rows = GL.slice().sort(function (a, b) { var x = a[1] === 'term', y = b[1] === 'term'; return x === y ? a[0].localeCompare(b[0]) : (x ? 1 : -1); });
    gb.innerHTML = '<tr><th>Term</th><th>Full form</th><th>Meaning</th></tr>' + rows.map(function (g) { return '<tr data-q="' + esc((g[0] + ' ' + g[1] + ' ' + g[2]).toLowerCase()) + '"><td>' + g[0] + '</td><td>' + (g[1] === 'term' ? '<span style="color:var(--mu)">Industry term</span>' : g[1]) + '</td><td>' + g[2] + '</td></tr>'; }).join('');
    var gq = $('#glq'), gc = $('#glc');
    var gf = function () { var q = (gq.value || '').toLowerCase().trim(), n = 0; $$('tr[data-q]', gb).forEach(function (r) { var on = !q || r.dataset.q.indexOf(q) >= 0; r.hidden = !on; if (on) n++; }); if (gc) gc.textContent = n + ' terms'; };
    if (gq) gq.addEventListener('input', gf); gf();
  }

  /* MBA map, built from each card's data-m */
  var mb = $('#mbamap');
  if (mb) {
    mb.innerHTML = '<tr><th>MBA module</th><th>What the module covers</th><th>Where it is on this page</th></tr>' + MB.map(function (m) {
      var cs = cards.filter(function (c) { return c.dataset.m === m[0]; });
      return '<tr><td>' + m[1] + '</td><td>' + m[2] + '</td><td>' + cs.map(function (c) { return '<a class="cref" href="#' + c.id + '">' + c.dataset.n + ' ' + esc($('h3', c).textContent) + '</a>'; }).join('<br>') + '</td></tr>';
    }).join('');
  }

  /* tables: column labels for the phone card layout */
  $$('.tw table').forEach(function (t) {
    var h = $$('tr:first-child th', t).map(function (x) { return x.textContent; });
    if (!h.length) return;
    $$('tr', t).forEach(function (r) { $$('td', r).forEach(function (c, i) { if (h[i]) c.setAttribute('data-l', h[i]); }); });
  });

  /* current state, approaches and how for each card (AC.act) */
  var SL = { ok: ['ok', 'Strong'], bd: ['bd', 'Building'], gp: ['gp', 'Gap'] };
  if (AC.act) cards.forEach(function (c) {
    var a = AC.act[c.id]; if (!a) return;
    var st = SL[a.s] || SL.bd, box = document.createElement('div'); box.className = 'act';
    box.innerHTML = '<div><h5>Current state</h5><span class="st ' + st[0] + '">' + st[1] + '</span><p class="now">' + a.now + '</p></div>' +
      '<div><h5>Approaches</h5>' + a.ap.map(function (o) { return '<div class="op' + (o[3] ? ' rec' : '') + '"><b>' + o[0] + (o[3] ? ' <span class="rk">Recommended</span>' : '') + ' <span class="bud' + (o[2] === 's' ? ' s' : '') + '">' + (o[2] === 's' ? 'Small budget' : 'Free') + '</span></b><span>' + o[1] + '</span></div>'; }).join('') + '</div>' +
      '<div><h5>How to do it</h5><ol>' + a.how.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ol></div>';
    var nx = $('.nx', c); if (nx) c.insertBefore(box, nx); else c.appendChild(box);
  });

  /* ---------- reveal, counters, spotlight ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; var t = e.target; t.classList.add('in'); $$('.pb i', t).forEach(function (b) { b.style.width = b.dataset.w + '%'; }); io.unobserve(t); }); }, { threshold: .06 }) : null;
  function watch(el) { if (io) io.observe(el); else { el.classList.add('in'); $$('.pb i', el).forEach(function (b) { b.style.width = b.dataset.w + '%'; }); } }
  $$('.reveal').forEach(watch);
  $$('[data-c]').forEach(function (el) { var to = +el.dataset.c, from = to > 1000 ? 1990 : 0, st = performance.now(); (function f(n) { var k = Math.min(1, (n - st) / 1500); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(st); });
  $$('.cell,.cc').forEach(function (c) { c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px'); }); });

  /* ---------- part nav, read marks, progress ---------- */
  var parts = $$('.part'), nav = $('#partnav');
  var read = {}; (get('read') || '').split(',').forEach(function (x) { if (x) read[x] = 1; });
  if (nav) parts.forEach(function (p, i) {
    var a = document.createElement('a'); a.href = '#' + p.id; a.dataset.id = p.id; a.textContent = (i + 1) + ' · ' + p.dataset.t; if (read[p.id]) a.classList.add('read'); nav.appendChild(a);
    var bar = document.createElement('div'); bar.className = 'endp';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'xb' + (read[p.id] ? ' done' : ''); b.textContent = read[p.id] ? '✓ Read' : 'Mark part ' + (i + 1) + ' as read';
    b.onclick = function () { read[p.id] = 1; set('read', Object.keys(read).join(',')); b.className = 'xb done'; b.textContent = '✓ Read'; a.classList.add('read'); };
    bar.appendChild(b);
    if (parts[i + 1]) { var n = document.createElement('a'); n.className = 'xb pri'; n.href = '#' + parts[i + 1].id; n.textContent = 'Next: ' + parts[i + 1].dataset.t + ' →'; bar.appendChild(n); }
    p.appendChild(bar);
  });
  if (nav && io) {
    var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; $$('a', nav).forEach(function (a) { a.classList.toggle('cur', a.dataset.id === e.target.id); }); var c = $('a.cur', nav); if (c) nav.scrollTo({ left: c.offsetLeft - nav.clientWidth / 2 + c.offsetWidth / 2, behavior: 'smooth' }); }); }, { rootMargin: '-35% 0px -60% 0px' });
    parts.forEach(function (p) { pio.observe(p); });
  }
  var pr = $('#prog');
  if (pr) addEventListener('scroll', function () { var h = document.documentElement.scrollHeight - innerHeight; pr.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%'; }, { passive: true });

  /* ---------- interactive pieces ---------- */
  $$('.flip').forEach(function (f) { f.onclick = function () { f.classList.toggle('on'); }; });

  function seg(id, fn) { var bs = $$('#' + id + ' button'); bs.forEach(function (b) { b.onclick = function () { bs.forEach(function (x) { x.classList.toggle('on', x === b); }); fn(b); }; }); }

  /* positioning builder */
  var PP = AC.pp || [], ins = $$('#pform input'), out = $('#pout'), pn = $('#pnote');
  if (out && PP.length) {
    var m = function (f) { var i = $('#pform [data-f="' + f + '"]'); return '<mark>' + esc((i && i.value) || '…') + '</mark>'; };
    var render = function () { out.innerHTML = 'For ' + m('who') + ' who need ' + m('need') + ', ' + m('brand') + ' is the ' + m('cat') + ' that ' + m('ben') + '. Unlike ' + m('alt') + ', we ' + m('rtb') + '.'; };
    var load = function (i) { ins.forEach(function (x) { x.value = PP[i][x.dataset.f] || ''; }); var r = PP[i].tag === 'r'; pn.innerHTML = '<span class="tg ' + (r ? 'r' : 'd') + '">' + (r ? 'Our reading' : 'Draft') + '</span> ' + PP[i].note; render(); };
    ins.forEach(function (x) { x.oninput = render; });
    seg('ppre', function (b) { load(+b.dataset.p); }); load(0);
  }

  /* perceptual map */
  var pmp = $('#pmapp');
  if (pmp && AC.pm) $$('.pdot').forEach(function (g) { var f = function () { var d = AC.pm[+g.dataset.i]; pmp.innerHTML = '<b>' + d[0] + '</b>' + d[1]; }; g.addEventListener('click', f); g.addEventListener('mouseenter', f); });

  /* architecture panel (map on desktop, tree on phone) */
  var ap = $('#apanel');
  if (ap && AC.ap) $$('.anode,.atree .nd').forEach(function (n) { n.addEventListener('click', function () { $$('.anode,.atree .nd').forEach(function (x) { x.classList.toggle('on', x.dataset.k === n.dataset.k); }); var d = AC.ap[n.dataset.k]; if (d) ap.innerHTML = '<b>' + d[0] + '</b>' + d[1]; }); });

  /* personality bars: the same three brands on every page, so they can be compared */
  var bars = $('#bars');
  if (bars) {
    var D = [['Haritt Group', '/admin/academy/img/haritt.png', [4, 2, 4, 3, 1]], ['Haritt Developers', '/admin/academy/img/haritt-developers.png', [3, 4, 4, 2, 2]], ['HV Verse', '/admin/academy/img/hv-world.svg', [5, 3, 3, 2, 1]]];
    var N = ['Sincerity', 'Excitement', 'Competence', 'Sophistication', 'Ruggedness'];
    bars.innerHTML = D.map(function (d) { return '<div class="mini' + (d[0] === AC.name ? ' me' : '') + '"><div class="h"><img src="' + d[1] + '" alt=""><h4>' + d[0] + '</h4></div>' + d[2].map(function (x, i) { return '<div class="row"><span>' + N[i] + '</span><div class="pb"><i data-w="' + x * 20 + '"></i></div><b>' + x + '</b></div>'; }).join('') + '</div>'; }).join('');
    bars.classList.add('reveal'); watch(bars);
  }

  /* archetypes */
  var ar = $('#arch'), am = $('#archmsg');
  if (ar && AC.am) {
    var AR = [['Innocent', 'pure, optimistic'], ['Everyman', 'down to earth, for all'], ['Hero', 'brave, proves itself'], ['Outlaw', 'breaks the rules'], ['Explorer', 'freedom, discovery'], ['Creator', 'builds, imagines'], ['Ruler', 'control, order'], ['Magician', 'transforms'], ['Lover', 'closeness, beauty'], ['Caregiver', 'helps, protects'], ['Jester', 'fun, playful'], ['Sage', 'wisdom, clarity']];
    ar.innerHTML = AR.map(function (a) { return '<div><b>' + a[0] + '</b>' + a[1] + '</div>'; }).join('');
    var showA = function (k) { var x = AC.am[k]; [].forEach.call(ar.children, function (c, i) { c.classList.toggle('on', i === x[0][0]); c.classList.toggle('on2', i === x[0][1]); }); am.innerHTML = '<b><span class="tg r">Our reading</span></b>' + x[1]; };
    seg('archsel', function (b) { showA(b.dataset.b); }); showA(AC.amFirst || 'g');
  }

  /* logo size slider */
  var sz = $('#sz'), li = $$('.sizes img'), sm = $('#szmsg');
  if (sz) {
    var size = function () {
      var v = +sz.value; li.forEach(function (i) { i.style.width = v + 'px'; i.style.height = v + 'px'; });
      if (v >= 64) { sm.className = 'verdict good'; sm.textContent = v + 'px: all three read clearly. Fine for headers, covers and posters.'; }
      else if (v >= 32) { sm.className = 'verdict mid'; sm.textContent = v + 'px: "HARITT" is readable, "GROUP" and "DEVELOPERS" are hard. This is the Instagram, WhatsApp and LinkedIn profile size.'; }
      else { sm.className = 'verdict bad'; sm.textContent = v + 'px: the two Haritt badges become plain red circles and can\'t be told apart. HV Verse\'s orbit mark still reads, because it has no text. Browser tabs show logos at 16px.'; }
    };
    sz.oninput = size; size();
  }

  /* brand vs activation mix */
  var MX = AC.mx, mxa = $('#mixa'), mxb = $('#mixb'), mm = $('#mixmsg');
  if (MX && mxa) {
    var mix = function (i) { var x = MX[i]; mxa.style.width = x[0] + '%'; mxb.style.width = x[1] + '%'; mxa.textContent = x[3] ? 'Brand time' : 'Brand ' + x[0] + '%'; mxb.textContent = x[3] ? 'Activation time' : 'Activation ' + x[1] + '%'; mm.className = 'verdict' + (x[3] ? ' mid' : ''); mm.textContent = x[2]; };
    seg('mixsel', function (b) { mix(+b.dataset.m); }); mix(0);
  }
})();
