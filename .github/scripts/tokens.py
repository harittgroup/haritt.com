"""Token expiry check + reminder mails (60/30/14/7/3/1 days). Writes status/tokens.json"""
import sys, json, os, datetime, time, urllib.request
NOW = datetime.datetime.now(datetime.timezone.utc)
UA = {"User-Agent": "haritt-tokens/1.0"}
def get(url, tok):
    r = urllib.request.Request(url, headers=dict(UA, Authorization="Bearer " + tok) if tok else dict(UA))
    with urllib.request.urlopen(r, timeout=20) as x: return x.headers, json.load(x)
def parse(s):
    s = s.strip().replace("Z", "+00:00").replace(" UTC", "")
    try: d = datetime.datetime.fromisoformat(s)
    except ValueError: d = datetime.datetime.strptime(s[:19], "%Y-%m-%d %H:%M:%S")
    return d if d.tzinfo else d.replace(tzinfo=datetime.timezone.utc)
def renew_url(kind, reg=""):
    r = (reg or "").lower()
    if kind == "github": return "https://github.com/settings/personal-access-tokens"
    if kind == "cloudflare": return "https://dash.cloudflare.com/profile/api-tokens"
    if "cloudflare" in r: return "https://dash.cloudflare.com/?to=/:account/domains"
    if "spaceship" in r: return "https://www.spaceship.com/application/domain-list-application/"
    if "godaddy" in r: return "https://dcc.godaddy.com/domains"
    if "namecheap" in r: return "https://ap.www.namecheap.com/domains/list/"
    if "hostinger" in r: return "https://hpanel.hostinger.com/domains"
    if "bigrock" in r or "endurance" in r: return "https://www.bigrock.in/"
    return ""
path = "status/tokens.json"
prev = json.load(open(path)) if os.path.exists(path) else {}
rem = prev.get("rem", {}); items = []
for name, env in (("GitHub token: changelog (haritt.com)", "CHANGELOG_TOKEN"), ("GitHub token: changelog (developers)", "CHANGELOG_TOKEN_DEV")):
    tk = os.environ.get(env, "")
    if not tk: continue
    it = {"name": name, "days": None, "ok": True, "note": "", "kind": "github", "url": renew_url("github")}
    try:
        h, _ = get("https://api.github.com/rate_limit", tk)
        ex = h.get("github-authentication-token-expiration")
        if ex: it["days"] = (parse(ex) - NOW).days; it["date"] = parse(ex).isoformat()
        else: it["note"] = "No expiry"
    except Exception as e:
        it["ok"] = False; it["note"] = "Invalid or expired (%s)" % str(e)[:40]
    items.append(it)
cf = os.environ.get("CF_TOKEN", ""); acc = os.environ.get("CF_ACCOUNT", "")
if cf:
    it = {"name": "Cloudflare API token", "days": None, "ok": True, "note": "", "kind": "cloudflare", "url": renew_url("cloudflare")}
    for u in ("https://api.cloudflare.com/client/v4/accounts/%s/tokens/verify" % acc, "https://api.cloudflare.com/client/v4/user/tokens/verify"):
        try:
            _, j = get(u, cf)
            r = j.get("result") or {}
            if r.get("expires_on"): it["days"] = (parse(r["expires_on"]) - NOW).days; it["date"] = parse(r["expires_on"]).isoformat()
            else: it["note"] = "No expiry"
            it["ok"] = r.get("status") == "active"; break
        except Exception as e:
            it["ok"] = False; it["note"] = "Check failed (%s)" % str(e)[:40]
    items.append(it)
try:
    for x in json.load(open("status/system.json")).get("sites", []):
        if x.get("domain_days") is not None: items.append({"name": "Domain " + x["host"], "days": x["domain_days"], "ok": True, "note": "", "kind": "domain", "date": x.get("domain_date"), "start": x.get("domain_start"), "registrar": x.get("registrar", ""), "url": renew_url("domain", x.get("registrar", ""))})
