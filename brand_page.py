"""Brand Assets & Design System page (/brand/) and per-brand token files (/brand-assets/<brand>/).
Every value here was read from the live code or the original logo files; anything measured is marked as such."""
import colorsys, json, os, html

def rgb(h):
    h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def hsl(h):
    r, g, b = [x / 255 for x in rgb(h)]; hh, l, s = colorsys.rgb_to_hls(r, g, b)
    return f"hsl({round(hh*360)}, {round(s*100)}%, {round(l*100)}%)"
E = lambda s: html.escape(str(s), quote=True)

# (name, css var, value, group, source note)  source: "v" verified from code/file, "m" measured from logo pixels
BRANDS = [
 {"id": "haritt-group", "pre": "hg", "name": "Haritt Group", "role": "Umbrella brand", "url": "https://haritt.com",
  "about": "The umbrella brand for the group and its ventures. Warm off-white, editorial serif headlines and a deep red accent.",
  "theme": "Light only. The site does not ship a dark theme.",
  "src": "haritt.com/site.css and the original logo artwork",
  "logos": [("Primary logo (glossy 3D)", "/logo.png", "PNG", "Circular badge with a thin glassy ring. Use on light or dark backgrounds."),
            ("Favicon / compact", "/favicon.png", "PNG", "Browser tab and app icon use."),
            ("Social share cover", "/og.jpg", "JPG", "1200 × 630 link preview image.")],
  "missing": ["Secondary / wordmark-only logo", "Monochrome logo", "Dedicated dark-background version (the glossy badge works on both)"],
  "colors": [("Primary Red", "--hg-red", "#A70D22", "Brand"), ("Bright Red", "--hg-red-bright", "#C8102E", "Brand"),
             ("Logo Red Light", "--hg-logo-red-1", "#C8102A", "Logo"), ("Logo Red Mid", "--hg-logo-red-2", "#9E0A1C", "Logo"), ("Logo Red Deep", "--hg-logo-red-3", "#5E0010", "Logo"),
             ("Background", "--hg-bg", "#F5F4EF", "Surface"), ("Background Alt", "--hg-bg-alt", "#ECEAE2", "Surface"), ("Card", "--hg-card", "#FBFAF7", "Surface"),
             ("Text", "--hg-ink", "#17161A", "Text"), ("Text Secondary", "--hg-ink-2", "#3A3833", "Text"), ("Muted", "--hg-muted", "#6E6A60", "Text"), ("Faint", "--hg-faint", "#9A968B", "Text"),
             ("Border", "--hg-line", "#DDDAD0", "Border")],
  "nocolor": "Success, warning and error colours are not defined on haritt.com.",
  "fonts": [("Source Serif 4", "Headings, display", "400, 500, 600, italic 500", '"Source Serif 4", Georgia, "Times New Roman", serif', "Google Fonts · SIL Open Font License 1.1"),
            ("Inter", "Body, UI, navigation", "400, 500, 600", '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', "Google Fonts · SIL Open Font License 1.1")],
  "scale": [("Display (home hero)", "clamp(46px, 7.2vw, 92px)", "1.02", "-0.02em", "Serif 500"), ("H1 (page)", "clamp(44px, 6.4vw, 80px)", "inherits", "-0.02em", "Serif 500"),
            ("H2", "clamp(34px, 4.6vw, 56px)", "1.08", "-0.02em", "Serif 500"), ("H3 (cards)", "23–34px (24px most cards)", "1.25", "-0.02em", "Serif 500"),
            ("Lead", "clamp(19px, 2.1vw, 22px)", "1.6", "normal", "Sans 400"), ("Body", "17px", "1.65", "normal", "Sans 400"), ("Card text", "16px", "1.65", "normal", "Sans 400"),
            ("Navigation", "14.5px", "1.65", "normal", "Sans 400"), ("Button", "15px", "1.65", "normal", "Sans 500"), ("Eyebrow / caption", "12.5px uppercase", "1.65", "0.16em", "Sans 600")],
  "ui": [("Container", "max-width 1160px, side padding 24px"), ("Section spacing", "110px top and bottom (64px under 700px)"), ("Card", "background --hg-card, 1px solid --hg-line, radius 20px, padding 30px"),
         ("Button", "pill (radius 999px), 11px × 20px, background --hg-ink, text --hg-bg"), ("Navigation", "floating pill, 60px high, frosted card with radius 999px"),
         ("Shadow", "0 10px 30px -18px rgba(40,20,10,.35) on the navigation"), ("Motion", "hover .2s; cards .35s cubic-bezier(.2,.7,.2,1); reduced motion respected"),
         ("Breakpoints", "520, 600, 700, 760, 860, 900, 960px"), ("Icons", "real product icons; line icons where needed")],
  "tokens": {"radius-card": "20px", "radius-pill": "999px", "container": "1160px", "section-y": "110px", "shadow-nav": "0 10px 30px -18px rgba(40,20,10,.35)", "ease": "cubic-bezier(.2,.7,.2,1)",
             "font-heading": '"Source Serif 4", Georgia, "Times New Roman", serif', "font-body": '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
             "text-display": "clamp(46px, 7.2vw, 92px)", "text-h1": "clamp(44px, 6.4vw, 80px)", "text-h2": "clamp(34px, 4.6vw, 56px)", "text-h3": "24px", "text-body": "17px", "text-small": "14.5px", "text-caption": "12.5px", "leading-body": "1.65"},
  "fontcss": "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,500&family=Inter:wght@400;500;600&display=swap",
 },
 {"id": "haritt-developers", "pre": "hd", "name": "Haritt Developers", "role": "Digital services & technology brand", "url": "https://developers.haritt.com",
  "about": "The client-service brand for development, branding, marketing, lead generation and AI. Dark, premium surfaces with a red-to-orange growth gradient.",
  "theme": "Dark theme with light content sections on the same page. No user-switchable light/dark mode.",
  "src": "developers.haritt.com/site.css and the original logo file",
  "logos": [("Original logo (flat)", "/brand-assets/haritt-developers/logos/haritt-developers-original.png", "PNG", "The original artwork supplied by the founder. Flat red circle, white type."),
            ("Primary logo (glossy 3D)", "/brand-assets/haritt-developers/logos/haritt-developers-glossy.png", "PNG", "3D treatment used on the website. 532 × 532, transparent background."),
            ("Compact / icon (180px)", "/icons/haritt-developers.png", "PNG", "Header, footer and cross-brand cards.")],
  "missing": ["Secondary / wordmark-only logo", "Monochrome logo"],
  "colors": [("Primary Red", "--hd-red", "#E5263A", "Brand"), ("Growth Orange", "--hd-orange", "#FF7A3D", "Brand"), ("Gradient Mid", "--hd-grad-mid", "#FF5A3C", "Brand"), ("Gradient End", "--hd-grad-end", "#FF9A3D", "Brand"),
             ("Logo Red (original)", "--hd-logo-red", "#AC0700", "Logo"),
             ("Background", "--hd-bg", "#07080C", "Surface"), ("Background Alt", "--hd-bg-alt", "#0E1017", "Surface"), ("Card", "--hd-card", "#12141C", "Surface"),
             ("Light Section", "--hd-light", "#F6F5F2", "Surface"), ("Light Card", "--hd-light-card", "#FFFFFF", "Surface"),
             ("Text", "--hd-ink", "#F4F5F8", "Text"), ("Text Secondary", "--hd-soft", "#A3A7B3", "Text"), ("Faint", "--hd-faint", "#6F7380", "Text"),
             ("Text on Light", "--hd-light-soft", "#5D5F66", "Text"), ("Link on Light", "--hd-link", "#C41E30", "Text"),
             ("Border on Light", "--hd-light-line", "#E6E3DC", "Border"), ("Error", "--hd-error", "#FF8A8A", "State"), ("Success", "--hd-success", "#24AA6E", "State")],
  "colornote": "Dark-surface border is rgba(255,255,255,.09) (--hd-line). Brand gradient: linear-gradient(100deg, #E5263A 0%, #FF5A3C 45%, #FF9A3D 100%). The original logo red #AC0700 was measured from the logo file's pixels.",
  "measured": ["#AC0700"],
  "nocolor": "No warning colour is defined.",
  "fonts": [("Sora", "Headings, display, brand name", "600, 700", '"Sora", "Inter", system-ui, sans-serif', "Google Fonts · SIL Open Font License 1.1"),
            ("Inter", "Body, UI, forms", "400, 500, 600", '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', "Google Fonts · SIL Open Font License 1.1")],
  "scale": [("H1 (home)", "clamp(38px, 5.2vw, 64px)", "1.08", "-0.02em", "Sora 700"), ("H1 (page)", "clamp(38px, 5.6vw, 66px)", "1.08", "-0.02em", "Sora 700"),
            ("H2", "clamp(30px, 4.2vw, 50px)", "1.08", "-0.02em", "Sora 700"), ("H3", "20px", "1.08", "-0.01em", "Sora 600"), ("Lead", "clamp(17px, 1.6vw, 20px)", "1.65", "normal", "Inter 400"),
            ("Body", "16.5px", "1.65", "normal", "Inter 400"), ("Navigation", "15px", "1.65", "normal", "Inter 500"), ("Button", "15.5px", "1.65", "normal", "Inter 600"),
            ("Form label", "14px", "1.65", "normal", "Inter 600"), ("Eyebrow / caption", "13px uppercase", "1.65", "0.1em", "Inter 600")],
  "ui": [("Container", "max-width 1180px, side padding 24px"), ("Section spacing", "110px (80px under 760px)"), ("Card", "background --hd-card, 1px solid --hd-line, radius 22px, padding 28px"),
         ("Primary button", "pill, gradient background, white text, glow 0 14px 30px -12px rgba(229,38,58,.7)"), ("Ghost button", "pill, 1px border --hd-line, rgba(255,255,255,.03) fill"),
         ("Inputs", "background #0B0C12, radius 14px, 13px × 14px padding, orange focus border"), ("Icon tiles", "46px, radius 14px, red-orange tinted fill, 1.8px line icons"),
         ("Shadow", "0 30px 60px -30px rgba(0,0,0,.6)"), ("Motion", "hover .2–.25s; reveal .8s cubic-bezier(.2,.7,.2,1); floating logo 6s; reduced motion respected"),
         ("Breakpoints", "760, 1020px")],
  "tokens": {"radius-card": "22px", "radius-input": "14px", "radius-pill": "999px", "container": "1180px", "section-y": "110px", "gradient": "linear-gradient(100deg, #E5263A 0%, #FF5A3C 45%, #FF9A3D 100%)",
             "line": "rgba(255,255,255,.09)", "shadow": "0 30px 60px -30px rgba(0,0,0,.6)", "shadow-cta": "0 14px 30px -12px rgba(229,38,58,.7)", "ease": "cubic-bezier(.2,.7,.2,1)",
             "font-heading": '"Sora", "Inter", system-ui, sans-serif', "font-body": '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
             "text-h1": "clamp(38px, 5.2vw, 64px)", "text-h2": "clamp(30px, 4.2vw, 50px)", "text-h3": "20px", "text-body": "16.5px", "text-small": "14px", "text-caption": "13px", "leading-body": "1.65", "z-nav": "50"},
  "fontcss": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap",
 },
 {"id": "hv-world", "pre": "hvw", "name": "HV World", "role": "Digital product ecosystem", "url": "https://hvworld.haritt.com",
  "about": "The product ecosystem: HV Reset, HV Tests, HV Vault and HV AI. Clean, light, Apple-like surfaces with a deep blue accent and one colour per product.",
  "theme": "Light only. The HV World site does not ship a dark theme (individual apps may differ).",
  "src": "hvworld.haritt.com index.html styles and the SVG logo files",
  "logos": [("Primary logo / app icon", "/icons/hv-world.svg", "SVG", "Orbit mark on a blue-violet gradient tile."),
            ("HV Reset icon", "/icons/hv-reset.svg", "SVG", "Product icon."), ("HV Vault icon", "/icons/hv-vault.png", "PNG", "Product icon."),
            ("HV Test icon", "/icons/hv-test.png", "PNG", "Product icon."), ("HV AI icon", "/icons/hv-ai.svg", "SVG", "Product icon.")],
  "missing": ["Wordmark logo (\"HV World\" text lockup)", "Monochrome logo", "Dark-background version"],
  "colors": [("Accent Blue", "--hvw-accent", "#2E43A6", "Brand"), ("Accent Hover", "--hvw-accent-hover", "#1D2B72", "Brand"),
             ("Logo Navy", "--hvw-logo-1", "#1C2A6B", "Logo"), ("Logo Indigo", "--hvw-logo-2", "#4A46C9", "Logo"), ("Logo Violet", "--hvw-logo-3", "#7C5CE0", "Logo"),
             ("HV Test Green", "--hvw-test", "#127A4F", "Product"), ("HV Reset Blue", "--hvw-reset", "#4A72C8", "Product"), ("HV Vault Gold", "--hvw-vault", "#A87A22", "Product"), ("HV AI Violet", "--hvw-ai", "#6D4FD6", "Product"),
             ("Background", "--hvw-bg", "#F9F9FB", "Surface"), ("Surface Gray", "--hvw-gray", "#F2F3F6", "Surface"),
             ("Text", "--hvw-ink", "#1D1D1F", "Text"), ("Text Secondary", "--hvw-soft", "#6E6E73", "Text"), ("Faint", "--hvw-faint", "#86868B", "Text"), ("Border", "--hvw-line", "#E4E5EA", "Border")],
  "colornote": "Logo accent dots: #F2C063, #34C77B, #F2A77E. Logo core gradient #FFFFFF to #C9D3FF.",
  "nocolor": "No shared success, warning or error colours are defined on the HV World site.",
  "fonts": [("HVSora (Sora)", "Display headings", "400, 600–700", 'HVSora, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif', "Self-hosted: /media/fonts/Sora-Regular.ttf, Sora-SemiBold.ttf · SIL Open Font License 1.1"),
            ("System UI stack", "Body, UI", "system", '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif', "Device fonts, nothing to license")],
  "scale": [("H1", "clamp(40px, 5.4vw, 64px)", "1", "-0.045em", "700"), ("H2", "clamp(28px, 3.4vw, 42px)", "1.1", "-0.035em", "700"), ("H2 (Sora sections)", "clamp(26px, 5vw, 34px)", "1.15", "-0.03em", "Sora 600"),
            ("Body", "17px", "1.5", "-0.018em", "400"), ("Small", "15px", "1.5", "-0.018em", "400"), ("Caption", "13px", "1.5", "-0.018em", "400")],
  "ui": [("Buttons & chips", "pill (radius 999px)"), ("Cards", "radius 18–28px (18px most common), light borders --hvw-line"), ("Product theming", "each product sets its own colour (--pc) and tint on shared components"),
         ("Motion", "short hover transitions; reduced motion respected"), ("Icons", "rounded-square app icons with gradients")],
  "tokens": {"radius-card": "18px", "radius-card-lg": "28px", "radius-pill": "999px",
             "font-display": 'HVSora, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif', "font-body": '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
             "text-h1": "clamp(40px, 5.4vw, 64px)", "text-h2": "clamp(28px, 3.4vw, 42px)", "text-body": "17px", "text-small": "15px", "text-caption": "13px", "leading-body": "1.5", "tracking-body": "-0.018em"},
  "fontcss": None,
 },
]

