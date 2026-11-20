# Phase 2 remediation

This release converts the first content-governance pass into enforced source corrections.

- The procedure layout shows assurance status and links to the quality policy and audit on every procedure page.
- The global header exposes the Quality page everywhere.
- Legacy duplicate categories are prohibited.
- Known malformed symptom titles are prohibited.
- The unrelated account-lockout evidence command is removed from all 27 IAM procedures that reused it.
- Each affected IAM procedure now contains a procedure-specific diagnostic evidence block and remains `under_review` until a named technical owner validates the full runbook in the target environment.
- `npm run check` fails deployment when the old defects reappear.
