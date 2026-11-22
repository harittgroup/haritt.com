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
due = []
for it in items:
    key = it["name"]; d = it["days"]
    if not it["ok"]: d = 0
    if d is None or d > 60: rem.pop(key, None); continue
    m = min(x for x in (60, 30, 14, 7, 3, 1) if d <= x) if d >= 0 else 0
    if rem.get(key) != m: due.append((key, d, m))
RK = os.environ.get("RESEND_FULL_KEY", "")
if due and RK and os.environ.get("SEND_REMINDERS") == "1":
    body = {"from": "Haritt Alerts <alerts@haritt.com>", "to": ["harsh.goyal@haritt.com"], "subject": "Haritt reminder: a token expires in %d days" % min(d for _, d, _ in due),
            "text": "Create a new one before it expires:\n\n" + "\n".join("- %s: %s" % (k, ("expires in %d days" % d) if d > 0 else "expired or invalid") for k, d, _ in due) + "\n\nAll tokens: https://haritt.com/admin/system-status/\n"}
    try:
        r = urllib.request.Request("https://api.resend.com/emails", data=json.dumps(body).encode(), headers=dict(UA, Authorization="Bearer " + RK, **{"Content-Type": "application/json"}))
        urllib.request.urlopen(r, timeout=20)
        for k, _, m in due: rem[k] = m
        print("reminder sent")
    except Exception as e: print("reminder failed", e)
os.makedirs("status", exist_ok=True)
json.dump({"updated": NOW.isoformat(), "tokens": items, "rem": rem}, open(path, "w"), indent=1)
print(json.dumps(items))
