---
title: "MFA setup or approval fails"
slug: mfa-setup-fails
description: "Resolve registration loops, missing prompts, time drift and stale authentication methods."
content_type: procedure
category: Identity
severity: high
tags: [mfa, authenticator, identity, security]
error_codes: ["registration failed", "request denied", "code invalid"]
tldr: "Verify identity and device time, confirm network access, then reset only the stale MFA registration through the approved identity portal."
related_symptoms: [cannot-sign-in]
related_causes: [stale-mfa-registration]
next_steps: [password-reset]
escalation: "Escalate to Identity Security with user ID, tenant/application, registration stage, device OS, exact message, timestamp and verified methods already attempted. Never include one-time codes."
last_reviewed: 2026-08-02
---
## Steps
1. Verify the user through the approved process. Confirm they are using the official authenticator application and correct corporate account.

2. Ensure automatic date, time and time zone are enabled on both computer and phone.

3. Test from a standard network and disable captive portals or restrictive guest Wi-Fi.

4. In the identity administration portal, inspect registered methods. Remove only the stale or replaced device registration after approval.

5. Start registration in a private browser window and complete the full test notification.

   <div class="expected"><strong>Expected result:</strong> The new method appears as registered and a test prompt is approved successfully.</div>

## Verification
Sign out and perform one fresh sign-in that requires MFA. Confirm backup methods comply with policy.
