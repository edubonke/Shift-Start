---
title: "Windows PC is unusually slow"
slug: slow-windows-pc
description: "Identify CPU, memory, disk, startup, update and storage-pressure causes before making changes."
content_type: procedure
category: Desktop
severity: medium
tags: [performance, windows, disk, memory]
error_codes: ["100% disk", "Not responding"]
tldr: "Check uptime, free disk, top processes and pending restart first; avoid cleanup tools until the bottleneck is identified."
related_symptoms: [slow-computer]
related_causes: [resource-pressure]
next_steps: []
escalation: "Escalate to Endpoint Engineering with performance timestamps, top process data, free space, SMART/health status, Event Viewer errors and whether slowness follows the user or device."
last_reviewed: 2026-08-02
---
## Steps
1. Confirm whether the issue affects one app or the whole PC and whether it started after an update.

2. Capture uptime, free space and top resource consumers.

{% command "powershell" "PowerShell" "Get-CimInstance Win32_OperatingSystem | Select-Object LastBootUpTime,FreePhysicalMemory,TotalVisibleMemorySize\nGet-Volume | Select-Object DriveLetter,SizeRemaining,Size\nGet-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name,CPU,WorkingSet" %}

3. Restart normally if uptime is excessive or a restart is pending, after saving user work.

4. Review Task Manager Startup apps and disable only non-essential approved items.

5. Check storage health and endpoint security scan status. Do not use registry cleaners.

<div class="expected"><strong>Expected result:</strong> The measured bottleneck is identified and performance improves after the smallest approved change.</div>

## Verification
Repeat the slow task and compare opening time or response time with the original observation.
