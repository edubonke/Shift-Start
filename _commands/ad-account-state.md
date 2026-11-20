---
title: Read Active Directory account state
slug: ad-account-state
description: 'Read lockout, enablement and password state where RSAT access is authorised.'
content_type: command
platform: Windows PowerShell with RSAT
tags:
  - identity
  - active-directory
permalink: /commands/ad-account-state/
layout: article
---
{% capture kb_command_1 %}
Get-ADUser -Identity username -Properties LockedOut,Enabled,PasswordExpired,LastBadPasswordAttempt
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}