def css_tokens(b):
    p = b["pre"]; lines = [f"/* {b['name']} design tokens. Source: {b['src']}. Copy only into projects for this brand. */", f".brand-{b['id']}, :root {{"]
    lines += [f"  {v}: {h};" for _, v, h, _ in b["colors"]]
    lines += [f"  --{p}-{k}: {v};" for k, v in b["tokens"].items()]
    return "\n".join(lines) + "\n}\n"
def json_tokens(b):
    return json.dumps({"brand": b["name"], "website": b["url"], "source": b["src"], "theme": b["theme"],
        "color": {v.split("-", 3)[-1] if False else v.replace(f"--{b['pre']}-", ""): {"name": n, "hex": h, "rgb": "rgb(%d, %d, %d)" % rgb(h), "hsl": hsl(h), "group": g} for n, v, h, g in b["colors"]},
        "font": [{"family": f, "use": u, "weights": w, "css": c, "source": s} for f, u, w, c, s in b["fonts"]],
        "tokens": b["tokens"], "logos": [{"name": n, "path": "https://haritt.com" + pth, "format": fm} for n, pth, fm, _ in b["logos"]]}, indent=2) + "\n"
def typo_css(b):
    out = [f"/* {b['name']} typography */"]
    if b["fontcss"]: out.append(f'@import url("{b["fontcss"]}");')
    out.append(f".brand-{b['id']}, :root {{")
    out += [f"  --{b['pre']}-font-{i+1}: {c}; /* {f}: {u} */" for i, (f, u, w, c, s) in enumerate(b["fonts"])]
    out += [f"  --{b['pre']}-{k}: {v};" for k, v in b["tokens"].items() if k.startswith(("text-", "leading", "tracking", "font-"))]
    return "\n".join(out) + "\n}\n"

