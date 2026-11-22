"""Token expiry check + reminder mails (60/30/14/7/3/1 days). Writes status/tokens.json"""
import json, os, datetime, urllib.request
NOW = datetime.datetime.now(datetime.timezone.utc)
UA = {"User-Agent": "haritt-tokens/1.0"}
def get(url, tok):
    r = urllib.request.Request(url, headers=dict(UA, Authorization="Bearer " + tok))
    with urllib.request.urlopen(r, timeout=20) as x: return x.headers, json.load(x)
def parse(s):
    s = s.strip().replace("Z", "+00:00").replace(" UTC", "")
    try: d = datetime.datetime.fromisoformat(s)
    except ValueError: d = datetime.datetime.strptime(s[:19], "%Y-%m-%d %H:%M:%S")
    return d if d.tzinfo else d.replace(tzinfo=datetime.timezone.utc)
path = "status/tokens.json"
prev = json.load(open(path)) if os.path.exists(path) else {}
rem = prev.get("rem", {}); items = []
for name, env in (("GitHub token: changelog (haritt.com)", "CHANGELOG_TOKEN"), ("GitHub token: changelog (developers)", "CHANGELOG_TOKEN_DEV")):
    tk = os.environ.get(env, "")
    if not tk: continue
    it = {"name": name, "days": None, "ok": True, "note": ""}
    try:
        h, _ = get("https://api.github.com/rate_limit", tk)
        ex = h.get("github-authentication-token-expiration")
        if ex: it["days"] = (parse(ex) - NOW).days
        else: it["note"] = "No expiry"
    except Exception as e:
        it["ok"] = False; it["note"] = "Invalid or expired (%s)" % str(e)[:40]
    items.append(it)
cf = os.environ.get("CF_TOKEN", ""); acc = os.environ.get("CF_ACCOUNT", "")
if cf:
    it = {"name": "Cloudflare API token", "days": None, "ok": True, "note": ""}
    for u in ("https://api.cloudflare.com/client/v4/accounts/%s/tokens/verify" % acc, "https://api.cloudflare.com/client/v4/user/tokens/verify"):
        try:
            _, j = get(u, cf)
            r = j.get("result") or {}
            if r.get("expires_on"): it["days"] = (parse(r["expires_on"]) - NOW).days
            else: it["note"] = "No expiry"
            it["ok"] = r.get("status") == "active"; break
        except Exception as e:
            it["ok"] = False; it["note"] = "Check failed (%s)" % str(e)[:40]
    items.append(it)
try:
    for x in json.load(open("status/system.json")).get("sites", []):
        if x.get("domain_days") is not None: items.append({"name": "Domain " + x["host"], "days": x["domain_days"], "ok": True, "note": "", "kind": "domain"})
except Exception: pass
TODAY = NOW.strftime("%Y-%m-%d")
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
def mail(k, d, level):
    danger = level == "danger"
    col = "#B3001B" if danger else "#A70D22"
    head = "DANGER: ACTION NEEDED" if danger else "Reminder"
    msg = ("This runs out in %d day%s. If it is not renewed, it will stop working and you can lose it. Please do it today." % (d, "" if d == 1 else "s")) if d > 0 else "This has expired or is invalid. Fix it now."
    if not danger: msg = "This comes up for renewal in %d days. Please plan it now so nothing stops." % d
    html = ('<div style="background:#F6F4F7;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,sans-serif"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:%s">'
            '<div style="background:%s;color:#fff;padding:16px 24px;font-weight:800;letter-spacing:.06em">%s</div><div style="padding:26px 24px;color:#1B1A1C">'
            '<h2 style="margin:0 0 8px;font-size:21px">%s</h2><p style="margin:0 0 16px;color:#4A464E;line-height:1.6">%s</p>'
            '<p style="margin:0;font-size:34px;font-weight:800;color:%s">%s</p><a href="https://haritt.com/admin/system-status/" style="display:inline-block;margin-top:20px;background:%s;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700">Open status</a>'
            '<p style="margin:18px 0 0;color:#98939E;font-size:12px">%s</p></div></div></div>'
            % ("2px solid " + col if danger else "1px solid #E4E0E6", col, head, k, msg, col, ("%d days left" % d) if d > 0 else "Expired", col,
               "You get this mail every day until it is renewed." if danger else "Daily mails start when 30 days are left."))
    body = {"from": "Haritt Alerts <alerts@haritt.com>", "to": ["harsh.goyal@haritt.com"],
            "subject": ("DANGER: %s expires in %d day%s" % (k, d, "" if d == 1 else "s")) if danger and d > 0 else ("DANGER: %s needs attention now" % k if danger else "Reminder: %s expires in %d days" % (k, d)), "html": html}
    r = urllib.request.Request("https://api.resend.com/emails", data=json.dumps(body).encode(), headers=dict(UA, Authorization="Bearer " + RK, **{"Content-Type": "application/json"}))
    urllib.request.urlopen(r, timeout=20)
if due and RK and os.environ.get("SEND_REMINDERS") == "1":
    for k, d, lv in due:
        try:
            mail(k, d, lv); st = rem.get(k) if isinstance(rem.get(k), dict) else {}
            st["day"] = TODAY if lv == "danger" else st.get("day"); st["early"] = True; rem[k] = st; print("reminder sent", k)
        except Exception as e: print("reminder failed", k, e)
os.makedirs("status", exist_ok=True)
json.dump({"updated": NOW.isoformat(), "tokens": items, "rem": rem}, open(path, "w"), indent=1)
print(json.dumps(items))
