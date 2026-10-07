"""Builds the Haritt Group multi-page site. Run: python3 build.py"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

CSS = """
:root{--bg:#F5F4EF;--bg2:#ECEAE2;--card:#FBFAF7;--ink:#17161A;--ink2:#3A3833;--muted:#6E6A60;--faint:#9A968B;--line:#DDDAD0;
--red:#A70D22;--red2:#C8102E;--redsoft:rgba(167,13,34,.07);--serif:"Source Serif 4",Georgia,"Times New Roman",serif;--sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
*{box-sizing:border-box}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.65 var(--sans);-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit}p{margin:0}.w{max-width:1160px;margin:0 auto;padding:0 24px}.nar{max-width:780px}
.topbar{height:3px;background:linear-gradient(90deg,var(--red),var(--red2) 60%,#E8505F)}
nav{position:sticky;top:0;z-index:30;background:rgba(245,244,239,.88);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid transparent;transition:border-color .3s}
nav.sc{border-bottom-color:var(--line)}
nav .w{display:flex;align-items:center;justify-content:space-between;height:70px}
.br{display:flex;align-items:center;gap:11px;text-decoration:none}.br img{width:32px;height:32px;border-radius:50%}
.br span{font-family:var(--serif);font-size:22px;font-weight:600;letter-spacing:-.01em}
.lk{display:flex;align-items:center;gap:30px;font-size:15px}.lk a{text-decoration:none;color:var(--ink2);position:relative}
.lk a:not(.btn):hover{color:var(--ink)}
.lk a.on{color:var(--ink)}.lk a.on::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:2px;border-radius:2px;background:var(--red)}
.btn{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-weight:500;font-size:15px;padding:11px 20px;border-radius:999px;background:var(--ink);color:var(--bg)!important;transition:background .2s,transform .2s}
.btn:hover{background:var(--red);transform:translateY(-1px)}
.btn.o{background:transparent;color:var(--ink)!important;border:1px solid var(--ink)}.btn.o:hover{background:var(--ink);color:var(--bg)!important}
.btn.r{background:var(--red)}.btn.r:hover{background:#7E0A1A}
.menu{display:none;background:none;border:0;padding:8px;cursor:pointer}.menu i{display:block;width:22px;height:2px;background:var(--ink);margin:5px 0;border-radius:2px}
@media (max-width:900px){.lk{display:none}.menu{display:block}
 nav.open .lk{display:flex;position:absolute;top:70px;left:0;right:0;flex-direction:column;align-items:flex-start;gap:18px;padding:22px 24px 28px;background:var(--bg);border-bottom:1px solid var(--line)}}
.eb{font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--red)}
h1,h2,h3{font-family:var(--serif);font-weight:500;letter-spacing:-.02em;margin:0}
h1{font-size:clamp(46px,7.2vw,92px);line-height:1.02}h2{font-size:clamp(34px,4.6vw,56px);line-height:1.08}h3{font-size:24px;line-height:1.25}
.lead{font-size:clamp(19px,2.1vw,22px);line-height:1.6;color:var(--ink2)}
section{padding:110px 0;border-top:1px solid var(--line)}@media (max-width:700px){section{padding:80px 0}}
.ph{padding:110px 0 70px;border-top:0}.ph h1{font-size:clamp(44px,6.4vw,80px);margin-top:16px}.ph .lead{margin-top:24px;max-width:680px}
/* home hero */
.hero{padding:96px 0 90px;border-top:0;position:relative;overflow:hidden}
.hero .g{display:grid;grid-template-columns:1.25fr 1fr;gap:56px;align-items:center}@media (max-width:960px){.hero .g{grid-template-columns:1fr}}
.hero h1 em{font-style:italic;color:var(--red)}
.hero .lead{margin-top:28px;max-width:600px}
.hero .cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:40px}
.tag{display:inline-flex;align-items:center;gap:10px;padding:6px 14px 6px 6px;border-radius:99px;background:var(--card);border:1px solid var(--line);font-size:13.5px;color:var(--ink2);margin-bottom:30px}
.tag img{width:26px;height:26px;border-radius:50%}.tag b{color:var(--red);font-weight:600}
.orbit{position:relative;aspect-ratio:1;max-width:460px;width:100%;margin:0 auto}
.orbit .ring{position:absolute;inset:0;border:1px dashed #CFCBC0;border-radius:50%}.orbit .ring.r2{inset:17%;border-style:solid;border-color:#E2DFD5}
.orbit .core{position:absolute;left:50%;top:50%;width:34%;transform:translate(-50%,-50%);border-radius:50%;filter:drop-shadow(0 24px 40px rgba(120,0,20,.28))}
.orbit .sp{position:absolute;inset:0;animation:spin 60s linear infinite}
.orbit .ic{position:absolute;width:18%;transform:translate(-50%,-50%)}
.orbit .ic img{width:100%;display:block;border-radius:24%;box-shadow:0 14px 30px -14px rgba(30,20,10,.45);animation:spin 60s linear infinite reverse}
@keyframes spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.orbit .sp,.orbit .ic img{animation:none}}
.strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:84px}
@media (max-width:760px){.strip{grid-template-columns:1fr 1fr}}
.strip div{padding:26px 22px}.strip div+div{border-left:1px solid var(--line)}
@media (max-width:760px){.strip div:nth-child(3){border-left:0}.strip div:nth-child(n+3){border-top:1px solid var(--line)}}
.strip b{display:block;font-family:var(--serif);font-size:30px;font-weight:500}.strip span{color:var(--muted);font-size:14.5px}
/* blocks */
.two{display:grid;grid-template-columns:1fr 1.35fr;gap:72px;align-items:start}@media (max-width:860px){.two{grid-template-columns:1fr;gap:26px}}
.two .txt p+p{margin-top:20px}.two .txt p{font-size:19px;color:var(--ink2)}
.mv{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line);border-radius:22px;overflow:hidden;background:var(--card)}
@media (max-width:760px){.mv{grid-template-columns:1fr}}
.mv>div{padding:46px;position:relative}.mv>div+div{border-left:1px solid var(--line)}
@media (max-width:760px){.mv>div+div{border-left:0;border-top:1px solid var(--line)}}
.mv>div::before{content:"";position:absolute;left:46px;top:0;width:44px;height:3px;background:var(--red);border-radius:0 0 3px 3px}
.mv p{font-family:var(--serif);font-size:clamp(23px,2.6vw,31px);line-height:1.3;margin-top:16px;letter-spacing:-.01em}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}@media (max-width:860px){.cards{grid-template-columns:1fr}}
.cd{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:30px;transition:transform .35s cubic-bezier(.2,.7,.2,1),border-color .3s}
.cd:hover{transform:translateY(-3px);border-color:#CBC6B9}
.cd .n{font-family:var(--serif);font-size:15px;color:var(--red)}.cd h3{margin-top:14px}.cd p{margin-top:10px;color:var(--muted);font-size:16px}
.prod{display:grid;grid-template-columns:1.05fr 1fr;background:#17161A;color:#F5F4EF;border-radius:28px;overflow:hidden;position:relative}
.prod::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,var(--red),#E8505F)}
@media (max-width:900px){.prod{grid-template-columns:1fr}}
.prod .l{padding:56px}@media (max-width:600px){.prod .l{padding:34px}}
.prod .l .eb{color:#E8818E}.prod h3{font-size:clamp(34px,4vw,48px);margin-top:16px}
.prod .l>img{width:68px;height:68px;border-radius:18px}
.prod .l p{color:#CFCABE;margin-top:16px;font-size:17.5px}.prod .l .btn{background:#F5F4EF;color:#17161A!important;margin-top:30px}.prod .l .btn:hover{background:#fff}
.prod .r{border-left:1px solid #33312C;display:flex;flex-direction:column}@media (max-width:900px){.prod .r{border-left:0;border-top:1px solid #33312C}}
.app{padding:26px 40px;border-bottom:1px solid #33312C;display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;text-decoration:none;transition:background .25s}
.app:last-child{border-bottom:0}.app:hover{background:#221F1C}
.app img{width:46px;height:46px;border-radius:12px;display:block}
.app b{display:block;font-weight:600;font-size:17px}.app span{display:block;color:#ADA89B;font-size:14.5px;margin-top:2px}.app em{font-style:normal;color:#77736A}
.pr{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid var(--line)}@media (max-width:760px){.pr{grid-template-columns:1fr}}
.pr>div{padding:36px 36px 36px 0;border-bottom:1px solid var(--line)}.pr>div:nth-child(even){padding-left:36px;border-left:1px solid var(--line)}
@media (max-width:760px){.pr>div,.pr>div:nth-child(even){padding:30px 0;border-left:0}}
.pr .n{font-family:var(--serif);color:var(--red);font-size:15px}.pr h3{font-size:24px;margin-top:8px}.pr p{margin-top:10px;color:var(--muted)}
.rd{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}@media (max-width:860px){.rd{grid-template-columns:1fr}}
.rc{border-top:2px solid var(--line);padding-top:22px}.rc.now{border-top-color:var(--red)}
.rc .t{font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}.rc.now .t{color:var(--red)}
.rc h3{margin-top:10px;font-size:23px}.rc p{margin-top:8px;color:var(--muted);font-size:16px}
.fd{display:grid;grid-template-columns:auto 1fr;gap:48px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:24px;padding:48px}
@media (max-width:700px){.fd{grid-template-columns:1fr;gap:24px;padding:32px}}
.av{width:140px;height:140px;border-radius:50%;background:linear-gradient(160deg,#fff,var(--bg2));border:1px solid var(--line);display:grid;place-items:center;font-family:var(--serif);font-size:48px;color:var(--red)}
.fd h3{font-size:34px}.fd .r{color:var(--red);font-weight:500;font-size:15px;margin-top:4px}.fd p{margin-top:16px;color:var(--ink2)}
.fd .ln{display:flex;gap:18px;flex-wrap:wrap;margin-top:20px;font-weight:500;font-size:15px}.fd .ln a{text-underline-offset:4px}
.band{background:#17161A;color:#F5F4EF;border-radius:28px;padding:72px 56px;text-align:center;position:relative;overflow:hidden}
.band::after{content:"";position:absolute;width:520px;height:520px;right:-180px;top:-260px;border-radius:50%;background:radial-gradient(closest-side,rgba(200,16,46,.45),transparent)}
.band h2{position:relative;z-index:1}.band p{position:relative;z-index:1;color:#CFCABE;margin:18px auto 0;max-width:560px;font-size:19px}
.band .cta{position:relative;z-index:1;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:34px}
.band .btn{background:#F5F4EF;color:#17161A!important}.band .btn:hover{background:#fff}.band .btn.o{background:transparent;color:#F5F4EF!important;border-color:#F5F4EF}
@media (max-width:600px){.band{padding:52px 26px}}
.cgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}@media (max-width:860px){.cgrid{grid-template-columns:1fr}}
.cc{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:30px}.cc .eb{color:var(--muted)}
.cc a{display:block;font-family:var(--serif);font-size:24px;margin-top:12px;text-decoration:none;color:var(--ink)}.cc a:hover{color:var(--red)}
.cc p{margin-top:8px;color:var(--muted);font-size:15.5px}
.more{display:inline-flex;align-items:center;gap:6px;margin-top:26px;font-weight:500;color:var(--red);text-decoration:none;font-size:16px}.more:hover{gap:10px}
.more{transition:gap .2s}
.sh{display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap;margin-bottom:52px}
footer{border-top:1px solid var(--line);padding:64px 0 48px;font-size:14.5px;color:var(--muted)}
.fg{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:32px}@media (max-width:760px){.fg{grid-template-columns:1fr 1fr}}
.fg b{display:block;color:var(--ink);font-weight:600;margin-bottom:12px}.fg a{display:block;text-decoration:none;margin:7px 0}.fg a:hover{color:var(--red)}
.fb{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:52px;padding-top:24px;border-top:1px solid var(--line);font-size:13.5px}
.rv{opacity:0;transform:translateY(22px);transition:opacity .9s ease,transform 1s cubic-bezier(.2,.7,.2,1)}.rv.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){*{transition:none!important}.rv{opacity:1;transform:none}}
"""

PAGES = [("/", "Home"), ("/about/", "About"), ("/products/", "Products"), ("/leadership/", "Leadership"), ("/contact/", "Contact")]
HV = "https://hvworld.haritt.com"
APPS = [
    ("hv-reset.svg", "HV Reset", "Plan your day, one task at a time, with a personal dashboard for focus and progress.", HV + "/reset/"),
    ("hv-vault.png", "HV Vault", "Every job, company and follow-up in one place, from first application to offer.", HV + "/vault/"),
    ("hv-test.png", "HV Test", "Short tests that show your strengths and how you grow, with private results.", HV + "/test/"),
    ("hv-ai.svg", "HV AI", "The assistant inside every app. Speak or type in English, Hindi or Hinglish.", HV + "/"),
]


def page(path, title, desc, body):
    links = "".join('<a href="%s"%s>%s</a>' % (h, ' class="on"' if h == path else "", n) for h, n in PAGES[1:])
    full = "Haritt Group" if path == "/" else "%s · Haritt Group" % title
    url = "https://haritt.com" + path
    return """<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title><meta name="description" content="%s"><meta name="theme-color" content="#F5F4EF">
<link rel="icon" href="/logo.png" type="image/png"><link rel="apple-touch-icon" href="/logo.png"><link rel="canonical" href="%s">
<meta property="og:type" content="website"><meta property="og:site_name" content="Haritt Group"><meta property="og:title" content="%s"><meta property="og:description" content="%s"><meta property="og:url" content="%s"><meta property="og:image" content="https://haritt.com/og.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://haritt.com/og.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site.css">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Haritt Group","url":"https://haritt.com","logo":"https://haritt.com/logo.png","email":"hello@haritt.com","founder":{"@type":"Person","name":"Harsh Goyal"}}</script>
</head><body><div class="topbar"></div>
<nav id="nav"><div class="w"><a class="br" href="/"><img src="/logo.png" alt="Haritt Group logo"><span>Haritt</span></a>
<div class="lk">%s<a class="btn" href="%s/">Try HV World</a></div>
<button class="menu" id="menu" aria-label="Open menu"><i></i><i></i><i></i></button></div></nav>
%s
<footer><div class="w"><div class="fg">
<div><a class="br" href="/"><img src="/logo.png" alt=""><span>Haritt</span></a><p style="margin-top:14px;max-width:290px">Useful technology, made simple. An independent company, built in India.</p></div>
<div><b>Company</b><a href="/about/">About</a><a href="/about/#principles">Principles</a><a href="/leadership/">Leadership</a><a href="/contact/">Contact</a></div>
<div><b>Products</b><a href="/products/">HV World</a><a href="%s/reset/">HV Reset</a><a href="%s/vault/">HV Vault</a><a href="%s/test/">HV Test</a></div>
<div><b>Legal</b><a href="%s/privacy/">Privacy</a><a href="%s/terms/">Terms</a></div>
</div><div class="fb"><span>© 2026 Haritt Group. All rights reserved.</span><span>hello@haritt.com</span></div></div></footer>
<script src="/site.js"></script></body></html>""" % (full, desc, url, full, desc, url, links, HV, body, HV, HV, HV, HV, HV)


def apps_list():
    return "".join('<a class="app" href="%s"><img src="/icons/%s" alt="%s icon"><div><b>%s</b><span>%s</span></div><em>→</em></a>' % (u, i, n, n, d) for i, n, d, u in APPS)


def band(h, p):
    return ('<section><div class="w"><div class="band rv"><h2>%s</h2><p>%s</p><div class="cta">'
            '<a class="btn" href="%s/">Try HV World →</a><a class="btn o" href="/contact/">Contact us</a></div></div></div></section>') % (h, p, HV)


MV = ('<div class="mv rv"><div><div class="eb">Our mission</div><p>To make useful technology simple and accessible for everyone, from individuals to growing businesses.</p></div>'
      '<div><div class="eb">Our vision</div><p>To become India’s most trusted home for simple, useful products that people rely on every day.</p></div></div>')

ORBIT = ('<div class="orbit rv" aria-hidden="true"><div class="ring"></div><div class="ring r2"></div><img class="core" src="/logo.png" alt="">'
         '<div class="sp">' + "".join('<div class="ic" style="left:%s;top:%s"><img src="/icons/%s" alt=""></div>' % (x, y, i) for (x, y), i in zip(
             [("50%", "0%"), ("100%", "50%"), ("50%", "100%"), ("0%", "50%"), ("85.4%", "14.6%")], ["hv-world.svg", "hv-reset.svg", "hv-vault.png", "hv-test.png", "hv-ai.svg"])) +
         '</div></div>')

HOME = """<header class="hero"><div class="w"><div class="g"><div>
<div class="tag rv"><img src="/logo.png" alt=""><span><b>Haritt Group</b> · Founded 2026 · India</span></div>
<h1 class="rv">Useful technology,<br><em>made simple.</em></h1>
<p class="lead rv">We build products that put AI to work for everyday life and everyday work: for people planning their day, professionals growing their careers, and businesses getting more done.</p>
<div class="cta rv"><a class="btn" href="/products/">Our products →</a><a class="btn o" href="/about/">About Haritt</a></div>
</div>""" + ORBIT + """</div>
<div class="strip rv"><div><b>1</b><span>Product live: HV World</span></div><div><b>4</b><span>Apps and assistants</span></div><div><b>3</b><span>Languages HV AI understands</span></div><div><b>₹0</b><span>To get started</span></div></div>
</div></header>
<section><div class="w"><div class="two"><div class="rv"><div class="eb">Who we are</div><h2 style="margin-top:14px">An independent, founder-led company.</h2></div>
<div class="txt rv"><p>Powerful technology is everywhere, but most of it is built for experts. Haritt Group exists to turn what AI can do into products anyone can open, understand in a minute and use every day.</p>
<a class="more" href="/about/">Read our story →</a></div></div>
<div style="margin-top:56px">""" + MV + """</div></div></section>
<section><div class="w"><div class="sh"><div class="rv nar"><div class="eb">Our product</div><h2 style="margin-top:14px">HV World.</h2></div><a class="more rv" href="/products/" style="margin:0">All products →</a></div>
<div class="prod rv"><div class="l"><img src="/icons/hv-world.svg" alt="HV World icon"><h3>One assistant.<br>Three apps.</h3>
<p>Tell HV AI what you need in your own words, and it plans your day, files a job lead or opens the right test. One sign-in works everywhere.</p>
<a class="btn" href=\"""" + HV + """/">Open HV World →</a></div><div class="r">""" + apps_list() + """</div></div></div></section>
<section><div class="w"><div class="rv nar" style="margin-bottom:52px"><div class="eb">Who we build for</div><h2 style="margin-top:14px">From one person to a whole team.</h2></div>
<div class="cards"><div class="cd rv"><div class="n">01</div><h3>Individuals</h3><p>Students, homemakers and anyone who wants to understand themselves and make the most of their time.</p></div>
<div class="cd rv"><div class="n">02</div><h3>Professionals</h3><p>People building a career, from the first application to the next role, with every opportunity in one place.</p></div>
<div class="cd rv"><div class="n">03</div><h3>Startups &amp; businesses</h3><p>Small teams that want AI to take busywork off their plate, without hiring a technical department.</p></div></div></div></section>
""" + band("Start with HV World. It’s free.", "Plan your day, track your career and know yourself better, with one assistant that speaks your language.")

ABOUT = """<header class="ph"><div class="w"><div class="eb rv">About Haritt</div><h1 class="rv">Technology that works<br>for everyone.</h1>
<p class="lead rv">Haritt Group is an independent, founder-led company from India. We build simple, useful products with AI, starting with HV World.</p></div></header>
<section><div class="w"><div class="two"><div class="rv"><div class="eb">Our story</div><h2 style="margin-top:14px">Why we exist.</h2></div>
<div class="txt rv"><p>Powerful technology is everywhere, but most of it is built for experts. Ordinary people and small teams are left with tools that are complicated, expensive, or both.</p>
<p>Haritt Group was started to change that. We take what AI can do and turn it into products that anyone can open, understand in a minute and use every day: to plan, to learn, to grow and to run their work.</p>
<p>Our first product, HV World, brings together a day planner, a career tracker and self-discovery tests, all connected by one assistant that understands plain language. It is free to use and works in any browser.</p>
<p>We build for India first, in the languages people actually speak, and for the world next.</p></div></div></div></section>
<section><div class="w">""" + MV + """</div></section>
<section id="principles"><div class="w"><div class="rv nar" style="margin-bottom:52px"><div class="eb">Our principles</div><h2 style="margin-top:14px">How we build.</h2></div>
<div class="pr"><div class="rv"><div class="n">01</div><h3>Useful before impressive</h3><p>Every feature has to make someone’s day easier. If it does not help, it does not ship.</p></div>
<div class="rv"><div class="n">02</div><h3>Simple by design</h3><p>Plain words, clean screens and no learning curve. Anyone should get it in a minute.</p></div>
<div class="rv"><div class="n">03</div><h3>Private by default</h3><p>Your data belongs to you. We collect only what a feature needs and never sell it.</p></div>
<div class="rv"><div class="n">04</div><h3>Honest and accessible</h3><p>Free where we can be, clear about what we do, and built to work for people across India.</p></div></div></div></section>
<section><div class="w"><div class="rv nar" style="margin-bottom:52px"><div class="eb">What’s next</div><h2 style="margin-top:14px">Where we are going.</h2></div>
<div class="rd"><div class="rc now rv"><div class="t">Now</div><h3>HV World</h3><p>Growing HV Reset, HV Vault and HV Test, and making HV AI smarter with every release.</p></div>
<div class="rc rv"><div class="t">Next</div><h3>AI for teams</h3><p>Bringing the same simple AI to small teams and startups, so they can plan and work faster together.</p></div>
<div class="rc rv"><div class="t">Later</div><h3>More products</h3><p>New products under the Haritt name, each solving one everyday problem well.</p></div></div></div></section>
""" + band("See what we’ve built.", "HV World is live and free. Try it in your browser, no download needed.")

PRODUCTS = """<header class="ph"><div class="w"><div class="eb rv">Products</div><h1 class="rv">Built to be used<br>every day.</h1>
<p class="lead rv">Everything we make lives under one roof. Our first product is HV World: free apps connected by one AI assistant.</p></div></header>
<section><div class="w"><div class="prod rv"><div class="l"><img src="/icons/hv-world.svg" alt="HV World icon"><div class="eb" style="margin-top:22px">Live · Free · In your browser</div><h3>HV World</h3>
<p>One sign-in, three apps and one assistant. Tell HV AI what you need, typed or spoken, and it does the work in the right app. Your data stays yours.</p>
<a class="btn" href=\"""" + HV + """/">Open HV World →</a></div><div class="r">""" + apps_list() + """</div></div></div></section>
<section><div class="w"><div class="rv nar" style="margin-bottom:52px"><div class="eb">Inside HV World</div><h2 style="margin-top:14px">What each app does.</h2></div>
<div class="cards">
<div class="cd rv"><img src="/icons/hv-reset.svg" alt="" style="width:52px;height:52px;border-radius:14px"><h3>HV Reset</h3><p>A daily planner that moves with you. One task at a time, a timer that keeps you focused, and a dashboard for your streaks and progress.</p><a class="more" href=\"""" + HV + """/reset/">Open HV Reset →</a></div>
<div class="cd rv"><img src="/icons/hv-vault.png" alt="" style="width:52px;height:52px;border-radius:14px"><h3>HV Vault</h3><p>Your career in one place. Save jobs and companies from a link or screenshot, track every application and never miss a follow-up.</p><a class="more" href=\"""" + HV + """/vault/">Open HV Vault →</a></div>
<div class="cd rv"><img src="/icons/hv-test.png" alt="" style="width:52px;height:52px;border-radius:14px"><h3>HV Test</h3><p>Short, honest tests that show your strengths and how you change over time. Results are private to you.</p><a class="more" href=\"""" + HV + """/test/">Open HV Test →</a></div>
</div></div></section>
<section><div class="w"><div class="two"><div class="rv"><img src="/icons/hv-ai.svg" alt="" style="width:64px;height:64px;border-radius:18px"><div class="eb" style="margin-top:20px">HV AI</div><h2 style="margin-top:14px">Just say it.</h2></div>
<div class="txt rv"><p>HV AI is the assistant inside every HV World app. Say “Kal 4 baje interview hai” and it adds the event. Paste a job post and it fills the details. Ask what to do next and it plans your day.</p>
<p>It understands English, Hindi and Hinglish, by voice or by text, and it always asks before it changes anything.</p></div></div></div></section>
""" + band("More products are on the way.", "Next, we are bringing simple AI to small teams and startups. Want to hear first? Write to us.")

LEAD = """<header class="ph"><div class="w"><div class="eb rv">Leadership</div><h1 class="rv">Founder-led,<br>product-first.</h1>
<p class="lead rv">Haritt Group is led by its founder, who still writes the code, designs the screens and talks to users every week.</p></div></header>
<section><div class="w"><div class="fd rv"><div class="av">HG</div><div><h3>Harsh Goyal</h3><div class="r">Founder, Haritt Group</div>
<p>Harsh founded Haritt Group to turn everyday problems into simple products. He leads product, design and engineering, and built HV World from the first line of code to launch: the apps, the AI assistant, the cloud and the website.</p>
<p>He believes the best technology is the kind people stop noticing because it simply helps.</p>
<div class="ln"><a href="mailto:harsh@haritt.com">harsh@haritt.com</a></div></div></div></div></section>
<section><div class="w"><div class="two"><div class="rv"><div class="eb">Join us</div><h2 style="margin-top:14px">We’re a small team, growing.</h2></div>
<div class="txt rv"><p>We are looking for people who care about building simple, useful things: engineers, designers and people who love talking to users.</p>
<p>If that sounds like you, write to us with a few lines about yourself and something you have built.</p><a class="more" href="mailto:hello@haritt.com?subject=Joining%20Haritt">hello@haritt.com →</a></div></div></div></section>
"""

CONTACT = """<header class="ph"><div class="w"><div class="eb rv">Contact</div><h1 class="rv">Let’s talk.</h1>
<p class="lead rv">Partnerships, feedback, press or careers: we read every message and reply within two working days.</p></div></header>
<section><div class="w"><div class="cgrid">
<div class="cc rv"><div class="eb">General</div><a href="mailto:hello@haritt.com">hello@haritt.com</a><p>Questions, partnerships and press.</p></div>
<div class="cc rv"><div class="eb">Founder</div><a href="mailto:harsh@haritt.com">harsh@haritt.com</a><p>Talk directly to Harsh Goyal.</p></div>
<div class="cc rv"><div class="eb">Product help</div><a href=\"""" + HV + """/">HV World</a><p>Use HV AI or the in-app help for anything about the apps.</p></div>
</div></div></section>
<section><div class="w"><div class="two"><div class="rv"><div class="eb">Company</div><h2 style="margin-top:14px">Haritt Group</h2></div>
<div class="txt rv"><p>An independent, founder-led company based in India.</p><p>Website: <a href="https://haritt.com">haritt.com</a><br>Product: <a href=\"""" + HV + """/">hvworld.haritt.com</a><br>Email: <a href="mailto:hello@haritt.com">hello@haritt.com</a></p></div></div></div></section>
"""

JS = """(function(){var n=document.getElementById("nav");addEventListener("scroll",function(){n.classList.toggle("sc",scrollY>8)},{passive:true});
document.getElementById("menu").onclick=function(){n.classList.toggle("open")};
var io="IntersectionObserver" in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12}):null;
document.querySelectorAll(".rv").forEach(function(el,i){if(io){el.style.transitionDelay=(i%3)*80+"ms";io.observe(el)}else el.classList.add("in")})})();"""

NOTFOUND = """<header class="ph"><div class="w"><div class="eb">404</div><h1>Page not found.</h1><p class="lead">The page you are looking for has moved or does not exist.</p>
<div style="margin-top:34px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="/">Go home</a><a class="btn o" href=\"""" + HV + """/">Try HV World</a></div></div></header>"""


def write(rel, html):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(html)


write("site.css", CSS.strip() + "\n")
write("site.js", JS + "\n")
D = "Haritt Group builds simple, useful products with AI for individuals, professionals and businesses. Home of HV World."
write("index.html", page("/", "Home", D, HOME))
write("about/index.html", page("/about/", "About", "Our story, mission, vision and principles.", ABOUT))
write("products/index.html", page("/products/", "Products", "HV World: HV Reset, HV Vault, HV Test and HV AI.", PRODUCTS))
write("leadership/index.html", page("/leadership/", "Leadership", "Harsh Goyal, founder of Haritt Group.", LEAD))
write("contact/index.html", page("/contact/", "Contact", "Get in touch with Haritt Group.", CONTACT))
write("404.html", page("/404", "Not found", "Page not found.", NOTFOUND))
print("built")
