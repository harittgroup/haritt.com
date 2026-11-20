# Deploys Firestore rules with the Firebase Rules REST API. Usage: deploy-rules.py <project> <rules-file | html-page>
# A page (admin/rules/index.html) is read from its first <pre> after "Firestore rules". Bad rules are rejected by Google and nothing changes.
import sys, os, re, html, json, urllib.request
proj, src = sys.argv[1], sys.argv[2]; tok = os.environ["TOKEN"]
t = open(src, encoding="utf-8").read()
if src.endswith(".html"):
    i = t.index("<h1>Firestore rules</h1>"); a = t.index("<pre", i); a = t.index(">", a) + 1; t = html.unescape(t[a:t.index("</pre>", a)])
if "service cloud.firestore" not in t: sys.exit("rules not found in " + src)
def call(method, url, body):
    r = urllib.request.Request(url, data=json.dumps(body).encode(), method=method, headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    try: return json.load(urllib.request.urlopen(r))
    except urllib.error.HTTPError as e: sys.exit(method + " " + url + " -> " + str(e.code) + " " + e.read().decode()[:800])
B = "https://firebaserules.googleapis.com/v1/projects/" + proj
rs = call("POST", B + "/rulesets", {"source": {"files": [{"name": "firestore.rules", "content": t}]}})
call("PATCH", B + "/releases/cloud.firestore", {"release": {"name": "projects/" + proj + "/releases/cloud.firestore", "rulesetName": rs["name"]}})
print("Firestore rules live on", proj, "->", rs["name"], "(" + str(t.count("\n")) + " lines)")
