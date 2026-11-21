import json, os, re, datetime, urllib.request
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
now = datetime.datetime.now(IST)
since = (now - datetime.timedelta(days=7)).astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
wk = now.strftime("%G-w%V")
REPOS = ["harittgroup/haritt.com", "haritt-developers/developers-src", "hv-verse/hv-verse-src"]
tok = os.environ.get("CHANGELOG_TOKEN") or os.environ.get("GITHUB_TOKEN", "")
SKIP = re.compile(r"^(merge|seo|save|dmarc policy|sitemap|status|auto|weekly changelog|reset changelog)", re.I)
CAT = {"feat": "New", "add": "New", "new": "New", "improve": "Improved", "update": "Improved", "fix": "Fixed", "bug": "Fixed"}
out = {"New": [], "Improved": [], "Fixed": []}
for r in REPOS:
    try:
        req = urllib.request.Request("https://api.github.com/repos/%s/commits?since=%s&per_page=100" % (r, since), headers={"Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json"})
        cs = json.load(urllib.request.urlopen(req)); print(r, len(cs), "commits")
        for c in cs:
            if "bot" in c["commit"]["author"]["name"].lower(): continue
            m = c["commit"]["message"].split("\n")[0].strip()
            if not m or SKIP.match(m): continue
            mm = re.match(r"(\w+)(?:\([^)]*\))?:\s*(.+)", m)
            k, t = (CAT.get(mm.group(1).lower(), "Improved"), mm.group(2)) if mm else ("Improved", m)
            t = t[0].upper() + t[1:]
            if t not in out[k]: out[k].append(t)
    except Exception as e:
        print("skip", r, e)
idx_p = "changelog/index.json"
idx = json.load(open(idx_p)) if os.path.exists(idx_p) else {"entries": []}
if any(e["week"] == wk for e in idx["entries"]) or not any(out.values()):
    print("nothing to add"); open(os.environ["GITHUB_OUTPUT"], "a").write("changed=0\n"); raise SystemExit
n = len(idx["entries"]) + 1
shots = sorted(f for f in os.listdir("changelog/img") if f.startswith(wk)) if os.path.isdir("changelog/img") else []
e = {"number": n, "name": "Week of %s" % (now - datetime.timedelta(days=6)).strftime("%d %b %Y"), "week": wk, "date_ist": now.strftime("%d %b %Y, %I:%M %p IST"), "changes": out, "screenshots": ["changelog/img/" + s for s in shots]}
os.makedirs("changelog", exist_ok=True)
json.dump(e, open("changelog/%s.json" % wk, "w"), indent=1)
idx["entries"].insert(0, {k: e[k] for k in ("number", "name", "week", "date_ist")})
json.dump(idx, open(idx_p, "w"), indent=1)
open(os.environ["GITHUB_OUTPUT"], "a").write("changed=1\n")
