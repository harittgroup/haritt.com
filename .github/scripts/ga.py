"""GA4 numbers for the admin SEO page -> seo/ga.json
Per site: last 7 / 28 / 90 days (with the period before for comparison), daily visitors for 90 days,
top pages, landing pages, channels, countries, cities, devices, browsers and actions (events).
Our own admin and mock pages are left out."""
import json, os, datetime, requests
T = os.environ.get("GA_TOKEN", "")
out = {"updated": datetime.datetime.utcnow().isoformat() + "Z", "v": 2, "sites": {}, "notes": []}
H = {"Authorization": "Bearer " + T}
HOSTS = {"haritt.com": ["haritt.com", "www.haritt.com"], "developers.haritt.com": ["developers.haritt.com"], "thehvverse.com": ["thehvverse.com", "www.thehvverse.com"]}
SKIP_EV = {"page_view", "session_start", "first_visit", "user_engagement", "scroll", "form_start"}
RANGES = (7, 28, 90)


def done():
    os.makedirs("seo", exist_ok=True)
    json.dump(out, open("seo/ga.json", "w"), separators=(",", ":"))


if not T:
    out["notes"].append("No Google token"); done(); raise SystemExit
r = requests.get("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200", headers=H, timeout=30)
if not r.ok:
    out["notes"].append("Admin API %s: %s" % (r.status_code, r.text[:200].replace("\n", " "))); done(); raise SystemExit
props = [p["property"] for a in r.json().get("accountSummaries", []) for p in a.get("propertySummaries", [])]


def flt(host):
    return {"andGroup": {"expressions": [
        {"filter": {"fieldName": "hostName", "inListFilter": {"values": HOSTS[host]}}},
        {"notExpression": {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "BEGINS_WITH", "value": "/admin"}}}},
        {"notExpression": {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "CONTAINS", "value": "/mock"}}}},
    ]}}


def rng(n, back=0):
    return {"startDate": "%ddaysAgo" % (n * (back + 1)), "endDate": "%ddaysAgo" % (n * back + 1) if back else "yesterday"}


def rep(base, host, body, ranges):
    body = dict(body, dateRanges=ranges, dimensionFilter=flt(host))
    t = requests.post(base, headers=H, timeout=40, json=body)
    if not t.ok:
        raise RuntimeError("%s %s" % (t.status_code, t.text[:140].replace("\n", " ")))
    return t.json().get("rows", [])


def top(base, host, n, dim, metric, limit, extra=None):
    rows = rep(base, host, {"dimensions": [{"name": dim}], "metrics": [{"name": metric}], "limit": limit + 10,
                            "orderBys": [{"metric": {"metricName": metric}, "desc": True}]}, [rng(n)])
    res = []
    for x in rows:
        k = x["dimensionValues"][0]["value"]
        if extra and not extra(k):
            continue
        res.append([k, int(float(x["metricValues"][0]["value"]))])
    return res[:limit]


M = ["activeUsers", "newUsers", "sessions", "screenPageViews", "averageSessionDuration", "engagementRate"]
for p in props:
    base = "https://analyticsdata.googleapis.com/v1beta/%s:runReport" % p
    for host in HOSTS:
        if host in out["sites"]:
            continue
        try:
            probe = rep(base, host, {"metrics": [{"name": "sessions"}]}, [rng(90)])
            if not probe or float(probe[0]["metricValues"][0]["value"]) == 0:
                continue
            site = {"r": {}}
            for n in RANGES:
                rows = rep(base, host, {"metrics": [{"name": m} for m in M]}, [rng(n), rng(n, 1)])
                cur = prev = None
                for x in rows:
                    vals = [float(v["value"]) for v in x["metricValues"]]
                    dr = x.get("dimensionValues", [{}])
                    if dr and dr[0].get("value") == "date_range_1":
                        prev = vals
                    else:
                        cur = vals
                cur = cur or [0] * len(M)
                if len(rows) == 1 and prev is None:
                    cur = [float(v["value"]) for v in rows[0]["metricValues"]]
                o = {"users": int(cur[0]), "new": int(cur[1]), "sessions": int(cur[2]), "views": int(cur[3]),
                     "secs": int(cur[4]), "eng": round(cur[5] * 100, 1)}
                if prev:
                    o["prev"] = {"users": int(prev[0]), "sessions": int(prev[2]), "views": int(prev[3])}
                o["pages"] = top(base, host, n, "pagePath", "screenPageViews", 10)
                o["landing"] = top(base, host, n, "landingPage", "sessions", 8, lambda k: k and k != "(not set)")
                o["channels"] = top(base, host, n, "sessionDefaultChannelGroup", "sessions", 6)
                o["sources"] = top(base, host, n, "sessionSource", "sessions", 8)
                o["countries"] = top(base, host, n, "country", "activeUsers", 8)
                o["cities"] = top(base, host, n, "city", "activeUsers", 8, lambda k: k != "(not set)")
                o["devices"] = top(base, host, n, "deviceCategory", "activeUsers", 3)
                o["browsers"] = top(base, host, n, "browser", "activeUsers", 5)
                o["events"] = top(base, host, n, "eventName", "eventCount", 8, lambda k: k not in SKIP_EV)
                o["organic"] = sum(v for k, v in o["channels"] if "Organic Search" in k)
                site["r"][str(n)] = o
            dy = rep(base, host, {"dimensions": [{"name": "date"}], "metrics": [{"name": "activeUsers"}, {"name": "sessions"}],
                                  "orderBys": [{"dimension": {"dimensionName": "date"}}]}, [rng(90)])
            byd = {x["dimensionValues"][0]["value"]: [int(x["metricValues"][0]["value"]), int(x["metricValues"][1]["value"])] for x in dy}
            days = [(datetime.date.today() - datetime.timedelta(days=i)).strftime("%Y%m%d") for i in range(90, 0, -1)]
            site["daily"] = [byd.get(d, [0, 0])[0] for d in days]
            site["dailyS"] = [byd.get(d, [0, 0])[1] for d in days]
            site["dayEnd"] = days[-1]
            # keep old fields (28 days) for older pages
            o = site["r"]["28"]
            site.update({"users": o["users"], "sessions": o["sessions"], "views": o["views"], "secs": o["secs"],
                         "pages": [{"p": k, "v": v} for k, v in o["pages"][:8]], "channels": [{"c": k, "s": v} for k, v in o["channels"]]})
            out["sites"][host] = site
        except Exception as e:
            out["notes"].append("%s: %s" % (host, str(e)[:160]))
for m in HOSTS:
    if m not in out["sites"] and not any(n.startswith(m) for n in out["notes"]):
        out["notes"].append("%s: property not visible to bot (add seo-bot as Viewer)" % m)
done()
print({h: s["r"]["28"]["users"] for h, s in out["sites"].items()}, out["notes"])
