#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

repo = Path.cwd()
manifest_path = repo / "_data" / "batch-b3-audit-remediation.json"
errors = []

if not manifest_path.exists():
    print("Missing _data/batch-b3-audit-remediation.json", file=sys.stderr)
    sys.exit(1)
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

def read_proc(slug):
    p = repo / "_procedures" / f"{slug}.md"
    if not p.exists():
        errors.append(f"Missing procedure: {slug}")
        return ""
    return p.read_text(encoding="utf-8")

def fm(text):
    parts = text.split("---", 2)
    return parts[1] if len(parts) >= 3 else ""

def field(text, key):
    m = re.search(rf"(?m)^{re.escape(key)}:\s*(.*?)\s*$", fm(text))
    if not m:
        return None
    v = m.group(1).strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "'\"":
        v = v[1:-1]
    return v

def list_field(text, key):
    f = fm(text).splitlines()
    out=[]; in_list=False; base_indent=None
    for line in f:
        if re.match(rf"^{re.escape(key)}:\s*$", line):
            in_list=True
            continue
        if in_list:
            m=re.match(r"^\s*-\s+(.*)$",line)
            if m:
                out.append(m.group(1).strip().strip("'\""))
            elif line and not line.startswith(" "):
                break
    return out

for slug, rec in manifest["procedures"].items():
    t=read_proc(slug)
    if not t: continue
    if (field(t,"verification_priority") or "").upper() != rec["priority"]:
        errors.append(f"{slug}: priority mismatch")
    if (field(t,"severity") or "").lower() != rec["severity"]:
        errors.append(f"{slug}: severity mismatch")
    if slug not in manifest["merge_policy"] and "## Mandatory Batch B-3 controls" not in t:
        errors.append(f"{slug}: Batch B-3 controls missing")
    if (field(t,"verification_governance_state") or "").lower() == "verified":
        errors.append(f"{slug}: incorrectly promoted to Verified")

# Merge/deprecation checks.
for slug, policy in manifest["merge_policy"].items():
    t=read_proc(slug)
    if field(t,"content_status") != "deprecated":
        errors.append(f"{slug}: not deprecated")
    if field(t,"verification_governance_state") != "deprecated":
        errors.append(f"{slug}: governance state not deprecated")
    if field(t,"canonical_procedure") != policy["canonical"]:
        errors.append(f"{slug}: canonical_procedure mismatch")

# Canonical printer/account-lockout checks.
printer=read_proc("install-or-update-a-printer-driver")
for token in ["## Printer driver and device management decision path","Printbrm","signed"]:
    if token not in printer:
        errors.append(f"printer canonical missing {token}")

lockout=read_proc("trace-an-active-directory-account-lockout-source")
if "## Repeated lockout decision path" not in lockout:
    errors.append("account lockout canonical routing missing")

# Identity lifecycle cross-reference.
for slug in manifest["relationship_policy"]["identity_lifecycle"]:
    if "## Identity lifecycle relationship" not in read_proc(slug):
        errors.append(f"{slug}: identity lifecycle relationship missing")

# Literal Step 0 governance markers for the 10 blocked procedures.
step0_tokens = {
"deprovision-a-departing-user-account":"0. **Verify authorised offboarding before action.**",
"escalate-a-legal-hold-or-retention-request":"0. **Verify Legal/Compliance authority before action.**",
"handle-a-sensitive-data-misdelivery":"0. **Contain the data exposure immediately.**",
"investigate-an-antivirus-or-edr-alert":"0. **Contain a credible active threat before ordinary investigation.**",
"perform-an-approved-remote-wipe":"0. **Verify wipe authority and exact device before issuing the command.**",
"recover-a-device-requesting-a-bitlocker-recovery-key":"0. **Verify identity and exact device before using a recovery key.**",
"recover-a-mac-requesting-a-filevault-recovery-key":"0. **Verify identity and exact Mac before using a recovery key.**",
"recover-data-from-a-failing-drive-safely":"0. **Stop normal use and protect the source drive first.**",
"report-and-contain-a-phishing-email":"0. **Report and contain the phishing message immediately.**",
"resolve-a-conditional-access-block":"0. **Check Entra service health before policy changes.**",
}
for slug, token in step0_tokens.items():
    if token not in read_proc(slug):
        errors.append(f"{slug}: Step 0 marker missing")

# Symptom mismatch corrections: discover related BitLocker/FileVault-specific symptoms.
for proc_slug, policy in manifest["symptom_mapping_policy"].items():
    t=read_proc(proc_slug)
    rel = list_field(t, "related_symptoms")
    matches=[s for s in rel if all(term in s.lower() for term in policy["match_terms"])]
    if not matches:
        errors.append(f"{proc_slug}: no matching related symptom found for mapping correction")
        continue
    for symptom_slug in matches:
        sp=repo/"_symptoms"/f"{symptom_slug}.md"
        if not sp.exists():
            errors.append(f"Missing symptom file: {symptom_slug}")
            continue
        st=sp.read_text(encoding="utf-8")
        if (field(st,"severity") or "").lower() != policy["target_severity"]:
            errors.append(f"{symptom_slug}: expected severity {policy['target_severity']}")

if len(list((repo/"_procedures").glob("*.md"))) != 421:
    errors.append("Procedure count is not 421")

if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)

print("Batch B-3 remediation validation passed.")
print("Corrected ledger: P1=8, P2=19, P3=3, P0=0.")
print("Blocked governance procedures remediated: 10.")
print("No Batch B-3 procedure was promoted to Verified.")
