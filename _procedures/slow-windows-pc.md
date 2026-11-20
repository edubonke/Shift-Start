---
title: Resolve an unusually slow Windows PC
slug: slow-windows-pc
description: 'Identify CPU, memory, disk, startup, update and storage-pressure causes before applying a targeted change.'
content_type: procedure
category: Windows Endpoints
severity: medium
support_tier: L1
estimated_time: 20-30 mins
owner_team: Service Desk
tags:
  - performance
  - windows
  - disk
  - memory
error_codes:
  - 100% disk
  - Not responding
tldr: 'Define whether slowness is device-wide or application-specific, capture uptime, free space and resource pressure, then apply only the smallest change supported by measured evidence.'
related_symptoms:
  - slow-computer
related_causes:
  - resource-pressure
next_steps: []
escalation: 'Escalate to Endpoint Engineering if storage health is degraded, a security process indicates infection, resource pressure cannot be attributed safely, or the device remains unusable after approved first-line remediation.'
risk_model: impact-v1
risk_basis: Medium impact - performance is degraded rather than fully unavailable and a temporary workaround may exist.
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/slow-windows-pc/
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
---
## Diagnostic Steps
1. Confirm whether the issue affects one application or the whole PC.
2. Record whether the problem started after an update or software change.
3. Capture uptime, free disk space and top resource consumers.

{% capture kb_command_1 %}
Get-CimInstance Win32_OperatingSystem | Select-Object LastBootUpTime,FreePhysicalMemory,TotalVisibleMemorySize
Get-Volume | Select-Object DriveLetter,SizeRemaining,Size
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name,CPU,WorkingSet
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}

4. Review Task Manager for CPU, memory, disk and startup pressure.
5. Check storage-health and endpoint-security status before applying cleanup or optimisation actions.

## Remediation Steps
1. Save user work and restart normally if uptime is excessive or a restart is pending.
2. Disable only non-essential approved startup items when evidence points to startup pressure.
3. Free disk space only using approved cleanup methods.
4. Address the measured bottleneck rather than applying registry cleaners or broad optimisation tools.

## Rollback Steps
1. Re-enable a startup item if disabling it causes a required application or business function to fail.
2. Reverse any approved configuration change that worsens performance.
3. If no persistent setting was changed, record rollback as not applicable.

## Verification Steps
1. Repeat the originally slow task.
2. Compare opening or response time with the original observation.
3. Confirm the device remains responsive after a normal restart.
4. Confirm no new storage or endpoint-security alert is present.

## Escalation Path
1. Escalate to Endpoint Engineering if storage health is degraded, malware is suspected, resource pressure remains unexplained, or the device is still unusable.
2. Include timestamps, top-process data, free space, storage-health state, relevant event errors and whether the issue follows the user or device.
