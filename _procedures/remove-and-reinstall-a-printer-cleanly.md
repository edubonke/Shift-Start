---
title: Remove and reinstall a printer cleanly
slug: remove-and-reinstall-a-printer-cleanly
description: 'Enterprise runbook to remove and reinstall a printer cleanly without skipping evidence, verification, rollback or escalation requirements.'
content_type: procedure
category: Printing & Scanning
service: Printing & Scanning
severity: medium
support_tier: L1-L2
owner_team: Workplace Technology or Print Services
platforms:
  - Windows
  - macOS
  - Print services
risk_level: controlled
estimated_time: 15-45 minutes
tags:
  - a
  - and
  - cleanly
  - l1-l2
  - printer
  - printing-and-scanning
  - reinstall
  - remove
error_codes: []
tldr: 'Confirm scope and authorisation, capture evidence, isolate the failing layer, apply the least disruptive approved remediation for remove and reinstall a printer cleanly, verify the original business task, and escalate with complete logs if recovery is not achieved.'
related_symptoms:
  - need-to-remove-and-reinstall-a-printer-cleanly
  - printing-or-scanning-is-not-working
symptom_weights:
  need-to-remove-and-reinstall-a-printer-cleanly: 10
  printing-or-scanning-is-not-working: 3
related_causes: []
related_commands: []
next_steps:
  - general-workstation-triage
escalation: 'Escalate to Workplace Technology or Print Services with the exact user or service impact, timestamps and timezone, affected assets, screenshots or error text, diagnostic results, logs, recent changes, remediation attempted, rollback status and a clear statement of what remains broken.'
last_reviewed: '2026-08-02'
review_cycle_days: 180
required_role: technician
approval_required: 'Follow organisational policy for privileged, destructive, security-sensitive or service-impacting actions.'
permalink: /procedures/remove-and-reinstall-a-printer-cleanly/
layout: article
content_status: deprecated
generated_baseline: true
reviewed_by: ''
last_tested: ''
tested_platforms:
  - Windows
  - macOS
  - Print services
source_references: []
change_record: Enterprise baseline retained in full; technical-owner validation is required before production changes.
quality_gate: pending
risk_model: impact-v1
risk_basis: 'Batch B-3 audit classification: P2 / medium.'
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
classification_audit: batch-b3-2026-08-13
canonical_procedure: install-or-update-a-printer-driver
deprecation_reason: Merged into the definitive Printer Driver & Device Management runbook during Batch B-3 audit.
---
## Deprecated — use the definitive printer driver/device procedure
This workflow has been merged into **Install or update a printer driver**.

Use `/procedures/install-or-update-a-printer-driver/`.

The canonical procedure now contains update, clean-reinstall, rollback and verification branches. This page remains to preserve historical links.
