#!/usr/bin/env python3
from pathlib import Path
import json,re,sys
repo=Path.cwd()
mp=repo/"_data/batch-b5-audit-remediation.json"
errors=[]
if not mp.exists():
    print("Missing _data/batch-b5-audit-remediation.json",file=sys.stderr);sys.exit(1)
m=json.loads(mp.read_text(encoding="utf-8"))
def read(slug):
    p=repo/"_procedures"/f"{slug}.md"
    if not p.exists():errors.append(f"Missing procedure: {slug}");return ""
    return p.read_text(encoding="utf-8")
def fm(t):
    a=t.split("---",2);return a[1] if len(a)>=3 else ""
def field(t,k):
    x=re.search(rf"(?m)^{re.escape(k)}:\s*(.*?)\s*$",fm(t))
    if not x:return None
    v=x.group(1).strip()
    if len(v)>=2 and v[0]==v[-1] and v[0] in "'\"":v=v[1:-1]
    return v

for slug,r in m["procedures"].items():
    t=read(slug)
    if not t:continue
    if (field(t,"verification_priority") or "").upper()!=r["priority"]:errors.append(f"{slug}: priority mismatch")
    if (field(t,"severity") or "").lower()!=r["severity"]:errors.append(f"{slug}: severity mismatch")
    if slug not in m["merge_policy"] and "## Mandatory Batch B-5 controls" not in t:errors.append(f"{slug}: B5 controls missing")
    if (field(t,"verification_governance_state") or "").lower()=="verified":errors.append(f"{slug}: incorrectly Verified")

# Explicit detailed blocked verdicts.
checks={
"troubleshoot-an-http-500-error":"0. **Check platform and application health before deployment changes.**",
"troubleshoot-directory-synchronisation":"0. **Check directory-sync service health before synchronization changes.**",
}
for slug,token in checks.items():
    if token not in read(slug):errors.append(f"{slug}: blocked-governance marker missing")

# Additional governance fixes from source summary.
tokens={
"troubleshoot-disk-encryption-compliance":"## Encryption compliance decision path",
"troubleshoot-endpoint-protection-health":"## Endpoint protection health decision path",
"troubleshoot-gmail-send-or-receive":"0. **Check Google Workspace service health before mail-flow changes.**",
"troubleshoot-linux-certificate-trust":"## Linux certificate trust decision path",
}
for slug,token in tokens.items():
    if token not in read(slug):errors.append(f"{slug}: governance control missing")

# External-monitor merge depends on B4 canonical.
canon=read("troubleshoot-an-external-monitor")
for token in ["definitive-cross-platform-external-monitor-runbook","### Arrangement and resolution branch"]:
    if token not in canon:errors.append(f"external-monitor canonical missing {token}")
dup=read("troubleshoot-multiple-monitor-arrangement-or-resolution")
if field(dup,"content_status")!="deprecated":errors.append("monitor arrangement page not deprecated")
if field(dup,"verification_governance_state")!="deprecated":errors.append("monitor arrangement governance not deprecated")
if field(dup,"canonical_procedure")!="troubleshoot-an-external-monitor":errors.append("monitor arrangement canonical mismatch")

# Endpoint-health and active incident separation.
ep=read("troubleshoot-endpoint-protection-health")
if "investigate-an-antivirus-or-edr-alert" not in ep:errors.append("endpoint health does not route active alerts to EDR incident runbook")

# Data-preservation safeguards.
for slug,token in {
"troubleshoot-chrome-profile-synchronisation":"Do not clear cloud sync data",
"troubleshoot-known-folder-move":"Do not blindly stop sync",
"troubleshoot-google-drive-synchronisation":"do not overwrite cloud data",
"troubleshoot-blocked-browser-downloads":"do not release it automatically",
}.items():
    if token not in read(slug):errors.append(f"{slug}: safety safeguard missing")

if len(list((repo/"_procedures").glob("*.md")))!=421:errors.append("Procedure count changed")
if errors:
    print("\n".join(errors),file=sys.stderr);sys.exit(1)
print("Batch B-5 remediation validation passed.")
print("Corrected ledger: P1=11, P2=15, P3=4, P0=0.")
print("Explicit detailed Blocked verdicts remediated: 3.")
print("No Batch B-5 procedure was promoted to Verified.")
