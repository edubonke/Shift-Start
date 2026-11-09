---
title: "VPN not connecting"
slug: vpn-not-connecting
description: "Diagnose internet, DNS, client, credential and gateway causes without unnecessary reinstallation."
content_type: procedure
category: Network
severity: high
tags: [vpn, remote-work, dns, connectivity]
error_codes: ["authentication failed", "gateway unavailable", "connection timed out"]
tldr: "Confirm normal internet access, correct system time and gateway reachability; restart the VPN service before resetting or reinstalling the client."
related_symptoms: [vpn-fails]
related_causes: [vpn-client-state]
next_steps: [password-reset]
escalation: "Escalate to Network Operations with user, public IP, VPN client version, gateway, timestamp, exact error, log bundle and results of DNS and reachability tests."
last_reviewed: 2026-08-02
---
## Steps
1. Confirm the user can browse a public website without the VPN and that airplane mode is off.

   <div class="expected"><strong>Expected result:</strong> Basic internet works. If it does not, troubleshoot the local connection first.</div>

2. Confirm date and time are correct. Authentication may fail when the clock is significantly wrong.

{% command "powershell" "PowerShell" "Get-Date; w32tm /query /status" %}

3. Resolve and test the configured VPN gateway.

{% command "powershell" "PowerShell" "Resolve-DnsName vpn.example.com; Test-NetConnection vpn.example.com -Port 443" %}

   <div class="expected"><strong>Expected result:</strong> DNS returns the approved gateway and the required port is reachable.</div>

4. Fully exit the client, restart its approved Windows service, then reconnect. Do not clear certificates or profiles unless your product runbook requires it.

5. Test with a mobile hotspot. Success on the hotspot suggests a local router, ISP or restrictive guest network issue.

## Verification
Connect the VPN, open one internal service and confirm the assigned corporate network route.
