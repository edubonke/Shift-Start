---
title: Procedure title
slug: procedure-slug
description: What this procedure resolves.
content_type: procedure
category: Category
severity: medium
tags:
- windows
- example
error_codes: []
tldr: One-line expert fix.
related_symptoms: []
related_causes: []
next_steps: []
required_role: technician
escalation: Escalate to Team Name with user, device, timestamps, logs and completed
  steps.
last_reviewed: 2026-08-02
layout: article
permalink: /procedures/replace-with-slug/
---
## Before you begin

State impact, permissions, risk and prerequisites.

## Steps

1. Perform the safest first action.

   <div class="expected"><strong>Expected result:</strong> Describe exactly what success looks like.</div>

{% capture kb_command_1 %}
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion
{% endcapture %}
{% include command.html shell="powershell" label="PowerShell" command=kb_command_1 %}

2. Continue based on the result.

## Verification

Confirm that the original symptom is gone and record the result in the ticket.
