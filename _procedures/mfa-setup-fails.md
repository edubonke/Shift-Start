---
title: Resolve MFA setup or approval failure
slug: mfa-setup-fails
description: 'Resolve MFA registration loops, missing prompts, time drift and stale authentication methods safely.'
content_type: procedure
category: Identity & Access Management
severity: medium
support_tier: L2
estimated_time: 10-20 mins
owner_team: Identity & Access Management
tags:
  - mfa
  - authenticator
  - identity
  - security
error_codes:
  - registration failed
  - request denied
  - code invalid
tldr: 'Verify the user, confirm device time and network access, inspect registered methods, remove only an approved stale method and complete a fresh MFA registration test.'
related_symptoms:
  - cannot-sign-in
related_causes:
  - stale-mfa-registration
next_steps:
  - password-reset
escalation: 'Escalate to Identity & Access Management if identity cannot be verified, the tenant or Conditional Access policy blocks registration, no secure method remains, or a fresh registration still fails.'
risk_model: impact-v1
risk_basis: 'Batch B-1 audit classification: P2 / medium.'
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/mfa-setup-fails/
layout: article
content_status: verified
generated_baseline: false
reviewed_by: ShiftStart technical review
last_tested: ''
tested_platforms: []
source_references: []
change_record: Standardised to the Enterprise runbook template; existing verified status retained pending recorded live revalidation evidence.
quality_gate: passed
runbook_template: enterprise-v1
verification_evidence_state: legacy_verified_pending_revalidation
verification_schema_version: 2
verification_governance_state: revalidation_required
verification_v2_complete: false
verification_v2_score_percent: 18
verification_v2_missing:
  - diagnostic_tested
  - remediation_tested
  - rollback_or_irreversibility_confirmed
  - escalation_confirmed
  - time_validated
  - expected_result_confirmed
  - owner_signoff
  - authoritative_source_provenance
  - tested_platforms
  - last_tested
  - minimum_peer_reviewers
  - minimum_sme_reviewers
  - minimum_test_records
  - minimum_distinct_environments
verification_promotion_ready: false
classification_audit: batch-b1-2026-08-13
---
## Mandatory Batch B-1 controls
These audit-derived controls are mandatory before more invasive remediation.

### Pre-checks
1. Check identity-provider/service health before changing MFA registration.
2. Review registered authentication methods and policy/Conditional Access requirements.
3. Confirm mobile device date/time and push-notification capability where relevant.

### Rollback / undo
- Before deleting an authentication method, record the approved recovery path; if re-registration fails, use the organisation's approved temporary-access method.

## Diagnostic Steps
1. Verify the user's identity through the approved organisational process.
2. Confirm the user is using the official authenticator application and the correct corporate account.
3. Confirm automatic date, time and time zone are enabled on both the computer and phone.
4. Test registration from a standard trusted network and rule out captive portals or restrictive guest Wi-Fi.
5. In the approved identity administration portal, inspect the currently registered authentication methods.

## Remediation Steps
1. Remove only the stale, replaced or explicitly approved authentication method.
2. Start a new registration in a private browser window.
3. Complete the registration and send a test notification.
4. Confirm the new method is listed in the identity platform.

## Rollback Steps
1. Do not restore an insecure or lost authentication method merely to regain access.
2. If a still-controlled approved method was removed in error and policy permits restoration, re-register that method using the normal secure process.
3. If no secure method remains, stop and escalate rather than bypassing MFA controls.

## Verification Steps
1. Sign out fully.
2. Perform one fresh sign-in that requires MFA.
3. Approve the prompt using the newly registered method.
4. Confirm backup methods comply with organisational policy.
5. Confirm no one-time code or secret was captured in the ticket.

## Escalation Path
1. Escalate to Identity & Access Management if identity cannot be verified, registration remains blocked, Conditional Access prevents setup, or no secure method is available.
2. Include user ID, tenant/application, registration stage, device OS, exact error and timestamp. Never include one-time codes or authentication secrets.
