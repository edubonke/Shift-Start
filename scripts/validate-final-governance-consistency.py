#!/usr/bin/env python3
from pathlib import Path
import json
import sys

repo = Path.cwd()
errors = []

def read(rel):
    path = repo / rel
    if not path.exists():
        errors.append(f"Missing {rel}")
        return ""
    return path.read_text(encoding="utf-8")

procedure_count = len(list((repo / "_procedures").glob("*.md")))
if procedure_count != 421:
    errors.append(f"Procedure count changed: expected 421, found {procedure_count}")

quality = read("content-quality.html")
if "where: 'content_status', 'verified'" in quality:
    errors.append("content-quality.html still counts legacy content_status verified")
for token in [
    "verification_governance_state",
    "verification_v2_complete",
    "verification_promotion_ready",
    "revalidation_required",
    "quality_verified",
    "quality_revalidation",
]:
    if token not in quality:
        errors.append(f"content-quality.html missing governance token: {token}")

readiness = read("_includes/readiness-dashboard.html")
if "where: 'content_status', 'verified'" in readiness:
    errors.append("readiness-dashboard.html still counts legacy content_status verified")
for token in [
    "verification_governance_state",
    "verification_v2_complete",
    "verification_promotion_ready",
    "revalidation_required",
    "readiness_verified",
    "readiness_revalidation",
    "readiness_deprecated",
]:
    if token not in readiness:
        errors.append(f"_includes/readiness-dashboard.html missing governance token: {token}")

catalog = read("enterprise-catalog.json")
for token in [
    '"contentStatus": {{ effective_status | jsonify }}',
    '"legacyContentStatus":',
    '"governanceStatus": {{ effective_status | jsonify }}',
    '"recordedGovernanceStatus":',
    '"verificationV2Complete":',
    "verification_v2_complete",
    "verification_promotion_ready",
    "revalidation_required",
]:
    if token not in catalog:
        errors.append(f"enterprise-catalog.json missing governance token: {token}")
if '"contentStatus": {{ item.content_status' in catalog:
    errors.append("enterprise-catalog.json still exposes raw content_status as contentStatus")

package_path = repo / "package.json"
try:
    package = json.loads(package_path.read_text(encoding="utf-8"))
    scripts = package.get("scripts", {})
    for name in ["product:polish:check", "final:governance:check", "site:artifact:clean"]:
        if name not in scripts:
            errors.append(f"package.json missing script {name}")
    check = scripts.get("check", "")
    if "product:polish:check" not in check:
        errors.append("npm run check does not include product:polish:check")
    if "final:governance:check" not in check:
        errors.append("npm run check does not include final:governance:check")
    if "site:artifact:clean" not in scripts.get("build", ""):
        errors.append("npm run build does not clean the generated Pages artifact")
except Exception as exc:
    errors.append(f"package.json could not be validated: {exc}")

workflow = read(".github/workflows/deploy.yml")
for token in [
    "Remove development patch artifacts from Pages output",
    "npm run site:artifact:clean",
    "test -s _site/assets/data/enterprise-catalog.json",
    "python3 scripts/clean-pages-artifact.py --check",
    "invalidEnterpriseVerified",
]:
    if token not in workflow:
        errors.append(f"deploy.yml missing final hardening token: {token}")

ignore = read(".gitignore")
for token in [
    ".shiftstart-backups/",
    "shiftstart-supportvault-product-polish",
    "shiftstart-final-corrective-patch",
]:
    if token not in ignore:
        errors.append(f".gitignore missing patch hygiene token: {token}")

if not (repo / "scripts/validate-supportvault-product-polish.py").exists():
    errors.append("SupportVault-style product polish validator is missing")

if errors:
    print("Final governance consistency validation FAILED:", file=sys.stderr)
    for error in errors:
        print(f" - {error}", file=sys.stderr)
    sys.exit(1)

print("Final governance consistency validation passed.")
print("Public status model: Verification v2 authoritative across quality, readiness and enterprise catalogue.")
print("CI: product-polish and final-governance validators are enforced.")
print("Pages artifact: development patch/install material is removed before deployment.")
print("Procedure catalogue preserved: 421 procedures.")
