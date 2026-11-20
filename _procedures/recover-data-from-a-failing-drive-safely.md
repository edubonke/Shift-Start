---
title: Recover data from a failing drive safely
slug: recover-data-from-a-failing-drive-safely
description: 'Enterprise runbook to recover data from a failing drive safely without skipping evidence, verification, rollback or escalation requirements.'
content_type: procedure
category: 'Data Protection, Backup & Recovery'
service: 'Data Protection, Backup & Recovery'
severity: high
support_tier: L1-L3
owner_team: 'Backup, Storage or Data Protection'
platforms:
  - Backup
  - File services
  - Cloud storage
risk_level: controlled
estimated_time: 15-45 minutes
tags:
  - a
  - data
  - data-protection-backup-and-recovery
  - drive
  - failing
  - from
  - l1-l3
  - recover
  - safely
error_codes: []
tldr: 'Confirm scope and authorisation, capture evidence, isolate the failing layer, apply the least disruptive approved remediation for recover data from a failing drive safely, verify the original business task, and escalate with complete logs if recovery is not achieved.'
related_symptoms:
  - data-from-a-failing-drive-safely
  - business-data-is-missing-corrupted-or-requires-recovery
symptom_weights:
  data-from-a-failing-drive-safely: 10
  business-data-is-missing-corrupted-or-requires-recovery: 3
related_causes: []
related_commands: []
next_steps:
  - general-workstation-triage
escalation: 'Escalate to Backup, Storage or Data Protection with the exact user or service impact, timestamps and timezone, affected assets, screenshots or error text, diagnostic results, logs, recent changes, remediation attempted, rollback status and a clear statement of what remains broken.'
last_reviewed: '2026-08-02'
review_cycle_days: 180
required_role: technician
approval_required: 'Follow organisational policy for privileged, destructive, security-sensitive or service-impacting actions.'
permalink: /procedures/recover-data-from-a-failing-drive-safely/
layout: article
content_status: under_review
generated_baseline: true
reviewed_by: ''
last_tested: ''
tested_platforms:
  - Backup
  - File services
  - Cloud storage
source_references: []
change_record: Enterprise baseline retained in full; technical-owner validation is required before production changes.
quality_gate: pending
risk_model: impact-v1
risk_basis: 'Batch B-3 audit classification: P1 / high.'
verification_priority: P1
verification_state: awaiting_live_validation
verification_schema_version: 2
verification_governance_state: under_review
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
classification_audit: batch-b3-2026-08-13
---
## Purpose and scope
Use this runbook for **recover data from a failing drive safely** in a managed enterprise environment. It covers intake, evidence, safe diagnosis, remediation, verification, documentation and escalation. It does not replace organisation-specific security, change, safety, privacy, regulatory or vendor procedures.

## Mandatory Batch B-3 controls
These audit-derived controls are mandatory before more invasive remediation.

### Pre-checks
1. Step 0: stop normal use immediately if the drive shows physical-failure signs, repeated I/O errors or serious SMART/media faults; escalate physical failure to approved data-recovery specialists.
2. Verify whether an approved backup/synchronised copy already contains the needed data before attempting recovery.
3. For logical recovery on a readable drive, work from an image/clone created with approved recovery tooling where feasible; never write recovery output back to the failing source.

### Rollback / undo
- There is no safe rollback for additional media damage. Preserve the source read-only, work from an image/clone and restore business data from verified backups or recovered copies to a separate healthy destination.
## Preconditions and authorisation
- Verify the requester, affected user, asset and business service.
- Confirm that the requested action is permitted for your support role.
- Protect unsaved work and business data before restarts, profile resets, re-enrolment, removal, wipe, restore or replacement actions.
- Use named administrative accounts and approved privileged-access workflows. Never request or record a user's password or MFA code.
- Stop when there is a safety risk, suspected security incident, legal hold, active major incident, unsupported device, data-loss risk or action outside your authority.

## Information and evidence to capture
- User, department, contact method, location and working hours.
- Device name, asset tag, serial number, operating system, network and management status where applicable.
- Exact error text, error code, screenshot, timestamp and timezone.
- Scope: one user, one device, one location, a group, or the whole service.
- Last known working time, recent changes and whether another user or device is affected.
- Business process blocked, workaround availability, urgency and deadline.

## Scenario-specific diagnostic and remediation plan

### Targeted checks
- Confirm data owner, exact item/path, time, retention, legal hold and recovery point.
- Preserve current data and restore to an alternate location first where possible.

