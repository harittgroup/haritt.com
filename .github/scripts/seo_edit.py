"""Changes asked for on the admin SEO page: keywords, page title/description/image text, and simple fixes.
Input: SEO_DATA (JSON). Writes the change into the right site and logs it in seo/edits.json."""
import json, os, re, base64, datetime, html, requests
D = json.loads(os.environ.get("SEO_DATA") or "{}")
LOG = "seo/edits.json"
REPOS = {"thehvverse.com": ("hv-verse/hv-verse.github.io", os.environ.get("TOK_HV", "")),
         "developers.haritt.com": ("Haritt-Developers/developers", os.environ.get("TOK_DEV", ""))}
NAMES = {"haritt.com": "Haritt Group", "developers.haritt.com": "Haritt Developers", "thehvverse.com": "HV Verse"}


def log(ok, msg, **kw):
    try:
        L = json.load(open(LOG))
    except Exception:
        L = []
    L.insert(0, dict({"at": datetime.datetime.utcnow().isoformat() + "Z", "kind": D.get("kind"), "ok": ok, "msg": msg,
                      "by": D.get("by", "")}, **kw))
    json.dump(L[:40], open(LOG, "w"), indent=1)
    print(ok, msg)


def fpath(p):
    p = (p or "/").split("?")[0].lstrip("/")
    if not p or p.endswith("/"):
        p += "index.html"
    elif "." not in p.split("/")[-1]:
        p += "/index.html"
    return p


def read(site, p):
    if site == "haritt.com":
        return open(p, encoding="utf-8").read(), None
    repo, tok = REPOS[site]
    r = requests.get("https://api.github.com/repos/%s/contents/%s" % (repo, p), headers={"Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json"}, timeout=30)
    if not r.ok:
        raise RuntimeError("cannot open %s (%s)" % (p, r.status_code))
    j = r.json()
    return base64.b64decode(j["content"]).decode("utf-8"), j["sha"]


def write(site, p, text, sha, msg):
    if site == "haritt.com":
        open(p, "w", encoding="utf-8").write(text); return
    repo, tok = REPOS[site]
    r = requests.put("https://api.github.com/repos/%s/contents/%s" % (repo, p), headers={"Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json"},
                     json={"message": msg, "content": base64.b64encode(text.encode("utf-8")).decode(), "sha": sha,
                           "committer": {"name": "Haritt Group", "email": "harsh.goyal@haritt.com"} if site != "thehvverse.com" else {"name": "HV Verse", "email": "harsh.goyal@haritt.com"}}, timeout=30)
    if not r.ok:
        raise RuntimeError("cannot save (%s): no write access to %s yet" % (r.status_code, repo))


def setmeta(h, attr, key, val):
    e = html.escape(val, quote=True)
    pat = re.compile(r'<meta\s+[^>]*%s=["\']%s["\'][^>]*>' % (attr, re.escape(key)), re.I)
    tag = '<meta %s="%s" content="%s">' % (attr, key, e)
    if pat.search(h):
        return pat.sub(lambda m: tag, h, count=1)
    return h.replace("</head>", tag + "</head>", 1)


def has(h, attr, key):
    return re.search(r'<meta\s+[^>]*%s=["\']%s["\']' % (attr, re.escape(key)), h, re.I)


kind = D.get("kind")
if kind == "kw":
    L = [{"q": str(k["q"])[:80].strip().lower(), "s": k["s"]} for k in D.get("list", []) if k.get("q") and k.get("s") in NAMES][:50]
    json.dump({"list": L}, open("seo/keywords.json", "w"), indent=1)
    log(True, "%d keywords saved" % len(L))
elif kind in ("meta", "fix"):
    site, path = D.get("site"), D.get("path") or "/"
    if site not in NAMES:
        raise SystemExit("unknown site")
    p = fpath(path)
    try:
        h, sha = read(site, p)
        before = h
        url = "https://%s%s" % (site, path)
        if kind == "meta":
            t, d = (D.get("title") or "").strip(), (D.get("desc") or "").strip()
            if t:
                h = re.sub(r"<title>.*?</title>", "<title>%s</title>" % html.escape(t, quote=False), h, count=1, flags=re.S | re.I) if re.search(r"<title>", h, re.I) else h.replace("</head>", "<title>%s</title></head>" % html.escape(t, quote=False), 1)
                h = setmeta(h, "property", "og:title", t)
                if has(h, "name", "twitter:title"): h = setmeta(h, "name", "twitter:title", t)
            if d:
                h = setmeta(h, "name", "description", d)
                h = setmeta(h, "property", "og:description", d)
                if has(h, "name", "twitter:description"): h = setmeta(h, "name", "twitter:description", d)
            for src, alt in (D.get("alts") or {}).items():
                a = html.escape(alt.strip(), quote=True)
                def fix_img(m):
                    tag = m.group(0)
                    if re.search(r'\salt=("[^"]*"|\'[^\']*\')', tag):
                        return re.sub(r'\salt=("[^"]*"|\'[^\']*\')', ' alt="%s"' % a, tag, count=1)
                    return tag.replace("<img", '<img alt="%s"' % a, 1)
                h = re.sub(r'<img\b[^>]*src=["\']%s["\'][^>]*>' % re.escape(src), fix_img, h)
            what = "title, description and image text"
        else:
            c = D.get("check")
            if c == "canon" and not re.search(r'rel=["\']canonical', h, re.I):
                h = h.replace("</head>", '<link rel="canonical" href="%s"></head>' % url, 1)
            elif c == "og":
                t = re.search(r"<title>(.*?)</title>", h, re.S | re.I); t = html.unescape(t.group(1).strip()) if t else NAMES[site]
                dm = re.search(r'<meta\s+[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)', h, re.I)
                if not has(h, "property", "og:title"): h = setmeta(h, "property", "og:title", t)
                if dm and not has(h, "property", "og:description"): h = setmeta(h, "property", "og:description", html.unescape(dm.group(1)))
                if not has(h, "property", "og:url"): h = setmeta(h, "property", "og:url", url)
                if not has(h, "property", "og:type"): h = setmeta(h, "property", "og:type", "website")
            elif c == "schema" and "application/ld+json" not in h:
                t = re.search(r"<title>(.*?)</title>", h, re.S | re.I)
                ld = {"@context": "https://schema.org", "@type": "WebPage", "name": html.unescape(t.group(1).strip()) if t else NAMES[site], "url": url,
                      "isPartOf": {"@type": "WebSite", "name": NAMES[site], "url": "https://%s/" % site}}
                h = h.replace("</head>", '<script type="application/ld+json">%s</script></head>' % json.dumps(ld), 1)
            what = {"canon": "main address", "og": "share preview", "schema": "Google data"}.get(c, c)
        if h == before:
            log(True, "Nothing to change on %s%s" % (site, path), site=site, path=path)
        else:
            write(site, p, h, sha, "SEO: %s on %s" % (what, path))
            log(True, "Updated %s on %s%s" % (what, site, path), site=site, path=path)
    except Exception as e:
        log(False, str(e)[:160], site=site, path=path)
