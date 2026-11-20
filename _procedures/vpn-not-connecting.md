---
title: Resolve VPN connection failure
slug: vpn-not-connecting
description: 'Diagnose internet, DNS, client, credential and gateway causes without unnecessary reinstallation or certificate removal.'
content_type: procedure
category: Network & Connectivity
severity: medium
support_tier: L1-L2
estimated_time: 15-30 mins
owner_team: Network Operations
tags:
  - vpn
  - remote-work
  - dns
  - connectivity
error_codes:
  - authentication failed
  - gateway unavailable
  - connection timed out
tldr: 'Confirm public internet access, system time, DNS and gateway reachability, restart only the approved VPN client service, then isolate local-network versus corporate-gateway scope.'
related_symptoms:
  - vpn-fails
related_causes:
  - vpn-client-state
next_steps:
  - password-reset
escalation: 'Escalate to Network Operations if the gateway is unreachable from multiple networks, authentication fails after identity validation, the managed client profile is corrupt, or multiple users report the same VPN outage.'
risk_model: impact-v1
risk_basis: 'Batch B-1 audit classification: P2 / medium.'
verification_priority: P2
last_reviewed: 2026-08-10T00:00:00.000Z
permalink: /procedures/vpn-not-connecting/
layout: article
content_status: verified
generated_baseline: false
reviewed_by: ShiftStart technical review
last_tested: ''
tested_platforms: []
source_references:
  - 'https://learn.microsoft.com/powershell/module/dnsclient/resolve-dnsname'
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
  - minimum_sme_reviewers
  - minimum_test_records
  - minimum_distinct_environments
verification_promotion_ready: false
classification_audit: batch-b1-2026-08-13
---
## Mandatory Batch B-1 controls

These Batch B-1 controls remain mandatory for VPN triage:

1. Determine scope before making endpoint changes: one endpoint, one platform, multiple users, or gateway-wide.
2. Check VPN provider or corporate gateway service health before client remediation.
3. Check identity, Conditional Access, NAC and certificate-related blocks before deleting profiles or authentication material.
4. Do not perform destructive certificate, managed-profile or VPN-configuration changes from this parent triage procedure.
5. Route remediation and rollback to the child runbook responsible for the failing VPN layer.

## Diagnostic Steps

1. **Determine the scope of the VPN failure.**
   - Confirm whether one endpoint, one platform, several users, or the corporate VPN gateway is affected.
   - Record the exact VPN client error, timestamp and affected network.

2. **Check external service and gateway health first.**
   - Confirm whether the approved VPN gateway or provider reports an outage.
   - If multiple users or networks are affected, avoid unnecessary endpoint remediation.

3. **Check endpoint prerequisites.**
   - Confirm normal public internet connectivity.
   - Confirm the system date and time are correct.
   - Verify DNS resolution and gateway reachability.
   - Confirm the approved VPN client version is installed.

4. **Check identity and policy controls.**
   - Confirm the user account is enabled.
   - Check Conditional Access, NAC or equivalent access-control decisions where applicable.
   - Determine whether certificate expiry or authentication policy is involved.

5. **Select the appropriate child procedure from the observed evidence.**
   - Linux endpoint → `troubleshoot-linux-vpn`
   - macOS endpoint → `troubleshoot-macos-vpn`
   - Mobile endpoint → `troubleshoot-mobile-vpn`
   - Certificate failure → `troubleshoot-vpn-certificate-failure`
   - Repeated disconnects → `troubleshoot-vpn-disconnections`
   - Slow VPN → `troubleshoot-slow-vpn-performance`
   - Multiple users or gateway issue → `troubleshoot-a-cloud-vpn-gateway`

## Parent triage decision path

Use the evidence collected during diagnostics to select the correct resolution path:

- Linux endpoint → `troubleshoot-linux-vpn`
- macOS endpoint → `troubleshoot-macos-vpn`
- Mobile endpoint → `troubleshoot-mobile-vpn`
- Certificate-specific failure → `troubleshoot-vpn-certificate-failure`
- Repeated disconnects → `troubleshoot-vpn-disconnections`
- Slow VPN performance → `troubleshoot-slow-vpn-performance`
- Multiple users or gateway-wide impact → `troubleshoot-a-cloud-vpn-gateway`

The parent procedure identifies the failing layer. The selected child procedure owns any state-changing remediation, rollback and live verification.

## Remediation Steps

This procedure is a **parent triage runbook**. It deliberately does not perform destructive VPN remediation.

1. Route the incident to the child procedure identified during diagnostics.
2. Apply remediation only from the child runbook that owns the affected VPN layer.
3. Do not delete managed profiles, certificates, authentication material or enterprise VPN configuration from this parent procedure.
4. Where the evidence identifies a gateway/provider outage, stop endpoint remediation and follow the gateway or provider escalation path.
5. Record the selected child procedure and the evidence used to select it.

## Rollback Steps

This parent procedure does not intentionally make state-changing configuration changes, so rollback should normally not be required.

1. If no configuration was changed during triage, record **No rollback required — diagnostic activity only**.
2. If a child runbook made a configuration change, use the rollback instructions in that child runbook.
3. If an unplanned change was made before this procedure was followed, stop further remediation and restore the previous approved configuration where safe.
4. Escalate if the previous state cannot be safely restored.

## Verification Steps

1. Confirm the correct child or gateway runbook was selected from observed evidence.
2. Confirm scope is documented as single endpoint, platform-specific, multi-user or gateway-wide.
3. Confirm any remediation and rollback are owned by the selected child procedure.
4. Confirm the original VPN issue is either resolved or has a documented escalation path.
5. Record the outcome and supporting diagnostic evidence.

## Escalation Path

Escalate to Network Operations when:

- multiple users or networks are affected;
- the VPN gateway is unhealthy or unreachable;
- evidence indicates a provider-side outage;
- authentication continues to fail after identity validation;
- managed VPN configuration appears damaged;
- certificate or Conditional Access investigation requires elevated administrative access; or
- the appropriate child runbook does not restore service.

Include the affected users/devices, timestamps and timezone, exact error text, network used, DNS/gateway test results, authentication findings, remediation attempted and rollback state.

