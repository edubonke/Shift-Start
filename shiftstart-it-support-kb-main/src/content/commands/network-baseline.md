---
title: "Windows network baseline"
slug: network-baseline
description: "Capture adapters, addressing, DNS and route information."
content_type: command
platform: Windows PowerShell
tags: [network, diagnostics]
---
{% command "powershell" "PowerShell" "Get-NetAdapter\nGet-NetIPConfiguration\nGet-DnsClientServerAddress\nGet-NetRoute -DestinationPrefix '0.0.0.0/0'" %}
