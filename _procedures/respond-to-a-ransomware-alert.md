---
title: Respond to a ransomware alert
slug: respond-to-a-ransomware-alert
description: 'Enterprise runbook to respond to a ransomware alert without skipping evidence, verification, rollback or escalation requirements.'
content_type: procedure
category: Security & Compliance
service: Security & Compliance
severity: critical
support_tier: L1-L3
owner_team: Security Operations or Incident Response
platforms:
  - EDR
  - SIEM
  - Identity
  - Email security
risk_level: controlled
estimated_time: 15-45 minutes
tags:
  - a
  - alert
  - l1-l3
  - ransomware
  - respond
  - security-and-compliance
  - to
error_codes: []
tldr: 'Confirm scope and authorisation, capture evidence, isolate the failing layer, apply the least disruptive approved remediation for respond to a ransomware alert, verify the original business task, and escalate with complete logs if recovery is not achieved.'
related_symptoms:
  - reported-a-ransomware-alert
  - a-security-or-compliance-concern-is-reported
symptom_weights:
  reported-a-ransomware-alert: 10
  a-security-or-compliance-concern-is-reported: 3
related_causes: []
related_commands: []
next_steps:
  - general-workstation-triage
escalation: 'Escalate to Security Operations or Incident Response with the exact user or service impact, timestamps and timezone, affected assets, screenshots or error text, diagnostic results, logs, recent changes, remediation attempted, rollback status and a clear statement of what remains broken.'
last_reviewed: '2026-08-02'
review_cycle_days: 180
required_role: technician
approval_required: 'Follow organisational policy for privileged, destructive, security-sensitive or service-impacting actions.'
permalink: /procedures/respond-to-a-ransomware-alert/
layout: article
content_status: under_review
generated_baseline: true
reviewed_by: ''
last_tested: ''
tested_platforms:
  - EDR
  - SIEM
  - Identity
  - Email security
source_references: []
source_provenance:
  - publisher: CISA
    title: '#StopRansomware Guide'
    url: 'https://www.cisa.gov/stopransomware/ransomware-guide'
    retrieved_at: '2026-08-10'
    authoritative: true
  - publisher: Microsoft
    title: Responding to ransomware attacks - Microsoft Defender XDR
    url: 'https://learn.microsoft.com/en-us/defender-xdr/playbook-responding-ransomware-m365-defender'
    retrieved_at: '2026-08-10'
    authoritative: true
  - publisher: Microsoft
    title: Take response actions on a device - Microsoft Defender for Endpoint
    url: 'https://learn.microsoft.com/en-us/defender-endpoint/respond-machine-alerts'
    retrieved_at: '2026-08-10'
    authoritative: true
  - publisher: NIST
    title: 'NIST IR 8374 Rev. 1 - Ransomware Risk Management: A Cybersecurity Framework 2.0 Community Profile'
    url: 'https://csrc.nist.gov/pubs/ir/8374/r1/final'
    retrieved_at: '2026-08-10'
    authoritative: true
change_record: Enterprise baseline retained in full; technical-owner validation is required before production changes.
quality_gate: pending
risk_model: impact-v1
risk_basis: 'Critical impact indicators detected: system/boot outage, data-integrity risk, security breach, or broad service outage.'
verification_priority: P0
verification_state: awaiting_live_validation
verification_schema_version: 2
verification_governance_state: under_review
verification_v2_complete: false
verification_v2_score_percent: 28
verification_v2_missing:
  - diagnostic_tested
  - remediation_tested
  - rollback_or_irreversibility_confirmed
  - escalation_confirmed
  - time_validated
  - expected_result_confirmed
  - owner_signoff
  - last_tested
  - minimum_peer_reviewers
  - minimum_sme_reviewers
  - minimum_test_records
  - minimum_distinct_environments
  - negative_path_tested
verification_promotion_ready: false
classification_audit: sprint1-2026-08-13
---
## Purpose and scope
Use this runbook for **respond to a ransomware alert** in a managed enterprise environment. It covers intake, evidence, safe diagnosis, remediation, verification, documentation and escalation. It does not replace organisation-specific security, change, safety, privacy, regulatory or vendor procedures.

## Preconditions and authorisation
- Verify the requester, affected user, asset and business service.
- Confirm that the requested action is permitted for your support role.
- Treat a credible ransomware alert as a security incident. Containment and evidence preservation take precedence over preserving unsaved user work.
- Establish approved secure or out-of-band communication with Security Operations / Incident Response when compromise may still be active.
- Use named administrative accounts and approved privileged-access workflows. Never request or record a user's password or MFA code.
- Never ask the user to re-open a suspicious attachment, execute a suspected payload or reproduce ransomware behaviour.
- Stop when there is a safety risk, legal hold, unsupported device, data-loss risk or action outside your authority; escalate immediately through the incident-response process.

## Information and evidence to capture
- User, department, contact method, location and working hours.
- Device name, asset tag, serial number, operating system, network and management status where applicable.
- Exact error text, error code, screenshot, timestamp and timezone.
- Scope: one user, one device, one location, a group, or the whole service.
- Last known working time, recent changes and whether another user or device is affected.
- Business process blocked, workaround availability, urgency and deadline.

## Scenario-specific diagnostic and remediation plan

