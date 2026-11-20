---
title: 'Resolve a locked, forgotten or expired user password'
slug: password-reset
description: 'Restore user access safely after a forgotten password, expiry or lockout without weakening identity controls.'
content_type: procedure
category: Identity & Access Management
severity: medium
support_tier: L1
estimated_time: 10-15 mins
owner_team: Identity & Access Management
tags:
  - password
  - account
  - lockout
  - active-directory
error_codes:
  - account locked
  - password expired
tldr: 'Verify the user, determine whether the account is locked, disabled or expired, then use the approved identity platform to unlock or reset access and confirm the account does not immediately lock again.'
related_symptoms:
  - cannot-sign-in
related_causes:
  - account-lockout
next_steps:
  - mfa-setup-fails
escalation: 'Escalate to Identity & Access Management if identity cannot be verified, the account repeatedly locks, the source of bad-password attempts is unknown, the account is disabled unexpectedly, or policy prevents a standard reset.'
risk_model: impact-v1
risk_basis: 'Batch B-1 audit classification: P2 / medium.'
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/password-reset/
layout: article
content_status: verified
generated_baseline: false
reviewed_by: ShiftStart technical review
last_tested: ''
tested_platforms: []
source_references:
  - 'https://learn.microsoft.com/powershell/module/activedirectory/get-aduser'
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
canonical_role: definitive-user-account-access-recovery
---
## Mandatory Batch B-1 controls
These audit-derived controls are mandatory before more invasive remediation.

### Pre-checks
1. Verify the user's identity through the approved out-of-band verification process.
2. Check whether the lockout/failed-sign-in pattern indicates brute-force or suspicious activity.
3. Confirm required MFA/authentication methods remain available after reset.

### Rollback / undo
- If access fails after the reset, use the organisation's approved temporary-access/recovery method rather than recycling or disclosing old credentials.

## Diagnostic Steps
1. Verify the user's identity using the organisation's approved process. Never ask for an existing password or MFA code.
2. Confirm the exact username, affected service and error message.
3. Determine whether the issue is a forgotten password, expired password, disabled account or repeated lockout.
4. Where RSAT and directory access are authorised, gather read-only account-state evidence.

{% capture kb_command_1 %}
Get-ADUser -Identity username -Properties LockedOut,Enabled,PasswordExpired,LastBadPasswordAttempt | Select-Object SamAccountName,Enabled,LockedOut,PasswordExpired,LastBadPasswordAttempt
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}

5. If repeated lockout is present, record the last bad-password time before changing the account.

## Remediation Steps
1. Unlock or reset the account only after identity verification and according to the approved identity process.
2. Require a password change at next sign-in where policy requires it.
3. Ask the user to sign in once on a trusted corporate device.
4. Update stale saved credentials on approved phones, Outlook, VPN clients and mapped drives as necessary.

## Rollback Steps
1. A password reset is not rolled back by restoring or disclosing the old password.
2. If the reset does not restore access, stop repeated resets and investigate the actual authentication source.
3. If an unintended account-state change occurred, restore only the approved account state through the identity platform and record the change.

## Verification Steps
1. Confirm the user can sign in to the original affected service.
2. Confirm the account remains enabled and unlocked.
3. Monitor for at least five minutes for new bad-password attempts where tooling permits.
4. Confirm the user has updated stale saved credentials that could re-lock the account.

## Escalation Path
1. Escalate to Identity & Access Management if identity verification fails, the account repeatedly locks, the account is unexpectedly disabled, or standard reset policy cannot restore access.
2. Include the verified username, lockout time, suspected source device if known, actions taken and repeated-lockout evidence.

## User account access recovery decision path
Use the narrowest recovery path after verifying the user's identity:

- **One-time lockout, no compromise evidence:** identify obvious stale-credential causes, unlock under policy, then verify sign-in.
- **Forgotten/expired password:** follow the approved password-reset flow and MFA/recovery controls.
- **Repeated lockout:** use `trace-an-active-directory-account-lockout-source` before repeatedly unlocking the account.
- **Brute force or suspected compromise:** stop routine unlock/reset handling and invoke the compromised-account/security process.

Do not repeatedly unlock an account without diagnosing an immediate relock.

