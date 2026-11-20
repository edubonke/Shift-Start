# Verification Sprint 1 — P0-01 Test Plan
## Procedure: Respond to a ransomware alert

**Status:** Source review complete; live/sandbox validation pending.

This plan must be executed only in authorised test environments. Do not use live ransomware or untrusted malware. Use vendor-provided safe demonstration/detection scenarios.

## Acceptance gate

P0 Verification v2 requires:
- 3 passing test records;
- 3 distinct representative environments;
- 2 independent SME reviewers;
- diagnostic path tested;
- remediation/containment path tested;
- rollback/release tested;
- escalation tested;
- timing validated;
- expected outcome confirmed;
- negative/failure path tested;
- owner sign-off.

## Environment 1 — Windows 11 + Microsoft Defender for Endpoint

**Purpose:** Validate alert intake, evidence collection, isolation and release on a managed workstation.

Prerequisites:
- dedicated non-production Windows 11 device;
- onboarded to Microsoft Defender for Endpoint;
- authorised test account;
- device isolation permissions;
- no dependency on production business services.

Safe trigger:
- Microsoft Defender for Endpoint EDR/detection test or another Microsoft-provided harmless demonstration.

Capture:
1. device and OS build;
2. alert/incident ID;
3. alert creation timestamp;
4. initial isolation state;
5. investigation package action/status;
6. isolation action/status;
7. test of expected blocked connectivity;
8. Defender service connectivity while isolated;
9. release-from-isolation action/status;
10. restored connectivity;
11. elapsed minutes.

Pass criteria:
- alert is visible;
- affected test device is correctly identified;
- evidence can be collected;
- isolation is enforced;
- release is successful after the simulated risk is cleared;
- no unrelated test endpoint is affected.

## Environment 2 — Windows 10/11 ransomware-protection demonstration

**Purpose:** Validate the decision path against a ransomware-like but vendor-provided safe demonstration.

Safe trigger:
- Microsoft's Controlled Folder Access ransomware demonstration on a disposable test device only.

Capture:
- demonstration name/version;
- test device/build;
- generated Defender event/alert;
- files/folders affected by the demonstration;
- containment decision;
- evidence preserved;
- recovery/cleanup result;
- elapsed minutes.

Pass criteria:
- the runbook never instructs a user to rerun the sample;
- containment decisions occur before recovery;
- relevant evidence remains available for review;
- cleanup does not proceed before required evidence is captured.

## Environment 3 — Windows Server/Azure test VM onboarded to MDE

**Purpose:** Confirm the P0 procedure handles server/business-impact constraints.

Use:
- non-production Windows Server or Azure test VM;
- MDE onboarded;
- Microsoft-supported harmless EDR detection test;
- documented service dependency.

Capture:
- server role and build;
- alert;
- business-impact/critical-asset decision;
- whether full isolation is appropriate;
- approved alternative containment where applicable;
- investigation evidence;
- containment/release result;
- elapsed minutes.

Pass criteria:
- critical-service impact is assessed before disruptive containment;
- response still prevents uncontrolled spread;
- rollback/release is documented;
- escalation path is exercised.

## Negative-path test

At least one environment must test a failure condition, for example:
- isolation action remains pending or fails;
- target is a critical asset where full isolation is not approved;
- investigation package collection fails;
- device is offline when the isolation command is issued.

Expected result:
- technician does not improvise destructive remediation;
- incident is escalated with action status, timestamps and evidence;
- alternative containment follows the approved IR process.

## Evidence to return to ShiftStart

For each environment provide:
- screenshots or exported Action Center/incident evidence with secrets redacted;
- OS/product/build;
- timestamps and timezone;
- before/after connectivity state;
- alert/incident ID (redacted if necessary);
- test action results;
- elapsed time;
- tester name/role;
- reviewer name/role;
- owner sign-off/change or exercise record.

Only after all three records pass should the evidence work-item be marked `completed`.