### Targeted checks
- Identify affected and at-risk devices, identities, services and network paths from EDR/SIEM, identity, email and network evidence.
- Preserve alerts, timestamps and volatile/high-value evidence before cleanup where feasible.
- Determine whether execution, credential theft, exfiltration or lateral movement is still active.
- Never ask the user to re-open suspicious content or re-execute the suspected payload.

### Targeted remediation sequence
1. Immediately contain affected systems through approved incident-response/SOC actions. Isolate compromised endpoints from the network where appropriate.
2. Preserve compromised systems for analysis. Do not shut them down merely for convenience; if network disconnection is impossible, follow the approved incident-response decision for power-down and record the evidence impact.
3. Contain compromised identities, remote sessions, malicious indicators and attacker communication paths as directed by Security Operations.
4. Do not reconnect, restore or return a contained device/service until Security Operations confirms that investigation and mitigation are complete.

### Scenario-specific success criterion
Security Operations confirms containment and evidence preservation.


## Procedure
0. **Isolate and contain immediately.** Treat a credible ransomware alert as an active security incident. Isolate affected endpoints/identities through approved EDR, identity or network controls before ordinary investigation; establish the incident owner and preserve evidence.

1. **Confirm and declare the incident without reproducing the payload.** Validate the ransomware alert using the original alert, timestamps, affected asset/account, EDR/SIEM evidence and user report. Do **not** ask the user to reopen suspicious content or execute the suspected payload. Establish secure incident-response communications and link the alert to an existing incident or declare a new ransomware incident.

   <div class="expected"><strong>Expected result:</strong> The incident record contains the triggering evidence, first-seen time, affected entities, business impact and incident owner without re-executing suspicious content.</div>

2. **Determine scope and prioritise containment.** Identify impacted and at-risk devices, user/service accounts, applications, network communications, payloads and possible originating/spreader systems. Prioritise isolation of affected entities while investigation continues.

   <div class="expected"><strong>Expected result:</strong> The response team has an evidence-based scope hypothesis and the highest-risk affected entities are contained or queued for approved containment.</div>

3. **Preserve evidence and record reversible containment state.** Record the current incident/device/account state and collect approved forensic or investigation evidence before cleanup where feasible. Do not delay urgent containment merely to save user work. Record how each containment action can be released or reversed and obtain approval for high-impact actions.

   <div class="expected"><strong>Expected result:</strong> Volatile/high-value evidence is preserved where feasible, containment is not unnecessarily delayed, and reversal/release conditions are documented.</div>

4. **Collect incident evidence and non-destructive diagnostics.** Review the approved EDR/SIEM incident, device timeline, identity activity, email evidence, network telemetry and available investigation package. Preserve artefacts and avoid cleanup until the incident owner authorises eradication.

{% capture enterprise_command %}
Get-MpComputerStatus | Select AntivirusEnabled,RealTimeProtectionEnabled,AntivirusSignatureLastUpdated,QuickScanAge,FullScanAge
{% endcapture %}
{% include command.html shell="powershell" label="Endpoint protection state" command=enterprise_command %}

   <div class="expected"><strong>Expected result:</strong> Evidence identifies the failing layer or eliminates likely causes without changing production state.</div>

5. **Apply approved containment.** Use authorised controls such as endpoint isolation, compromised-account/session containment, indicator blocking, message quarantine or equivalent SOC actions. For critical infrastructure, assess service impact and use the approved containment method rather than improvising destructive changes.

   <div class="expected"><strong>Expected result:</strong> Attack propagation and unauthorised access paths are constrained, the containment action is visible in the relevant control plane, and evidence remains available for investigation.</div>

6. **Verify containment without re-triggering ransomware.** Confirm isolation/containment status, loss of unauthorised network paths, preservation of Defender/EDR management connectivity where applicable, and that related alerts or lateral movement are no longer progressing. Do not re-run the suspected ransomware payload as a verification step.

   <div class="expected"><strong>Expected result:</strong> The incident owner confirms containment is effective and investigation can continue without new propagation from the affected entity.</div>

7. **Apply secondary remediation only when justified.** Follow the security incident playbook for eradication, recovery, notification and evidence retention under Security Operations direction.

   <div class="expected"><strong>Expected result:</strong> Any deeper change follows an approved runbook, is reversible where possible and is fully recorded.</div>

8. **Validate security, management and compliance.** Confirm encryption, endpoint protection, identity policy, management check-in, logging, patch level and access controls remain healthy where relevant.

   <div class="expected"><strong>Expected result:</strong> Recovery has not created a security, compliance, licensing or manageability gap.</div>

9. **Complete end-to-end security verification before release.** The incident owner confirms containment, eradication/recovery criteria, required evidence preservation and monitoring results. Release isolation or return a device/service only after the approved security decision.

   <div class="expected"><strong>Expected result:</strong> Security Operations confirms the entity can safely return to service, the business owner confirms restoration where applicable, and monitoring shows no continuing ransomware activity.</div>

10. **Document and close correctly.** Record the cause or best evidence, every command and change, before-and-after results, user confirmation, linked problem/change/vendor records, assets involved and follow-up actions. Do not close while a workaround is unowned or monitoring is still unstable.

   <div class="expected"><strong>Expected result:</strong> Another technician can reconstruct the incident, continue the work or audit the decision trail from the ticket alone.</div>

## Rollback and stop conditions
- **Containment rollback:** release from isolation only after Incident Response confirms investigation and mitigation are complete; verify security telemetry before restoring normal access.
- Do not wipe, reimage or destroy artefacts merely to recover service without incident-owner approval.
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
