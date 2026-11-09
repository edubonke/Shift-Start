---
title: "Teams microphone not working"
slug: teams-microphone-not-working
description: "Restore microphone input by checking privacy, device selection, exclusive access and hardware isolation."
content_type: procedure
category: Collaboration
severity: medium
tags: [teams, microphone, audio, permissions]
error_codes: ["microphone not detected"]
tldr: "Select the correct input in Teams, confirm Windows microphone privacy permission, then test the device in Sound Recorder."
related_symptoms: [microphone-fails]
related_causes: [wrong-audio-device]
next_steps: []
escalation: "Escalate to Collaboration Support with headset model, connection type, Teams version, Windows input test result, privacy setting and whether the device works on another PC."
last_reviewed: 2026-08-02
---
## Steps
1. Check physical mute controls and reconnect the headset directly rather than through an untested hub.

2. In Teams device settings, select the intended microphone and run a test call.

3. In Windows Settings > Privacy & security > Microphone, allow microphone access and desktop app access according to policy.

4. Test in Sound Recorder. If it fails there, the issue is below Teams.

5. Review detected audio devices.

{% command "powershell" "PowerShell" "Get-PnpDevice -Class AudioEndpoint | Select-Object Status,FriendlyName,InstanceId" %}

<div class="expected"><strong>Expected result:</strong> Windows and Teams both detect the intended microphone and record clear input.</div>

## Verification
Complete a Teams test call and confirm clear input without switching devices automatically.
