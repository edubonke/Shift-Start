---
title: "Printer shows Offline"
slug: printer-offline
description: "Restore printing by checking reachability, queue state, port and spooler health."
content_type: procedure
category: Printing
severity: low
tags: [printer, spooler, queue, tcp-ip]
error_codes: ["Printer Offline", "Error - Printing"]
tldr: "Confirm the printer is reachable, clear stuck jobs, disable 'Use Printer Offline', then restart the Print Spooler."
related_symptoms: [printer-offline-symptom]
related_causes: [stuck-print-queue]
next_steps: []
escalation: "Escalate to Desktop or Print Services with printer name, IP, site, queue screenshot, ping result, port configuration and spooler restart result."
last_reviewed: 2026-08-02
---
## Steps
1. Check power, display errors, paper and network cable. Print a device configuration page if available.

2. Test network reachability using the approved printer IP.

{% command "powershell" "PowerShell" "Test-Connection 192.0.2.25 -Count 2; Test-NetConnection 192.0.2.25 -Port 9100" %}

3. Open the queue, cancel failed jobs and make sure **Use Printer Offline** is not selected.

4. Restart the spooler with administrator approval.

{% command "powershell" "PowerShell (Admin)" "Restart-Service Spooler\nGet-Service Spooler" %}

   <div class="expected"><strong>Expected result:</strong> Spooler status is Running and the queue begins processing.</div>

5. Confirm the Windows printer port matches the current printer IP or approved print server queue.

## Verification
Print a Windows test page and a one-page document from the affected application.
