"""Auto SEO: submit sitemaps to Search Console, inspect URLs, ping IndexNow, write seo/status.json."""
import json, os, sys, time, re, datetime, urllib.request, urllib.parse
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

SITES = ["haritt.com", "developers.haritt.com", "thehvverse.com"]
INSPECT_LIMIT = int(os.environ.get("INSPECT_LIMIT", "150"))  # per site, API quota is 2000/day
KEY = os.environ.get("INDEXNOW_KEY", "")
out = {"updated": datetime.datetime.utcnow().isoformat() + "Z", "sites": {}, "notes": []}

def get(url):
    try:
        r = requests.get(url, timeout=20, headers={"User-Agent": "seo-bot"})
        return r.text if r.ok else None
    except Exception:
        return None

def sitemap_urls(host):
    seen, todo, urls = set(), ["https://%s/sitemap.xml" % host], []
    while todo:
        u = todo.pop()
        if u in seen: continue
        seen.add(u)
        x = get(u)
        if not x: continue
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", x)
        (todo if "<sitemapindex" in x else urls).extend(locs)
    return urls

tok = None
sa = os.environ.get("SA", "")
if sa:
    try:
        creds = service_account.Credentials.from_service_account_info(
            json.loads(sa), scopes=["https://www.googleapis.com/auth/webmasters"])
        creds.refresh(Request()); tok = creds.token
        out["sa"] = creds.service_account_email
    except Exception as e:
        out["notes"].append("Google key error: %s" % e)
else:
    out["notes"].append("GSC_SA_JSON secret missing")
H = {"Authorization": "Bearer %s" % tok} if tok else {}

owned = {}
if tok:
    r = requests.get("https://www.googleapis.com/webmasters/v3/sites", headers=H, timeout=20)
    if r.ok:
        owned = {s["siteUrl"]: s["permissionLevel"] for s in r.json().get("siteEntry", [])}
    else:
        out["notes"].append("sites.list %s: %s" % (r.status_code, r.text[:200]))

for host in SITES:
    s = {"urls": 0, "sitemap": None, "inspected": [], "counts": {}, "indexnow": None}
    urls = sitemap_urls(host)
    s["urls"] = len(urls)
    parts = host.split(".")
    cands = ["sc-domain:" + ".".join(parts[i:]) for i in range(len(parts) - 1)] + ["https://%s/" % host]
    prop = next((p for p in cands if p in owned), None)
    s["property"] = prop
    if tok and not prop:
        s["error"] = "Not added in Search Console for this key (add %s as Owner)" % out.get("sa", "service account")
    if prop:
        smap = "https://%s/sitemap.xml" % host
        r = requests.put("https://www.googleapis.com/webmasters/v3/sites/%s/sitemaps/%s" % (
            urllib.parse.quote(prop, safe=""), urllib.parse.quote(smap, safe="")), headers=H, timeout=20)
        s["sitemap"] = "submitted" if r.status_code in (200, 204) else "error %s" % r.status_code
        # only inspect urls from prefix-matching domain
        for u in urls[:INSPECT_LIMIT]:
            try:
                r = requests.post("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                                  headers=H, json={"inspectionUrl": u, "siteUrl": prop}, timeout=30)
                if not r.ok:
                    s["inspect_error"] = "%s %s" % (r.status_code, r.text[:160]); break
                ix = r.json().get("inspectionResult", {}).get("indexStatusResult", {})
                v = ix.get("verdict", "UNKNOWN")
                s["counts"][v] = s["counts"].get(v, 0) + 1
                s["inspected"].append({"u": u, "v": v, "c": ix.get("coverageState", ""), "t": ix.get("lastCrawlTime", "")})
            except Exception as e:
                s["inspect_error"] = str(e); break
            time.sleep(0.15)
    if KEY and urls and get("https://%s/%s.txt" % (host, KEY)) == KEY:
        r = requests.post("https://api.indexnow.org/indexnow", json={"host": host, "key": KEY, "urlList": urls[:9000]}, timeout=30)
        s["indexnow"] = "pinged %s" % r.status_code
    elif urls:
        s["indexnow"] = "key file missing on site"
    out["sites"][host] = s

os.makedirs("seo", exist_ok=True)
json.dump(out, open("seo/status.json", "w"), indent=1)
print(json.dumps({h: {k: v for k, v in s.items() if k != "inspected"} for h, s in out["sites"].items()}, indent=1), out["notes"])