### Targeted remediation sequence
1. Perform the approved restore or migration and retain before/after evidence.
2. Do not overwrite live data without owner approval and rollback.

### Scenario-specific success criterion
The owner validates data integrity, completeness, permissions and usability.


## Procedure
0. **Stop normal use and protect the source drive first.** If physical-failure signs or serious media errors exist, stop and escalate to approved recovery specialists; verify backups before any recovery attempt.

1. **Confirm the report and reproduce safely.** Ask the user to demonstrate the original task or reproduce it with non-sensitive test data. Do not repeatedly trigger lockouts, failed jobs, duplicate transactions or destructive actions.

   <div class="expected"><strong>Expected result:</strong> The ticket contains a precise, reproducible statement of the failure and its business impact.</div>

2. **Determine scope and priority.** Compare another user, device, location or service path where safe. Check monitoring, service-health notices, known errors, major incidents and recent changes.

   <div class="expected"><strong>Expected result:</strong> The issue is correctly classified as local, user-specific, device-specific, site-specific, service-wide or a standard request.</div>

3. **Protect data and establish a rollback point.** Save work, record current settings and export or back up configuration where supported. Obtain approval before actions that can interrupt service or remove data.

   <div class="expected"><strong>Expected result:</strong> Current state and recovery options are documented before any material change.</div>

4. **Run non-destructive diagnostics.** Confirm data owner, exact path, version, deletion or corruption time, retention policy, legal hold and available recovery points before restoring anything.

   <div class="expected"><strong>Expected result:</strong> Evidence identifies the failing layer or eliminates likely causes without changing production state.</div>

5. **Apply the primary approved remediation.** Restore to an alternate safe location first when possible and preserve the current version for comparison.

   <div class="expected"><strong>Expected result:</strong> The affected component returns to a supported, known-good state with minimal user or service disruption.</div>

6. **Re-test the original task.** Repeat the exact business action using the same account, device, network and data path. Also test a controlled alternative where useful.

   <div class="expected"><strong>Expected result:</strong> The original failure is resolved or the remaining fault is narrowed to a specific dependency.</div>

7. **Apply secondary remediation only when justified.** Use storage, backup, application or specialist recovery only with explicit authorisation when overwrite or data-loss risk exists.

   <div class="expected"><strong>Expected result:</strong> Any deeper change follows an approved runbook, is reversible where possible and is fully recorded.</div>

8. **Validate security, management and compliance.** Confirm encryption, endpoint protection, identity policy, management check-in, logging, patch level and access controls remain healthy where relevant.

   <div class="expected"><strong>Expected result:</strong> Recovery has not created a security, compliance, licensing or manageability gap.</div>

9. **Complete end-to-end verification.** The data owner validates completeness, integrity, permissions and business usability of the recovered data.

   <div class="expected"><strong>Expected result:</strong> The user or service owner confirms the business task is restored and monitoring remains stable.</div>

10. **Document and close correctly.** Record the cause or best evidence, every command and change, before-and-after results, user confirmation, linked problem/change/vendor records, assets involved and follow-up actions. Do not close while a workaround is unowned or monitoring is still unstable.

   <div class="expected"><strong>Expected result:</strong> Another technician can reconstruct the incident, continue the work or audit the decision trail from the ticket alone.</div>

## Rollback and stop conditions
- Roll back the last change if service worsens, a new error appears or verification fails.
- Stop immediately for electrical, battery, overheating, liquid, smoke, physical-security or personal-safety risk.
- Stop and invoke the security process for suspected compromise, malware, phishing, data exposure or unauthorised access.
- Stop before deleting profiles, wiping devices, resetting production services, restoring over live data, changing network/security policy or bypassing controls without approval.

## Evidence required for escalation
- Ticket priority and business impact.
- Exact reproduction steps and result.
- Affected and unaffected comparison points.
- Diagnostic outputs and relevant logs with timestamps.
- Screenshots or error codes with sensitive data redacted.
- Recent changes, updates, deployments or environmental differences.
- Actions attempted, outcomes and rollback performed.
- Current workaround and user availability for testing.

## Verification checklist
- [ ] Original business task succeeds.
- [ ] No related alert, error, lockout or failed job is recurring.
- [ ] Security and management controls remain active.
- [ ] User or service owner confirms recovery.
- [ ] Ticket evidence and categorisation are complete.
- [ ] Follow-up problem, change, vendor or knowledge work is linked.
