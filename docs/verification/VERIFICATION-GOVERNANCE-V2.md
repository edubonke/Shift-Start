# ShiftStart Verification Governance v2 — M1 Day 1–2

## Objective

Create one authoritative public trust state and a machine-enforced evidence schema without fabricating evidence or weakening the existing live-test gate.

## Authoritative state

`verification_governance_state` is now the public trust state.

A raw `content_status: verified` is not enough to show a green Verified state.

- `verified`: verification-v2 complete and review SLA current.
- `revalidation_required`: legacy/raw verified metadata exists but evidence-v2 is incomplete or expired.
- `live_validation_pending`: documentation structure is ready but live evidence/promotion is incomplete.
- `under_review`: documentation/technical review is not yet structurally ready.
- `draft`: work in progress.
- `deprecated`: withdrawn guidance.

## Verification-v2 criteria

All operational P0–P3 procedures require:
- diagnostics tested;
- remediation tested;
- rollback tested, or approved irreversibility with confirmed stop conditions;
- escalation path confirmed;
- execution time validated;
- expected result confirmed;
- named owner sign-off;
- authoritative source provenance;
- last-tested date and tested platforms;
- risk-specific peer review and test records.

P0:
- 3 passing test records across 3 distinct environments;
- 2 independent SME reviewers;
- negative/failure path tested;
- 90-day review SLA.

P1:
- 2 passing test records across 2 distinct environments;
- 2 independent SME reviewers;
- negative/failure path tested;
- 120-day review SLA.

P2:
- 2 passing test records;
- at least 1 SME reviewer;
- 180-day review SLA.

P3:
- 1 passing test record;
- at least 1 technical reviewer;
- 365-day review SLA.

P4:
- supported only for low-risk informational/self-service guidance;
- 1 validation when executable;
- source provenance + technical review;
- 365-day review SLA.

## No automatic promotion

`npm run verification:v2:apply` calculates governance state and missing evidence only.

`npm run readiness:promote` is the only promotion command. It promotes only procedures that satisfy the full v2 evidence gate.

## Review expiry

For complete evidence, `next_review_due` is derived from the last tested/reviewed date using the priority SLA. Once expired, a stored verified procedure becomes `revalidation_required` after the v2 state is recalculated.

## Reports

- `reports/verification-v2.json`
- `reports/verification-v2.csv`
- `_data/verification-v2-dashboard.json`

The report makes the difference between raw verified metadata and evidence-complete Verified explicit.
