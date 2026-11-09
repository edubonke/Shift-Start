---
title: "Reset or unlock a user password"
slug: password-reset
description: "Safely restore account access after a forgotten password, expiry or lockout."
content_type: procedure
category: Identity
severity: medium
tags: [password, account, lockout, active-directory]
error_codes: ["account locked", "password expired"]
tldr: "Verify the user, confirm lockout status, then reset or unlock through the approved identity platform and require a secure password change."
related_symptoms: [cannot-sign-in]
related_causes: [account-lockout]
next_steps: [mfa-setup-fails]
escalation: "Escalate to Identity and Access Management with the verified username, lockout time, source device if known, actions taken and any repeated lockout evidence."
last_reviewed: 2026-08-02
---
## Before you begin
Confirm the caller's identity using the organisation's approved verification process. Never ask the user to disclose an existing password or MFA code.

## Steps
1. Confirm the exact username, affected service and error message.

   <div class="expected"><strong>Expected result:</strong> You know whether the issue is a forgotten password, expired password, disabled account or repeated lockout.</div>

2. Check the account state using the approved administration console. Where RSAT is authorised, gather read-only evidence:

{% command "powershell" "PowerShell" "Get-ADUser -Identity username -Properties LockedOut,Enabled,PasswordExpired,LastBadPasswordAttempt | Select-Object SamAccountName,Enabled,LockedOut,PasswordExpired,LastBadPasswordAttempt" %}

   <div class="expected"><strong>Expected result:</strong> The account state explains the sign-in failure or indicates that another system must be checked.</div>

3. Unlock or reset the account only after identity verification. Require a password change at next sign-in where policy requires it.

4. Ask the user to sign in once on a trusted corporate device. Then update saved credentials on phones, Outlook, VPN clients and mapped drives.

   <div class="expected"><strong>Expected result:</strong> The user signs in successfully and the account does not immediately lock again.</div>

## Verification
Confirm access to the original service and check that no new bad-password attempts appear for five minutes.
