---
title: Windows system baseline
slug: system-baseline
description: 'Collect operating system, uptime, storage and current identity information.'
content_type: command
platform: Windows PowerShell
tags:
  - windows
  - diagnostics
permalink: /commands/system-baseline/
layout: article
---
{% capture kb_command_1 %}
whoami
Get-CimInstance Win32_OperatingSystem | Select Caption,Version,LastBootUpTime
Get-Volume
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}
