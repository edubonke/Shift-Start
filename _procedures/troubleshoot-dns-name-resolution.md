---
title: Troubleshoot DNS name resolution
slug: troubleshoot-dns-name-resolution
description: 'Enterprise runbook to troubleshoot dns name resolution without skipping evidence, verification, rollback or escalation requirements.'
content_type: procedure
category: Network & Connectivity
service: Network & Connectivity
severity: high
support_tier: L1-L2
owner_team: Network Operations
platforms:
  - LAN
  - Wi-Fi
  - VPN
  - DNS
  - DHCP
risk_level: controlled
estimated_time: 15-45 minutes
tags:
  - dns
  - l1-l2
  - name
  - network-and-connectivity
  - resolution
  - troubleshoot
error_codes: []
tldr: 'Confirm scope and authorisation, capture evidence, isolate the failing layer, apply the least disruptive approved remediation for troubleshoot dns name resolution, verify the original business task, and escalate with complete logs if recovery is not achieved.'
related_symptoms:
  - dns-name-resolution
  - network-or-internet-access-is-unavailable
  - connection-is-slow-or-intermittent
symptom_weights:
  dns-name-resolution: 10
  network-or-internet-access-is-unavailable: 3
  connection-is-slow-or-intermittent: 3
related_causes: []
related_commands: []
next_steps:
  - general-workstation-triage
escalation: 'Escalate to Network Operations with the exact user or service impact, timestamps and timezone, affected assets, screenshots or error text, diagnostic results, logs, recent changes, remediation attempted, rollback status and a clear statement of what remains broken.'
last_reviewed: '2026-08-02'
review_cycle_days: 180
required_role: technician
approval_required: 'Follow organisational policy for privileged, destructive, security-sensitive or service-impacting actions.'
permalink: /procedures/troubleshoot-dns-name-resolution/
layout: article
content_status: deprecated
generated_baseline: true
reviewed_by: ''
last_tested: ''
tested_platforms:
  - LAN
  - Wi-Fi
  - VPN
  - DNS
  - DHCP
source_references: []
change_record: Enterprise baseline retained in full; technical-owner validation is required before production changes.
quality_gate: pending
risk_model: impact-v1
risk_basis: 'Batch B-2 audit classification: P1 / high.'
verification_priority: P1
verification_state: awaiting_live_validation
verification_schema_version: 2
verification_governance_state: deprecated
verification_v2_complete: false
verification_v2_score_percent: 22
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
  - negative_path_tested
verification_promotion_ready: false
classification_audit: batch-b2-2026-08-13
canonical_procedure: triage-a-dns-service-issue
deprecation_reason: Merged into the definitive DNS service runbook during Batch B-2 audit.
---
## Deprecated — use the definitive DNS service runbook
This procedure has been merged into **Triage a DNS service issue**.

Use `/procedures/triage-a-dns-service-issue/`.

The canonical runbook now covers client resolver checks, primary/secondary DNS testing, service/zone/forwarder health, rollback and end-to-end verification. This page remains only to preserve historical links.
