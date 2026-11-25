# Prints what the Firebase key may do (no secrets printed). Used to plan the admin sign-in worker.
import os, json, urllib.request
from google.oauth2 import service_account; from google.auth.transport.requests import Request
info = json.loads(os.environ["SA"]); c = service_account.Credentials.from_service_account_info(info, scopes=["https://www.googleapis.com/auth/cloud-platform"]); c.refresh(Request())
print("key account domain:", info["client_email"].split("@")[1], "project:", info.get("project_id"))
def call(u, b=None):
    r = urllib.request.Request(u, data=json.dumps(b).encode() if b is not None else None, method="POST" if b is not None else "GET", headers={"Authorization": "Bearer " + c.token, "Content-Type": "application/json"})
    try: return 200, json.load(urllib.request.urlopen(r))
    except urllib.error.HTTPError as e: return e.code, e.read().decode()[:200]
P = ["firebaseauth.users.get", "firebaseauth.users.create", "firebaseauth.users.update", "datastore.entities.get", "datastore.entities.list", "resourcemanager.projects.setIamPolicy", "iam.serviceAccounts.signBlob"]
s, r = call("https://cloudresourcemanager.googleapis.com/v1/projects/harsh-reset:testIamPermissions", {"permissions": P}); print("perms:", s, r if s != 200 else r.get("permissions"))
s, r = call("https://identitytoolkit.googleapis.com/v1/projects/harsh-reset/accounts:lookup", {"email": ["harsh.goyal@haritt.com"]}); print("auth lookup:", s, ("found" if s == 200 and r.get("users") else "none") if s == 200 else r)
s, r = call("https://firestore.googleapis.com/v1/projects/harsh-reset/databases/(default)/documents/team?pageSize=1&mask.fieldPaths=role"); print("firestore read:", s, "ok" if s == 200 else r)
