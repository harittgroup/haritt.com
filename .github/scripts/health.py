"""Page health for the admin SEO page -> seo/health.json
Opens every page in each sitemap like Google does and checks titles, descriptions, H1, canonical,
image text, broken links, schema and share preview. Phone speed comes from Google PageSpeed (free)."""
import json, os, re, datetime, html, urllib.parse, requests
from html.parser import HTMLParser
SITES = ["haritt.com", "developers.haritt.com", "thehvverse.com"]
UA = {"User-Agent": "Mozilla/5.0 (compatible; HarittSEO/1.0)"}
out = {"updated": datetime.datetime.utcnow().isoformat() + "Z", "sites": {}, "notes": []}


def get(u, t=20):
    try:
        return requests.get(u, timeout=t, headers=UA, allow_redirects=True)
    except Exception:
        return None


def sitemap(host):
    seen, todo, urls = set(), ["https://%s/sitemap.xml" % host], []
    while todo:
        u = todo.pop()
        if u in seen:
            continue
        seen.add(u)
        r = get(u)
        if not r or not r.ok:
            continue
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", r.text)
        (todo if "<sitemapindex" in r.text else urls).extend(locs)
    return list(dict.fromkeys(urls))[:120]


class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.title = ""; s.in_t = False; s.meta = {}; s.h1 = 0; s.canon = ""; s.imgs = []; s.links = []; s.ld = 0; s.in_ld = False
    def handle_starttag(s, tag, a):
        a = dict(a)
        if tag == "title": s.in_t = True
        elif tag == "meta":
            k = (a.get("name") or a.get("property") or "").lower()
            if k: s.meta[k] = a.get("content") or ""
        elif tag == "h1": s.h1 += 1
        elif tag == "link" and (a.get("rel") or "").lower() == "canonical": s.canon = a.get("href") or ""
        elif tag == "img": s.imgs.append((a.get("src") or a.get("data-src") or "", a.get("alt")))
        elif tag == "a" and a.get("href"): s.links.append(a["href"])
        elif tag == "script" and (a.get("type") or "") == "application/ld+json": s.ld += 1
    def handle_endtag(s, tag):
        if tag == "title": s.in_t = False
    def handle_data(s, d):
        if s.in_t: s.title += d


LINK_OK = {}


def link_ok(u):
    if u in LINK_OK:
        return LINK_OK[u]
    try:
        r = requests.head(u, timeout=12, headers=UA, allow_redirects=True)
        if r.status_code in (405, 403, 400):
            r = requests.get(u, timeout=12, headers=UA, allow_redirects=True)
        ok = r.status_code < 400
    except Exception:
        ok = False
    LINK_OK[u] = ok
    return ok


def psi(u):
    try:
        prm = {"url": u, "strategy": "mobile", "category": "performance"}
        tk = os.environ.get("GSC_TOKEN")
        r = requests.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed", params=prm, timeout=90, headers={"Authorization": "Bearer " + tk} if tk else {})
        if not r.ok and tk:
            r = requests.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed", params=prm, timeout=90)
        if not r.ok:
            return {"err": "%s" % r.status_code}
        j = r.json(); a = j.get("lighthouseResult", {}).get("audits", {}); fe = j.get("loadingExperience", {}).get("metrics", {})
        lcp = (fe.get("LARGEST_CONTENTFUL_PAINT_MS", {}).get("percentile") or a.get("largest-contentful-paint", {}).get("numericValue", 0)) / 1000
        inp = fe.get("INTERACTION_TO_NEXT_PAINT", {}).get("percentile") or a.get("total-blocking-time", {}).get("numericValue", 0)
        cls = fe.get("CUMULATIVE_LAYOUT_SHIFT_SCORE", {}).get("percentile")
        cls = cls / 100 if cls is not None else a.get("cumulative-layout-shift", {}).get("numericValue", 0)
        sc = j.get("lighthouseResult", {}).get("categories", {}).get("performance", {}).get("score")
        return {"lcp": round(lcp, 2), "inp": int(inp), "cls": round(cls, 3), "score": int((sc or 0) * 100), "field": bool(fe)}
    except Exception as e:
        return {"err": str(e)[:80]}