def write_files(root):
    for b in BRANDS:
        d = os.path.join(root, "brand-assets", b["id"]); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "colors.css"), "w").write(css_tokens(b))
        open(os.path.join(d, "typography.css"), "w").write(typo_css(b))
        open(os.path.join(d, "tokens.json"), "w").write(json_tokens(b))
        g = [f"# {b['name']} brand guidelines", "", f"Role: {b['role']}. Website: {b['url']}.", "", b["about"], "", f"Theme: {b['theme']}", "",
             "## Logos", *[f"- {n}: https://haritt.com{p} ({fm}). {d2}" for n, p, fm, d2 in b["logos"]], "", "Not available: " + "; ".join(b["missing"]) + ".", "",
             "## Usage", *[f"- {x}" for x in RULES], "", "## Fonts", *[f"- {f}: {u}, weights {w}. {s}" for f, u, w, c, s in b["fonts"]], "",
             "Tokens: colors.css, typography.css, tokens.json in this folder. They document the live site; changing them does not change the website.", ""]
        open(os.path.join(d, "guidelines.md"), "w").write("\n".join(g))

RULES = ["Use the logo files as supplied. Never stretch, squash, rotate, recolour or add effects.",
         "Minimum size: 24px on screen for circular badges and app icons; 32px or larger when the text inside must be readable.",
         "Clear space: keep at least 25% of the logo's width empty on every side.",
         "Circular badges and app icons work on light and dark backgrounds; avoid busy photos behind them.",
         "Keep each brand in its own colours and fonts. Do not mix tokens across brands.",
         "Cross-brand links: show the venture's own logo and name, and link to its own website.",
         "Headers: logo plus brand name; a parent link (\"by Haritt Group\") may sit beside a venture's name.",
         "Naming: brand-assets/<brand>/logos/<brand>-<variant>.<ext>; CSS variables use the brand prefix (--hg-, --hd-, --hvw-)."]

