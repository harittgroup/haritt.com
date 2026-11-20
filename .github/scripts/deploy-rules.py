# Deploys Firestore rules with the Firebase Rules REST API. Usage: deploy-rules.py <project> <rules-file | html-page>
# A page (admin/rules/index.html) is read from its first <pre> after "Firestore rules". Bad rules are rejected by Google and nothing changes.
import sys, os, re, html, json, urllib.request
proj, src = sys.argv[1], sys.argv[2]; tok = os.environ.get("TOKEN")
if not tok:
    from google.oauth2 import service_account; from google.auth.transport.requests import Request
    c = service_account.Credentials.from_service_account_info(json.loads(os.environ["SA"]), scopes=["https://www.googleapis.com/auth/firebase", "https://www.googleapis.com/auth/cloud-platform"]); c.refresh(Request()); tok = c.token
t = open(src, encoding="utf-8").read()
if src.endswith(".html"):
    i = t.index("<h1>Firestore rules</h1>"); a = t.index("<pre", i); a = t.index(">", a) + 1; t = html.unescape(t[a:t.index("</pre>", a)])
if "service cloud.firestore" not in t: sys.exit("rules not found in " + src)
prev = ""
# Safety check: refuse rules that would open data to everyone. Only single-document "allow get: if true" is allowed.
bad = []
body = re.sub(r"//[^\n]*", "", t)
for n, l in enumerate(body.split("\n"), 1):
    for m in re.finditer(r"allow\s+([a-z,\s]+?)\s*:\s*if\s+([^;]*);", l):
        ops = {o.strip() for o in m.group(1).split(",")}; cond = re.sub(r"[\s()]", "", m.group(2))
        if cond == "true" and ops - {"get"}: bad.append(str(n) + ": " + l.strip())
        if cond == "request.auth!=null" and re.search(r"match\s*/\{document=\*\*\}", l + prev) and ops - {"get", "list", "read"}: bad.append(str(n) + ": " + l.strip() + "  (any signed-in user could write everything)")
    if "match" in l: prev = l
if bad: sys.exit("BLOCKED: these rules would open data to everyone, nothing was published:\n  " + "\n  ".join(bad))
def call(method, url, body):
    r = urllib.request.Request(url, data=json.dumps(body).encode(), method=method, headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    try: return json.load(urllib.request.urlopen(r))
    except urllib.error.HTTPError as e: sys.exit(method + " " + url + " -> " + str(e.code) + " " + e.read().decode()[:800])
B = "https://firebaserules.googleapis.com/v1/projects/" + proj
rs = call("POST", B + "/rulesets", {"source": {"files": [{"name": "firestore.rules", "content": t}]}})
call("PATCH", B + "/releases/cloud.firestore", {"release": {"name": "projects/" + proj + "/releases/cloud.firestore", "rulesetName": rs["name"]}})
print("Firestore rules live on", proj, "->", rs["name"], "(" + str(t.count("\n")) + " lines)")
