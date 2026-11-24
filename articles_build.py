"""Articles for all three sites, written in haritt.com/admin/playbooks (each post has a site: haritt, dev or hv).

  python3 articles_build.py haritt                -> journal-pages.json + journal/img (the Next.js site renders /journal/)
  python3 articles_build.py dev  <developers repo> -> insights/<slug>/ pages in the Haritt Developers site
  python3 articles_build.py hv   <hv-verse repo>   -> guides/ pages in the HV Verse site
  python3 articles_build.py redirects             -> old haritt.com/playbooks/<slug>/ links point to HV Verse Guides once Guides is live

Each site section has a Live switch (playbooksCfg/main json "sites"). While it is off, pages still open by direct link,
but carry noindex, stay out of sitemaps and get no menu link. Dev and HV pages reuse that site's own header, footer and styles,
taken from one of its existing pages, so they look like the rest of the site."""
import json, os, re, shutil, sys, time
import playbooks_build as pb
from playbooks_build import esc, plain, nice_date, iso

ROOT = os.path.dirname(os.path.abspath(__file__))
SITES = {
    "haritt": {"n": "Haritt Group", "sec": "Journal", "host": "https://haritt.com", "path": "journal", "by": "Team Haritt",
               "intro": "News and notes from the team behind Haritt Group.", "bio": "Creating ventures, brands and solutions that deliver meaningful value to people and the world."},
    "dev": {"n": "Haritt Developers", "sec": "Insights", "host": "https://developers.haritt.com", "path": "insights", "by": "Team Haritt Developers", "tpl": "faq/index.html", "list": "insights/all",
            "intro": "Plain guides for business owners on websites, apps, branding and AI.", "bio": "Your business solutions partner. We understand the business first, then build what moves it.",
            "cta": ("Have a project in mind?", "Tell us what you need. We reply within a day.", "Start a project", "/first-look/")},
    "hv": {"n": "HV Verse", "sec": "Guides", "host": "https://thehvverse.com", "path": "guides", "by": "Team HV Verse", "tpl": "privacy/index.html",
           "intro": "Practical guides for your career, your day and your growth.", "bio": "Apps that help you plan your day, track your career and know yourself better.",
           "cta": ("Try HV Verse", "Plan your day, track your career and know yourself better. Free.", "Open HV Verse", "/")},
}