except Exception: pass
TODAY = NOW.strftime("%Y-%m-%d")
metas = {i["name"]: i for i in items}
due = []
for it in items:
    key = it["name"]; d = it["days"]
    if not it["ok"]: d = 0
    if d is None or d > 60: rem.pop(key, None); continue
    st = rem.get(key) if isinstance(rem.get(key), dict) else {}
    if d <= 30:
        if st.get("day") != TODAY: due.append((key, d, "danger"))
    elif not st.get("early"):
        due.append((key, d, "early"))
RK = os.environ.get("RESEND_FULL_KEY", "")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rcfg
CFG = rcfg.load()
RID = {"domain": "expiry_domain", "github": "expiry_github", "cloudflare": "expiry_cf"}
def mail(k, d, level, meta, to):
    IST = datetime.timedelta(hours=5, minutes=30)
    def fdt(v): return (parse(v) + IST).strftime("%d %b %Y") if v else ""
    date = meta.get("date"); kind = {"domain": "Domain", "github": "GitHub access token", "cloudflare": "Cloudflare access token"}.get(meta.get("kind"), "Item")
    exp = fdt(date); by = (parse(date) + IST - datetime.timedelta(days=7)).strftime("%d %b %Y") if date else ""
    what = k[len("Domain "):] if meta.get("kind") == "domain" else k
    msg = ("This %s runs out in %d day%s. If it is not renewed, it stops working and you can lose it." % (kind.lower(), d, "" if d == 1 else "s")) if d > 0 else "This %s has expired or is invalid. Fix it now." % kind.lower()
    rows = [("What", "%s: <b>%s</b>" % (kind, what))]
    if meta.get("start"): rows.append(("Started on", "<b>%s</b>" % fdt(meta["start"])))
    if exp: rows.append(("Expires on", "<b>%s</b>" % exp)); rows.append(("Renew by", "<b>%s</b>" % by))
    if meta.get("registrar"): rows.append(("Registrar", "<b>%s</b>" % meta["registrar"]))
    tr = "".join('<tr><td style="padding:9px 0;color:#64606A;width:110px;border-top:1px solid #ECE8EE">%s</td><td style="padding:9px 0;border-top:1px solid #ECE8EE">%s</td></tr>' % r for r in rows)
    btn = ('<a href="%s" style="display:inline-block;margin:20px 8px 0 0;background:#B3001B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700">Renew now</a>' % meta["url"]) if meta.get("url") else ""
    html = ('<div style="background:#F6F4F7;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,sans-serif"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:2px solid #B3001B">'
            '<div style="background:#B3001B;color:#fff;padding:16px 24px;font-weight:800;letter-spacing:.06em">DANGER: ACTION NEEDED</div><div style="padding:26px 24px;color:#1B1A1C">'
            '<h2 style="margin:0 0 8px;font-size:22px">%s</h2><p style="margin:0 0 14px;color:#4A464E;line-height:1.6">%s</p>'
            '<p style="margin:0 0 12px;font-size:36px;font-weight:800;color:#B3001B">%s</p><table style="width:100%%;border-collapse:collapse;font-size:14px">%s</table>%s'
            '<a href="https://haritt.com/admin/expiry/" style="display:inline-block;margin-top:20px;background:#fff;color:#B3001B;border:2px solid #B3001B;text-decoration:none;padding:10px 20px;border-radius:10px;font-weight:700">All dates</a>'
            '<p style="margin:18px 0 0;color:#98939E;font-size:12px">%s</p></div></div></div>'
            % (what, msg, ("%d days left" % d) if d > 0 else "Expired", tr, btn, "You get this mail every day until it is renewed." if d <= 30 else "You will get this mail daily once 30 days are left."))
    body = {"from": "Haritt Alerts <alerts@haritt.com>", "to": [to],
            "subject": ("DANGER: %s expires in %d day%s" % (k, d, "" if d == 1 else "s")) if d > 0 else "DANGER: %s needs attention now" % k, "html": html}
    r = urllib.request.Request("https://api.resend.com/emails", data=json.dumps(body).encode(), headers=dict(UA, Authorization="Bearer " + RK, **{"Content-Type": "application/json"}))
    urllib.request.urlopen(r, timeout=20)
