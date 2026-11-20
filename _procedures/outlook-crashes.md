---
title: Resolve Outlook crashes or failure to open
slug: outlook-crashes
description: 'Isolate add-in, profile, navigation-pane and Office-installation failures without destroying the existing mail profile.'
content_type: procedure
category: Microsoft 365 & Collaboration
severity: medium
support_tier: L1
estimated_time: 20-40 mins
owner_team: Microsoft 365 Support
tags:
  - outlook
  - office
  - add-ins
  - profile
error_codes:
  - Cannot start Microsoft Outlook
  - Outlook has stopped working
tldr: 'Test Classic Outlook in safe mode, isolate add-ins, reset the navigation pane, repair Office and test a temporary mail profile without deleting the original profile.'
related_symptoms:
  - outlook-wont-open
related_causes:
  - outlook-addin
next_steps: []
escalation: 'Escalate to Microsoft 365 Support if Outlook fails in safe mode, a clean profile also fails, crash events indicate an Office or Windows component fault, or mailbox synchronisation cannot be restored.'
risk_model: impact-v1
risk_basis: Medium impact - the desktop client is degraded while an approved alternative mail-access path may exist.
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/outlook-crashes/
layout: article
content_status: verified
generated_baseline: false
reviewed_by: ShiftStart technical review
last_tested: ''
tested_platforms: []
source_references:
  - 'https://support.microsoft.com/office/lifecycle/command-line-switches-for-microsoft-office-products'
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
1. Record the Office build, crash time and whether the issue started after an Office, Windows or add-in change.
2. End remaining Outlook processes and start Classic Outlook in safe mode.

{% capture kb_command_1 %}
taskkill /F /IM outlook.exe
outlook.exe /safe
{% endcapture %}
{% include command.html shell="cmd" label="Command Prompt" command=kb_command_1 %}

3. If Outlook opens in safe mode, record the enabled add-ins before changing them.
4. If safe mode does not resolve the issue, reset the navigation pane.

{% capture kb_command_2 %}
outlook.exe /resetnavpane
{% endcapture %}
{% include command.html shell="cmd" label="Command Prompt" command=kb_command_2 %}

5. Capture the relevant Windows Application event for the Outlook crash where available.

## Remediation Steps
1. If safe mode works, disable non-essential add-ins one at a time until the failing add-in is isolated.
2. Check approved Office and Windows updates.
3. Run Office Quick Repair.
4. If the issue persists, create a temporary new mail profile from Control Panel > Mail.
5. Keep the original profile until the temporary profile is fully verified.

## Rollback Steps
1. Re-enable any add-in that was disabled but proved unrelated to the crash.
2. If the temporary mail profile does not solve the problem, switch back to the original profile.
3. Do not delete the original profile or local data files until recovery and mailbox synchronisation are confirmed.

## Verification Steps
1. Open Outlook normally twice.
2. Send and receive a test message.
3. Confirm calendar data loads.
4. Confirm search opens and returns expected results.
5. Confirm the mailbox synchronises without a new crash event.

## Escalation Path
1. Escalate to Microsoft 365 Support if Outlook fails in safe mode, a clean profile fails, or Office repair does not restore stability.
2. Include Office build, crash timestamp, relevant Event Viewer error, add-in list, safe-mode result and profile-test result.