def load():
    try:
        data = pb.fetch()
        json.dump(data, open(pb.CACHE, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    except Exception as e:
        print("articles: Firestore not reachable (%s), using cache" % e)
        data = json.load(open(pb.CACHE, encoding="utf-8")) if os.path.exists(pb.CACHE) else {"posts": [], "cfg": {}, "media": {}}
    return data


def live(data, key):
    return bool((((data.get("cfg") or {}).get("sites") or {}).get(key) or {}).get("live"))


class SiteArticles(pb.Playbooks):
    """The Playbooks renderer, limited to one site's posts, with its own URLs and image folder."""

    def __init__(self, data, key, img_dir):
        self.key, self.S, self.img_dir = key, SITES[key], img_dir
        posts = []
        for p in data.get("posts", []):
            if p.get("site") == key or (key == "hv" and not p.get("site") and live(data, "hv")):
                q = dict(p); q.pop("site", None); posts.append(q)
        used = set()
        for p in posts:
            if p.get("cover"): used.add(p["cover"])
            for b in p.get("blocks", []):
                if b.get("t") == "img" and b.get("id"): used.add(b["id"])
        media = {k: v for k, v in (data.get("media") or {}).items() if k in used or k.startswith("cov-")}
        pb.Playbooks.__init__(self, {"posts": posts, "cfg": data.get("cfg") or {}, "media": media})
        cats = (data.get("cfg") or {}).get("cats") or []
        self.cats = {c["slug"]: c for c in cats if (c.get("site") or ("dev" if c.get("slug") == "building-software" else "hv")) == key}
        for p in self.posts:  # a category from another site still shows its name
            if p.get("cat") and p["cat"] not in self.cats:
                c = next((c for c in cats if c.get("slug") == p["cat"]), None)
                if c: self.cats[c["slug"]] = c

    def _write_images(self):
        d = self.img_dir
        if os.path.isdir(d): shutil.rmtree(d)
        for i, m in self.media.items():
            mt = re.match(r"data:image/(jpeg|png|webp);base64,(.+)$", m.get("d", ""), re.S)
            if not mt: continue
            ext = {"jpeg": "jpg", "png": "png", "webp": "webp"}[mt.group(1)]
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "%s.%s" % (i, ext)), "wb").write(pb.base64.b64decode(mt.group(2)))
            self.imgs[i] = {"src": "/%s/img/%s.%s" % (self.S["path"], i, ext), "w": m.get("w") or 0, "h": m.get("h") or 0}

    def url(self, p): return "/%s/%s/" % (self.S["path"], p["slug"])

    def data(self, p):
        inner, toc, faqs = self.body(p); im = self.imgs.get(p.get("cover")) or {}
        pub = p.get("pub") or p.get("at"); upd = p.get("at") or pub
        has = any(b.get("t") == "product" for b in p.get("blocks", []))
        return {"id": p.get("id"), "slug": p["slug"], "url": self.url(p), "title": p["title"], "excerpt": p.get("excerpt", ""), "cat": p.get("cat", ""), "catName": self.cat_name(p),
                "date": nice_date(pub), "updated": nice_date(upd), "minutes": self.minutes(p), "video": p.get("type") == "video",
                "cover": ({"src": im["src"], "w": im["w"], "h": im["h"], "alt": p.get("coverAlt") or p["title"]} if im else None),
                "html": inner, "toc": [[i, t] for i, t in toc], "faqs": faqs, "pub": pub, "upd": upd, "seoTitle": p.get("seoTitle") or "", "seoDesc": p.get("seoDesc") or "",
                "end": self.product_card(p["product"]) if self.prods.get(p.get("product")) and not has else ""}


