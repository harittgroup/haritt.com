/* Joining backend. JOIN_API = fast Cloudflare edge ("haritt-join" Worker) in front of the Apps Script.
   If the edge cannot be reached, calls go straight to the Apps Script (JOIN_SCRIPT). */
window.JOIN_API = "https://haritt-join.harittgroup.workers.dev";
window.JOIN_SCRIPT = "https://script.google.com/macros/s/AKfycbyjVZM40H9UKE_JgpAjn1R288XZTc94V74XshoqFqgKWycPcqXh4423V-1Oc9f5AU-OFw/exec";
window.joinFetch = function (body) {
  var o = function (u) { return fetch(u, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); }); };
  return o(window.JOIN_API).catch(function () { return o(window.JOIN_SCRIPT); });
};
