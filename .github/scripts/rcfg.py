import json, urllib.request, datetime, hashlib
KEY = "rmcfg_13fba2fddc"
URL = "https://firestore.googleapis.com/v1/projects/harsh-reset/databases/(default)/documents/%s/main?key=AIzaSyDggasAVdqpvamkn1xeex2NmPUqG9JiZJ4" % KEY
DEF = {"expiry_domain": ["owner"], "expiry_github": ["owner"], "expiry_cf": ["owner"], "alerts": ["owner", "cofounder"]}
DANGER = {"expiry_domain", "expiry_github", "expiry_cf", "alerts"}
OWNER = "harsh.goyal@haritt.com"
def load():
    try:
        r = urllib.request.urlopen(urllib.request.Request(URL, headers={"User-Agent": "haritt-bot"}), timeout=15)
        d = json.load(r)
        return json.loads(d["fields"]["json"]["stringValue"])
    except Exception as e:
        print("rcfg: default (", e, ")"); return {}
def enabled(cf, rid):
    return (cf.get("sw") or {}).get(rid) is not False
def recipients(cf, rid):
    people = cf.get("people") or [{"e": OWNER, "n": "Harsh", "role": "owner"}]
    rs = (cf.get("roleMap") or {}).get(rid) or DEF.get(rid, ["owner"])
    today = datetime.date.today().isoformat(); out = []
    for p in people:
        inr = p.get("role") in rs or p["e"] in (cf.get("add") or {}).get(rid, [])
        m = ((cf.get("mute") or {}).get(rid) or {}).get(p["e"])
        muted = bool(m) and (m == "forever" or m > today)
        if never(cf, p["e"]): continue
        if inr and (not muted or (rid in DANGER and p.get("role") == "owner")): out.append(p["e"])
    if rid in DANGER and OWNER not in out: out.insert(0, OWNER)
    return out

def never(cf, addr):
    h = hashlib.sha256(addr.lower().strip().encode()).hexdigest()
    return h in [x.get("h") for x in (cf.get("never") or [])]