# ---------------- haritt.com: data for the Next.js /journal/ pages ----------------
def build_haritt(data):
    A = SiteArticles(data, "haritt", os.path.join(ROOT, "journal", "img"))
    S, on = SITES["haritt"], live(data, "haritt")
    posts = [A.data(p) for p in A.posts]
    for x in posts: x.pop("faqs", None)
    pages = {"/journal/": {"title": "Journal | Haritt Group", "desc": S["intro"], "ld": "", "og": "https://haritt.com/og.jpg?v=2", "type": "website"}}
    for x in posts:
        pages[x["url"]] = {"title": x["seoTitle"] or x["title"], "desc": x["seoDesc"] or x["excerpt"] or x["title"], "ld": "", "og": ("https://haritt.com" + x["cover"]["src"]) if x["cover"] else "https://haritt.com/og.jpg?v=2", "type": "article"}
    for s, c in A.cats.items():
        if any(x["cat"] == s for x in posts): pages["/journal/category/%s/" % s] = {"title": "%s | Haritt Group Journal" % c["name"], "desc": c.get("desc", ""), "ld": "", "og": "https://haritt.com/og.jpg?v=2", "type": "website"}
    out = {"live": on, "pages": pages, "posts": posts, "intro": S["intro"], "publisher": {"name": "Team Haritt", "bio": S["bio"]},
           "cats": [{"slug": s, "name": c["name"], "desc": c.get("desc", "")} for s, c in A.cats.items() if any(x["cat"] == s for x in posts)]}
    open(os.path.join(ROOT, "journal-pages.json"), "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    # links in the site menu: Journal once it is live, Playbooks while old posts still live there
    legacy = any(not p.get("site") and p.get("status") == "published" for p in data.get("posts", [])) and not live(data, "hv")
    nav = {"journal": on and bool(posts), "playbooks": legacy}
    open(os.path.join(ROOT, "next-src", "lib", "nav.json"), "w").write(json.dumps(nav) + "\n")
    print("haritt journal: %d posts, live=%s, nav=%s" % (len(posts), on, nav))
    return out


def redirects(data):
    """Once HV Verse Guides is live, old haritt.com/playbooks/<slug>/ pages send people (and Google) to the new address."""
    if not live(data, "hv"): return
    for p in data.get("posts", []):
        if p.get("site") or not p.get("slug"): continue
        to = "https://thehvverse.com/guides/%s/" % p["slug"]
        d = os.path.join(ROOT, "playbooks", p["slug"]); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w").write('<!doctype html><meta charset="utf-8"><title>Moved</title><link rel="canonical" href="%s"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=%s"><script>location.replace(%s)</script><a href="%s">This guide moved to HV Verse</a>\n' % (to, to, json.dumps(to), to))
    d = os.path.join(ROOT, "playbooks"); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w").write('<!doctype html><meta charset="utf-8"><title>Moved</title><link rel="canonical" href="https://thehvverse.com/guides/"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=https://thehvverse.com/guides/"><a href="https://thehvverse.com/guides/">Guides moved to HV Verse</a>\n')


# ---------------- Developers and HV Verse: static pages in the site's own design ----------------
CSS = """
.hart{--ac:%(ac)s;--tx:%(tx)s;--mu:%(mu)s;--ln:%(ln)s;--cd:%(cd)s;--hf:%(hf)s;color:var(--tx)}
.hart *{box-sizing:border-box}.hart a{color:inherit}
.hart .aw{max-width:1080px;margin:0 auto;padding:0 24px}
.hart .ahero{max-width:780px;margin:0 auto;padding:%(top)s 24px 26px}
.hart .acr{font-size:14px;color:var(--mu);display:flex;gap:8px;flex-wrap:wrap}.hart .acr a{color:var(--ac);text-decoration:none;font-weight:600}.hart .acr a:hover{text-decoration:underline}
.hart h1.at{font-family:var(--hf);font-size:clamp(32px,5vw,54px);line-height:1.08;letter-spacing:-.03em;margin:14px 0 14px;font-weight:700;text-wrap:balance}
.hart .ald{font-size:clamp(17px,2vw,20px);color:var(--mu);margin:0 0 22px;line-height:1.55}
.hart .aby{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--mu);line-height:1.45}.hart .aby img{width:40px;height:40px;border-radius:10px}.hart .aby b{color:var(--tx);display:block}
.hart .acov{max-width:1080px;margin:0 auto;padding:0 24px}.hart .acov img{width:100%%;height:auto;max-height:620px;object-fit:cover;border-radius:22px;display:block}
.hart .agen{aspect-ratio:21/9;border-radius:22px;background:%(gen)s;display:flex;align-items:flex-end;padding:26px;color:#fff;font:700 clamp(20px,3vw,32px)/1.2 var(--hf)}
.hart .awr{max-width:1080px;margin:0 auto;padding:34px 24px 20px;display:grid;grid-template-columns:220px minmax(0,1fr);gap:48px}
.hart .aside{position:sticky;top:100px;align-self:start;font-size:14px}
.hart .atoc b{display:block;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu);margin-bottom:8px}
.hart .atoc a{display:block;color:var(--mu);text-decoration:none;padding:6px 0 6px 12px;border-left:2px solid var(--ln);line-height:1.35}.hart .atoc a:hover,.hart .atoc a.on{color:var(--ac);border-color:var(--ac)}
.hart .ash{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px;align-items:center;color:var(--mu);font-size:13.5px}
.hart .ash a,.hart .ash button{font:inherit;font-size:13px;border:1px solid var(--ln);background:var(--cd);color:var(--tx);border-radius:99px;padding:5px 12px;text-decoration:none;cursor:pointer}
.hart .ash a:hover,.hart .ash button:hover{border-color:var(--ac);color:var(--ac)}
.hart .abody{max-width:680px;font-size:18px;line-height:1.75}
.hart .abody p{margin:0 0 20px}.hart .abody a{color:var(--ac)}
.hart .abody h2,.hart .abody h3,.hart .abody h4{font-family:var(--hf);letter-spacing:-.02em;line-height:1.25;margin:38px 0 12px;scroll-margin-top:100px}
.hart .abody h2{font-size:clamp(24px,3vw,30px)}.hart .abody h3{font-size:22px}.hart .abody h4{font-size:19px}
.hart .pba{opacity:0;margin-left:8px;color:var(--mu);text-decoration:none;font-weight:400}.hart h2:hover .pba,.hart h3:hover .pba{opacity:1}
.hart .abody ul,.hart .abody ol{margin:0 0 20px;padding-left:24px}.hart .abody li{margin:0 0 8px}
.hart .pbck{list-style:none;padding:0!important}.hart .pbck li{position:relative;padding-left:32px}.hart .pbck li::before{content:"";position:absolute;left:0;top:6px;width:18px;height:18px;border-radius:6px;border:2px solid var(--ac)}
.hart blockquote{margin:26px 0;padding:6px 0 6px 22px;border-left:3px solid var(--ac);font-family:var(--hf);font-size:22px;line-height:1.45}.hart blockquote p{margin:0}.hart cite{display:block;font:500 14px/1.4 inherit;color:var(--mu);margin-top:8px;font-style:normal}
.hart figure{margin:26px 0}.hart figure img{width:100%%;height:auto;border-radius:16px;display:block;border:1px solid var(--ln)}.hart figcaption{font-size:14px;color:var(--mu);margin-top:8px;text-align:center}
.hart .pbv div{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000}.hart .pbv iframe{position:absolute;inset:0;width:100%%;height:100%%;border:0}
.hart .pbo{position:static;white-space:normal;font-family:inherit;font-weight:400;line-height:1.6;letter-spacing:0;color:inherit;display:block;background:color-mix(in srgb,var(--ac) 7%%,var(--cd));border-left:3px solid var(--ac);border-radius:0 14px 14px 0;padding:14px 18px;margin:0 0 22px;font-size:16.5px}
.hart .pbo::before{display:none}.hart .pbo b{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ac);margin-bottom:4px}.hart .pbo.warning{--ac:#B45309}
.hart .pbtb{overflow-x:auto;margin:0 0 22px;border:1px solid var(--ln);border-radius:14px}.hart table{border-collapse:collapse;width:100%%;font-size:15.5px}.hart th,.hart td{padding:10px 14px;border-bottom:1px solid var(--ln);text-align:left}.hart th{background:color-mix(in srgb,var(--ac) 6%%,var(--cd))}.hart tr:last-child td{border-bottom:0}
.hart pre{background:#16161a;color:#eee;border-radius:14px;padding:16px 18px;overflow-x:auto;font-size:14px;line-height:1.6}.hart code{font-size:.9em}
.hart .pbfaq{border:1px solid var(--ln);border-radius:16px;background:var(--cd);padding:4px 20px;margin:0 0 22px}
.hart .pbfaq details{border-bottom:1px solid var(--ln);padding:14px 0}.hart .pbfaq details:last-child{border:0}.hart .pbfaq summary{cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:12px}.hart .pbfaq summary::after{content:"+";color:var(--ac);font-size:20px;line-height:1}.hart .pbfaq details[open] summary::after{content:"\\2212"}.hart .pbfaq summary::-webkit-details-marker{display:none}.hart .pbfaq details div{color:var(--mu);margin-top:8px;font-size:16px}
.hart .pbp,.hart .acta{display:flex;gap:16px;align-items:center;background:var(--cd);border:1px solid var(--ln);border-radius:18px;padding:18px 20px;margin:28px 0}
.hart .pbp img,.hart .acta img{width:52px;height:52px;border-radius:14px;flex:none}.hart .pbp div,.hart .acta div{flex:1;min-width:0}.hart .pbp b,.hart .acta b{display:block;font-family:var(--hf);font-size:17px}.hart .pbp span,.hart .acta span{font-size:14.5px;color:var(--mu);line-height:1.45}
.hart .pbp .btn,.hart .acta a.ab,.hart .pbbt .btn{background:var(--ac);color:#fff!important;text-decoration:none;font-weight:600;font-size:14.5px;padding:10px 18px;border-radius:99px;white-space:nowrap;border:0;display:inline-block}
.hart .pbbt .btn.o{background:none;color:var(--ac)!important;border:1.5px solid var(--ac)}
.hart .aau{border-top:1px solid var(--ln);padding-top:20px;margin-top:30px;display:flex;gap:14px;font-size:15px;color:var(--mu)}.hart .aau img{width:44px;height:44px;border-radius:12px}.hart .aau b{color:var(--tx);display:block}.hart .aau p{margin:2px 0 0}
.hart .arel{max-width:1080px;margin:0 auto;padding:40px 24px 70px}.hart .arel>b,.hart .ah2{font-family:var(--hf);font-size:24px;display:block;margin-bottom:18px;letter-spacing:-.02em}
.hart .ag{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.hart .ac{display:flex;flex-direction:column;background:var(--cd);border:1px solid var(--ln);border-radius:18px;overflow:hidden;text-decoration:none;transition:transform .25s,box-shadow .25s}
.hart .ac:hover{transform:translateY(-3px);box-shadow:0 18px 40px -24px rgba(0,0,0,.35)}
.hart .ac .ai,.hart .af .ai{aspect-ratio:16/9;background:%(gen)s;display:flex;align-items:flex-end;padding:14px;color:#fff;font:700 16px/1.25 var(--hf);overflow:hidden;position:relative}
.hart .ai img{position:absolute;inset:0;width:100%%;height:100%%;object-fit:cover}
.hart .ac .t{padding:14px 16px 18px}.hart .ac small,.hart .af small{display:block;color:var(--ac);font-weight:600;font-size:12.5px;margin-bottom:6px}.hart .ac h3{margin:0 0 6px;font-family:var(--hf);font-size:18px;line-height:1.3}.hart .ac p{margin:0;color:var(--mu);font-size:14.5px;line-height:1.5}
.hart .aix{max-width:1080px;margin:0 auto;padding:%(top)s 24px 70px}
.hart .ach{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 26px}.hart .ach a{border:1px solid var(--ln);background:var(--cd);padding:7px 15px;border-radius:99px;font-size:14px;color:var(--mu);text-decoration:none}.hart .ach a.on{background:var(--ac);border-color:var(--ac);color:#fff}
.hart .af{display:grid;grid-template-columns:1.25fr 1fr;gap:26px;align-items:center;background:var(--cd);border:1px solid var(--ln);border-radius:24px;overflow:hidden;margin-bottom:26px;text-decoration:none}
.hart .af .ai{aspect-ratio:16/10;height:100%%;font-size:22px}.hart .af .t{padding:22px 26px 22px 0}.hart .af h2{font-family:var(--hf);font-size:clamp(22px,2.6vw,30px);margin:4px 0 10px;line-height:1.2}.hart .af p{margin:0;color:var(--mu)}
.hart .aemp{border:1px dashed var(--ln);border-radius:18px;padding:40px;text-align:center;color:var(--mu)}
.hart .abar{position:fixed;left:0;top:0;height:3px;width:0;background:var(--ac);z-index:9999}
@media(max-width:900px){.hart .awr{grid-template-columns:1fr;gap:0}.hart .aside{position:static;order:2}.hart .atoc{display:none}.hart .ag{grid-template-columns:1fr 1fr}.hart .af{grid-template-columns:1fr}.hart .af .t{padding:0 20px 20px}}
@media(max-width:600px){.hart .ag{grid-template-columns:1fr}.hart .abody{font-size:17px}.hart .pbp,.hart .acta{flex-wrap:wrap}.hart .pbp .btn,.hart .acta a.ab{width:100%%;text-align:center}.hart .agen{aspect-ratio:16/10}}
"""
THEME = {
    "dev": {"ac": "#E8461F", "tx": "var(--ink,#15130F)", "mu": "var(--mute,#6E675C)", "ln": "var(--rule,#E8E6E1)", "cd": "var(--white,#fff)", "hf": "var(--h,'Bricolage Grotesque',sans-serif)", "top": "130px",
            "gen": "radial-gradient(110% 90% at 90% 0,#ff7a2e 0,transparent 50%),linear-gradient(135deg,#120d0b,#2a1510)"},
    "hv": {"ac": "#4A46C9", "tx": "var(--ink,#1D1D1F)", "mu": "var(--soft,#6E6E73)", "ln": "var(--line,#E4E5EA)", "cd": "#fff", "hf": "Sora,var(--font)", "top": "40px",
           "gen": "radial-gradient(110% 90% at 85% 10%,#7b83ff 0,transparent 55%),linear-gradient(135deg,#0d0e22,#23265a)"},
}
JS = """<script>(function(){var b=document.querySelector('.abar');if(b){addEventListener('scroll',function(){var h=document.documentElement,m=h.scrollHeight-h.clientHeight;b.style.width=(m>0?h.scrollTop/m*100:0)+'%';},{passive:true});}
document.addEventListener('click',function(e){var c=e.target.closest('[data-copy]');if(!c)return;try{navigator.clipboard.writeText(c.dataset.copy);c.textContent='Copied';setTimeout(function(){c.textContent='Copy link'},1600)}catch(x){}});
var ls=[].slice.call(document.querySelectorAll('.atoc a'));if(ls.length&&'IntersectionObserver'in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){ls.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id)})}})},{rootMargin:'-20% 0px -70% 0px'});ls.forEach(function(a){var t=document.getElementById(a.getAttribute('href').slice(1));if(t)io.observe(t)})}})();</script>"""


class Template:
    """One existing page of the target site, with its main content swapped for ours."""

    def __init__(self, key, repo):
        self.key = key
        s = open(os.path.join(repo, SITES[key]["tpl"]), encoding="utf-8").read()
        if key == "dev":
            s = re.sub(r'<script[^>]*src="/_next/[^"]*"[^>]*></script>', "", s)
            s = re.sub(r'<script>\s*\(?self\.__next_f[\s\S]*?</script>', "", s)
            s = re.sub(r'<script id="_R_">[\s\S]*?</script>', "", s)
            s = re.sub(r'<link rel="preload" as="script"[^>]*/?>', "", s)
            s = re.sub(r'<link rel="preload" href="/site\.js[^>]*>', "", s)
            i, j = s.index('<header class="phero'), s.index("<footer")
            # the main area ends where the footer's wrapper starts: keep what follows the page content
            k = s.rfind("</div><!--$-->", i, j)
            self.a, self.b = s[:i], s[k:] if k > 0 else s[j:]
            self.b = self.b.replace("</body>", '<script src="/site.js"></script><script>window.dvInit&&window.dvInit()</script></body>')
        else:
            i = s.index('<main id="main"'); j = s.index("</main>", i) + len("</main>")
            self.a, self.b = s[:i], s[j:]
        self.a = re.sub(r'<script type="application/ld\+json">[\s\S]*?</script>', "", self.a)

    def page(self, path, title, desc, inner, robots, og=None, ld=""):
        S = SITES[self.key]; url = S["host"] + path
        a = self.a
        a = re.sub(r"<title>[\s\S]*?</title>", "<title>%s</title>" % esc(title), a, count=1)
        a = re.sub(r'<meta name="description" content="[^"]*"\s*/?>', '<meta name="description" content="%s"/>' % esc(desc), a, count=1)
        a = re.sub(r'<link rel="canonical" href="[^"]*"\s*/?>', '<link rel="canonical" href="%s"/>' % url, a, count=1)
        a = re.sub(r'<meta property="og:(title|description|url|image)"[^>]*>', "", a)
        a = re.sub(r'<meta name="twitter:(title|description|image)"[^>]*>', "", a)
        a = re.sub(r'<meta name="robots"[^>]*>', "", a)
        head = ('<meta property="og:title" content="%s"/><meta property="og:description" content="%s"/><meta property="og:url" content="%s"/>%s%s<style id="hart-css">%s</style>%s'
                % (esc(title), esc(desc), url, '<meta property="og:image" content="%s"/>' % og if og else "", '<meta name="robots" content="noindex, follow"/>' if robots == "noindex" else "",
                   CSS % THEME[self.key], ld))
        a = a.replace("</head>", head + "</head>", 1)
        inner = inner.replace('src="/icons/', 'src="https://haritt.com/icons/')
        if self.key == "hv": inner = '<main id="main" class="hart">%s</main>' % inner
        else: inner = '<div class="hart">%s</div>' % inner
        return a + inner + JS + self.b


def gen_cover(A, x, cls="ai"):
    if x["cover"]: return '<div class="%s"><img src="%s" alt="%s" loading="lazy"></div>' % (cls, x["cover"]["src"], esc(x["cover"]["alt"]))
    return '<div class="%s">%s</div>' % (cls, esc(x["title"]))


def card(A, x):
    return '<a class="ac" href="%s">%s<div class="t"><small>%s</small><h3>%s</h3><p>%s</p></div></a>' % (x["url"], gen_cover(A, x), esc(x["catName"] or A.S["sec"]), esc(x["title"]), esc(x["excerpt"]))


def build_static(data, key, repo):
    S = SITES[key]; on = live(data, key); robots = "index" if on else "noindex"
    base = os.path.join(repo, S["path"])
    A = SiteArticles(data, key, os.path.join(base, "img"))
    T = Template(key, repo)
    posts = [A.data(p) for p in A.posts]
    logo = {"dev": "/img/logo-3d.png", "hv": "/icons/hv-verse-180.png"}[key]
    man_f = os.path.join(base, "articles.json")
    old = json.load(open(man_f)).get("slugs", []) if os.path.exists(man_f) else []
    for sl in old:  # remove pages of articles that were unpublished or renamed
        if sl not in [x["slug"] for x in posts] and os.path.isdir(os.path.join(base, sl)): shutil.rmtree(os.path.join(base, sl))
    for x in posts:
        rel = [q for q in posts if q["slug"] != x["slug"] and q["cat"] == x["cat"]][:3]
        rel += [q for q in posts if q["slug"] != x["slug"] and q not in rel][:3 - len(rel)]
        share = S["host"] + x["url"]; e = lambda v: re.sub(r"[^A-Za-z0-9._~-]", lambda m: "%%%02X" % ord(m.group(0)), v)
        shr = ('<div class="ash"><span>Share</span><a target="_blank" rel="noopener" href="https://wa.me/?text=%s">WhatsApp</a><a target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=%s">LinkedIn</a>'
               '<a target="_blank" rel="noopener" href="https://x.com/intent/post?url=%s&amp;text=%s">X</a><button type="button" data-copy="%s">Copy link</button></div>' % (e(x["title"] + " " + share), e(share), e(share), e(x["title"]), share))
        toc = ('<nav class="atoc" aria-label="In this article"><b>In this article</b>%s</nav>' % "".join('<a href="#%s">%s</a>' % (i, esc(t)) for i, t in x["toc"])) if len(x["toc"]) >= 2 else ""
        cta = S.get("cta"); ctah = '<aside class="acta"><img src="%s" alt=""><div><b>%s</b><span>%s</span></div><a class="ab" href="%s">%s</a></aside>' % (logo, esc(cta[0]), esc(cta[1]), cta[3], esc(cta[2])) if cta and not x["end"] and "pbp" not in x["html"] else ""
        cover = '<div class="acov">%s</div>' % ('<img src="%s" alt="%s" width="%s" height="%s">' % (x["cover"]["src"], esc(x["cover"]["alt"]), x["cover"]["w"] or "", x["cover"]["h"] or "") if x["cover"] else '<div class="agen">%s</div>' % esc(x["title"]))
        listurl = "/%s/" % (S.get("list") or S["path"])
        inner = ('<div class="abar"></div><article><header class="ahero"><nav class="acr" aria-label="Breadcrumb"><a href="%s">%s</a>%s</nav><h1 class="at">%s</h1><p class="ald">%s</p>'
                 '<div class="aby"><img src="%s" alt=""><span><b>%s</b>%s · %d min read</span></div></header>%s<div class="awr"><aside class="aside">%s%s</aside><div class="abody">%s%s%s'
                 '<div class="aau"><img src="%s" alt=""><div><b>%s</b><p>%s</p></div></div></div></div></article>%s'
                 % (listurl, S["sec"], (" <span>/</span> " + esc(x["catName"])) if x["catName"] else "", esc(x["title"]), esc(x["excerpt"]), logo, S["by"], x["date"], x["minutes"], cover, toc, shr,
                    x["html"], x["end"], ctah, logo, S["n"], esc(S["bio"]),
                    ('<section class="arel"><b>Read next</b><div class="ag">%s</div></section>' % "".join(card(A, q) for q in rel)) if rel else ""))
        art = {"@context": "https://schema.org", "@type": "Article", "headline": x["seoTitle"] or x["title"], "description": x["seoDesc"] or x["excerpt"], "datePublished": iso(x["pub"]), "dateModified": iso(x["upd"]),
               "author": {"@type": "Organization", "name": S["n"]}, "publisher": {"@type": "Organization", "name": S["n"], "url": S["host"] + "/"}, "mainEntityOfPage": share}
        if x["cover"]: art["image"] = [S["host"] + x["cover"]["src"]]
        lds = [art]
        if x["faqs"]: lds.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": plain(i["q"]), "acceptedAnswer": {"@type": "Answer", "text": plain(i["a"])}} for i in x["faqs"]]})
        ld = "".join('<script type="application/ld+json">%s</script>' % json.dumps(l, ensure_ascii=False) for l in lds)
        os.makedirs(os.path.join(base, x["slug"]), exist_ok=True)
        open(os.path.join(base, x["slug"], "index.html"), "w", encoding="utf-8").write(
            T.page(x["url"], "%s | %s" % (x["seoTitle"] or x["title"], S["n"]), x["seoDesc"] or x["excerpt"] or x["title"], inner, robots, (S["host"] + x["cover"]["src"]) if x["cover"] else None, ld))
    # the list page
    lp = "/%s/" % (S.get("list") or S["path"])
    used = [s for s in A.cats if any(x["cat"] == s for x in posts)]
    if posts:
        f, rest = posts[0], posts[1:]
        feat = '<a class="af" href="%s">%s<div class="t"><small>%s · %d min read</small><h2>%s</h2><p>%s</p></div></a>' % (f["url"], gen_cover(A, f), esc(f["catName"] or "Latest"), f["minutes"], esc(f["title"]), esc(f["excerpt"]))
        grid = '<div class="ag">%s</div>' % "".join(card(A, x) for x in rest) if rest else ""
    else:
        feat, grid = '<div class="aemp">The first %s are on their way.</div>' % S["sec"].lower(), ""
    chips = ('<div class="ach"><a class="on" href="%s">All</a>%s</div>' % (lp, "".join('<a href="#c-%s" data-cat="%s">%s</a>' % (s, s, esc(A.cats[s]["name"])) for s in used))) if len(used) > 1 else ""
    inner = '<section class="aix"><h1 class="at">%s</h1><p class="ald">%s</p>%s%s%s</section>' % (S["sec"], esc(S["intro"]), chips, feat, grid)
    os.makedirs(os.path.join(repo, lp.strip("/")), exist_ok=True)
    open(os.path.join(repo, lp.strip("/"), "index.html"), "w", encoding="utf-8").write(T.page(lp, "%s | %s" % (S["sec"], S["n"]), S["intro"], inner, robots))
    # sitemap of articles, only while the section is live
    sm = os.path.join(base, "sitemap.xml")
    if on and posts:
        open(sm, "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s</urlset>\n' % "".join(
            "  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n" % (S["host"], u, d) for u, d in [(lp, time.strftime("%Y-%m-%d"))] + [(x["url"], pb.when(x["upd"]).strftime("%Y-%m-%d")) for x in posts]))
    elif os.path.exists(sm): os.remove(sm)
    json.dump({"live": on, "slugs": [x["slug"] for x in posts], "list": lp}, open(man_f, "w"))
    print("%s %s: %d posts, live=%s" % (key, S["sec"], len(posts), on))


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "haritt"
    d = load()
    if what == "haritt": build_haritt(d)
    elif what == "redirects": redirects(d)
    else: build_static(d, what, sys.argv[2])
