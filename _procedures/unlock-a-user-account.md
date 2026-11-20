---
title: Unlock a user account
slug: unlock-a-user-account
description: 'Enterprise runbook to unlock a user account without skipping evidence, verification, rollback or escalation requirements.'
content_type: procedure
category: Identity & Access Management
service: Identity & Access Management
severity: medium
support_tier: L1-L2
owner_team: Identity and Access Management
platforms:
  - Active Directory
  - Entra ID
  - SSO
risk_level: controlled
estimated_time: 15-45 minutes
tags:
  - a
  - account
  - identity-and-access-management
  - l1-l2
  - unlock
  - user
error_codes: []
tldr: 'Confirm scope and authorisation, capture evidence, isolate the failing layer, apply the least disruptive approved remediation for unlock a user account, verify the original business task, and escalate with complete logs if recovery is not achieved.'
related_symptoms:
  - unlock-a-user-account
  - cannot-sign-in
  - access-is-denied-or-missing
symptom_weights:
  unlock-a-user-account: 10
  cannot-sign-in: 3
  access-is-denied-or-missing: 3
related_causes: []
related_commands: []
next_steps:
  - general-workstation-triage
escalation: 'Escalate to Identity and Access Management with the exact user or service impact, timestamps and timezone, affected assets, screenshots or error text, diagnostic results, logs, recent changes, remediation attempted, rollback status and a clear statement of what remains broken.'
last_reviewed: '2026-08-02'
review_cycle_days: 180
required_role: technician
approval_required: 'Follow organisational policy for privileged, destructive, security-sensitive or service-impacting actions.'
permalink: /procedures/unlock-a-user-account/
layout: article
content_status: deprecated
generated_baseline: true
reviewed_by: ''
last_tested: ''
tested_platforms:
  - Active Directory
  - Entra ID
  - SSO
source_references: []
change_record: Generic account-status command replaced with procedure-specific evidence collection during phase-two IAM remediation; full technical-owner validation remains pending.
quality_gate: pending
risk_model: impact-v1
risk_basis: 'Batch B-6 audit classification: P2 / medium.'
verification_priority: P2
verification_state: awaiting_live_validation
verification_schema_version: 2
verification_governance_state: deprecated
verification_v2_complete: false
verification_v2_score_percent: 24
verification_v2_missing:
  - diagnostic_tested
  - remediation_tested
  - rollback_or_irreversibility_confirmed
  - escalation_confirmed
  - time_validated
  - expected_result_confirmed
  - owner_signoff
  - authoritative_source_provenance
  - last_tested
  - minimum_peer_reviewers
  - minimum_sme_reviewers
  - minimum_test_records
  - minimum_distinct_environments
verification_promotion_ready: false
classification_audit: batch-b6-2026-08-13
canonical_procedure: password-reset
deprecation_reason: Merged into password-reset during Batch B-6 audit.
---
## Deprecated — use the canonical procedure
This page has been consolidated into `password-reset`.

Use `/procedures/password-reset/`.

The canonical runbook now contains the relevant decision branch, rollback and verification path. This compatibility page remains to preserve historical links.
