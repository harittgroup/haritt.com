"""Playbooks (articles) for haritt.com.
Reads published posts from Firestore (written by haritt.com/admin/playbooks), caches them in playbooks-data.json,
and renders /playbooks/, every post, category pages, rss.xml and the sitemap/llms.txt entries.
Called from build.py: pb = playbooks_build.load(); ... pb.pages(page) ; pb.sitemap_urls() ; pb.llms()"""
import base64, html, json, os, re, time, urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://haritt.com"
API = os.environ.get("PLAYBOOKS_API") or "https://firestore.googleapis.com/v1/projects/harsh-reset/databases/(default)/documents"
KEY = "AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4"
CACHE = os.path.join(ROOT, "playbooks-data.json")
HV = "https://thehvverse.com"

DEFAULT_CFG = {
    "title": "Playbooks",
    "intro": "Practical guides for work, career and building things, from the team behind HV Verse.",
    "publisher": {"name": "Haritt Group", "bio": "Practical notes from the team building HV Verse, HV Reset and HV Hunt."},
    "cats": [
        {"slug": "productivity", "name": "Productivity", "desc": "Plan your time, build routines that last and get more done with less stress."},
        {"slug": "career", "name": "Career", "desc": "Plan your next move, build skills and present your work clearly."},
        {"slug": "privacy-and-files", "name": "Privacy and files", "desc": "Keep documents, resumes and personal files organised and private."},
        {"slug": "building-software", "name": "Building software", "desc": "What to know before you hire, build or ship a digital product."},
    ],
    "products": [
        {"id": "hv-world", "name": "HV Verse", "blurb": "Plan your day, track your career and know yourself better, with one assistant.", "btn": "Try HV Verse", "url": HV + "/", "icon": "/icons/hv-world.svg"},
        {"id": "hv-reset", "name": "HV Reset", "blurb": "A daily planner that moves with you: one task at a time, with a focus timer.", "btn": "Open HV Reset", "url": HV + "/reset/", "icon": "/icons/hv-reset.svg"},
        {"id": "hv-vault", "name": "HV Hunt", "blurb": "Every job, company and follow-up in one place, from first application to offer.", "btn": "Open HV Hunt", "url": HV + "/vault/", "icon": "/icons/hv-vault.png"},
        {"id": "hv-test", "name": "HV Assess", "blurb": "Short tests that show your strengths and how you grow, with private results.", "btn": "Open HV Assess", "url": HV + "/test/", "icon": "/icons/hv-test.png"},
        {"id": "haritt-developers", "name": "Haritt Developers", "blurb": "Websites, apps, branding and AI solutions for growing businesses.", "btn": "Start a project", "url": "https://developers.haritt.com/start/", "icon": "/icons/haritt-developers.png"},
    ],
}


FONTS = {
    "classic": ("", "", "var(--serif)", "var(--serif)"),
    "modern": ("", "", "var(--sans)", "var(--sans)"),
    "editorial": ("Playfair+Display:wght@500;600;700", "", '"Playfair Display",Georgia,serif', "var(--serif)"),
    "friendly": ("Poppins:wght@500;600;700", "", "Poppins,var(--sans)", "var(--sans)"),
    "bookish": ("Lora:ital,wght@0,400;0,600;0,700;1,400", "", "Lora,Georgia,serif", "Lora,Georgia,serif"),
    "slab": ("Merriweather:ital,wght@0,400;0,700;1,400", "", "Merriweather,Georgia,serif", "Merriweather,Georgia,serif"),
}


def font_head(p):
    f = FONTS.get(p.get("font") or "classic", FONTS["classic"]); size = p.get("size")
    out = ""
    if f[0]: out += '<link href="https://fonts.googleapis.com/css2?family=%s&display=swap" rel="stylesheet">' % f[0]
    css = ""
    if p.get("font") in FONTS and p.get("font") != "classic":
        css += ".pbbody{font-family:%s}.pbh h1,.pbbody h2,.pbbody h3,.pbbody h4,.pbbody blockquote{font-family:%s}" % (f[3], f[2])
    if size == "l": css += ".pbbody{font-size:22px}"
    return out + ("<style>%s</style>" % css if css else "")


def esc(s):
    return html.escape(str(s if s is not None else ""), quote=True)


# ---------- data ----------
def _dec(v):
    if "stringValue" in v: return v["stringValue"]
    if "integerValue" in v: return int(v["integerValue"])
    if "doubleValue" in v: return v["doubleValue"]
    if "booleanValue" in v: return v["booleanValue"]
    return None


def _post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=40))


def _get(path):
    try:
        return json.load(urllib.request.urlopen("%s/%s?key=%s" % (API, path, KEY), timeout=40))
    except urllib.error.HTTPError as e:
        if e.code == 404: return None
        raise


