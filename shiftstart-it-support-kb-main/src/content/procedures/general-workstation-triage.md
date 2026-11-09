---
title: "General workstation triage"
slug: general-workstation-triage
description: "A safe first-response workflow when the user's report is vague or spans multiple components."
content_type: procedure
category: Desktop
severity: medium
tags: [triage, windows, diagnostics, evidence]
error_codes: []
tldr: "Define impact, reproduce once, check recent changes, capture basic health data, then isolate account, application, device or network."
related_symptoms: []
related_causes: []
next_steps: []
escalation: "Escalate to the owning team with a concise problem statement, business impact, reproduction steps, timestamps, screenshots, diagnostic output and every change already made."
last_reviewed: 2026-08-02
---
## Steps
1. Capture who, what, where, when and impact. Ask what changed immediately before the issue.

2. Reproduce once without repeating risky actions. Record exact wording and timestamps.

3. Gather baseline system information.

{% command "powershell" "PowerShell" "$env:COMPUTERNAME\nwhoami\nGet-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,LastBootUpTime\nGet-Volume | Select-Object DriveLetter,FileSystemLabel,SizeRemaining,Size" %}

4. Isolate the layer:
   - Another user on the same device tests account scope.
   - The same user on another device tests device scope.
   - Another application tests application scope.
   - Another network tests network scope.

5. Apply only the smallest reversible fix supported by evidence.

<div class="expected"><strong>Expected result:</strong> The issue is assigned to a clear layer with evidence supporting the next action.</div>

## Verification
Repeat the user's original action and confirm the result survives a normal application restart.
