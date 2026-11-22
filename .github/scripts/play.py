"""Play Console status per app -> seo/play.json (read only: temporary edit, tracks, reviews of release state)"""
import json, os, datetime, requests
T = os.environ.get("PLAY_TOKEN", "")
APPS = {"com.thehvverse.reset": "HV Reset", "com.thehvverse.assess": "HV Assess"}
out = {"updated": datetime.datetime.utcnow().isoformat() + "Z", "apps": [], "notes": []}
H = {"Authorization": "Bearer " + T}
B = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/"
for pkg, name in APPS.items():
    a = {"pkg": pkg, "name": name, "tracks": []}
    e = requests.post(B + pkg + "/edits", headers=H, json={}, timeout=30)
    if not e.ok:
        a["error"] = "%s %s" % (e.status_code, e.text[:140].replace("\n", " ")); out["apps"].append(a); continue
    eid = e.json()["id"]
    r = requests.get(B + pkg + "/edits/%s/tracks" % eid, headers=H, timeout=30)
    if r.ok:
        for t in r.json().get("tracks", []):
            for rel in t.get("releases", [])[:1]:
                a["tracks"].append({"track": t["track"], "status": rel.get("status"), "name": rel.get("name"), "codes": rel.get("versionCodes", []), "frac": rel.get("userFraction")})
    else:
        a["error"] = "%s %s" % (r.status_code, r.text[:140].replace("\n", " "))
    tt = requests.get(B + pkg + "/edits/%s/testers/internal" % eid, headers=H, timeout=30)
    if tt.ok: a["testers_internal"] = len(tt.json().get("googleGroups", [])) + len(tt.json().get("emails", []) if "emails" in tt.json() else [])
    requests.delete(B + pkg + "/edits/" + eid, headers=H, timeout=30)
    out["apps"].append(a)
os.makedirs("seo", exist_ok=True); json.dump(out, open("seo/play.json", "w"), indent=1)
