"""GA4 numbers for admin: last 28 days per property -> seo/ga.json"""
import json, os, datetime, requests
T = os.environ.get("GA_TOKEN", "")
MAP = {"G-35VQ0SCDKM": "haritt.com", "G-ERL2FMV2TG": "developers.haritt.com", "G-ERS8360P56": "thehvverse.com"}
out = {"updated": datetime.datetime.utcnow().isoformat() + "Z", "sites": {}, "notes": []}
H = {"Authorization": "Bearer " + T}
def done():
    os.makedirs("seo", exist_ok=True); json.dump(out, open("seo/ga.json", "w"), indent=1)
if not T:
    out["notes"].append("No Google token"); done(); raise SystemExit
r = requests.get("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200", headers=H, timeout=30)
if not r.ok:
    out["notes"].append("Admin API %s: %s" % (r.status_code, r.text[:200].replace("\n", " "))); done(); raise SystemExit
props = [p["property"] for a in r.json().get("accountSummaries", []) for p in a.get("propertySummaries", [])]
out["found"] = props
HOSTS = {"haritt.com": ["haritt.com", "www.haritt.com"], "developers.haritt.com": ["developers.haritt.com"], "thehvverse.com": ["thehvverse.com", "www.thehvverse.com"]}
def rep(base, host, body):
    body["dateRanges"] = [{"startDate": "28daysAgo", "endDate": "yesterday"}]
    body["dimensionFilter"] = {"filter": {"fieldName": "hostName", "inListFilter": {"values": HOSTS[host]}}}
    return requests.post(base, headers=H, timeout=30, json=body)
for p in props:
    base = "https://analyticsdata.googleapis.com/v1beta/%s:runReport" % p
    for host in HOSTS:
        if host in out["sites"]: continue
        t = rep(base, host, {"metrics": [{"name": m} for m in ("activeUsers", "sessions", "screenPageViews", "averageSessionDuration")]})
        if not t.ok:
            out["notes"].append("%s: %s %s" % (host, t.status_code, t.text[:140].replace("\n", " "))); continue
        rows = t.json().get("rows")
        if not rows: continue
        v = [float(x["value"]) for x in rows[0]["metricValues"]]
        if v[1] == 0: continue
        pg = rep(base, host, {"dimensions": [{"name": "pagePath"}], "metrics": [{"name": "screenPageViews"}], "limit": 8, "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}]}).json().get("rows", [])
        src = rep(base, host, {"dimensions": [{"name": "sessionDefaultChannelGroup"}], "metrics": [{"name": "sessions"}], "limit": 6, "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}]}).json().get("rows", [])
        dy = rep(base, host, {"dimensions": [{"name": "date"}], "metrics": [{"name": "activeUsers"}], "orderBys": [{"dimension": {"dimensionName": "date"}}]}).json().get("rows", [])
        out["sites"][host] = {"users": int(v[0]), "sessions": int(v[1]), "views": int(v[2]), "secs": int(v[3]),
            "pages": [{"p": r["dimensionValues"][0]["value"], "v": int(r["metricValues"][0]["value"])} for r in pg],
            "channels": [{"c": r["dimensionValues"][0]["value"], "s": int(r["metricValues"][0]["value"])} for r in src],
            "daily": [int(r["metricValues"][0]["value"]) for r in dy]}
for m in HOSTS:
    if m not in out["sites"] and not any(n.startswith(m) for n in out["notes"]):
        out["notes"].append("%s: property not visible to bot (add seo-bot as Viewer)" % m)
done()
