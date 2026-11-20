---
title: Resolve no network on a docking station
slug: no-network-docking-station
description: 'Isolate dock Ethernet failures across cable, port, adapter, driver and firmware layers.'
content_type: procedure
category: Network & Connectivity
severity: medium
support_tier: L1
estimated_time: 15-30 mins
owner_team: Desktop Support
tags:
  - dock
  - ethernet
  - usb-c
  - driver
error_codes:
  - Unidentified network
  - Network cable unplugged
tldr: 'Confirm the network path with a known-good cable and port, power-cycle the dock, inspect the dock NIC, then reset only that adapter and apply approved firmware or driver updates.'
related_symptoms:
  - dock-no-network
related_causes:
  - dock-adapter-state
next_steps: []
escalation: 'Escalate to Desktop Support or Network Operations if another device also fails on the same port, the dock Ethernet adapter is absent, approved driver/firmware remediation fails, or there is evidence of a wider network issue.'
risk_model: impact-v1
risk_basis: Medium impact - wired docking connectivity is degraded but another network path may provide a temporary workaround.
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/no-network-docking-station/
layout: article
content_status: verified
generated_baseline: false
reviewed_by: ShiftStart technical review
last_tested: ''
tested_platforms: []
source_references:
  - 'https://learn.microsoft.com/powershell/module/netadapter/disable-netadapter'
  - 'https://learn.microsoft.com/powershell/module/netadapter/enable-netadapter'
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
1. Confirm whether Wi-Fi works on the same laptop.
2. Test the Ethernet cable and wall port with a known-good device.
3. Power-cycle the dock by disconnecting the laptop, dock power and peripherals for 30 seconds, then reconnect dock power followed by USB-C.
4. Inspect adapter state and IP configuration.

{% capture kb_command_1 %}
Get-NetAdapter | Sort-Object Status,Name | Format-Table Name,InterfaceDescription,Status,LinkSpeed
Get-NetIPConfiguration
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}

5. Identify the exact dock Ethernet adapter before making any adapter-state change.

## Remediation Steps
1. Disable and re-enable only the identified dock Ethernet adapter.

{% capture kb_command_2 %}
Disable-NetAdapter -Name 'Ethernet' -Confirm:$false
Start-Sleep 3
Enable-NetAdapter -Name 'Ethernet' -Confirm:$false
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell (Admin)" command=kb_command_2 %}

2. Install only approved laptop, dock and NIC driver or firmware updates.
3. Reconnect the dock and confirm the adapter receives the approved IP, gateway and DNS configuration.

## Rollback Steps
1. If the adapter reset does not help, ensure the adapter is left enabled.
2. If an approved driver change causes regression, use the organisation's approved driver rollback method.
3. Do not downgrade dock firmware unless the vendor and organisational change process explicitly support it.

## Verification Steps
1. Disable Wi-Fi temporarily.
2. Confirm the dock Ethernet adapter is Up.
3. Confirm gateway and DNS reachability.
4. Open an internal resource over dock Ethernet.
5. Monitor the link long enough to confirm it remains stable.

## Escalation Path
1. Escalate to Desktop Support if the dock adapter is absent or firmware/driver remediation fails.
2. Escalate to Network Operations if a known-good device also fails on the same network port.
3. Include laptop and dock models, serials, cable/port tests, adapter state, driver version and whether another laptop works on the same dock.