def copybtn(val, label="Copy"):
    return f'<button class="bc" type="button" data-copy="{E(val)}" aria-label="{E(label)}: {E(val)}">{E(label)}</button>'

def brand_html(b):
    pid = b["id"]
    logos = "".join(f'''<div class="lgc"><div class="lgv"><div class="lgl"><img src="{p}" alt="{E(n)}" loading="lazy"></div><div class="lgd"><img src="{p}" alt="" loading="lazy"></div></div>
<div class="lgi"><b>{E(n)}</b><span>{fm} · {E(d)}</span><div class="bca">{copybtn("https://haritt.com" + p, "Copy URL")}<a class="bc" href="{p}" download>Download</a></div></div></div>''' for n, p, fm, d in b["logos"])
    miss = "".join(f"<li>{E(m)} <span class='na'>Not available</span></li>" for m in b["missing"])
    groups = []
    for grp in ["Brand", "Logo", "Product", "Surface", "Text", "Border", "State"]:
        cs = [c for c in b["colors"] if c[3] == grp]
        if not cs: continue
        groups.append(f'<h4 class="bh4">{grp}</h4><div class="sw">' + "".join(f'''<div class="swc"><div class="swx" style="background:{h}"></div><div class="swi"><b>{E(n)}{' <span class="est">measured</span>' if h in b.get("measured", []) else ''}</b>
<div class="swr"><span>{h}</span>{copybtn(h,"HEX")}</div><div class="swr"><span>rgb{rgb(h)}</span>{copybtn("rgb(%d, %d, %d)" % rgb(h),"RGB")}</div><div class="swr"><span>{hsl(h)}</span>{copybtn(hsl(h),"HSL")}</div><div class="swr"><code>{v}</code>{copybtn(f"{v}: {h};","Var")}</div></div></div>''' for n, v, h, _ in cs) + "</div>")
    allcolors = "\n".join(f"{v}: {h};" for _, v, h, _ in b["colors"])
    fonts = "".join(f'''<div class="fc"><div class="fs" style="font-family:{E(c)}">Aa Bb 123</div><b>{E(f)}</b><span>{E(u)} · weights {E(w)}</span><span class="fsrc">{E(s)}</span><div class="bca">{copybtn("font-family: " + c + ";", "Copy font-family")}</div></div>''' for f, u, w, c, s in b["fonts"])
    scale = "".join(f"<tr><td>{E(a)}</td><td><code>{E(s)}</code></td><td>{E(l)}</td><td>{E(t)}</td><td>{E(w)}</td></tr>" for a, s, l, t, w in b["scale"])
    ui = "".join(f"<tr><td>{E(a)}</td><td>{E(v)}</td></tr>" for a, v in b["ui"])
    css = css_tokens(b); js = json_tokens(b); ty = typo_css(b)
    return f'''<section class="bsec" id="{pid}"><div class="w">
<div class="bhd rv"><img src="{b["logos"][0][1]}" alt="" width="64" height="64"><div><div class="eb">{E(b["role"])}</div><h2>{E(b["name"])}</h2><p class="bab">{E(b["about"])}</p>
<p class="bmeta"><a href="{b["url"]}">{b["url"].replace("https://","")}</a> · Source: {E(b["src"])}</p></div></div>
<h3 class="bh3">Logos</h3><div class="lgg">{logos}</div><ul class="miss">{miss}</ul>
<h3 class="bh3">Colours</h3>{"".join(groups)}<p class="bnote">{E(b.get("colornote",""))} {E(b["nocolor"])}</p><div class="bca">{copybtn(allcolors, "Copy all colour tokens")}</div>
<h3 class="bh3">Typography</h3><div class="fg2">{fonts}</div>
<div class="tbl"><table><thead><tr><th>Style</th><th>Size (desktop → mobile)</th><th>Line height</th><th>Letter spacing</th><th>Weight</th></tr></thead><tbody>{scale}</tbody></table></div>
<p class="bnote">Observed on the live site. clamp() values scale between mobile and desktop automatically.</p>
<h3 class="bh3">Theme & UI</h3><p class="bnote" style="margin-top:0"><b>{E(b["theme"])}</b></p><div class="tbl"><table><tbody>{ui}</tbody></table></div>
<h3 class="bh3">Design tokens</h3>
<div class="tk"><div class="tkh"><b>CSS custom properties</b><div class="bca">{copybtn(css,"Copy CSS")}<a class="bc" href="/brand-assets/{pid}/colors.css" download>colors.css</a></div></div><pre>{E(css)}</pre></div>
<div class="tk"><div class="tkh"><b>Typography CSS</b><div class="bca">{copybtn(ty,"Copy typography")}<a class="bc" href="/brand-assets/{pid}/typography.css" download>typography.css</a></div></div><pre>{E(ty)}</pre></div>
<div class="tk"><div class="tkh"><b>JSON tokens</b><div class="bca">{copybtn(js,"Copy JSON")}<a class="bc" href="/brand-assets/{pid}/tokens.json" download>tokens.json</a></div></div><pre class="tall">{E(js)}</pre></div>
<p class="bnote">Tailwind: paste the colour values into <code>theme.extend.colors.{b["pre"]}</code> and the font stacks into <code>theme.extend.fontFamily</code>. These tokens document the live site; copying or editing them does not change any website.</p>
</div></section>'''

