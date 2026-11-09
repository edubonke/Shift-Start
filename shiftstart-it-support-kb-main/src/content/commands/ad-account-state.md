---
title: "Read Active Directory account state"
slug: ad-account-state
description: "Read lockout, enablement and password state where RSAT access is authorised."
content_type: command
platform: Windows PowerShell with RSAT
tags: [identity, active-directory]
---
{% command "powershell" "PowerShell" "Get-ADUser -Identity username -Properties LockedOut,Enabled,PasswordExpired,LastBadPasswordAttempt" %}
