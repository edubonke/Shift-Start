#!/usr/bin/env python3
from pathlib import Path
import json, sys

repo = Path.cwd()
errors = []

required_tokens = {
    "scripts/generate-wizard.js": ["effectiveProcedureStatus", "legacyContentStatus", "verificationGovernanceState"],
    "scripts/generate-search-data.js": ["effectiveStatus", "legacyContentStatus", "verificationGovernanceState"],
    "scripts/validate-content.js": ["effectiveProcedureStatus", "isDeprecatedCompatibility", "legacyStatusCounts"],
    "_layouts/list.html": ["item_status", "revalidation_required", "live_validation_pending", "verification_governance_state"],
    "_layouts/article.html": ["related_status", "verification_governance_state"],
}
for rel, tokens in required_tokens.items():
    p = repo / rel
    if not p.exists():
        errors.append("Missing " + rel)
        continue
    text = p.read_text(encoding="utf-8")
    for token in tokens:
        if token not in text:
            errors.append(f"{rel}: missing {token}")

wizard = (repo / "scripts/generate-wizard.js").read_text(encoding="utf-8")
if 'const status = procedure.data.content_status || "under_review";' in wizard:
    errors.append("generate-wizard.js still counts legacy content_status")

validator_text = (repo / "scripts/validate-content.js").read_text(encoding="utf-8")
if '!isDeprecatedCompatibility && parsed.content.length < 1200' not in validator_text:
    errors.append("deprecated-only length exemption is missing")

wiz = repo / "assets/data/wizard-data.json"
if wiz.exists():
    try:
        data = json.loads(wiz.read_text(encoding="utf-8"))
        bad = [
            item for item in data.get("procedures", [])
            if item.get("contentStatus") == "verified"
            and not (item.get("verificationV2Complete") is True and item.get("verificationPromotionReady") is True)
        ]
        if bad:
            errors.append(f"wizard-data.json still has {len(bad)} non-v2 Verified item(s); run npm run generate")
    except Exception as exc:
        errors.append("wizard-data.json parse failed: " + str(exc))

if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)

print("Post-B6 governance validation passed.")
print("Public procedure statuses use Verification v2 governance.")
print("Deprecated compatibility stubs are exempt from the enterprise-length rule.")
