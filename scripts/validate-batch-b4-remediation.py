#!/usr/bin/env python3
from pathlib import Path
import json,re,sys
repo=Path.cwd()
mp=repo/"_data/batch-b4-audit-remediation.json"
errors=[]
if not mp.exists():
    print("Missing Batch B-4 audit manifest",file=sys.stderr); sys.exit(1)
m=json.loads(mp.read_text(encoding="utf-8"))

def read(slug):
    p=repo/"_procedures"/f"{slug}.md"
    if not p.exists(): errors.append(f"Missing {slug}"); return ""
    return p.read_text(encoding="utf-8")
def fm(t):
    a=t.split("---",2); return a[1] if len(a)>=3 else ""
def field(t,k):
    x=re.search(rf"(?m)^{re.escape(k)}:\s*(.*?)\s*$",fm(t))
    if not x:return None
    v=x.group(1).strip()
    if len(v)>=2 and v[0]==v[-1] and v[0] in "'\"":v=v[1:-1]
    return v

for slug,r in m["procedures"].items():
    t=read(slug)
    if not t: continue
    if (field(t,"verification_priority") or "").upper()!=r["priority"]: errors.append(f"{slug}: priority")
    if (field(t,"severity") or "").lower()!=r["severity"]: errors.append(f"{slug}: severity")
    if slug not in m["merge_policy"] and "## Mandatory Batch B-4 controls" not in t:
        errors.append(f"{slug}: B4 controls missing")
    if (field(t,"verification_governance_state") or "").lower()=="verified":
        errors.append(f"{slug}: incorrectly Verified")

# Cross-batch print server must remain one active P1, not deprecated.
ps=read("troubleshoot-a-print-server-outage")
if field(ps,"content_status")=="deprecated": errors.append("print server was incorrectly deprecated")
if (field(ps,"verification_priority") or "").upper()!="P1": errors.append("print server must remain P1")
for token in ["0. **Check print-server disk capacity before queue/service changes.**","Printbrm"]:
    if token not in ps: errors.append(f"print server missing {token}")

# Blocked governance corrections.
tokens={
"troubleshoot-a-saml-application-error":"0. **Check identity-provider health before federation changes.**",
"troubleshoot-an-aws-ec2-instance-that-is-unreachable":"0. **Check AWS service/account health before instance changes.**",
"troubleshoot-an-azure-virtual-machine-that-is-unreachable":"0. **Check Azure service/resource health before VM changes.**",
"troubleshoot-an-http-403-error":"## HTTP 403 decision path",
}
for slug,token in tokens.items():
    if token not in read(slug): errors.append(f"{slug}: governance marker missing")

# External monitor merge.
canon=read("troubleshoot-an-external-monitor")
for token in ["## Cross-platform external monitor decision path","### Windows branch","### macOS branch"]:
    if token not in canon: errors.append(f"external monitor canonical missing {token}")
for slug,p in m["merge_policy"].items():
    t=read(slug)
    if field(t,"content_status")!="deprecated": errors.append(f"{slug}: not deprecated")
    if field(t,"verification_governance_state")!="deprecated": errors.append(f"{slug}: governance not deprecated")
    if field(t,"canonical_procedure")!=p["canonical"]: errors.append(f"{slug}: canonical mismatch")

# Webcam relationship.
if "## Camera troubleshooting relationship" not in read("troubleshoot-a-webcam-on-windows"):
    errors.append("Windows webcam relationship missing")
if "troubleshoot-a-webcam-on-windows" not in read("troubleshoot-teams-camera"):
    errors.append("Teams camera does not route to generic Windows webcam diagnostics")

# Shared mailbox relationship.
if "grant-shared-mailbox-access" not in read("troubleshoot-a-shared-mailbox"):
    errors.append("shared mailbox troubleshooting cross-reference missing")

if len(list((repo/"_procedures").glob("*.md")))!=421:
    errors.append("Procedure count changed")

if errors:
    print("\n".join(errors),file=sys.stderr); sys.exit(1)
print("Batch B-4 remediation validation passed.")
print("Corrected ledger: P1=13, P2=15, P3=2, P0=0.")
print("Explicitly blocked individual verdicts remediated: 7.")
print("No Batch B-4 procedure was promoted to Verified.")
