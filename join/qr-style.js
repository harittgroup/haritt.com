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
/* Flame drawn with dots inside the QR (no image). Returns a Promise of SVG text. */
function harittQRDots(text, o) {
  o = Object.assign({ dot: '#1A1715', eye: '#8B0D0D', eyeIn: '#8B0D0D', flame: '#8B0D0D', flame2: null, density: 2, size: 0.3, mask: 'flame-wm.png', dotR: .5 }, o || {});
  return new Promise(function (res) {
    var img = new Image(); img.onload = function () {
      var q = qrcode(0, 'H'); q.addData(text); q.make();
      var n = q.getModuleCount(), m = 4, W = n + m * 2, id = 'f' + Math.random().toString(36).slice(2, 7);
      var L = Math.round(n * o.size); if ((n - L) % 2) L++; var l0 = (n - L) / 2;
      var inEye = function (r, c) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); };
      /* flame mask fitted into the centre box */
      var D = o.density, G = L * D, cv = document.createElement('canvas'); cv.width = cv.height = G; var x = cv.getContext('2d');
      var ar = img.width / img.height, fh = G * .96, fw = fh * ar; x.drawImage(img, (G - fw) / 2, (G - fh) / 2, fw, fh);
      var px = x.getImageData(0, 0, G, G).data, on = function (i, j) { return i >= 0 && j >= 0 && i < G && j < G && px[(i * G + j) * 4 + 3] > 110; };
      var s = '', f = '';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
        if (!q.isDark(r, c) || inEye(r, c)) continue;
        if (r >= l0 && r < l0 + L && c >= l0 && c < l0 + L) continue;
        s += '<circle cx="' + (c + m + .5) + '" cy="' + (r + m + .5) + '" r="' + o.dotR + '"/>';
      }
      var step = 1 / D;
      for (var i = 0; i < G; i++) for (var j = 0; j < G; j++) if (on(i, j)) f += '<circle cx="' + (l0 + m + (j + .5) * step) + '" cy="' + (l0 + m + (i + .5) * step) + '" r="' + (step * .42) + '"/>';
      var eye = function (X, Y) { X += m; Y += m; return '<rect x="' + (X + .5) + '" y="' + (Y + .5) + '" width="6" height="6" rx="1.9" fill="none" stroke="' + o.eye + '" stroke-width="1"/><rect x="' + (X + 2) + '" y="' + (Y + 2) + '" width="3" height="3" rx=".9" fill="' + o.eyeIn + '"/>'; };
      var g = o.flame2 ? '<defs><linearGradient id="' + id + '" x1="0" y1="1" x2=".6" y2="0"><stop offset="0" stop-color="' + o.flame + '"/><stop offset="1" stop-color="' + o.flame2 + '"/></linearGradient></defs>' : '';
      res('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + W + '">' + g + '<rect width="' + W + '" height="' + W + '" fill="#fff"/><g fill="' + o.dot + '">' + s + '</g><g fill="' + (o.flame2 ? 'url(#' + id + ')' : o.flame) + '">' + f + '</g>' + eye(0, 0) + eye(n - 7, 0) + eye(0, n - 7) + '</svg>');
    }; img.src = o.mask;
  });
}
