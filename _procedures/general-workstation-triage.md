---
title: Resolve a vague or multi-component workstation issue
slug: general-workstation-triage
description: 'Use a safe first-response workflow when the user''s report is vague or spans account, application, device and network layers.'
content_type: procedure
category: Windows Endpoints
severity: medium
support_tier: L1
estimated_time: 10-20 mins
owner_team: Service Desk
tags:
  - triage
  - windows
  - diagnostics
  - evidence
error_codes: []
tldr: 'Define impact, reproduce once, check recent changes, capture baseline health data, isolate the failing layer and apply only the smallest reversible fix supported by evidence.'
related_symptoms:
  - general-workstation-triage
related_causes: []
next_steps: []
escalation: 'Escalate to the owning resolver team if the failing layer cannot be isolated safely, the issue affects multiple users or services, or the smallest reversible fix does not restore the expected function.'
risk_model: impact-v1
risk_basis: Medium impact - the scope is initially unclear and a workaround may exist while the failing layer is isolated.
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/general-workstation-triage/
layout: article
symptom_weights:
  general-workstation-triage: 10
content_status: verified
generated_baseline: false
reviewed_by: ShiftStart technical review
last_tested: ''
tested_platforms: []
source_references: []
change_record: Standardised as the Enterprise runbook structural reference; existing verified status retained pending recorded live revalidation evidence.
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
---
## Diagnostic Steps
1. Capture who is affected, the exact symptom, the location, when it started and the business impact.
2. Ask what changed immediately before the issue.
3. Reproduce the issue once without repeating risky actions. Record exact wording, screenshots and timestamps.
4. Gather baseline system information.

{% capture kb_command_1 %}
$env:COMPUTERNAME
whoami
Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,LastBootUpTime
Get-Volume | Select-Object DriveLetter,FileSystemLabel,SizeRemaining,Size
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}

5. Isolate the failing layer:
   - Another user on the same device tests account scope.
   - The same user on another device tests device scope.
   - Another application tests application scope.
   - Another network tests network scope.

## Remediation Steps
1. Apply only the smallest reversible change supported by the evidence.
2. Change one variable at a time so the result can be attributed to a specific action.
3. Record the action, time and outcome in the ticket.

## Rollback Steps
1. If the remediation does not improve the issue, reverse the exact change made during this procedure.
2. If no persistent change was made, record that rollback is not applicable.
3. Stop and escalate rather than stacking unrelated fixes.

## Verification Steps
1. Repeat the user's original action.
2. Confirm the result survives a normal application restart.
3. Confirm the issue is assigned to a clear account, application, device or network layer.
4. Record the final evidence and user confirmation.

## Escalation Path
1. Escalate to the owning resolver team if the layer cannot be isolated, the issue expands in scope, or the smallest reversible fix does not restore service.
2. Include the problem statement, business impact, reproduction steps, timestamps, screenshots, diagnostic output and every change already made.
