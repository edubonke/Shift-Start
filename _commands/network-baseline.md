---
title: Windows network baseline
slug: network-baseline
description: 'Capture adapters, addressing, DNS and route information.'
content_type: command
platform: Windows PowerShell
tags:
  - network
  - diagnostics
permalink: /commands/network-baseline/
layout: article
---
{% capture kb_command_1 %}
Get-NetAdapter
Get-NetIPConfiguration
Get-DnsClientServerAddress
Get-NetRoute -DestinationPrefix '0.0.0.0/0'
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}