STYLE = """<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet"><style>
.bnav{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}.bnav a{display:inline-flex;align-items:center;gap:10px;text-decoration:none;padding:8px 16px 8px 8px;border:1px solid var(--line);border-radius:999px;background:var(--card);font-size:15px}.bnav img{width:30px;height:30px;border-radius:50%}
.bsec{padding:90px 0}.bhd{display:flex;gap:22px;align-items:flex-start}.bhd img{width:64px;height:64px;border-radius:16px;flex:none}.bab{color:var(--ink2);margin-top:10px;max-width:760px}.bmeta{font-size:14px;color:var(--muted);margin-top:8px}
.bh3{font-family:var(--serif);font-size:28px;margin:54px 0 18px}.bh4{font:600 12.5px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:22px 0 10px}
.lgg{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}.lgc{background:var(--card);border:1px solid var(--line);border-radius:20px;overflow:hidden}
.lgv{display:grid;grid-template-columns:1fr 1fr}.lgv>div{height:130px;display:grid;place-items:center}.lgl{background:#fff}.lgd{background:#14141a}.lgv img{max-width:72%;max-height:96px;object-fit:contain}
.lgi{padding:16px}.lgi b{display:block}.lgi span{display:block;font-size:13.5px;color:var(--muted);margin-top:4px}
.bca{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.bc{font:500 13px var(--sans);color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 12px;cursor:pointer;text-decoration:none}.bc:hover{border-color:var(--red);color:var(--red)}.bc.ok{border-color:#2E7D4F;color:#2E7D4F}
.miss{list-style:none;padding:0;margin:14px 0 0;display:flex;flex-wrap:wrap;gap:8px}.miss li{font-size:13.5px;color:var(--ink2);border:1px dashed var(--line);border-radius:999px;padding:5px 12px}.na{color:var(--faint)}
.sw{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.swc{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}.swx{height:64px;border-bottom:1px solid var(--line)}
.swi{padding:12px 14px}.swi b{display:block;font-size:14.5px;margin-bottom:6px}.swr{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12.5px;color:var(--ink2);padding:2px 0}.swr .bc{padding:3px 9px;font-size:11.5px}
.swr code,.tbl code{font:12px ui-monospace,Menlo,monospace}.est{font:600 10.5px var(--sans);color:#8A5A00;background:#FFF3D6;border-radius:99px;padding:2px 7px;margin-left:4px}
.bnote{font-size:14px;color:var(--muted);margin-top:14px;max-width:820px}
.fg2{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}.fc{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px}.fs{font-size:44px;line-height:1.1;margin-bottom:12px}.fc b{display:block}.fc span{display:block;font-size:13.5px;color:var(--muted);margin-top:3px}.fsrc{font-style:italic}
.tbl{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:18px;margin-top:16px}.tbl table{border-collapse:collapse;width:100%;font-size:14.5px}.tbl th,.tbl td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:top}.tbl th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}.tbl tr:last-child td{border-bottom:0}
.tk{background:#17161A;border-radius:18px;margin-top:14px;overflow:hidden}.tkh{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 16px;color:#F5F4EF;border-bottom:1px solid #2c2a26}.tkh .bca{margin:0}
.tk pre{margin:0;padding:16px;color:#E9E6DD;font:12.5px/1.6 ui-monospace,Menlo,monospace;overflow:auto;max-height:260px}.tk pre.tall{max-height:320px}
.lib{overflow-x:auto}.btoast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);background:#17161A;color:#fff;padding:10px 18px;border-radius:999px;font-size:14px;opacity:0;transition:.25s;pointer-events:none;z-index:99}.btoast.on{opacity:1;transform:translateX(-50%)}
.rules{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}.rules div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;font-size:15px;color:var(--ink2)}
@media (max-width:600px){.bhd{flex-direction:column}.bsec{padding:64px 0}}
</style>"""

