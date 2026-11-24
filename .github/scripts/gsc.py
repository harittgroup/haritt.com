"""Search Console numbers for the admin SEO page -> seo/search.json
Per site: last 7 / 28 / 90 days (and the period before), daily clicks and views on Google for 90 days,
searches, pages, countries, devices. Also positions for the keywords saved in seo/keywords.json."""
import json, os, datetime, urllib.parse, requests
T = os.environ.get("GSC_TOKEN", "")
H = {"Authorization": "Bearer " + T}
SITES = ["haritt.com", "developers.haritt.com", "thehvverse.com"]
out = {"updated": datetime.datetime.utcnow().isoformat() + "Z", "sites": {}, "notes": [], "keywords": {}}


def done():
    os.makedirs("seo", exist_ok=True)
    json.dump(out, open("seo/search.json", "w"), separators=(",", ":"))


if not T:
    out["notes"].append("No Google token"); done(); raise SystemExit
r = requests.get("https://www.googleapis.com/webmasters/v3/sites", headers=H, timeout=20)
owned = [s["siteUrl"] for s in r.json().get("siteEntry", [])] if r.ok else []
END = datetime.date.today() - datetime.timedelta(days=2)  # Search Console is about 2 days behind


def prop_for(host):
    parts = host.split(".")
    for c in ["sc-domain:" + ".".join(parts[i:]) for i in range(len(parts) - 1)] + ["https://%s/" % host]:
        if c in owned:
            return c


def q(prop, host, start, end, dims=None, limit=25, extra=None):
    body = {"startDate": str(start), "endDate": str(end), "rowLimit": limit}
    if dims:
        body["dimensions"] = dims
    f = [{"dimension": "page", "operator": "contains", "expression": "://%s/" % host}]
    if extra:
        f += extra
    body["dimensionFilterGroups"] = [{"filters": f}]
    u = "https://www.googleapis.com/webmasters/v3/sites/%s/searchAnalytics/query" % urllib.parse.quote(prop, safe="")
    t = requests.post(u, headers=H, json=body, timeout=40)
    if not t.ok:
        raise RuntimeError("%s %s" % (t.status_code, t.text[:140].replace("\n", " ")))
    return t.json().get("rows", [])


def tot(rows):
    t = rows[0] if rows else {}
    return {"clicks": int(t.get("clicks", 0)), "impr": int(t.get("impressions", 0)),
            "ctr": round(t.get("ctr", 0) * 100, 2), "pos": round(t.get("position", 0), 1)}


try:
    KW = json.load(open("seo/keywords.json")).get("list", [])
except Exception:
    KW = []

for host in SITES:
    prop = prop_for(host)
    if not prop:
        out["notes"].append("%s: not in Search Console for the bot" % host); continue
    try:
        site = {"r": {}}
        for n in (7, 28, 90):
            s, e = END - datetime.timedelta(days=n - 1), END
            ps, pe = s - datetime.timedelta(days=n), s - datetime.timedelta(days=1)
            o = tot(q(prop, host, s, e))
            o["prev"] = tot(q(prop, host, ps, pe))
            o["queries"] = [{"q": x["keys"][0], "c": int(x["clicks"]), "i": int(x["impressions"]), "p": round(x["position"], 1)}
                            for x in q(prop, host, s, e, ["query"], 50)]
            prevq = {x["keys"][0]: round(x["position"], 1) for x in q(prop, host, ps, pe, ["query"], 200)}
            for x in o["queries"]:
                if x["q"] in prevq:
                    x["pp"] = prevq[x["q"]]
            o["pages"] = [{"u": x["keys"][0], "c": int(x["clicks"]), "i": int(x["impressions"]), "p": round(x["position"], 1)}
                          for x in q(prop, host, s, e, ["page"], 20)]
            o["countries"] = [[x["keys"][0], int(x["clicks"]), int(x["impressions"])] for x in q(prop, host, s, e, ["country"], 8)]
            o["devices"] = [[x["keys"][0], int(x["clicks"]), int(x["impressions"])] for x in q(prop, host, s, e, ["device"], 3)]
            site["r"][str(n)] = o
        dy = {x["keys"][0]: x for x in q(prop, host, END - datetime.timedelta(days=89), END, ["date"], 100)}
        days = [str(END - datetime.timedelta(days=i)) for i in range(89, -1, -1)]
        site["daily"] = [[int(dy[d]["clicks"]) if d in dy else 0, int(dy[d]["impressions"]) if d in dy else 0] for d in days]
        site["dayEnd"] = days[-1]
        out["sites"][host] = site
        # saved keywords for this site: 28-day position + 14 daily positions
        for k in KW:
            if k.get("s") != host:
                continue
            ex = [{"dimension": "query", "operator": "equals", "expression": k["q"]}]
            t = tot(q(prop, host, END - datetime.timedelta(days=27), END, None, 1, ex))
            d = {x["keys"][0]: round(x["position"], 1) for x in q(prop, host, END - datetime.timedelta(days=13), END, ["date"], 20, ex)}
            pg = q(prop, host, END - datetime.timedelta(days=27), END, ["page"], 1, ex)
            out["keywords"][k["q"]] = {"pos": t["pos"] or None, "clicks": t["clicks"], "impr": t["impr"],
                                       "days": [d.get(str(END - datetime.timedelta(days=i))) or None for i in range(13, -1, -1)],
                                       "page": pg[0]["keys"][0] if pg else ""}
    except Exception as e:
        out["notes"].append("%s: %s" % (host, str(e)[:160]))
done()
print({h: s["r"]["28"]["clicks"] for h, s in out["sites"].items()}, len(out["keywords"]), out["notes"])
