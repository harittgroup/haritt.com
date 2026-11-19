/* Haritt styled QR: round dots, rounded finder eyes, flame in the centre. Needs qrcode.js (qrcode-generator). */
function harittQR(text, o) {
  o = Object.assign({ dot: '#8B0D0D', dot2: null, eye: '#8B0D0D', eyeIn: '#8B0D0D', shape: 'dot', eyeShape: 'round', logo: 'flame-wm.png', logoBox: true, size: 0.22 }, o || {});
  var q = qrcode(0, 'H'); q.addData(text); q.make();
  var n = q.getModuleCount(), m = 4, W = n + m * 2, s = '', id = 'g' + Math.random().toString(36).slice(2, 7);
  var L = Math.round(n * o.size); if ((n - L) % 2) L++; var l0 = (n - L) / 2, l1 = l0 + L;
  var inEye = function (r, c) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); };
  var fill = o.dot2 ? 'url(#' + id + ')' : o.dot;
  for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
    if (!q.isDark(r, c) || inEye(r, c)) continue;
    if (o.logo && r >= l0 - 1 && r < l1 + 1 && c >= l0 - 1 && c < l1 + 1) continue;
    var x = c + m, y = r + m;
    if (o.shape === 'dot') s += '<circle cx="' + (x + .5) + '" cy="' + (y + .5) + '" r=".44"/>';
    else s += '<rect x="' + (x + .07) + '" y="' + (y + .07) + '" width=".86" height=".86" rx=".3"/>';
  }
  var eye = function (x, y) {
    x += m; y += m;
    if (o.eyeShape === 'circle') return '<circle cx="' + (x + 3.5) + '" cy="' + (y + 3.5) + '" r="3" fill="none" stroke="' + o.eye + '" stroke-width="1"/><circle cx="' + (x + 3.5) + '" cy="' + (y + 3.5) + '" r="1.55" fill="' + o.eyeIn + '"/>';
    return '<rect x="' + (x + .5) + '" y="' + (y + .5) + '" width="6" height="6" rx="1.9" fill="none" stroke="' + o.eye + '" stroke-width="1"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" rx=".9" fill="' + o.eyeIn + '"/>';
  };
  var g = o.dot2 ? '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + o.dot + '"/><stop offset="1" stop-color="' + o.dot2 + '"/></linearGradient></defs>' : '';
  var lg = '';
  if (o.logo) {
    var cx = m + n / 2, bx = l0 + m - .6, bw = L + 1.2;
    if (o.logoBox) lg += '<rect x="' + bx + '" y="' + bx + '" width="' + bw + '" height="' + bw + '" rx="' + (bw * .26) + '" fill="#fff"/>';
    var lh = L * (o.ratio ? .95 : .82), lw = lh * (o.ratio || 0.67);
    lg += '<image href="' + o.logo + '" x="' + (cx - lw / 2) + '" y="' + (cx - lh / 2) + '" width="' + lw + '" height="' + lh + '"/>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + W + '" shape-rendering="geometricPrecision">' + g + '<rect width="' + W + '" height="' + W + '" fill="#fff"/><g fill="' + fill + '">' + s + '</g>' + eye(0, 0) + eye(n - 7, 0) + eye(0, n - 7) + lg + '</svg>';
}