if due and RK and os.environ.get("SEND_REMINDERS") == "1":
    for k, d, lv in due:
        try:
            rid = RID.get(metas.get(k, {}).get("kind"), "expiry_github")
            if not rcfg.enabled(CFG, rid): print("switched off", k); continue
            for to in rcfg.recipients(CFG, rid): mail(k, d, lv, metas.get(k, {}), to)
            st = rem.get(k) if isinstance(rem.get(k), dict) else {}
            st["day"] = TODAY if lv == "danger" else st.get("day"); st["early"] = True; rem[k] = st; print("reminder sent", k)
        except Exception as e: print("reminder failed", k, e)
limits, keys = [], []
def pct(u, m): return int(100 * u / m) if m else 0
if RK:
    try:   # Resend: mails sent today and this month (free plan: 100 a day, 3000 a month)
        today, month, td, mo, after = NOW.strftime("%Y-%m-%d"), NOW.strftime("%Y-%m"), 0, 0, None
        for _ in range(35):
            _, j = get("https://api.resend.com/emails?limit=100" + ("&after=" + after if after else ""), RK); data = j.get("data", [])
            if not data: break
            for m in data:
                c = str(m.get("created_at") or "")
                if c[:7] == month: mo += 1
                if c[:10] == today: td += 1
            if not j.get("has_more") or str(data[-1].get("created_at") or "")[:7] < month: break
            after = data[-1]["id"]; time.sleep(0.6)
        limits.append({"name": "Resend mails today", "used": td, "max": 100, "pct": pct(td, 100), "note": "Free plan limit, assumed"})
        limits.append({"name": "Resend mails this month", "used": mo, "max": 3000, "pct": pct(mo, 3000), "note": "Free plan limit, assumed"})
    except Exception as e: print("resend usage skipped", str(e)[:60])
    try:   # Resend keys (they do not expire; shown so nothing old is forgotten)
        _, j = get("https://api.resend.com/api-keys", RK); sa = 0
        for k in j.get("data", []):
            if str(k.get("name", "")).lower().startswith("send-as "): sa += 1; continue
            keys.append({"name": k.get("name", ""), "service": "Resend", "days": (NOW - parse(str(k.get("created_at")))).days})
        if sa: keys.append({"name": "%d Send as keys (one per team address)" % sa, "service": "Resend", "days": None})
    except Exception as e: print("resend keys skipped", str(e)[:60])
if cf and acc:
    try:   # Cloudflare Workers requests today (free plan: 100,000 a day); needs Account Analytics read, skipped if the token has no access
        q = {"query": "query{viewer{accounts(filter:{accountTag:\"%s\"}){workersInvocationsAdaptive(limit:1000,filter:{datetime_geq:\"%s\",datetime_leq:\"%s\"}){sum{requests}}}}}" % (acc, NOW.strftime("%Y-%m-%dT00:00:00Z"), NOW.strftime("%Y-%m-%dT%H:%M:%SZ"))}
        r = urllib.request.Request("https://api.cloudflare.com/client/v4/graphql", data=json.dumps(q).encode(), headers=dict(UA, Authorization="Bearer " + cf, **{"Content-Type": "application/json"}))
        with urllib.request.urlopen(r, timeout=20) as x: g = json.load(x)
        n = sum(z["sum"]["requests"] for z in g["data"]["viewer"]["accounts"][0]["workersInvocationsAdaptive"])
        limits.append({"name": "Cloudflare Workers requests today", "used": n, "max": 100000, "pct": pct(n, 100000), "note": "Free plan limit"})
    except Exception as e: print("cloudflare usage skipped", str(e)[:60])
