---
title: Troubleshoot a stopped Windows Server service
slug: troubleshoot-a-stopped-windows-server-service
description: 'Enterprise runbook to troubleshoot a stopped windows server service without skipping evidence, verification, rollback or escalation requirements.'
content_type: procedure
category: Servers & Core Infrastructure
service: Servers & Core Infrastructure
severity: high
support_tier: L2-L3
owner_team: Server or Infrastructure Operations
platforms:
  - Windows Server
  - AD DS
  - DNS
  - DHCP
risk_level: controlled
estimated_time: 15-45 minutes
tags:
  - a
  - l2-l3
  - server
  - servers-and-core-infrastructure
  - service
  - stopped
  - troubleshoot
  - windows
error_codes: []
tldr: 'Confirm scope and authorisation, capture evidence, isolate the failing layer, apply the least disruptive approved remediation for troubleshoot a stopped windows server service, verify the original business task, and escalate with complete logs if recovery is not achieved.'
related_symptoms:
  - a-stopped-windows-server-service
  - a-server-or-infrastructure-service-is-degraded
symptom_weights:
  a-stopped-windows-server-service: 10
  a-server-or-infrastructure-service-is-degraded: 3
related_causes: []
related_commands: []
next_steps:
  - general-workstation-triage
escalation: 'Escalate to Server or Infrastructure Operations with the exact user or service impact, timestamps and timezone, affected assets, screenshots or error text, diagnostic results, logs, recent changes, remediation attempted, rollback status and a clear statement of what remains broken.'
last_reviewed: '2026-08-02'
review_cycle_days: 180
required_role: technician
approval_required: 'Follow organisational policy for privileged, destructive, security-sensitive or service-impacting actions.'
permalink: /procedures/troubleshoot-a-stopped-windows-server-service/
layout: article
content_status: under_review
generated_baseline: true
reviewed_by: ''
last_tested: ''
tested_platforms:
  - Windows Server
  - AD DS
  - DNS
  - DHCP
source_references: []
change_record: Enterprise baseline retained in full; technical-owner validation is required before production changes.
quality_gate: pending
risk_model: impact-v1
risk_basis: 'Batch B-4 audit classification: P1 / high.'
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
classification_audit: batch-b4-2026-08-13
---
## Purpose and scope
Use this runbook for **troubleshoot a stopped windows server service** in a managed enterprise environment. It covers intake, evidence, safe diagnosis, remediation, verification, documentation and escalation. It does not replace organisation-specific security, change, safety, privacy, regulatory or vendor procedures.

## Mandatory Batch B-4 controls
These audit-derived controls are mandatory before more invasive remediation.

### Pre-checks
1. Review System/Application/service-specific event logs for the stop/failure reason before restarting the service.
2. Check service dependencies and dependency health.
3. Check the service identity/credential, required permissions, resource capacity and recent configuration/update changes.

### Rollback / undo
- Capture the service configuration and recent change record. If a confirmed configuration/update caused the stop, revert only that approved change or restore the prior known-good service configuration; do not repeatedly restart a crashing service without diagnosis.
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
- Check service dependencies, account credentials, start type, executable path and recent configuration.
- Read the exact service and system logs at the failure time.

### Targeted remediation sequence
1. Correct the confirmed dependency or configuration and start the service once.
2. Do not repeatedly restart a failing production service without understanding impact.

### Scenario-specific success criterion
The service remains running and its dependent transaction succeeds.


## Procedure
1. **Confirm the report and reproduce safely.** Ask the user to demonstrate the original task or reproduce it with non-sensitive test data. Do not repeatedly trigger lockouts, failed jobs, duplicate transactions or destructive actions.

   <div class="expected"><strong>Expected result:</strong> The ticket contains a precise, reproducible statement of the failure and its business impact.</div>

2. **Determine scope and priority.** Compare another user, device, location or service path where safe. Check monitoring, service-health notices, known errors, major incidents and recent changes.

   <div class="expected"><strong>Expected result:</strong> The issue is correctly classified as local, user-specific, device-specific, site-specific, service-wide or a standard request.</div>

3. **Protect data and establish a rollback point.** Save work, record current settings and export or back up configuration where supported. Obtain approval before actions that can interrupt service or remove data.

   <div class="expected"><strong>Expected result:</strong> Current state and recovery options are documented before any material change.</div>

4. **Run non-destructive diagnostics.** Confirm monitoring, recent changes, dependency health, capacity, service state, event logs, network reachability and redundancy before changing the server.

{% capture enterprise_command %}
Get-Service | Where-Object Status -ne Running | Select -First 30 Name,Status,StartType; Get-Volume | Select DriveLetter,SizeRemaining,Size; Get-WinEvent -LogName System -MaxEvents 30 | Select TimeCreated,Id,LevelDisplayName,Message
{% endcapture %}
{% include command.html shell="powershell" label="Server baseline" command=enterprise_command %}

   <div class="expected"><strong>Expected result:</strong> Evidence identifies the failing layer or eliminates likely causes without changing production state.</div>

5. **Apply the primary approved remediation.** Use the approved runbook to restore the smallest affected component; avoid rebooting, failing over or clearing data without change authority.

   <div class="expected"><strong>Expected result:</strong> The affected component returns to a supported, known-good state with minimal user or service disruption.</div>

6. **Re-test the original task.** Repeat the exact business action using the same account, device, network and data path. Also test a controlled alternative where useful.

   <div class="expected"><strong>Expected result:</strong> The original failure is resolved or the remaining fault is narrowed to a specific dependency.</div>

7. **Apply secondary remediation only when justified.** Engage the service owner and infrastructure on-call team when the issue is systemic, recurring, high risk or requires privileged recovery.

   <div class="expected"><strong>Expected result:</strong> Any deeper change follows an approved runbook, is reversible where possible and is fully recorded.</div>

8. **Validate security, management and compliance.** Confirm encryption, endpoint protection, identity policy, management check-in, logging, patch level and access controls remain healthy where relevant.

   <div class="expected"><strong>Expected result:</strong> Recovery has not created a security, compliance, licensing or manageability gap.</div>

9. **Complete end-to-end verification.** Monitoring is healthy, the dependent business transaction succeeds, redundancy is restored and no new critical events appear.

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