def fetch():
    q = {"structuredQuery": {"from": [{"collectionId": "playbooks"}], "where": {"fieldFilter": {"field": {"fieldPath": "status"}, "op": "IN",
         "value": {"arrayValue": {"values": [{"stringValue": "published"}, {"stringValue": "scheduled"}]}}}}, "limit": 500}}
    rows = _post(API + ":runQuery?key=" + KEY, q)
    posts = []
    for r in rows:
        d = r.get("document")
        if not d: continue
        f = {k: _dec(v) for k, v in d["fields"].items()}
        try: p = json.loads(f.get("json") or "{}")
        except ValueError: continue
        p["id"] = d["name"].split("/")[-1]; p["status"] = f.get("status"); p["pub"] = f.get("pub") or 0; p["at"] = f.get("at") or 0
        posts.append(p)
    cfg = {}
    c = _get("playbooksCfg/main")
    if c:
        try: cfg = json.loads(c["fields"]["json"]["stringValue"])
        except (KeyError, ValueError): cfg = {}
    media = {}
    ids = set()
    for p in posts:
        if p.get("cover"): ids.add(p["cover"])
        for b in p.get("blocks", []):
            if b.get("t") == "img" and b.get("id"): ids.add(b["id"])
    for i in ids:
        m = _get("playbookMedia/" + i)
        if m:
            fl = {k: _dec(v) for k, v in m["fields"].items()}
            media[i] = {"d": fl.get("d", ""), "w": fl.get("w") or 0, "h": fl.get("h") or 0}
    return {"posts": posts, "cfg": cfg, "media": media}


def load():
    data = None
    try:
        data = fetch()
        # keep a copy so a build without network does not lose posts
        json.dump(data, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    except Exception as e:
        print("playbooks: could not reach Firestore (%s), using cache" % e)
        if os.path.exists(CACHE):
            data = json.load(open(CACHE, encoding="utf-8"))
    return Playbooks(data or {"posts": [], "cfg": {}, "media": {}})


# ---------- text helpers ----------
_COL = re.compile(r"^(#[0-9a-fA-F]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\))$")


class _Clean(HTMLParser):
    OK = {"b", "strong", "i", "em", "u", "s", "strike", "del", "sub", "sup", "code", "br", "a", "mark", "span", "font"}

    def __init__(self):
        super().__init__(convert_charrefs=True); self.out = []; self.stack = []

    def handle_starttag(self, t, attrs):
        if t not in self.OK: return
        if t == "a":
            h = dict(attrs).get("href", "") or ""
            if not re.match(r"^(https?://|mailto:|/|#)", h): return
            ext = h.startswith("http") and not h.startswith(SITE) and "thehvverse.com" not in h
            self.out.append('<a href="%s"%s>' % (esc(h), ' target="_blank" rel="noopener"' if ext else ""))
        elif t in ("span", "font"):
            a = dict(attrs); st = []
            col = a.get("color") or (re.search(r"(?<![-\w])color:\s*([^;]+)", a.get("style") or "") or [None, None])[1]
            bg = (re.search(r"background(?:-color)?:\s*([^;]+)", a.get("style") or "") or [None, None])[1]
            if col and _COL.match(col.strip()): st.append("color:" + col.strip())
            if bg and _COL.match(bg.strip()): st.append("background-color:" + bg.strip())
            self.stack.append(bool(st))
            if st: self.out.append('<span style="%s">' % esc(";".join(st)))
        else:
            self.out.append("<%s>" % {"strike": "s", "del": "s"}.get(t, t))

    def handle_endtag(self, t):
        if t in ("span", "font"):
            if self.stack and self.stack.pop(): self.out.append("</span>")
        elif t in self.OK and t not in ("br",): self.out.append("</%s>" % {"strike": "s", "del": "s"}.get(t, t))

    def handle_data(self, d): self.out.append(esc(d))


def clean(h):
    c = _Clean(); c.feed(h or ""); c.close()
    return "".join(c.out)


def plain(h):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h or ""))).strip()


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "section"


def when(ms):
    return datetime.fromtimestamp(ms / 1000, timezone.utc)


def nice_date(ms):
    d = when(ms); return "%d %s %d" % (d.day, d.strftime("%b"), d.year)


def iso(ms): return when(ms).strftime("%Y-%m-%dT%H:%M:%S+00:00")


