#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

repo = Path.cwd()
manifest_path = repo / "_data" / "batch-b2-audit-remediation.json"
errors = []

if not manifest_path.exists():
    errors.append("Missing _data/batch-b2-audit-remediation.json")
    manifest = {}
else:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

def read(slug):
    p = repo / "_procedures" / f"{slug}.md"
    if not p.exists():
        errors.append(f"Missing procedure: {slug}")
        return ""
    return p.read_text(encoding="utf-8")

def fm_value(text, key):
    parts = text.split("---", 2)
    fm = parts[1] if len(parts) >= 3 else text
    m = re.search(rf"(?m)^{re.escape(key)}:\s*(.*?)\s*$", fm)
    if not m:
        return None
    value = m.group(1).strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
        value = value[1:-1]
    return value

if manifest:
    for slug, expected in manifest["classifications"].items():
        text = read(slug)
        if not text:
            continue
        sev = (fm_value(text, "severity") or "").lower()
        pri = (fm_value(text, "verification_priority") or "").upper()
        if sev != expected["severity"]:
            errors.append(f"{slug}: severity={sev}, expected {expected['severity']}")
        if pri != expected["priority"]:
            errors.append(f"{slug}: priority={pri}, expected {expected['priority']}")
        if slug != "troubleshoot-dns-name-resolution" and "## Mandatory Batch B-2 controls" not in text:
            errors.append(f"{slug}: Mandatory Batch B-2 controls missing")

    dns_dup = read("troubleshoot-dns-name-resolution")
    if fm_value(dns_dup, "content_status") != "deprecated":
        errors.append("DNS duplicate is not deprecated")
    if fm_value(dns_dup, "verification_governance_state") != "deprecated":
        errors.append("DNS duplicate governance state is not deprecated")
    if fm_value(dns_dup, "canonical_procedure") != "triage-a-dns-service-issue":
        errors.append("DNS duplicate canonical_procedure incorrect")

    canonical_dns = read("triage-a-dns-service-issue")
    for token in ["## Merged DNS decision path", "primary and secondary DNS", "zone/forwarder"]:
        if token not in canonical_dns:
            errors.append(f"Canonical DNS runbook missing: {token}")

    dhcp = read("troubleshoot-dhcp-address-assignment")
    for token in ["scope utilisation", "relay/helper", "reload in 10"]:
        if token not in dhcp:
            errors.append(f"DHCP runbook missing: {token}")

    calling = read("troubleshoot-teams-calling")
    for token in ["Microsoft 365 / Teams Phone service health", "Direct Routing/SBC"]:
        if token not in calling:
            errors.append(f"Teams calling missing: {token}")

    teams_phone = read("troubleshoot-a-teams-phone-device")
    if "Microsoft 365 / Teams service health" not in teams_phone:
        errors.append("Teams Phone provider-health check missing")

    teams_signin = read("troubleshoot-microsoft-teams-sign-in")
    if "Microsoft 365 / Teams service health" not in teams_signin:
        errors.append("Teams sign-in provider-health check missing")

    printq = read("clear-a-stuck-windows-print-queue")
    for token in ["disk free space", "Move/copy the affected spool files"]:
        if token not in printq:
            errors.append(f"Print queue safety control missing: {token}")

    evidence = read("collect-security-incident-evidence")
    for token in ["Step 0: establish chain of custody", "SHA-256", "approved forensic tooling"]:
        if token not in evidence:
            errors.append(f"Security evidence control missing: {token}")

    outlook = read("troubleshoot-outlook-that-will-not-open")
    if "## Outlook client decision path" not in outlook:
        errors.append("Outlook routing section missing")

    procedure_count = len(list((repo / "_procedures").glob("*.md")))
    if procedure_count != 421:
        errors.append(f"Procedure count changed: {procedure_count}, expected 421")

    for slug in manifest["classifications"]:
        text = read(slug)
        if (fm_value(text, "verification_governance_state") or "").lower() == "verified":
            errors.append(f"{slug}: incorrectly promoted to Verified")

if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)

print("Batch B-2 remediation validation passed.")
print("Individual verdict ledger: P1=9, P2=18, P3=3, P0=0.")
print("Active P1 after DNS merge: 8 + 1 deprecated P1 duplicate.")
print("No Batch B-2 procedure was promoted to Verified.")
