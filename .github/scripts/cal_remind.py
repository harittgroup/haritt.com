"""Content calendar reminder: 9 AM IST 'today's posts', 6 PM IST 'still not posted'.
Reads admin/content-calendar/data.json and the posted marks in Firestore (calp_7c2e91ab4d, single-doc reads).
Who gets it and on/off: Mail Center id "calendar" (rcfg)."""
import json, os, sys, urllib.request, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rcfg
def _e(t): return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
def card(title, inner, btn, pre, label):   # Haritt default mail design (same as workers/haritt-inbox.js card())
    st = "@media (prefers-color-scheme:dark){.bg{background:#0E0F12!important}.cd{background:#17161A!important;border-color:#2B2830!important}.tx,.hd,.ad{color:#F1EEF3!important}.mt{color:#B6B0BD!important}.bx{background:#2A1B1E!important;border-color:#4A2E33!important}.lb{color:#E88A93!important}.ft{background:#141210!important;border-color:#2A2623!important}.cta{background:#E88A93!important;color:#1B1A1C!important}}"
    b = ('<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px"><tr><td class="cta" style="background:#A70D22;border-radius:10px"><a class="cta" href="%s" style="display:inline-block;padding:13px 24px;color:#fff;text-decoration:none;font-weight:600;font-size:15px;border-radius:10px">%s</a></td></tr></table>' % (_e(btn[1]), _e(btn[0]))) if btn else ""
    return ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><style>' + st + '</style></head>'
        '<body class="bg" style="margin:0;background:#F6F4F7;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + _e(pre) + '</div>'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background:#F6F4F7"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px"><tr><td class="cd" style="background:#fff;border:1px solid #ECE8EE;border-radius:16px;overflow:hidden;padding:0">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#16110F;background-image:linear-gradient(125deg,#16110F 0%,#2B0B0B 55%,#7A0C0C 100%);padding:16px 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="https://haritt.com/mail/haritt-3d-120.png" width="30" height="30" alt="" style="display:block;border-radius:50%"></td><td style="padding-left:10px;vertical-align:middle;color:#fff;font-size:12px;font-weight:700;letter-spacing:.22em">HARITT GROUP</td></tr></table></td>'
        '<td align="right" style="vertical-align:middle"><span style="display:inline-block;border:1px solid rgba(255,255,255,.28);border-radius:99px;padding:4px 11px;color:#F3D9D9;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">' + _e(label) + '</span></td></tr></table></td></tr></table>'
        '<div style="padding:26px 26px 28px"><div class="hd" style="font-size:21px;line-height:1.3;font-weight:700;color:#1B1A1C;margin:0 0 10px">' + title + '</div><div class="mt" style="font-size:15px;line-height:1.6;color:#4A4650">' + inner + '</div>' + b + '</div>'
        '<div class="ft" style="background:#FAF7F3;border-top:1px solid #EEE7DF;padding:18px 26px;text-align:center;font-size:12.5px;line-height:1.7;color:#8A8492"><b class="tx" style="color:#3D3730">Haritt Group</b> &middot; <a href="https://haritt.com" style="color:#8A8492;text-decoration:underline">haritt.com</a><br>Behind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001<br>Jaipur &middot; Bharatpur<br><span style="font-size:11.5px">This is a private message from Haritt Group. Please do not forward it.</span></div>'
        '</td></tr></table></td></tr></table></body></html>')

KS = ["ig", "li", "x", "fb", "yt", "yc", "rl"]
FULL = {"ig": "Instagram", "li": "LinkedIn", "x": "X", "fb": "Facebook", "yt": "YouTube Short", "yc": "YouTube post", "rl": "Instagram Reel"}
TIME = {"ig": "7:30 PM", "li": "9:00 AM", "x": "12:30 PM", "fb": "8:00 PM", "yt": "6:00 PM", "yc": "11:00 AM", "rl": "7:00 PM"}
TMIN = {"ig": 1170, "li": 540, "x": 750, "fb": 1200, "yt": 1080, "yc": 660, "rl": 1140}
COL = "calp_7c2e91ab4d"; KEY = "AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4"
DB = "projects/harsh-reset/databases/(default)/documents"
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
NOW = datetime.datetime.now(IST); TODAY = NOW.date().isoformat()
MODE = os.environ.get("MODE") or ("evening" if NOW.hour >= 15 else "morning")
URL = "https://haritt.com/admin/content-calendar/"
RK = os.environ.get("RESEND_FULL_KEY", "")
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = json.load(open(os.path.join(root, "admin/content-calendar/data.json")))
posts = []
for d in DATA:
    for a, pl in ((0, d.get("platforms") or {}), (1, (d.get("ann") or {}).get("platforms") or {})):
        for k in KS:
            if k in pl: posts.append({"d": d["date"], "k": k, "a": a, "id": "hv_%s_%s%s" % (d["date"], "a-" if a else "", k)})