# ---------- the site ----------
class Playbooks:
    def __init__(self, data):
        now = time.time() * 1000
        self.cfg = dict(DEFAULT_CFG); self.cfg.update({k: v for k, v in (data.get("cfg") or {}).items() if v})
        self.media = data.get("media") or {}
        # optional hand-made covers: playbooks_covers/<slug>.jpg replaces that post's cover
        cdir = os.path.join(ROOT, "playbooks_covers")
        for p in data.get("posts", []):
            f = os.path.join(cdir, "%s.jpg" % p.get("slug", ""))
            if os.path.isfile(f):
                from PIL import Image
                w, h = Image.open(f).size
                self.media["cov-" + p["slug"]] = {"d": "data:image/jpeg;base64," + base64.b64encode(open(f, "rb").read()).decode(), "w": w, "h": h}
                p["cover"] = "cov-" + p["slug"]
        self.posts = sorted([p for p in data.get("posts", []) if p.get("slug") and (p["status"] == "published" or (p["status"] == "scheduled" and p["pub"] <= now))],
                            key=lambda p: -(p.get("pub") or p.get("at") or 0))
        self.cats = {c["slug"]: c for c in self.cfg["cats"]}
        self.prods = {p["id"]: p for p in self.cfg["products"]}
        self.imgs = {}
        self._write_images()

    def live(self): return bool(self.posts)

    def _write_images(self):
        d = os.path.join(ROOT, "playbooks", "img")
        if os.path.isdir(d):
            for f in os.listdir(d): os.remove(os.path.join(d, f))
        for i, m in self.media.items():
            mt = re.match(r"data:image/(jpeg|png|webp);base64,(.+)$", m.get("d", ""), re.S)
            if not mt: continue
            ext = {"jpeg": "jpg", "png": "png", "webp": "webp"}[mt.group(1)]
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "%s.%s" % (i, ext)), "wb").write(base64.b64decode(mt.group(2)))
            self.imgs[i] = {"src": "/playbooks/img/%s.%s" % (i, ext), "w": m.get("w") or 0, "h": m.get("h") or 0}

    def img(self, i, alt="", cls="", lazy=True, w=None):
        m = self.imgs.get(i)
        if not m: return ""
        dim = ' width="%d" height="%d"' % (m["w"], m["h"]) if m["w"] and m["h"] else ""
        return '<img src="%s" alt="%s"%s%s%s>' % (m["src"], esc(alt), dim, ' class="%s"' % cls if cls else "", ' loading="lazy" decoding="async"' if lazy else "")

    def url(self, p): return "/playbooks/%s/" % p["slug"]

    def cat_name(self, p): return (self.cats.get(p.get("cat")) or {}).get("name", "")

    def minutes(self, p):
        words = 0
        for b in p.get("blocks", []):
            if b.get("t") == "code": continue
            if b.get("t") == "faq": txt = " ".join("%s %s" % (i.get("q", ""), i.get("a", "")) for i in b.get("items", []))
            elif b.get("t") == "table": txt = " ".join(" ".join(r) for r in b.get("rows", []))
            else: txt = b.get("h") or b.get("x") or " ".join(i for i in b.get("items", []) if isinstance(i, str))
            words += len(plain(txt).split())
        return max(1, round(words / 200))

    def card(self, p, big=False):
        cov = self.img(p.get("cover"), p.get("coverAlt") or p.get("title"), "", True) if p.get("cover") else ""
        ph = '<div class="pbi">%s</div>' % cov if cov else '<div class="pbi pbn"><span>%s</span></div>' % esc(self.cat_name(p) or "Playbook")
        return ('<a class="pbc rv" href="%s">%s<div class="pbt"><div class="pbk">%s</div><h3>%s</h3><p>%s</p><div class="pbm">%s · %d min read</div></div></a>'
                % (self.url(p), ph, esc(self.cat_name(p)), esc(p["title"]), esc(p.get("excerpt", "")), nice_date(p.get("pub") or p.get("at")), self.minutes(p)))

    # ----- article body -----
    def _cls(self, b, extra=""):
        c = [extra] if extra else []
        if b.get("al") in ("center", "right", "justify"): c.append("al-" + b["al"])
        if b.get("sz") in ("s", "l"): c.append("sz-" + b["sz"])
        return ' class="%s"' % " ".join(c) if c else ""

    def body(self, p):
        out, toc, faqs, n = [], [], [], 0
        for b in p.get("blocks", []):
            t = b.get("t")
            if t == "p": out.append("<p%s>%s</p>" % (self._cls(b), clean(b.get("h"))))
            elif t in ("h2", "h3", "h4"):
                txt = plain(b.get("x")); sid = slugify(txt) + ("-%d" % n if any(s == slugify(txt) for s, _ in toc) else "")
                n += 1
                if t == "h2": toc.append((sid, txt))
                out.append('<%s id="%s"%s>%s<a class="pba" href="#%s" aria-label="Link to this section">#</a></%s>' % (t, sid, self._cls(b), esc(txt), sid, t))
            elif t in ("ul", "ol"):
                out.append("<%s>%s</%s>" % (t, "".join("<li>%s</li>" % clean(i) for i in b.get("items", []) if plain(i)), t))
            elif t == "check":
                out.append('<ul class="pbck">%s</ul>' % "".join("<li>%s</li>" % clean(i) for i in b.get("items", []) if plain(i)))
            elif t == "quote":
                out.append("<blockquote%s><p>%s</p>%s</blockquote>" % (self._cls(b), esc(b.get("x")), "<cite>%s</cite>" % esc(b["by"]) if b.get("by") else ""))
            elif t == "img":
                im = self.img(b.get("id"), b.get("alt"))
                if im: out.append("<figure>%s%s</figure>" % (im, "<figcaption>%s</figcaption>" % esc(b["cap"]) if b.get("cap") else ""))
            elif t == "callout":
                k = b.get("kind") if b.get("kind") in ("tip", "note", "warning") else "tip"
                out.append('<aside%s><b>%s</b><div>%s</div></aside>' % (self._cls(b, "pbo " + k), {"tip": "Tip", "note": "Note", "warning": "Watch out"}[k], clean(b.get("h"))))
            elif t == "product":
                out.append(self.product_card(b.get("id")))
            elif t == "code":
                out.append("<pre><code>%s</code></pre>" % esc(b.get("x", "")))
            elif t == "table":
                rows = [r for r in b.get("rows", []) if any(plain(c) for c in r)]
                if rows:
                    head = b.get("head", True)
                    tr = lambda r, tag: "<tr>%s</tr>" % "".join("<%s>%s</%s>" % (tag, clean(c), tag) for c in r)
                    out.append('<div class="pbtb"><table>%s%s</table></div>' % ("<thead>%s</thead>" % tr(rows[0], "th") if head else "", "<tbody>%s</tbody>" % "".join(tr(r, "td") for r in (rows[1:] if head else rows))))
            elif t == "video":
                m = re.search(r"(?:youtu\.be/|v=|embed/|shorts/)([A-Za-z0-9_-]{11})", b.get("url", ""))
                if m: out.append('<figure class="pbv"><div><iframe src="https://www.youtube-nocookie.com/embed/%s" title="%s" loading="lazy" allowfullscreen></iframe></div>%s</figure>' % (m.group(1), esc(b.get("cap") or "Video"), "<figcaption>%s</figcaption>" % esc(b["cap"]) if b.get("cap") else ""))
            elif t == "button":
                u = b.get("url", "")
                if re.match(r"^(https?://|/|#)", u) and plain(b.get("label")):
                    out.append('<p class="pbbt"><a class="btn%s" href="%s">%s</a></p>' % (" o" if b.get("style") == "outline" else "", esc(u), esc(plain(b["label"]))))
            elif t == "faq":
                its = [i for i in b.get("items", []) if plain(i.get("q")) and plain(i.get("a"))]
                if its:
                    faqs += its
                    out.append('<div class="pbfaq">%s</div>' % "".join("<details><summary>%s</summary><div>%s</div></details>" % (esc(plain(i["q"])), clean(i["a"])) for i in its))
            elif t == "hr": out.append("<hr>")
        return "".join(out), toc, faqs

    def product_card(self, pid):
        pr = self.prods.get(pid)
        if not pr: return ""
        return ('<aside class="pbp"><img src="%s" alt="" width="56" height="56"><div><b>%s</b><span>%s</span></div><a class="btn" href="%s">%s →</a></aside>'
                % (esc(pr["icon"]), esc(pr["name"]), esc(pr["blurb"]), esc(pr["url"]), esc(pr["btn"])))

    # ----- pages -----
    def pages(self, page, write, base_ld):
        c = self.cfg
        if self.live():
            self._home(page, write, base_ld)
            for p in self.posts: self._post(p, page, write, base_ld)
            for slug, cat in self.cats.items():
                ps = [p for p in self.posts if p.get("cat") == slug]
                if ps: self._cat(slug, cat, ps, page, write, base_ld)
            write("playbooks/rss.xml", self._rss())
        # nothing published yet: no pages, no nav link, nothing for search engines

    def _head(self, eyebrow, h1, lead):
        return '<header class="ph"><div class="w"><div class="eb rv">%s</div><h1 class="rv">%s</h1><p class="lead rv">%s</p></div></header>' % (esc(eyebrow), h1, esc(lead))

    def _chips(self, cur):
        used = [s for s in self.cats if any(p.get("cat") == s for p in self.posts)]
        ch = ['<a class="pch%s" href="/playbooks/">All</a>' % (" on" if cur == "" else "")]
        ch += ['<a class="pch%s" href="/playbooks/category/%s/">%s</a>' % (" on" if cur == s else "", s, esc(self.cats[s]["name"])) for s in used]
        return '<div class="pchs">%s</div>' % "".join(ch)

    def _home(self, page, write, base_ld):
        c = self.cfg; first = self.posts[0]; rest = self.posts[1:]
        cov = self.img(first.get("cover"), first.get("coverAlt") or first["title"], "", False) if first.get("cover") else ""
        feat = ('<a class="pbf rv" href="%s"><div class="pbi">%s</div><div class="pbt"><div class="pbk">%s · Latest</div><h2>%s</h2><p>%s</p><div class="pbm">%s · %d min read</div></div></a>'
                % (self.url(first), cov or '<div class="pbn"><span>%s</span></div>' % esc(self.cat_name(first)), esc(self.cat_name(first)), esc(first["title"]), esc(first.get("excerpt", "")), nice_date(first.get("pub") or first.get("at")), self.minutes(first)))
        body = (self._head("Playbooks", "Practical guides for work,<br>career and building things.", c["intro"]) + '<section class="pbs"><div class="w">' + feat + self._chips("")
                + ('<div class="pbg">%s</div>' % "".join(self.card(p) for p in rest) if rest else "") + self._rss_note() + "</div></section>")
        desc = c["intro"]
        ld = {"@type": "CollectionPage", "@id": SITE + "/playbooks/#page", "url": SITE + "/playbooks/", "name": "Playbooks | Haritt Group", "description": desc, "isPartOf": {"@id": SITE + "/#website"}, "publisher": {"@id": SITE + "/#org"},
              "mainEntity": {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": SITE + self.url(p), "name": p["title"]} for i, p in enumerate(self.posts[:50])]}}
        write("playbooks/index.html", page("/playbooks/", "Playbooks", desc, body, full="Playbooks | Practical guides from Haritt Group", ld=base_ld([ld], [("Playbooks", "/playbooks/")]),
                                           ogi=self._og(first)))

    def _rss_note(self):
        return ""

    def _og(self, p):
        i = self.imgs.get(p.get("cover"))
        return SITE + i["src"] if i else None

    def _cat(self, slug, cat, ps, page, write, base_ld):
        path = "/playbooks/category/%s/" % slug
        body = (self._head("Playbooks", esc(cat["name"]), cat.get("desc", "")) + '<section class="pbs"><div class="w">' + self._chips(slug)
                + '<div class="pbg">%s</div></div></section>' % "".join(self.card(p) for p in ps))
        ld = {"@type": "CollectionPage", "@id": SITE + path + "#page", "url": SITE + path, "name": cat["name"] + " playbooks | Haritt Group", "description": cat.get("desc", ""), "isPartOf": {"@id": SITE + "/#website"}}
        write("playbooks/category/%s/index.html" % slug, page(path, cat["name"], cat.get("desc") or self.cfg["intro"], body, full="%s Playbooks | Haritt Group" % cat["name"],
                                                           ld=base_ld([ld], [("Playbooks", "/playbooks/"), (cat["name"], path)]), ogi=self._og(ps[0])))

    def _post(self, p, page, write, base_ld):
        path = self.url(p); pub = p.get("pub") or p.get("at"); upd = p.get("at") or pub
        inner, toc, faqs = self.body(p)
        cov = self.img(p.get("cover"), p.get("coverAlt") or p["title"], "", False) if p.get("cover") else ""
        tocx = ('<nav class="pbtoc" aria-label="On this page"><div class="pbk">In this playbook</div>%s</nav>' % "".join('<a href="#%s">%s</a>' % (i, esc(t)) for i, t in toc)) if len(toc) >= 3 else ""
        prod = self.prods.get(p.get("product"))
        has_card = any(b.get("t") == "product" for b in p.get("blocks", []))
        endcard = self.product_card(p["product"]) if prod and not has_card else ""
        pub_name = (self.cfg.get("publisher") or {}).get("name", "Haritt Group")
        rel = [q for q in self.posts if q["id"] != p["id"] and q.get("cat") == p.get("cat")][:2] or [q for q in self.posts if q["id"] != p["id"]][:2]
        relx = ('<section class="pbs pbrel"><div class="w"><div class="pbk">Keep reading</div><div class="pbg">%s</div></div></section>' % "".join(self.card(q) for q in rel)) if rel else ""
        share = SITE + path
        shr = ('<div class="pbsh"><span>Share</span><a href="https://www.linkedin.com/sharing/share-offsite/?url=%s" target="_blank" rel="noopener">LinkedIn</a>'
               '<a href="https://x.com/intent/post?url=%s&amp;text=%s" target="_blank" rel="noopener">X</a><a href="https://wa.me/?text=%s" target="_blank" rel="noopener">WhatsApp</a>'
               '<button type="button" data-copy="%s">Copy link</button></div>' % (esc(share), esc(share), esc(p["title"].replace(" ", "%20")), esc((p["title"] + " " + share).replace(" ", "%20")), esc(share)))
        body = ('<div class="pbbar" id="pbbar"></div><article class="pbart"><header class="pbh"><div class="w pbn2"><nav class="pbcr" aria-label="Breadcrumb"><a href="/playbooks/">Playbooks</a> / %s</nav>'
                '<h1 class="rv">%s</h1><p class="lead rv">%s</p><div class="pbby rv"><span class="pbav">H</span><span><b>%s</b><br>%s · Updated %s · %d min read</span></div></div>%s</header>'
                '<div class="w pbw"><div class="pbside">%s%s</div><div class="pbbody">%s%s%s%s</div></div></article>%s'
                ) % (('<a href="/playbooks/category/%s/">%s</a>' % (p["cat"], esc(self.cat_name(p)))) if self.cat_name(p) else "", esc(p["title"]), esc(p.get("excerpt", "")), esc(pub_name),
                     nice_date(pub), nice_date(upd), self.minutes(p), ('<div class="w pbcov rv">%s</div>' % cov) if cov else "", tocx, shr, inner, endcard,
                     '<div class="pbau"><span class="pbav">H</span><div><b>%s</b><p>%s</p></div></div>' % (esc(pub_name), esc((self.cfg.get("publisher") or {}).get("bio", ""))), shr.replace('class="pbsh"', 'class="pbsh pbsh2"'), relx)
        art = {"@type": "Article", "@id": SITE + path + "#article", "mainEntityOfPage": {"@id": SITE + path + "#page"}, "headline": p.get("seoTitle") or p["title"], "description": p.get("seoDesc") or p.get("excerpt", ""),
               "datePublished": iso(pub), "dateModified": iso(upd), "inLanguage": "en", "author": {"@type": "Organization", "name": pub_name, "@id": SITE + "/#org"}, "publisher": {"@id": SITE + "/#org"},
               "isPartOf": {"@id": SITE + "/#website"}, "wordCount": self.minutes(p) * 200}
        if self._og(p): art["image"] = [self._og(p)]
        if self.cat_name(p): art["articleSection"] = self.cat_name(p)
        crumbs = [("Playbooks", "/playbooks/")] + ([(self.cat_name(p), "/playbooks/category/%s/" % p["cat"])] if self.cat_name(p) else []) + [(p["title"], path)]
        page_node = {"@type": "WebPage", "@id": SITE + path + "#page", "url": SITE + path, "name": p.get("seoTitle") or p["title"], "isPartOf": {"@id": SITE + "/#website"}}
        if faqs: nodes_extra = [{"@type": "FAQPage", "@id": SITE + path + "#faq", "mainEntity": [{"@type": "Question", "name": plain(i["q"]), "acceptedAnswer": {"@type": "Answer", "text": plain(i["a"])}} for i in faqs]}]
        else: nodes_extra = []
        extra = ('<meta property="article:published_time" content="%s"><meta property="article:modified_time" content="%s">' % (iso(pub), iso(upd)))
        write("playbooks/%s/index.html" % p["slug"], page(path, p["title"], p.get("seoDesc") or p.get("excerpt") or p["title"], body,
                                                           full=(p.get("seoTitle") or p["title"]), ld=extra + font_head(p) + base_ld([page_node, art] + nodes_extra, crumbs), ogi=self._og(p), otype="article"))

    def _rss(self):
        items = "".join("<item><title>%s</title><link>%s%s</link><guid>%s%s</guid><pubDate>%s</pubDate><description>%s</description></item>" % (
            esc(p["title"]), SITE, self.url(p), SITE, self.url(p), when(p.get("pub") or p.get("at")).strftime("%a, %d %b %Y %H:%M:%S +0000"), esc(p.get("excerpt", ""))) for p in self.posts[:30])
        return ('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Playbooks | Haritt Group</title><link>%s/playbooks/</link><description>%s</description><language>en</language>%s</channel></rss>\n'
                % (SITE, esc(self.cfg["intro"]), items))

    def sitemap_urls(self):
        if not self.live(): return []
        out = [("/playbooks/", when(max((p.get("at") or 0) for p in self.posts)).strftime("%Y-%m-%d"))]
        out += [("/playbooks/category/%s/" % s, when(max((p.get("at") or 0) for p in self.posts if p.get("cat") == s)).strftime("%Y-%m-%d")) for s in self.cats if any(p.get("cat") == s for p in self.posts)]
        out += [(self.url(p), when(p.get("at") or p.get("pub")).strftime("%Y-%m-%d")) for p in self.posts]
        return out

    def llms(self):
        if not self.live(): return ""
        return "\n## Playbooks\n\n" + "\n".join("- [%s](%s%s): %s" % (p["title"], SITE, self.url(p), plain(p.get("excerpt", ""))) for p in self.posts[:30]) + "\n"


CSS = """
/* Playbooks */
.pbs{padding:0 0 90px;border-top:0}.pbs .w{display:grid;gap:44px}
.pbk{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--red)}
.pbm{font-size:13.5px;color:var(--muted)}
.pbi{aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:var(--bg2);border:1px solid var(--line)}.pbi img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.pbn{display:grid;place-items:center;background:linear-gradient(135deg,#F1E1E1,#E9D2D5 55%,#F6EDE6);aspect-ratio:16/9;border-radius:18px;color:var(--red);font-family:var(--serif);font-size:22px;border:1px solid var(--line)}
.pbf{display:grid;grid-template-columns:1.15fr 1fr;gap:44px;align-items:center;text-decoration:none;color:inherit}@media(max-width:860px){.pbf{grid-template-columns:1fr;gap:22px}}
.pbf h2{font-size:clamp(30px,3.6vw,44px);margin:12px 0 14px}.pbf p{color:var(--ink2);font-size:18px;margin-bottom:16px}
.pbf:hover .pbi img,.pbc:hover .pbi img{transform:scale(1.035)}.pbf:hover h2,.pbc:hover h3{color:var(--red)}
.pbg{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 26px}@media(max-width:960px){.pbg{grid-template-columns:1fr 1fr}}@media(max-width:620px){.pbg{grid-template-columns:1fr}}
.pbc{text-decoration:none;color:inherit;display:grid;gap:14px;align-content:start}.pbc h3{font-size:23px;line-height:1.25;margin:6px 0 8px;transition:color .2s}.pbc p{color:var(--muted);font-size:15.5px;margin-bottom:10px}
.pbchs,.pchs{display:flex;gap:8px;flex-wrap:wrap}.pch{border:1px solid var(--line);background:var(--card);border-radius:99px;padding:7px 16px;font-size:14px;text-decoration:none;color:var(--ink2);transition:background .2s,color .2s}.pch:hover{background:var(--bg2)}.pch.on{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.pbr{font-size:14.5px;color:var(--muted)}.pbr a{color:var(--red)}
/* post */
.pbbar{position:fixed;left:0;top:0;height:3px;width:0;background:var(--red);z-index:60;transition:width .1s}
.pbh{padding:40px 0 10px}.pbn2{max-width:860px}.pbcr{font-size:14px;color:var(--muted);margin-bottom:22px}.pbcr a{color:var(--red);text-decoration:none}.pbcr a:hover{text-decoration:underline}
.pbh h1{font-size:clamp(36px,5.4vw,66px);line-height:1.06}.pbh .lead{margin-top:22px;max-width:700px}
.pbby{display:flex;gap:14px;align-items:center;margin-top:30px;font-size:14px;color:var(--muted);line-height:1.45}.pbby b{color:var(--ink);font-weight:600;font-size:15px}
.pbav{flex:none;width:44px;height:44px;border-radius:50%;background:var(--red);color:#fff;display:grid;place-items:center;font-family:var(--serif);font-size:20px}
.pbcov{margin-top:36px}.pbcov img{width:100%;height:auto;border-radius:22px;display:block;border:1px solid var(--line);max-height:640px;object-fit:cover}
.pbw{display:grid;grid-template-columns:200px minmax(0,700px);gap:60px;justify-content:center;padding-top:48px;padding-bottom:70px}@media(max-width:1000px){.pbw{grid-template-columns:minmax(0,700px)}}
.pbside{position:sticky;top:96px;align-self:start;display:grid;gap:26px;font-size:14px}@media(max-width:1000px){.pbside{position:static;order:-1}.pbside .pbsh{display:none}}
.pbtoc{display:grid;gap:2px;border-left:2px solid var(--line);padding-left:16px}.pbtoc .pbk{margin-bottom:8px}.pbtoc a{text-decoration:none;color:var(--muted);padding:3px 0;line-height:1.4}.pbtoc a:hover{color:var(--red)}
@media(max-width:1000px){.pbtoc{border:1px solid var(--line);border-radius:14px;padding:16px 18px;background:var(--card)}}
.pbsh{display:flex;gap:10px;flex-wrap:wrap;align-items:center;color:var(--muted)}.pbsh a,.pbsh button{font:inherit;font-size:13.5px;border:1px solid var(--line);background:var(--card);color:var(--ink2);border-radius:99px;padding:5px 13px;text-decoration:none;cursor:pointer}.pbsh a:hover,.pbsh button:hover{border-color:var(--red);color:var(--red)}
.pbbody{font-family:var(--serif);font-size:20px;line-height:1.75;color:var(--ink2)}.pbbody>*+*{margin-top:1.3em}
.pbbody h2{font-size:clamp(28px,3.4vw,36px);line-height:1.2;margin-top:2em;color:var(--ink)}.pbbody h3{font-size:25px;margin-top:1.7em;color:var(--ink)}
.pba{opacity:0;margin-left:10px;font-size:.6em;text-decoration:none;color:var(--red);transition:opacity .2s}.pbbody h2:hover .pba,.pbbody h3:hover .pba,.pba:focus{opacity:1}
.pbbody a{color:var(--red);text-underline-offset:3px}.pbbody ul,.pbbody ol{padding-left:1.3em}.pbbody li+li{margin-top:.5em}.pbbody li::marker{color:var(--red)}
.pbbody blockquote{margin:2em 0;padding:4px 0 4px 26px;border-left:3px solid var(--red);font-style:italic;font-size:1.25em;line-height:1.5;color:var(--ink)}.pbbody blockquote p{margin:0}.pbbody cite{display:block;margin-top:10px;font:500 14px var(--sans);font-style:normal;color:var(--muted)}
.pbbody figure{margin:2.2em -40px}@media(max-width:860px){.pbbody figure{margin:2em 0}}.pbbody figure img{width:100%;height:auto;border-radius:16px;display:block;border:1px solid var(--line)}.pbbody figcaption{font:14px/1.5 var(--sans);color:var(--muted);margin-top:10px;text-align:center}
.pbbody hr{border:0;height:1px;background:var(--line);margin:2.4em 0}
.pbo{font:16px/1.65 var(--sans);border-radius:16px;padding:18px 22px;background:var(--redsoft);display:grid;gap:4px;color:var(--ink2)}.pbo b{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--red)}.pbo.note{background:var(--bg2)}.pbo.note b{color:var(--ink2)}.pbo.warning{background:#FBEFD9}.pbo.warning b{color:#8A5A00}
.pbp{font-family:var(--sans);display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px 22px;margin:2.4em 0!important}
.pbp img{border-radius:14px}.pbp b{display:block;font-size:18px;color:var(--ink)}.pbp span{display:block;font-size:14.5px;color:var(--muted);margin-top:2px;line-height:1.5}@media(max-width:620px){.pbp{grid-template-columns:auto 1fr}.pbp .btn{grid-column:1/-1;justify-content:center}}
.pbau{font-family:var(--sans);display:flex;gap:16px;border-top:1px solid var(--line);padding-top:28px;margin-top:3em!important;align-items:flex-start}.pbau b{font-size:16px;color:var(--ink)}.pbau p{font-size:14.5px;color:var(--muted);margin-top:4px;line-height:1.55}
.pbsh2{display:none}@media(max-width:1000px){.pbsh2{display:flex}}
.pbbody h4{font-size:21px;margin-top:1.5em;color:var(--ink)}
.al-center{text-align:center}.al-right{text-align:right}.al-justify{text-align:justify}.pbbody .sz-l{font-size:1.18em;line-height:1.6}.pbbody .sz-s{font-size:.86em}
.pbbody mark{background:#FFE9A8;padding:0 .15em;border-radius:3px;color:inherit}.pbbody code{font:.86em ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--bg2);padding:.1em .35em;border-radius:5px}
.pbbody pre{background:#17161A;color:#F3EFE7;border-radius:14px;padding:18px 20px;overflow-x:auto;font:15px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}.pbbody pre code{background:none;padding:0;font:inherit;color:inherit}
.pbtb{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:var(--card)}.pbtb table{border-collapse:collapse;width:100%;font:15.5px/1.5 var(--sans);min-width:420px}.pbtb th{background:var(--bg2);text-align:left;font-weight:600;color:var(--ink)}.pbtb th,.pbtb td{padding:11px 16px;border-bottom:1px solid var(--line)}.pbtb tr:last-child td{border-bottom:0}
.pbv>div{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000}.pbv iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.pbbt{text-align:center}.pbbt .btn{text-decoration:none;font-family:var(--sans)}
.pbck{list-style:none;padding-left:0!important}.pbck li{padding-left:2em;position:relative}.pbck li:before{content:"";position:absolute;left:0;top:.5em;width:1.05em;height:1.05em;border-radius:5px;background:var(--red) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8.5l3 3 6-6.5' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/80% no-repeat}
.pbfaq{font-family:var(--sans);border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden}.pbfaq details+details{border-top:1px solid var(--line)}.pbfaq summary{cursor:pointer;padding:16px 20px;font-weight:600;font-size:17px;color:var(--ink);list-style:none;display:flex;justify-content:space-between;gap:12px}.pbfaq summary::-webkit-details-marker{display:none}.pbfaq summary:after{content:"+";color:var(--red);font-size:22px;line-height:1}.pbfaq details[open] summary:after{content:"\\2212"}.pbfaq details>div{padding:0 20px 18px;font-size:16.5px;line-height:1.65;color:var(--ink2)}
.pbrel{padding-top:20px;border-top:1px solid var(--line);padding-top:60px}
"""
JS = """(function(){var b=document.getElementById("pbbar");if(b){var f=function(){var a=document.querySelector(".pbbody");if(!a)return;var r=a.getBoundingClientRect(),t=r.height-innerHeight*.5;b.style.width=Math.max(0,Math.min(100,(-r.top+innerHeight*.3)/t*100))+"%"};addEventListener("scroll",f,{passive:true});f()}
document.querySelectorAll("[data-copy]").forEach(function(x){x.onclick=function(){var u=x.dataset.copy,d=function(){x.textContent="Link copied";setTimeout(function(){x.textContent="Copy link"},1800)};try{navigator.clipboard.writeText(u).then(d,function(){prompt("Copy this link",u)})}catch(e){prompt("Copy this link",u)}}})})();"""
