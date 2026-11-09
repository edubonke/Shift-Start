---
title: "Windows system baseline"
slug: system-baseline
description: "Collect operating system, uptime, storage and current identity information."
content_type: command
platform: Windows PowerShell
tags: [windows, diagnostics]
---
{% command "powershell" "PowerShell" "whoami\nGet-CimInstance Win32_OperatingSystem | Select Caption,Version,LastBootUpTime\nGet-Volume" %}
