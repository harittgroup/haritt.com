"""Covers for the admin Brand assets page -> admin/media/covers.json + admin/media/img/*.jpg
Every page in the 3 sitemaps gets a 1920x1080 cover (the top of the live page). New pages are shot the same morning,
existing covers are refreshed every 30 days, and pages that left the sitemap lose their cover."""
import json, os, re, subprocess, sys, urllib.parse, requests
SITES = {"haritt.com": "haritt", "developers.haritt.com": "dev", "thehvverse.com": "hvv"}
UA = {"User-Agent": "Mozilla/5.0 (compatible; HarittSEO/1.0)"}
F = "admin/media/covers.json"
covers = json.load(open(F)) if os.path.exists(F) else []
have = {c["u"] for c in covers}


def sitemap(host):
    seen, todo, urls = set(), ["https://%s/sitemap.xml" % host], []
    while todo:
        u = todo.pop()
        if u in seen: continue
        seen.add(u)
        try:
            r = requests.get(u, timeout=20, headers=UA)
        except Exception:
            continue
        if not r.ok: continue
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", r.text)
        (todo if "<sitemapindex" in r.text else urls).extend(locs)
    return list(dict.fromkeys(urls))


import datetime
TODAY = datetime.date.today()
by = {c["u"]: c for c in covers}
new, live = [], {}
for host in SITES:
    urls = sitemap(host)
    if not urls: continue
    live[host] = set()
    for u in urls:
        p = urllib.parse.urlparse(u)
        key = p.netloc.replace("www.", "") + (p.path or "/")
        if "/admin" in p.path or "/mock" in p.path: continue
        live[host].add(key)
        c = by.get(key)
        old = not c or not c.get("d") or (TODAY - datetime.date.fromisoformat(c["d"])).days >= 30
        if old: new.append((host, u, key))
# pages that left the sitemap: drop their covers
for c in list(covers):
    if c["s"] in live and c["u"] not in live[c["s"]]:
        covers.remove(c)
        for x in ("", "-s"):
            try: os.remove("admin/media/img/%s%s.jpg" % (c["f"], x))
            except OSError: pass
new = new[:40]
print("new pages:", [k for _, _, k in new])
if not new:
    json.dump(covers, open(F, "w"), indent=1); raise SystemExit
try:
    import playwright, PIL  # noqa
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "playwright", "pillow"], check=True)
    subprocess.run([sys.executable, "-m", "playwright", "install", "--with-deps", "chromium"], check=True, stdout=subprocess.DEVNULL)
from playwright.sync_api import sync_playwright
from PIL import Image
os.makedirs("admin/media/img", exist_ok=True)
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=os.environ.get("CHROME") or None)
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    for host, u, key in new:
        try:
            pg.goto(u, wait_until="networkidle", timeout=45000); pg.wait_for_timeout(1500)
            t = (pg.title() or key).strip()
            t = re.split(r"\s+[|·–-]\s+", t)[0][:60] or key
            slug = SITES[host] + "-" + (re.sub(r"[^a-z0-9]+", "-", urllib.parse.urlparse(u).path.lower()).strip("-") or "home")
            big = "admin/media/img/%s.jpg" % slug
            pg.screenshot(path=big, type="jpeg", quality=82)
            Image.open(big).resize((640, 360), Image.LANCZOS).save("admin/media/img/%s-s.jpg" % slug, quality=80)
            prev = by.get(key)
            if prev:
                covers.remove(prev)
                if prev["f"] != slug:
                    for x in ("", "-s"):
                        try: os.remove("admin/media/img/%s%s.jpg" % (prev["f"], x))
                        except OSError: pass
            covers.append({"t": t, "u": key, "f": slug, "s": host, "d": str(TODAY)})
            print("cover:", key)
        except Exception as e:
            print("skip", key, str(e)[:80])
    b.close()
json.dump(covers, open(F, "w"), indent=1)