SCRIPT = """<div class="btoast" id="btoast" role="status" aria-live="polite"></div><script>
(function(){var t=document.getElementById("btoast");function say(m){t.textContent=m;t.classList.add("on");clearTimeout(say.x);say.x=setTimeout(function(){t.classList.remove("on")},1600)}
document.querySelectorAll(".bc[data-copy]").forEach(function(b){b.addEventListener("click",function(){var v=b.getAttribute("data-copy");function ok(){var o=b.textContent;b.classList.add("ok");say("Copied");setTimeout(function(){b.classList.remove("ok")},1200)}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v).then(ok,function(){fb(v);ok()})}else{fb(v);ok()}})});
function fb(v){var a=document.createElement("textarea");a.value=v;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();try{document.execCommand("copy")}catch(e){}a.remove()}})();
</script>"""

def library():
    rows = []
    for b in BRANDS:
        for n, p, fm, d in b["logos"]:
            rows.append((b["name"], n, "Logo / icon", fm, p))
        for f in ["colors.css", "typography.css", "tokens.json", "guidelines.md"]:
            rows.append((b["name"], f, "Design tokens" if f != "guidelines.md" else "Guidelines", f.split(".")[-1].upper(), f"/brand-assets/{b['id']}/{f}"))
    r = "".join(f'<tr><td>{E(a)}</td><td>{E(n)}</td><td>{E(t)}</td><td>{E(fm)}</td><td><div class="bca" style="margin:0">{copybtn("https://haritt.com"+p,"Copy URL")}<a class="bc" href="{p}" download>Download</a></div></td></tr>' for a, n, t, fm, p in rows)
    return f'<div class="tbl lib"><table><thead><tr><th>Brand</th><th>Asset</th><th>Type</th><th>Format</th><th></th></tr></thead><tbody>{r}</tbody></table></div>'