try:
    prev = json.load(open("seo/health.json"))
except Exception:
    prev = {}

for host in SITES:
    urls = sitemap(host)
    pages, issues, titles, descs = [], {k: [] for k in ("title", "desc", "h1", "canon", "alt", "links", "schema", "og", "noindex")}, {}, {}
    for u in urls:
        r = get(u)
        path = urllib.parse.urlparse(u).path or "/"
        if not r or not r.ok:
            issues["links"].append([path, "page does not open (%s)" % (r.status_code if r else "no answer")]); continue
        p = P()
        try:
            p.feed(r.text)
        except Exception:
            pass
        t = html.unescape(p.title.strip()); d = html.unescape(p.meta.get("description", "").strip())
        pages.append({"u": path, "t": t, "d": d, "img": [s for s, a in p.imgs if s][:6]})
        if not t: issues["title"].append([path, "no title"])
        elif len(t) > 60: issues["title"].append([path, "%d characters, Google cuts after 60" % len(t)])
        elif len(t) < 25: issues["title"].append([path, "only %d characters" % len(t)])
        titles.setdefault(t, []).append(path)
        if not d: issues["desc"].append([path, "no description"])
        elif len(d) > 160: issues["desc"].append([path, "%d characters, Google cuts after 160" % len(d)])
        elif len(d) < 70: issues["desc"].append([path, "only %d characters" % len(d)])
        if d: descs.setdefault(d, []).append(path)
        if p.h1 != 1: issues["h1"].append([path, "no H1" if p.h1 == 0 else "%d H1 headings" % p.h1])
        if not p.canon: issues["canon"].append([path, "no main address (canonical)"])
        elif urllib.parse.urlparse(urllib.parse.urljoin(u, p.canon)).netloc not in (host, "www." + host):
            issues["canon"].append([path, "points to another site"])
        miss = [s for s, a in p.imgs if a is None or (a.strip() == "" and "logo" not in s.lower())]
        if miss: issues["alt"].append([path, "%d image%s without text" % (len(miss), "s" if len(miss) > 1 else "")])
        if not p.ld: issues["schema"].append([path, "no Google data (schema)"])
        if not (p.meta.get("og:title") and p.meta.get("og:image")): issues["og"].append([path, "no share image or title"])
        if "noindex" in p.meta.get("robots", "").lower(): issues["noindex"].append([path, "hidden from Google (noindex)"])
        bad = []
        for h in dict.fromkeys(p.links):
            if h.startswith(("mailto:", "tel:", "#", "javascript:", "whatsapp:")):
                continue
            full = urllib.parse.urljoin(u, h).split("#")[0]
            if urllib.parse.urlparse(full).netloc not in (host, "www." + host):
                continue
            if not link_ok(full):
                bad.append(urllib.parse.urlparse(full).path)
        for b in bad[:5]:
            issues["links"].append([path, "link to %s is broken" % b])
    for t, L in titles.items():
        if t and len(L) > 1:
            issues["title"].append([L[1], "same title as %s" % L[0]])
    for d, L in descs.items():
        if len(L) > 1:
            issues["desc"].append([L[1], "same description as %s" % L[0]])
    n = max(1, len(pages))
    W = {"title": 3, "desc": 2, "h1": 1.5, "canon": 1.5, "alt": 1, "links": 3, "schema": 0.5, "og": 1, "noindex": 4}
    pen = sum(W[k] * len(v) for k, v in issues.items()) / n * 6
    speed = psi("https://%s/" % host)
    if speed.get("err"):
        speed = (prev.get("sites", {}).get(host, {}) or {}).get("speed") or speed
    out["sites"][host] = {"pages": len(pages), "score": max(0, min(100, int(round(100 - pen)))), "issues": issues, "speed": speed,
                          "meta": pages}
os.makedirs("seo", exist_ok=True)
json.dump(out, open("seo/health.json", "w"), separators=(",", ":"))
print({h: (s["pages"], s["score"], {k: len(v) for k, v in s["issues"].items()}, s["speed"]) for h, s in out["sites"].items()})
