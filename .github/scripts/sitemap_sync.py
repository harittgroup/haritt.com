"""Add new indexable pages to sitemap.xml automatically (never removes)."""
import os, re, subprocess, datetime
SKIP = {"admin", "view", "_next", "_not-found", "next-src", "brand-assets", "icons", "mail", "r", "og", "playbooks_covers", "apps-script", "workers", "seo", ".github", "join", "brand", "marketing-command-centre", "node_modules"}
sm = open("sitemap.xml").read()
have = set(re.findall(r"<loc>https://haritt\.com([^<]*)</loc>", sm))
new = []
for d, dirs, files in os.walk("."):
    dirs[:] = [x for x in dirs if x not in SKIP and not x.startswith(".")]
    if "index.html" not in files: continue
    path = "/" + os.path.relpath(d, ".").replace("\\", "/").strip(".") + "/"
    path = path.replace("//", "/")
    h = open(os.path.join(d, "index.html"), errors="ignore").read(6000)
    if re.search(r'name="robots"[^>]*noindex', h): continue
    m = re.search(r'rel="canonical" href="([^"]+)"', h)
    if m and m.group(1).rstrip("/") != ("https://haritt.com" + path).rstrip("/"): continue
    if path not in have: new.append(path)
if new:
    today = datetime.date.today().isoformat()
    add = "".join('  <url><loc>https://haritt.com%s</loc><lastmod>%s</lastmod></url>\n' % (u, today) for u in sorted(new))
    open("sitemap.xml", "w").write(sm.replace("</urlset>", add + "</urlset>"))
print("added", new)
