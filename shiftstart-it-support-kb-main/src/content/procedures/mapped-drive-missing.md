---
title: "Mapped drive is missing or disconnected"
slug: mapped-drive-missing
description: "Restore an approved network drive by validating network, VPN, DNS, permissions and mapping state."
content_type: procedure
category: File Services
severity: medium
tags: [mapped-drive, smb, file-share, vpn]
error_codes: ["The local device name is already in use", "Network path was not found"]
tldr: "Confirm corporate network/VPN and share reachability, remove only the stale mapping, then recreate it using the approved UNC path."
related_symptoms: [mapped-drive-missing-symptom]
related_causes: [stale-drive-mapping]
next_steps: [vpn-not-connecting]
escalation: "Escalate to File Services with username, device, share UNC, drive letter, VPN status, DNS result, exact error and permission comparison with a known-good user."
last_reviewed: 2026-08-02
---
## Steps
1. Confirm the user is on the corporate network or connected VPN.

2. List current mappings and test the file server.

{% command "cmd" "Command Prompt" "net use\nnslookup fileserver.example.com\nping fileserver.example.com" %}

3. Open the approved UNC path directly in File Explorer. If access is denied, do not repeatedly reconnect with alternate credentials.

4. Remove only the stale drive letter and recreate it.

{% command "cmd" "Command Prompt" "net use H: /delete\nnet use H: \\fileserver.example.com\department /persistent:yes" %}

<div class="expected"><strong>Expected result:</strong> The approved share opens through its UNC path and the drive letter reconnects without a credential prompt.</div>

## Verification
Open, create and delete an authorised test file, then sign out/in and confirm the mapping persists.
