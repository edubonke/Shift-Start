---
title: Resolve a printer showing Offline
slug: printer-offline
description: 'Restore printing by checking device state, network reachability, queue state, port configuration and spooler health.'
content_type: procedure
category: Printing & Scanning
severity: low
support_tier: L1
estimated_time: 10-20 mins
owner_team: Print Services
tags:
  - printer
  - spooler
  - queue
  - tcp-ip
error_codes:
  - Printer Offline
  - Error - Printing
tldr: 'Confirm power and reachability, clear only failed jobs, disable Use Printer Offline, restart the Print Spooler when approved and verify the queue points to the correct printer or print server.'
related_symptoms:
  - printer-offline-symptom
related_causes:
  - stuck-print-queue
next_steps: []
escalation: 'Escalate to Print Services if the device is unreachable, the queue or port is incorrect but cannot be changed safely, the spooler repeatedly fails, or multiple users or printers are affected.'
risk_model: impact-v1
risk_basis: Low impact - a single printer outage is normally a minor inconvenience when alternate printing or digital workflow is available.
verification_priority: P3
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/printer-offline/
layout: article
content_status: verified
generated_baseline: false
reviewed_by: ShiftStart technical review
last_tested: ''
tested_platforms: []
source_references:
  - 'https://learn.microsoft.com/powershell/module/microsoft.powershell.management/restart-service'
  - 'https://learn.microsoft.com/powershell/module/nettcpip/test-netconnection'
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
  - minimum_technical_reviewers
  - minimum_test_records
  - minimum_distinct_environments
verification_promotion_ready: false
---
## Diagnostic Steps
1. Check printer power, display errors, paper and physical network connection.
2. Record the printer name, approved IP or print-server queue and site.
3. Test network reachability using the approved printer IP.

{% capture kb_command_1 %}
Test-Connection 192.0.2.25 -Count 2
Test-NetConnection 192.0.2.25 -Port 9100
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}

4. Open the Windows print queue and identify failed or stuck jobs.
5. Confirm **Use Printer Offline** is not selected.
6. Confirm the configured printer port matches the approved IP or print-server queue.

## Remediation Steps
1. Cancel only failed jobs that are safe to remove.
2. Clear the offline setting if it is incorrectly enabled.
3. Restart the Print Spooler with appropriate administrative approval.

{% capture kb_command_2 %}
Restart-Service Spooler
Get-Service Spooler
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell (Admin)" command=kb_command_2 %}

4. Correct the printer port or approved queue only when the intended target is known.

## Rollback Steps
1. If a port or queue was changed and printing worsens, restore the original documented port or queue.
2. Ensure the Print Spooler is left running.
3. Do not remove working printer drivers or queues as a generic troubleshooting step.

## Verification Steps
1. Confirm the spooler status is Running.
2. Print a Windows test page.
3. Print a one-page document from the affected application.
4. Confirm the queue clears and the printer returns to Ready.

## Escalation Path
1. Escalate to Print Services if the device is unreachable, spooler failure repeats, the approved port cannot be restored, or multiple users are affected.
2. Include printer name, IP, site, queue screenshot, connectivity result, port configuration and spooler restart result.