# posted marks + moved dates, one batch read
recs = {}
try:
    names = ["%s/%s/%s" % (DB, COL, p["id"]) for p in posts]
    for i in range(0, len(names), 100):
        rq = urllib.request.Request("https://firestore.googleapis.com/v1/%s:batchGet?key=%s" % (DB, KEY), data=json.dumps({"documents": names[i:i + 100]}).encode(), headers={"Content-Type": "application/json", "User-Agent": "haritt-bot"})
        for row in json.load(urllib.request.urlopen(rq, timeout=20)):
            f = (row.get("found") or {}).get("fields")
            if f: recs[row["found"]["name"].split("/")[-1]] = {"p": (f.get("p") or {}).get("booleanValue", False), "mv": (f.get("mv") or {}).get("stringValue", "")}
except Exception as e:
    print("firestore read failed:", str(e)[:120])
def day(p): return (recs.get(p["id"]) or {}).get("mv") or p["d"]
today = [p for p in posts if day(p) == TODAY]
left = [p for p in today if not (recs.get(p["id"]) or {}).get("p")]
mins = NOW.hour * 60 + NOW.minute
if MODE == "evening": left = [p for p in left if TMIN[p["k"]] <= mins + 180]
show = today if MODE == "morning" else left
print(MODE, TODAY, "today", len(today), "left", len(left))
if not show: print("nothing to send"); sys.exit(0)
CF = rcfg.load()
if not rcfg.enabled(CF, "calendar"): print("switched off"); sys.exit(0)
TO = rcfg.recipients(CF, "calendar")
NAMES = {p.get("e"): (p.get("n") or "") for p in (CF.get("people") or [])}
show.sort(key=lambda p: TMIN[p["k"]])
n = len(show); s = "" if n == 1 else "s"
rows = "".join('<div class="ad" style="font-size:15px;font-weight:600;margin-top:6px;color:#1B1A1C">%s%s <span style="font-weight:500;color:#8A8492">&middot; %s IST</span></div>' % (_e(FULL[p["k"]]), " (new feature)" if p["a"] else "", TIME[p["k"]]) for p in show)
box = '<div class="bx" style="margin:14px 0 6px;padding:14px 16px;border-radius:12px;background:#FBEDEF;border:1px solid #F1D5D9"><div class="lb" style="font-size:11px;letter-spacing:.08em;font-weight:700;color:#A70D22">%s</div>%s</div>' % ("TODAY'S POSTS" if MODE == "morning" else "STILL NOT POSTED", rows)
if MODE == "morning":
    subj = "Today: %d post%s to share" % (n, s); lab = "Reminder"
    lead = "There %s %d post%s to share today. Captions and images are ready on the calendar." % ("is" if n == 1 else "are", n, s)
    note = "Mark each one as posted after sharing, so the team knows."
else:
    subj = "Reminder: %d post%s not posted yet" % (n, s); lab = "Reminder"
    lead = "%d of today's posts %s not marked as posted yet." % (n, "is" if n == 1 else "are")
    note = "Already posted? Open the calendar and mark it as posted. Can't post today? Move it to another day."
txt = lead + "\n\n" + "\n".join("- %s%s · %s IST" % (FULL[p["k"]], " (new feature)" if p["a"] else "", TIME[p["k"]]) for p in show) + "\n\n" + note + "\n\nOpen the calendar: " + URL + "\n\nHaritt Group · haritt.com\nBehind Shiva Talkies, Sahyog Nagar, Bharatpur, Rajasthan 321001\nJaipur · Bharatpur\n"
if not RK: print("no key, dry run:", subj, TO); sys.exit(0)
for t in TO:
    nm = NAMES.get(t) or ""
    hi = "Hi %s," % _e(nm) if nm else "Hi,"
    html = card(hi, '<p style="margin:0">' + _e(lead) + '</p>' + box + '<div style="font-size:12.5px;color:#8A8492;margin-top:14px">' + _e(note) + '</div>', ["Open today's posts", URL], subj, lab)
    body = {"from": "Haritt Alerts <alerts@haritt.com>", "to": [t], "subject": subj, "html": html, "text": (("Hi %s,\n\n" % nm) if nm else "Hi,\n\n") + txt}
    try:
        urllib.request.urlopen(urllib.request.Request("https://api.resend.com/emails", data=json.dumps(body).encode(), headers={"Authorization": "Bearer " + RK, "Content-Type": "application/json", "User-Agent": "haritt-bot"}), timeout=20)
        print("sent to", t.split("@")[0][:2] + "***")
    except Exception as e:
        print("send failed", str(e)[:100])
