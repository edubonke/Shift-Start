---
title: Troubleshoot an Azure virtual machine that is unreachable
slug: troubleshoot-an-azure-virtual-machine-that-is-unreachable
description: 'Enterprise runbook to troubleshoot an azure virtual machine that is unreachable without skipping evidence, verification, rollback or escalation requirements.'
content_type: procedure
category: Cloud & Virtualisation
service: Cloud & Virtualisation
severity: high
support_tier: L2-L3
owner_team: Cloud Platform or Virtualisation Operations
platforms:
  - Azure
  - AWS
  - VMware
  - Hyper-V
risk_level: controlled
estimated_time: 15-45 minutes
tags:
  - an
  - azure
  - cloud-and-virtualisation
  - is
  - l2-l3
  - machine
  - that
  - troubleshoot
  - unreachable
  - virtual
error_codes: []
tldr: 'Confirm scope and authorisation, capture evidence, isolate the failing layer, apply the least disruptive approved remediation for troubleshoot an azure virtual machine that is unreachable, verify the original business task, and escalate with complete logs if recovery is not achieved.'
related_symptoms:
  - an-azure-virtual-machine-that-is-unreachable
  - a-cloud-or-virtual-resource-is-degraded
symptom_weights:
  an-azure-virtual-machine-that-is-unreachable: 10
  a-cloud-or-virtual-resource-is-degraded: 3
related_causes: []
related_commands: []
next_steps:
  - general-workstation-triage
escalation: 'Escalate to Cloud Platform or Virtualisation Operations with the exact user or service impact, timestamps and timezone, affected assets, screenshots or error text, diagnostic results, logs, recent changes, remediation attempted, rollback status and a clear statement of what remains broken.'
last_reviewed: '2026-08-02'
review_cycle_days: 180
required_role: technician
approval_required: 'Follow organisational policy for privileged, destructive, security-sensitive or service-impacting actions.'
permalink: /procedures/troubleshoot-an-azure-virtual-machine-that-is-unreachable/
layout: article
content_status: under_review
generated_baseline: true
reviewed_by: ''
last_tested: ''
tested_platforms:
  - Azure
  - AWS
  - VMware
  - Hyper-V
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
Use this runbook for **troubleshoot an azure virtual machine that is unreachable** in a managed enterprise environment. It covers intake, evidence, safe diagnosis, remediation, verification, documentation and escalation. It does not replace organisation-specific security, change, safety, privacy, regulatory or vendor procedures.

## Mandatory Batch B-4 controls
These audit-derived controls are mandatory before more invasive remediation.

### Pre-checks
1. Step 0: check Azure Service Health/resource health for the affected region/subscription before changing the VM or network.
2. Check VM power/provisioning state, Resource Health and Boot Diagnostics.
3. Check NSG, route, firewall and NIC configuration plus the intended management path before guest-OS changes.

### Rollback / undo
- Export/capture NSG, route and VM/network configuration before change. If an Azure network-policy change causes lockout, restore the previous approved configuration through Azure control-plane/IaC access; use Serial Console/Boot Diagnostics for guest-OS diagnosis, not as a substitute for restoring an incorrect NSG.
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
- Review provider health, resource status, console diagnostics, network/security rules, identity, quota and recent changes.
- Confirm disks, snapshots and recovery options before restart or redeploy.

### Targeted remediation sequence
1. Apply the smallest supported platform action and preserve audit evidence.
2. Use failover, recovery or provider support through incident/change control.

### Scenario-specific success criterion
The resource is healthy, reachable and serving its intended workload.


## Procedure
0. **Check Azure service/resource health before VM changes.** Check Azure Service Health and Resource Health for the affected subscription/region, then capture VM state, Boot Diagnostics and network policy before remediation.

1. **Confirm the report and reproduce safely.** Ask the user to demonstrate the original task or reproduce it with non-sensitive test data. Do not repeatedly trigger lockouts, failed jobs, duplicate transactions or destructive actions.

   <div class="expected"><strong>Expected result:</strong> The ticket contains a precise, reproducible statement of the failure and its business impact.</div>

2. **Determine scope and priority.** Compare another user, device, location or service path where safe. Check monitoring, service-health notices, known errors, major incidents and recent changes.

   <div class="expected"><strong>Expected result:</strong> The issue is correctly classified as local, user-specific, device-specific, site-specific, service-wide or a standard request.</div>

3. **Protect data and establish a rollback point.** Save work, record current settings and export or back up configuration where supported. Obtain approval before actions that can interrupt service or remove data.

   <div class="expected"><strong>Expected result:</strong> Current state and recovery options are documented before any material change.</div>

4. **Run non-destructive diagnostics.** Review provider health, resource state, monitoring, quota, network security, identity, console or boot diagnostics, capacity and recent changes.

   <div class="expected"><strong>Expected result:</strong> Evidence identifies the failing layer or eliminates likely causes without changing production state.</div>

5. **Apply the primary approved remediation.** Apply the documented platform action to the affected resource only, preserving disks, snapshots, configuration and audit evidence.

   <div class="expected"><strong>Expected result:</strong> The affected component returns to a supported, known-good state with minimal user or service disruption.</div>

6. **Re-test the original task.** Repeat the exact business action using the same account, device, network and data path. Also test a controlled alternative where useful.

   <div class="expected"><strong>Expected result:</strong> The original failure is resolved or the remaining fault is narrowed to a specific dependency.</div>

7. **Apply secondary remediation only when justified.** Use recovery, redeployment, failover or provider support only through the approved change and incident process.

   <div class="expected"><strong>Expected result:</strong> Any deeper change follows an approved runbook, is reversible where possible and is fully recorded.</div>

8. **Validate security, management and compliance.** Confirm encryption, endpoint protection, identity policy, management check-in, logging, patch level and access controls remain healthy where relevant.

   <div class="expected"><strong>Expected result:</strong> Recovery has not created a security, compliance, licensing or manageability gap.</div>

9. **Complete end-to-end verification.** The resource is healthy, monitored and reachable, and the business application transaction succeeds end to end.

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
