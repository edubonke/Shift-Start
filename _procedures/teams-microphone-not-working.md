---
title: Resolve a Teams microphone not working
slug: teams-microphone-not-working
description: 'Restore microphone input by checking physical mute, device selection, privacy permissions and Windows audio detection.'
content_type: procedure
category: Microsoft 365 & Collaboration
severity: medium
support_tier: L1
estimated_time: 10-20 mins
owner_team: Collaboration Support
tags:
  - teams
  - microphone
  - audio
  - permissions
error_codes:
  - microphone not detected
tldr: 'Check physical mute, select the correct input in Teams, confirm Windows microphone privacy permission and test the same device outside Teams before changing drivers.'
related_symptoms:
  - microphone-fails
related_causes:
  - wrong-audio-device
next_steps: []
escalation: 'Escalate to Collaboration Support or Desktop Support if the microphone fails outside Teams, the audio endpoint is absent or unhealthy, privacy policy blocks access, or the device fails on multiple systems.'
risk_model: impact-v1
risk_basis: 'Medium impact - meeting audio is degraded while chat, phone audio or another approved device may provide a workaround.'
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/teams-microphone-not-working/
layout: article
content_status: verified
generated_baseline: false
reviewed_by: ShiftStart technical review
last_tested: ''
tested_platforms: []
source_references:
  - 'https://learn.microsoft.com/powershell/module/pnpdevice/get-pnpdevice'
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
1. Check physical mute controls and reconnect the headset directly rather than through an untested hub.
2. In Teams device settings, select the intended microphone and run a test call.
3. In Windows Settings > Privacy & security > Microphone, confirm microphone access and desktop-app access comply with policy.
4. Test the microphone in Sound Recorder. If it fails there, treat the fault as Windows, driver or hardware rather than Teams-specific.
5. Review detected audio endpoints.

{% capture kb_command_1 %}
Get-PnpDevice -Class AudioEndpoint | Select-Object Status,FriendlyName,InstanceId
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}

## Remediation Steps
1. Select the correct Teams input device.
2. Enable the required Windows privacy permission where organisational policy allows it.
3. Reconnect the headset or move it to a known-good direct USB/audio connection.
4. Use approved driver remediation only if Windows does not detect the intended audio endpoint correctly.

## Rollback Steps
1. Restore the previous default audio device if changing it causes another required application to fail.
2. Reverse only the privacy or device-selection change made during this procedure if it produces an unexpected effect.
3. Do not disable organisation-managed privacy controls to work around policy.

## Verification Steps
1. Record clear audio in Sound Recorder.
2. Complete a Teams test call.
3. Confirm Teams keeps the intended input selected.
4. Confirm the microphone does not switch unexpectedly during a second test.

## Escalation Path
1. Escalate to Collaboration Support if Teams alone fails despite a successful Windows recording test.
2. Escalate to Desktop Support if the microphone fails outside Teams or the audio endpoint is absent.
3. Include headset model, connection type, Teams version, Windows input result, privacy setting and cross-device test result.
