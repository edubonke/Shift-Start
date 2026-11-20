---
title: Resolve a missing or disconnected mapped drive
slug: mapped-drive-missing
description: 'Restore an approved network drive by validating network, VPN, DNS, permissions and mapping state.'
content_type: procedure
category: File Services
severity: medium
support_tier: L1
estimated_time: 15-30 mins
owner_team: File Services
tags:
  - mapped-drive
  - smb
  - file-share
  - vpn
error_codes:
  - The local device name is already in use
  - Network path was not found
tldr: 'Confirm corporate network or VPN and the approved UNC path, remove only the stale mapping, then recreate the approved drive mapping and verify authorised file access.'
related_symptoms:
  - mapped-drive-missing-symptom
related_causes:
  - stale-drive-mapping
next_steps:
  - vpn-not-connecting
escalation: 'Escalate to File Services if the approved UNC path is unreachable, access is denied despite confirmed entitlement, repeated credential prompts occur, or a recreated mapping does not persist.'
risk_model: impact-v1
risk_basis: 'Batch B-1 audit classification: P2 / medium.'
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/mapped-drive-missing/
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
classification_audit: batch-b1-2026-08-13
canonical_role: definitive-mapped-drive-runbook
---
## Mandatory Batch B-1 controls
These audit-derived controls are mandatory before more invasive remediation.

### Pre-checks
1. Confirm corporate network/VPN connectivity.
2. Test the approved UNC path directly.
3. Check entitlement/group membership and capture current mappings with net use before deleting a mapping.

### Rollback / undo
- If remapping fails, remove only the mapping created during this procedure and restore the previously documented approved mapping.

## Diagnostic Steps
1. Confirm the user is on the corporate network or connected to the approved VPN.
2. Record the expected drive letter and approved UNC path.
3. Capture current mappings with `net use`, then test the file server and the approved UNC path before deleting any mapping.

{% capture kb_command_1 %}
net use
nslookup fileserver.example.com
ping fileserver.example.com
{% endcapture %}
{% include command.html shell="cmd" label="Command Prompt" command=kb_command_1 %}

4. Open the approved UNC path directly in File Explorer.
5. If access is denied, confirm entitlement and stop rather than repeatedly reconnecting with alternate credentials.

## Remediation Steps
1. Remove only the confirmed stale drive letter.

{% capture kb_command_2 %}
net use H: /delete
{% endcapture %}
{% include command.html shell="cmd" label="Command Prompt" command=kb_command_2 %}

2. Recreate the mapping using the approved UNC path.

{% capture kb_command_3 %}
net use H: \fileserver.example.com\department /persistent:yes
{% endcapture %}
{% include command.html shell="cmd" label="Command Prompt" command=kb_command_3 %}

3. Confirm the mapping reconnects without an unexpected credential prompt.

## Rollback Steps
1. If the new mapping points to the wrong share or causes an unexpected prompt, remove only the mapping created during this procedure.
2. Restore the previously documented approved mapping if one existed.
3. Do not store alternate credentials as a workaround.

## Verification Steps
1. Open the approved share through the UNC path.
2. Open the mapped drive.
3. Create and delete an authorised test file.
4. Sign out and back in, then confirm the mapping persists.

## Escalation Path
1. Escalate to File Services if the server is unreachable, entitlement is incorrect, access is denied, or the mapping repeatedly disconnects.
2. Include username, device, share UNC, drive letter, VPN status, DNS result, exact error and a comparison with a known-good authorised user where permitted.