if cf and acc:
    try:   # Cloudflare storage (KV) use today; free plan: 1,000 writes and 1,000 list calls a day, 100,000 reads
        q = {"query": "query{viewer{accounts(filter:{accountTag:\"%s\"}){kvOperationsAdaptiveGroups(limit:100,filter:{date_geq:\"%s\"}){sum{requests} dimensions{actionType}}}}}" % (acc, NOW.strftime("%Y-%m-%d"))}
        r = urllib.request.Request("https://api.cloudflare.com/client/v4/graphql", data=json.dumps(q).encode(), headers=dict(UA, Authorization="Bearer " + cf, **{"Content-Type": "application/json"}))
        with urllib.request.urlopen(r, timeout=20) as x: g = json.load(x)
        kv = {}
        for z in g["data"]["viewer"]["accounts"][0]["kvOperationsAdaptiveGroups"]: kv[z["dimensions"]["actionType"]] = kv.get(z["dimensions"]["actionType"], 0) + z["sum"]["requests"]
        for k2, nm, mx in (("write", "Cloudflare storage writes today", 1000), ("list", "Cloudflare storage list calls today", 1000), ("read", "Cloudflare storage reads today", 100000)):
            limits.append({"name": nm, "used": kv.get(k2, 0), "max": mx, "pct": pct(kv.get(k2, 0), mx), "note": "Free plan limit"})
    except Exception as e: print("cloudflare storage usage skipped", str(e)[:60])
for rp, nm in (("harittgroup/haritt.com", "haritt.com"), ("Haritt-Developers/developers", "Developers site"), ("hv-verse/hv-verse.github.io", "HV Verse site")):   # GitHub recommends repositories stay under 1 GB; a published site is limited to 1 GB
    try:
        tk0 = os.environ.get("CHANGELOG_TOKEN", "") if rp.startswith("harittgroup") else os.environ.get("CHANGELOG_TOKEN_DEV", "")
        _, j = get("https://api.github.com/repos/" + rp, tk0 or None)
        mb = int((j.get("size") or 0) / 1024)
        limits.append({"name": "GitHub storage used: " + nm + " (MB)", "used": mb, "max": 1000, "pct": pct(mb, 1000), "note": "GitHub recommended size"})
    except Exception as e: print("github storage skipped", rp, str(e)[:50])
hi = [l for l in limits if l.get("pct", 0) >= 80]
if hi and RK and os.environ.get("SEND_REMINDERS") == "1" and rem.get("_limit_day") != TODAY:
    try:   # free plan 80% alert, once a day, to the Owner
        lines = "".join("<li><b>%s</b>: %s of %s (%s%%)</li>" % (l["name"], l["used"], l["max"], l["pct"]) for l in hi)
        html = ('<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;border:2px solid #B3001B;border-radius:14px;overflow:hidden"><div style="background:#B3001B;color:#fff;padding:14px 22px;font-weight:800">DANGER: FREE LIMIT NEARLY FULL</div><div style="padding:22px;color:#1B1A1C"><p>These are over 80% of the free plan limit:</p><ul>%s</ul><p style="color:#64606A;font-size:13px">If a limit is full, new mail may be delayed. Team mail uses a free backup path meanwhile.</p><a href="https://haritt.com/admin/expiry/" style="color:#B3001B;font-weight:700">Open Expiry</a></div></div>' % lines)
        body = {"from": "Haritt Alerts <alerts@haritt.com>", "to": ["harsh.goyal@haritt.com"], "subject": "DANGER: free plan limit over 80%", "html": html}
        r = urllib.request.Request("https://api.resend.com/emails", data=json.dumps(body).encode(), headers=dict(UA, Authorization="Bearer " + RK, **{"Content-Type": "application/json"}))
        urllib.request.urlopen(r, timeout=20); rem["_limit_day"] = TODAY; print("limit alert sent")
    except Exception as e: print("limit alert failed", str(e)[:60])
if cf:
    keys.append({"name": "Cloudflare API token", "service": "Cloudflare", "days": None})
os.makedirs("status", exist_ok=True)
json.dump({"updated": NOW.isoformat(), "tokens": items, "rem": rem, "limits": limits, "keys": keys}, open(path, "w"), indent=1)
print(json.dumps(items))
