# ShiftStart Post-B6 Governance Fix

This patch fixes the two issues exposed after the successful Batch B-6 run:

- Public wizard/search/catalogue surfaces were still using historical `content_status`, allowing the 11 inherited legacy `verified` labels to appear as Verified even when Verification v2 says `revalidation_required`.
- Deprecated compatibility redirect pages were still being tested against the 1,200-character full enterprise-runbook length requirement.

For procedures, the authoritative public status is now `verification_governance_state`. A procedure is shown as Verified only when the governance state is `verified` and both `verification_v2_complete` and `verification_promotion_ready` are true.

Deprecated compatibility pages remain subject to all metadata/link/governance checks, but are exempt from the full-runbook body-length rule.

Apply after Batch B-6:

```bash
unzip -q shiftstart-post-b6-governance-fix.zip
python3 shiftstart-post-b6-governance-fix/apply-post-b6-governance-fix.py
```

Then regenerate and validate:

```bash
npm run verification:v2:apply
npm run generate
npm run post:b6:governance:check
npm run check
npm run build
```

Do not promote or relabel the 11 historical records merely to make counts match. They stay `revalidation_required` until Verification v2 evidence is complete and promotion is valid.