def build():
    nav = "".join(f'<a href="#{b["id"]}"><img src="{b["logos"][0][1]}" alt="">{E(b["name"])}</a>' for b in BRANDS)
    rules = "".join(f"<div>{E(x)}</div>" for x in RULES)
    return STYLE + f'''<header class="ph"><div class="w"><div class="eb rv">Brand</div><h1 class="rv">Brand Assets &amp;<br>Design System</h1>
<p class="lead rv">One central reference for the visual identity, design tokens, logos, typography, and brand assets across the Haritt ecosystem.</p>
<p class="bnote rv">Haritt Group is the umbrella brand. Haritt Developers is the client-service and technology brand. HV World is a separate digital product ecosystem. Each keeps its own identity.</p>
<div class="bnav rv">{nav}<a href="#library">Asset library</a><a href="#guidelines">Guidelines</a></div></div></header>
{"".join(brand_html(b) for b in BRANDS)}
<section class="bsec" id="library"><div class="w"><div class="eb">Library</div><h2>Brand assets library</h2><p class="bab">Every file, grouped by brand. Download the original or copy its URL.</p>{library()}</div></section>
<section class="bsec" id="guidelines"><div class="w"><div class="eb">Guidelines</div><h2>Usage rules</h2><p class="bab">Apply to all three brands.</p><div class="rules" style="margin-top:24px">{rules}</div>
<p class="bnote">Updating a brand: change its values in this documentation and its token files, then update that brand's own website separately. Nothing here is synced to the live sites automatically.</p></div></section>
''' + SCRIPT
