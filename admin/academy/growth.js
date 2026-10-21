/* Marketing Academy, Growth unit: small calculators used inside the concept cards.
   Each tool mounts into <div class="tool" data-tool="NAME"> and reads its defaults from window.AC.tools[NAME].
   Default numbers are examples and are labelled as such; nothing here is read from a live system. */
(function () {
  var AC = window.AC || {}, T = AC.tools || {};
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(v) { v = parseFloat(String(v).replace(/,/g, '')); return isFinite(v) ? v : 0; }
  function fmt(v, d) { if (!isFinite(v)) return '-'; return Number(v).toLocaleString('en-IN', { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: 0 }); }
  function pct(v, d) { return isFinite(v) ? fmt(v * 100, d == null ? 1 : d) + '%' : '-'; }
  function field(k, label, val, extra) { return '<label>' + label + '<input data-k="' + k + '" inputmode="decimal" value="' + esc(val) + '" ' + (extra || '') + '></label>'; }
  function metric(label, val, cls) { return '<div class="gx-m' + (cls ? ' ' + cls : '') + '"><b>' + val + '</b><span>' + label + '</span></div>'; }
  function note(c) { return '<div class="gx-note">' + (c.real ? '<span class="tg v">Your data</span> ' : '<span class="tg r">Example numbers</span> ') + (c.note || 'Replace these with your own numbers from analytics. Nothing here is read from a live system.') + '</div>'; }
  function val(root, k) { var i = $('[data-k="' + k + '"]', root); return i ? i.value : ''; }
  function bind(root, fn) { $$('input,select', root).forEach(function (i) { i.addEventListener('input', fn); i.addEventListener('change', fn); }); fn(); }

  /* normal CDF (Abramowitz and Stegun 7.1.26 via erf) */
  function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
  function cdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

  var tools = {};

  /* ---------- UTM link builder ---------- */
  tools.utm = function (root) {
    var c = T.utm || {}, urls = c.urls || [['Home page', 'https://example.com/']], P = c.presets || [];
    root.innerHTML = note({ note: 'Pick a page, fill the tags, copy the link. The values below are examples of a naming habit, not real campaigns.' }) +
      (P.length ? '<div class="seg" data-seg>' + P.map(function (p, i) { return '<button type="button" data-p="' + i + '"' + (i === 0 ? ' class="on"' : '') + '>' + esc(p.label) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="gx-grid"><label>Landing page<select data-k="base">' + urls.map(function (u) { return '<option value="' + esc(u[1]) + '">' + esc(u[0]) + ' - ' + esc(u[1]) + '</option>'; }).join('') + '</select></label>' +
      field('source', 'utm_source (who sent them)', (P[0] || {}).source || 'instagram') + field('medium', 'utm_medium (type of channel)', (P[0] || {}).medium || 'social') +
      field('campaign', 'utm_campaign (which push)', (P[0] || {}).campaign || 'launch-oct') + field('content', 'utm_content (which post or ad, optional)', (P[0] || {}).content || '') + field('term', 'utm_term (keyword, optional)', '') + '</div>' +
      '<div class="gx-out"></div><div class="gx-btns"><button class="xb pri" type="button" data-copy>Copy link</button><span class="gx-ok" aria-live="polite"></span></div>';
    var out = $('.gx-out', root);
    function clean(s) { return String(s).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_.+\-]/g, ''); }
    function run() {
      var base = val(root, 'base'), q = [], warn = [];
      ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (k) {
        var raw = val(root, k), v = clean(raw); if (raw && raw.trim() !== v) warn.push('"' + esc(raw.trim()) + '" was cleaned to "' + esc(v) + '" (lowercase, no spaces)');
        if (v) q.push('utm_' + k + '=' + encodeURIComponent(v));
      });
      var miss = ['source', 'medium', 'campaign'].filter(function (k) { return !clean(val(root, k)); });
      var url = base + (base.indexOf('?') >= 0 ? '&' : '?') + q.join('&');
      root._url = url;
      out.innerHTML = '<code class="gx-url">' + esc(url) + '</code><ul class="gx-chk">' +
        '<li class="' + (miss.length ? 'bad' : 'good') + '">' + (miss.length ? 'Missing required tag: ' + miss.map(function (m) { return 'utm_' + m; }).join(', ') : 'Source, medium and campaign are all set') + '</li>' +
        '<li class="' + (/^https:/.test(base) ? 'good' : 'bad') + '">' + (/^https:/.test(base) ? 'Link uses https' : 'Link is not https') + '</li>' +
        warn.map(function (w) { return '<li class="mid">' + w + '</li>'; }).join('') + '</ul>';
    }
    $$('[data-seg] button', root).forEach(function (b) { b.onclick = function () { $$('[data-seg] button', root).forEach(function (x) { x.classList.toggle('on', x === b); }); var p = P[+b.dataset.p]; ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (k) { var i = $('[data-k="' + k + '"]', root); if (i) i.value = p[k] || ''; }); if (p.base) { var s = $('[data-k="base"]', root); if (s) s.value = p.base; } run(); }; });
    $('[data-copy]', root).onclick = function () {
      var ok = $('.gx-ok', root), u = root._url || '';
      function done(m) { ok.textContent = m; setTimeout(function () { ok.textContent = ''; }, 2200); }
      function sel() { var r = document.createRange(); r.selectNodeContents($('.gx-url', root)); var s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected. Press copy.'); }
      try { navigator.clipboard.writeText(u).then(function () { done('Copied'); }, sel); } catch (e) { sel(); }
    };
    bind(root, run);
  };

  /* ---------- funnel step rates ---------- */
  tools.funnel = function (root) {
    var c = T.funnel || { stages: [['Visitors', 1000], ['Sign-ups', 120], ['Activated', 60], ['Came back in week 2', 18]] };
    root.innerHTML = note(c) + '<div class="gx-fun">' + c.stages.map(function (s, i) {
      return '<div class="gx-fr"><input class="gx-lab" data-l="' + i + '" value="' + esc(s[0]) + '" aria-label="Stage ' + (i + 1) + ' name"><input data-k="s' + i + '" inputmode="numeric" value="' + esc(s[1]) + '" aria-label="Stage ' + (i + 1) + ' count"><div class="gx-bar"><i></i><em></em></div></div>';
    }).join('') + '</div><div class="gx-out"></div>';
    var out = $('.gx-out', root), rows = $$('.gx-fr', root);
    function run() {
      var v = c.stages.map(function (s, i) { return n(val(root, 's' + i)); }), mx = Math.max.apply(null, v.concat([1]));
      var worst = -1, wr = 2, lines = [];
      rows.forEach(function (r, i) {
        $('.gx-bar i', r).style.width = Math.max(2, v[i] / mx * 100) + '%';
        var em = $('.gx-bar em', r);
        if (i === 0) { em.textContent = 'start'; return; }
        var rate = v[i - 1] > 0 ? v[i] / v[i - 1] : NaN; em.textContent = isFinite(rate) ? pct(rate) + ' of previous' : '-';
        if (isFinite(rate) && rate < wr) { wr = rate; worst = i; }
      });
      rows.forEach(function (r, i) { r.classList.toggle('worst', i === worst); });
      var names = $$('.gx-lab', root).map(function (x) { return x.value || 'stage'; });
      out.innerHTML = '<div class="gx-mm">' + metric('start to last stage', v[0] > 0 ? pct(v[v.length - 1] / v[0], 2) : '-') + metric('weakest step', worst > 0 ? pct(wr) : '-', worst > 0 ? 'warn' : '') + '</div>' +
        '<div class="verdict ' + (worst > 0 ? 'mid' : '') + '">' + (worst > 0 ? 'Biggest drop: ' + esc(names[worst - 1]) + ' to ' + esc(names[worst]) + ' (' + pct(wr) + ' continue). Look at this step first, but only after each stage has one fixed definition. Then change one thing and measure again.' : 'Enter the counts for each stage to see where people leave.') + '</div>';
    }
    bind(root, run);
  };

  /* ---------- forecast ---------- */
  tools.forecast = function (root) {
    var c = T.forecast || {}, st = c.stages || ['Visitors per month', 'Leads', 'Qualified', 'Won'], r = c.rates || [4, 40, 25], vp = c.value;
    root.innerHTML = note(c) + '<div class="gx-grid">' + field('v', st[0], c.visitors || 1000) +
      field('r1', st[0] + ' to ' + st[1] + ' (%)', r[0]) + field('r2', st[1] + ' to ' + st[2] + ' (%)', r[1]) + field('r3', st[2] + ' to ' + st[3] + ' (%)', r[2]) +
      (vp == null ? '' : field('val', c.valueLabel || 'Value per won (Rs)', vp)) +
      '<label>What if the first step improves by <span class="gx-lv"></span><input type="range" data-k="lift" min="0" max="100" value="0" step="5"></label></div><div class="gx-out"></div>';
    var out = $('.gx-out', root);
    function run() {
      var lift = n(val(root, 'lift')) / 100; $('.gx-lv', root).textContent = '+' + fmt(lift * 100) + '%';
      function chain(l) { var a = n(val(root, 'v')), b = a * n(val(root, 'r1')) / 100 * (1 + l), cq = b * n(val(root, 'r2')) / 100, d = cq * n(val(root, 'r3')) / 100; return [a, b, cq, d]; }
      var a = chain(0), b = chain(lift), money = vp != null;
      out.innerHTML = '<div class="gx-mm">' + metric(st[1], fmt(b[1], 1)) + metric(st[2], fmt(b[2], 1)) + metric(st[3], fmt(b[3], 1), 'hi') + (money ? metric('value', 'Rs ' + fmt(b[3] * n(val(root, 'val')))) : '') + '</div>' +
        '<div class="verdict">' + (lift > 0 ? 'A +' + fmt(lift * 100) + '% better first step adds ' + fmt(b[3] - a[3], 2) + ' more ' + esc(st[3].toLowerCase()) + ' without any extra traffic. This is why teams fix conversion before buying visitors.' : 'Move the slider to see what a better first step is worth. Every rate here is an input you choose, so use your measured rates once you have them.') + '</div>';
    }
    bind(root, run);
  };

  /* ---------- A/B test sample size and result check ---------- */
  tools.ab = function (root) {
    var c = T.ab || { base: 3, mde: 20, daily: 40 };
    root.innerHTML = note(c) + '<div class="gx-sub">1 · How many visitors do I need?</div><div class="gx-grid">' + field('base', 'Current conversion rate (%)', c.base) + field('mde', 'Smallest relative lift worth detecting (%)', c.mde) +
      '<label>Power<select data-k="pow"><option value="0.8416">80% (usual)</option><option value="1.2816">90%</option></select></label><label>Significance level<select data-k="alpha"><option value="1.96">5% (usual)</option><option value="1.645">10%</option></select></label>' + field('daily', 'Visitors per day to this page', c.daily) + '</div><div class="gx-out" data-o="size"></div>' +
      '<div class="gx-sub">2 · Is my result real?</div><div class="gx-grid">' + field('na', 'A: visitors', 500) + field('ca', 'A: conversions', 15) + field('nb', 'B: visitors', 500) + field('cb', 'B: conversions', 24) + '</div><div class="gx-out" data-o="res"></div>';
    var o1 = $('[data-o=size]', root), o2 = $('[data-o=res]', root);
    function run() {
      var p1 = n(val(root, 'base')) / 100, mde = n(val(root, 'mde')) / 100, za = n(val(root, 'alpha')), zb = n(val(root, 'pow')), d = n(val(root, 'daily')), p2 = p1 * (1 + mde), pb = (p1 + p2) / 2;
      if (p1 > 0 && p1 < 1 && p2 < 1 && mde > 0) {
        var N = Math.ceil(Math.pow(za * Math.sqrt(2 * pb * (1 - pb)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2) / Math.pow(p2 - p1, 2)), days = d > 0 ? Math.ceil(2 * N / d) : NaN;
        o1.innerHTML = '<div class="gx-mm">' + metric('visitors per version', fmt(N)) + metric('both versions', fmt(2 * N)) + metric('days at this traffic', isFinite(days) ? fmt(days) : '-', days > 56 ? 'warn' : 'hi') + '</div><div class="verdict ' + (days > 56 ? 'bad' : 'good') + '">' +
          (!isFinite(days) ? 'Enter your daily visitors.' : days > 56 ? 'Too slow: ' + fmt(days) + ' days. With this little traffic, test a much bigger change, test a page with more traffic, or use the methods in the small-traffic card instead of a formal test.' : 'Realistic: run it for whole weeks and do not stop early when the result looks good.') + '</div>';
      } else o1.innerHTML = '<div class="verdict mid">Enter a conversion rate between 0 and 100 and a lift above 0.</div>';
      var na = n(val(root, 'na')), ca = n(val(root, 'ca')), nb = n(val(root, 'nb')), cb = n(val(root, 'cb'));
      if (na > 0 && nb > 0 && ca <= na && cb <= nb) {
        var a = ca / na, b = cb / nb, pp = (ca + cb) / (na + nb), se = Math.sqrt(pp * (1 - pp) * (1 / na + 1 / nb)), z = se > 0 ? (b - a) / se : 0, p = 2 * (1 - cdf(Math.abs(z))), lift = a > 0 ? (b - a) / a : NaN;
        var sig = p < (za === 1.96 ? 0.05 : 0.10);
        o2.innerHTML = '<div class="gx-mm">' + metric('A rate', pct(a, 2)) + metric('B rate', pct(b, 2)) + metric('relative lift', isFinite(lift) ? (lift >= 0 ? '+' : '') + pct(lift, 1) : '-') + metric('p-value', p < 0.001 ? '< 0.001' : p.toFixed(3), sig ? 'hi' : 'warn') + '</div><div class="verdict ' + (sig ? 'good' : 'mid') + '">' +
          (sig ? 'The difference is unlikely to be chance at your chosen level. Check you reached the planned sample size before you call it.' : 'Not enough evidence yet. The gap could easily be chance. Keep running to the planned sample size, or accept that this change does not matter much.') + ' Two-sided two-proportion z-test.</div>';
      } else o2.innerHTML = '<div class="verdict mid">Conversions cannot be more than visitors.</div>';
    }
    bind(root, run);
  };

  /* ---------- ICE prioritisation ---------- */
  tools.ice = function (root) {
    var c = T.ice || { ideas: [['Example idea A', 8, 6, 7, ''], ['Example idea B', 5, 8, 9, ''], ['Example idea C', 9, 4, 3, '']] };
    root.innerHTML = note(c) + '<div class="seg" data-icem><button type="button" class="on" data-mo="avg">Average of I, C, E</button><button type="button" data-mo="mul">Multiply I x C x E</button></div><div class="tw gx-tw"><table class="gx-ice"><tr><th>Idea</th><th>Impact</th><th>Confidence</th><th>Ease</th><th>Score</th></tr></table></div><div class="gx-btns"><button class="xb" type="button" data-add>Add an idea</button><button class="xb" type="button" data-reset>Reset</button></div><div class="gx-out"></div>';
    var tb = $('table', root), mode = 'avg', out = $('.gx-out', root);
    function rows() { return $$('tr', tb).filter(function (r) { return r.querySelector('td'); }); }
    function rowHtml(d) { return '<tr><td data-l="Idea"><input class="gx-nm" value="' + esc(d[0]) + '" aria-label="Idea"><small>' + (d[4] || '') + '</small></td><td data-l="Impact"><input type="number" min="1" max="10" value="' + d[1] + '" aria-label="Impact 1 to 10"></td><td data-l="Confidence"><input type="number" min="1" max="10" value="' + d[2] + '" aria-label="Confidence 1 to 10"></td><td data-l="Ease"><input type="number" min="1" max="10" value="' + d[3] + '" aria-label="Ease 1 to 10"></td><td data-l="Score" class="gx-sc"></td></tr>'; }
    function load() { rows().forEach(function (r) { r.remove(); }); c.ideas.forEach(function (d) { tb.insertAdjacentHTML('beforeend', rowHtml(d)); }); }
    function score(r) { var i = $$('input[type=number]', r).map(function (x) { return Math.max(1, Math.min(10, n(x.value) || 1)); }); return mode === 'avg' ? (i[0] + i[1] + i[2]) / 3 : i[0] * i[1] * i[2]; }
    function run(sort) {
      var rs = rows(); rs.forEach(function (r) { $('.gx-sc', r).textContent = fmt(score(r), mode === 'avg' ? 1 : 0); r._s = score(r); });
      if (sort) { rs.sort(function (a, b) { return b._s - a._s; }).forEach(function (r) { tb.appendChild(r); }); }
      var top = rows().sort(function (a, b) { return b._s - a._s; })[0];
      out.innerHTML = top ? '<div class="verdict good">Highest score: ' + esc($('.gx-nm', top).value || 'unnamed idea') + '. Scores are judgement, not data, so treat the order as a starting point and re-score after each test.</div>' : '';
    }
    tb.addEventListener('input', function () { run(false); }); tb.addEventListener('change', function () { run(true); });
    $$('[data-icem] button', root).forEach(function (b) { b.onclick = function () { $$('[data-icem] button', root).forEach(function (x) { x.classList.toggle('on', x === b); }); mode = b.dataset.mo; run(true); }; });
    $('[data-add]', root).onclick = function () { tb.insertAdjacentHTML('beforeend', rowHtml(['New idea', 5, 5, 5, ''])); run(false); };
    $('[data-reset]', root).onclick = function () { load(); run(true); };
    load(); run(true);
  };

  /* ---------- CAC, LTV, payback ---------- */
  tools.cac = function (root) {
    var c = T.cac || { spend: 10000, cust: 8, value: 5000, margin: 60, months: 6 };
    root.innerHTML = note(c) + '<div class="gx-grid">' + field('spend', c.spendLabel || 'Total acquisition spend (Rs), including paid tools and your time at a fair rate', c.spend) + field('cust', c.custLabel || 'New customers won in the same period', c.cust) +
      field('value', c.valueLabel || 'Revenue per customer per month (Rs)', c.value) + field('margin', 'Gross margin (%)', c.margin) + field('months', c.monthsLabel || 'Months a customer stays', c.months) + '</div><div class="gx-out"></div>';
    var out = $('.gx-out', root);
    function run() {
      var sp = n(val(root, 'spend')), cu = n(val(root, 'cust')), v = n(val(root, 'value')), m = n(val(root, 'margin')) / 100, mo = n(val(root, 'months'));
      var cac = cu > 0 ? sp / cu : NaN, gp = v * m, ltv = gp * mo, ratio = cac > 0 ? ltv / cac : NaN, pay = gp > 0 ? cac / gp : NaN;
      if (v <= 0) { out.innerHTML = '<div class="gx-mm">' + metric('cost per customer (CAC)', isFinite(cac) ? 'Rs ' + fmt(cac) : '-', 'hi') + '</div><div class="verdict mid">No revenue per customer is entered. For a free product, judge the cost per ACTIVATED user and the day-30 retention instead of LTV, and decide what a retained user is worth to the business later.</div>'; return; }
      var tone = !isFinite(ratio) ? 'mid' : ratio >= 3 ? 'good' : ratio >= 1 ? 'mid' : 'bad';
      out.innerHTML = '<div class="gx-mm">' + metric('CAC (cost per customer)', isFinite(cac) ? 'Rs ' + fmt(cac) : '-') + metric('gross profit per month', 'Rs ' + fmt(gp)) + metric('LTV (lifetime value)', 'Rs ' + fmt(ltv)) + metric('LTV : CAC', isFinite(ratio) ? fmt(ratio, 1) + ' : 1' : '-', 'hi') + metric('payback', isFinite(pay) ? fmt(pay, 1) + ' months' : '-') + '</div>' +
        '<div class="verdict ' + tone + '">' + (!isFinite(ratio) ? 'Enter spend and at least one customer.' : ratio >= 3 ? 'LTV is at least 3 times CAC, a common rule of thumb for healthy economics.' : ratio >= 1 ? 'You earn back the cost, but thinly. Raise conversion, retention or price, or lower the cost of winning a customer.' : 'Each customer costs more to win than they return. Fix this before spending more.') + ' Rules of thumb vary by business, so treat them as a prompt, not a law.</div>';
    }
    bind(root, run);
  };

  /* ---------- retention by cohort ---------- */
  tools.cohort = function (root) {
    var c = T.cohort || { rows: [['Week 1 users', 100, 38, 21, 14], ['Week 2 users', 120, 41, 25, 18]] };
    root.innerHTML = note(c) + '<div class="tw gx-tw"><table class="gx-coh"><tr><th>Cohort</th><th>Started (day 0)</th><th>Active day 1</th><th>Active day 7</th><th>Active day 30</th></tr>' + c.rows.map(function (r, i) {
      return '<tr><td data-l="Cohort"><input class="gx-nm" data-k="l' + i + '" value="' + esc(r[0]) + '" aria-label="Cohort name"></td>' + [1, 2, 3, 4].map(function (j) { return '<td data-l="' + ['', 'Started (day 0)', 'Active day 1', 'Active day 7', 'Active day 30'][j] + '"><input type="number" min="0" data-k="c' + i + '_' + j + '" value="' + r[j] + '" aria-label="' + ['', 'Started', 'Day 1', 'Day 7', 'Day 30'][j] + ' users"></td>'; }).join('') + '</tr>';
    }).join('') + '</table></div><div class="gx-out"></div>';
    var out = $('.gx-out', root);
    function run() {
      var h = '<div class="tw gx-tw"><table class="gx-res"><tr><th>Cohort</th><th>D1</th><th>D7</th><th>D30</th><th>Shape</th></tr>';
      c.rows.forEach(function (r, i) {
        var s = n(val(root, 'c' + i + '_1')), d = [2, 3, 4].map(function (j) { return s > 0 ? n(val(root, 'c' + i + '_' + j)) / s : NaN; });
        var shape = !isFinite(d[1]) || !isFinite(d[2]) || d[1] <= 0 ? '-' : d[2] / d[1] >= 0.6 ? 'Flattening: some users stay' : 'Still falling: no habit yet';
        h += '<tr><td data-l="Cohort">' + esc(val(root, 'l' + i)) + '</td>' + d.map(function (x, k) { return '<td data-l="' + ['D1', 'D7', 'D30'][k] + '"><span class="gx-heat" style="--h:' + (isFinite(x) ? Math.min(1, x) : 0) + '">' + pct(x, 0) + '</span></td>'; }).join('') + '<td data-l="Shape">' + shape + '</td></tr>';
      });
      out.innerHTML = h + '</table></div><div class="verdict">Day-N retention = users active on day N divided by users who started on day 0. Compare cohorts that started in the same way. A curve that flattens means a group has found lasting value; a curve that keeps falling to zero means the product is not yet a habit. The "flattening" label is a rough rule (D30 at least 60% of D7), not a standard.</div>';
    }
    bind(root, run);
  };

  function mountTool(r) { var f = tools[r.dataset.tool]; if (f) { try { f(r); } catch (e) { r.innerHTML = '<div class="verdict bad">This calculator could not load.</div>'; } } }
  var ALLT = T, BRN = { gg: 'Haritt Group', gd: 'Haritt Developers', gh: 'HV Verse' };
  $$('.tool[data-tool]').forEach(function (r) {
    if (!(ALLT && ALLT.gg)) { mountTool(r); return; }
    var wrap = document.createElement('div'); wrap.className = 'gx-bwrap'; r.parentNode.insertBefore(wrap, r);
    var bar = document.createElement('div'); bar.className = 'gx-bsw'; bar.innerHTML = '<span>Try it with</span>' + ['gg', 'gd', 'gh'].map(function (k) { return '<button type="button" data-k="' + k + '">' + BRN[k] + '</button>'; }).join('');
    wrap.appendChild(bar); wrap.appendChild(r);
    var cur = r;
    function pick(k) {
      T = ALLT[k];
      var n = document.createElement('div'); n.className = r.className; n.dataset.tool = r.dataset.tool;
      wrap.replaceChild(n, cur); cur = n; mountTool(n);
      $$('button', bar).forEach(function (b) { b.classList.toggle('on', b.dataset.k === k); });
    }
    bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pick(b.dataset.k); });
    pick('gg');
  });
})();
