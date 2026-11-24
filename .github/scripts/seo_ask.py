"""'Ask Google' from the admin SEO page: for each page, send Google's re-index request (Indexing API),
ping Bing (IndexNow), then check the page live in Search Console and update seo/status.json."""
import json, os, time, datetime, urllib.parse, requests
D = json.loads(os.environ.get("SEO_DATA") or "{}")
T = os.environ.get("GSC_TOKEN", "")
KEY = os.environ.get("INDEXNOW_KEY", "")
H = {"Authorization": "Bearer " + T}
NOW = datetime.datetime.utcnow().isoformat() + "Z"
st = json.load(open("seo/status.json"))
site = D.get("site")
S = st.get("sites", {}).get(site)


def log(ok, msg):
    try:
        L = json.load(open("seo/edits.json"))
    except Exception:
        L = []
    L.insert(0, {"at": NOW, "kind": "ask", "ok": ok, "msg": msg, "by": D.get("by", ""), "site": site})
    json.dump(L[:40], open("seo/edits.json", "w"), indent=1)
    print(ok, msg)


if not S or not T:
    log(False, "Google login failed" if not T else "unknown site"); raise SystemExit
rows = {r["u"]: r for r in S.get("inspected", [])}
urls = [u for u in (D.get("urls") or [r["u"] for r in rows.values() if r.get("v") != "PASS"]) if u.startswith("https://%s/" % site)][:30]
r = requests.get("https://www.googleapis.com/webmasters/v3/sites", headers=H, timeout=20)
owned = [x["siteUrl"] for x in r.json().get("siteEntry", [])] if r.ok else []
pts = site.split(".")
prop = next((c for c in ["sc-domain:" + ".".join(pts[i:]) for i in range(len(pts) - 1)] + ["https://%s/" % site] if c in owned), None)
sent = added = 0; limit = False
for u in urls:
    row = rows.get(u) or {"u": u}
    if not limit:
        rr = requests.post("https://indexing.googleapis.com/v3/urlNotifications:publish", headers=H, json={"url": u, "type": "URL_UPDATED"}, timeout=20)
        if rr.ok:
            row["req"] = "requested"; sent += 1
        elif rr.status_code == 429:
            row["req"] = "Daily limit, retry tomorrow"; limit = True
        else:
            row["req"] = "error %s" % rr.status_code
    row["asked"] = NOW
    if prop:
        x = requests.post("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", headers=H,
                          json={"inspectionUrl": u, "siteUrl": prop}, timeout=30)
        if x.ok:
            ix = x.json().get("inspectionResult", {}).get("indexStatusResult", {})
            row.update({"v": ix.get("verdict", row.get("v", "UNKNOWN")), "c": ix.get("coverageState", row.get("c", "")),
                        "t": ix.get("lastCrawlTime", row.get("t", ""))}); row.pop("stale", None)
            added += row["v"] == "PASS"
    rows[u] = row
    time.sleep(0.4)
S["inspected"] = list(rows.values())
S["counts"] = {}
for x in S["inspected"]:
    S["counts"][x.get("v", "UNKNOWN")] = S["counts"].get(x.get("v", "UNKNOWN"), 0) + 1
if KEY and urls:
    try:
        requests.post("https://api.indexnow.org/indexnow", json={"host": site, "key": KEY, "urlList": urls}, timeout=20)
    except Exception:
        pass
json.dump(st, open("seo/status.json", "w"), indent=1)
n = len(urls)
msg = "Asked Google to add %d page%s on %s" % (sent, "" if sent == 1 else "s", site)
if added: msg += ", %d already on Google" % added
if limit: msg += ". Google's daily limit reached, rest go tomorrow by themselves"
log(sent > 0 or added > 0, msg if n else "Nothing to ask on %s, all pages are on Google" % site)
