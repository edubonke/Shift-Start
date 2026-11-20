---
title: Add or remove security group membership
slug: add-or-remove-security-group-membership
description: 'Safely validate, add, remove and verify an approved user, computer, service account or group membership change in Active Directory or Microsoft Entra ID.'
content_type: procedure
category: Identity & Access Management
service: Directory group management
severity: medium
support_tier: L2
owner_team: Identity and Access Management
platforms:
  - Active Directory
  - Microsoft Entra ID
risk_level: high
estimated_time: 15-45 minutes
tags:
  - active-directory
  - entra-id
  - group-membership
  - least-privilege
  - access-control
error_codes: []
tldr: 'Confirm the approved target group and principal, capture current direct and effective membership, identify whether the group is assigned, dynamic, role-assignable or synchronised, make only the approved change with a named administrative account, then verify replication, token refresh and the original business access.'
related_symptoms:
  - need-to-change-security-group-membership
  - access-is-denied-or-missing
symptom_weights:
  need-to-change-security-group-membership: 10
  access-is-denied-or-missing: 4
related_causes: []
related_commands: []
next_steps:
  - grant-access-through-an-approved-request
  - remove-inappropriate-or-expired-access
escalation: 'Escalate to Identity and Access Management when approval is missing or ambiguous, the group is privileged, role-assignable, dynamic, synchronised from another authority, protected by PIM or access governance, replication does not converge, the requested principal cannot be resolved, or the resulting access is broader than approved. Include the request or change record, before-and-after membership evidence, group and principal object IDs, timestamps, directory source, commands used, replication or token-refresh results and the business test outcome.'
last_reviewed: '2026-08-02'
review_cycle_days: 90
required_role: technician
approval_required: A valid access request or change record approved by the resource owner or delegated authority is mandatory. Privileged and role-assignable groups require the organisation's privileged-access workflow.
content_status: under_review
generated_baseline: false
reviewed_by: ''
last_tested: ''
tested_platforms:
  - Active Directory Domain Services
  - Microsoft Entra ID
source_references:
  - Microsoft Learn - Add-ADGroupMember
  - Microsoft Learn - Remove-ADGroupMember
  - Microsoft Learn - Microsoft Graph group membership cmdlets
change_record: 'Rewritten during content remediation to replace an unrelated account-lockout command with group-specific diagnostics, controlled change commands, rollback and verification.'
quality_gate: pending
permalink: /procedures/add-or-remove-security-group-membership/
layout: article
risk_model: impact-v1
risk_basis: 'Batch B-1 audit classification: P2 / medium.'
verification_priority: P2
verification_state: awaiting_live_validation
verification_schema_version: 2
verification_governance_state: under_review
verification_v2_complete: false
verification_v2_score_percent: 24
verification_v2_missing:
  - diagnostic_tested
  - remediation_tested
  - rollback_or_irreversibility_confirmed
  - escalation_confirmed
  - time_validated
  - expected_result_confirmed
  - owner_signoff
  - authoritative_source_provenance
  - last_tested
  - minimum_peer_reviewers
  - minimum_sme_reviewers
  - minimum_test_records
  - minimum_distinct_environments
verification_promotion_ready: false
classification_audit: batch-b1-2026-08-13
---
## Mandatory Batch B-1 controls
These audit-derived controls are mandatory before more invasive remediation.

### Pre-checks
1. Verify approved requester/change authority.
2. Confirm group scope/type, nested membership and target entitlement.
3. Record existing membership state before the change.

### Rollback / undo
- If the change causes unintended access impact, restore the exact previous membership state and document the reversal.

## Purpose and scope
Use this procedure for an approved request to add or remove a user, computer, service account or nested group from a security group. It covers:

- On-premises Active Directory groups.
- Microsoft Entra ID assigned-membership groups.
- Hybrid groups where the source of authority must be identified before making a change.

Do not use this procedure to bypass access governance, alter a dynamic membership rule, change a privileged group without the required privileged-access process, or modify a group whose ownership and business purpose cannot be confirmed.

## Safety and stop conditions
Stop and escalate before making a change when any of the following applies:

- The request has no valid approval, has conflicting approvals, or names the wrong user, group or environment.
- The group grants administrative, security, finance, payroll, HR, production, source-code, customer-data or other sensitive access.
- The group is role-assignable, managed through Privileged Identity Management, controlled by an access package, or subject to an access review.
- The group uses dynamic membership. Direct member changes are not the correct remediation for a dynamic group.
- The group is synchronised and the current directory is not the source of authority.
- Removal may interrupt an active service account, scheduled task, application pool, integration or emergency-access account.
- The requested change would create circular nesting, excessive privilege or access outside the approved scope.

## Information and evidence to capture
Record all of the following in the ticket before changing membership:

- Request or change-record number and approver.
- User or object display name, sign-in name, employee or asset identifier and immutable object ID where available.
- Exact group display name, distinguished name or object ID.
- Group owner, business purpose, source of authority and membership type.
- Whether the group is privileged, role-assignable, dynamic, synchronised, nested or licence-bearing.
- Current direct membership and, when relevant, effective or transitive membership.
- The specific access expected after the change and the business application or resource used for verification.

## Procedure
1. **Validate the request and resolve the exact objects.** Confirm that the approved request identifies one unambiguous principal and one unambiguous group. Do not rely on display name alone when duplicates exist.

   <div class="expected"><strong>Expected result:</strong> The principal and group are uniquely identified, the approval scope matches the proposed change, and the source directory is known.</div>

2. **Inspect group properties before changing anything.** Confirm group scope and category in Active Directory, or membership type, synchronisation state and role-assignable status in Microsoft Entra ID.

{% capture ad_group_properties %}
$Group = Get-ADGroup -Identity "GROUP_SAM_OR_DN" -Properties GroupCategory,GroupScope,ManagedBy,member
$Group | Select-Object Name,SamAccountName,GroupCategory,GroupScope,ManagedBy,DistinguishedName
{% endcapture %}
{% include command.html shell="powershell" label="Active Directory group properties" command=ad_group_properties %}

{% capture entra_group_properties %}
Connect-MgGraph -Scopes "GroupMember.Read.All","Group.Read.All"
$Group = Get-MgGroup -Filter "displayName eq 'GROUP_DISPLAY_NAME'" -Property Id,DisplayName,SecurityEnabled,GroupTypes,MembershipRule,OnPremisesSyncEnabled,IsAssignableToRole
$Group | Select-Object Id,DisplayName,SecurityEnabled,GroupTypes,MembershipRule,OnPremisesSyncEnabled,IsAssignableToRole
{% endcapture %}
{% include command.html shell="powershell" label="Microsoft Entra group properties" command=entra_group_properties %}

   <div class="expected"><strong>Expected result:</strong> You know whether the group can be changed directly in the current directory and whether additional privileged or governance approval is required.</div>

3. **Capture before-state membership.** Record both the target principal's current groups and the target group's direct members. Use transitive checks only as supporting evidence; a user may have effective access through nesting even when they are not a direct member.

{% capture ad_membership_evidence %}
Get-ADPrincipalGroupMembership -Identity "USER_OR_OBJECT" |
  Sort-Object Name |
  Select-Object Name,SamAccountName,GroupCategory,GroupScope

Get-ADGroupMember -Identity "GROUP_SAM_OR_DN" -Recursive:$false |
  Sort-Object Name |
  Select-Object Name,SamAccountName,ObjectClass,DistinguishedName
{% endcapture %}
{% include command.html shell="powershell" label="Active Directory before-state evidence" command=ad_membership_evidence %}

{% capture entra_membership_evidence %}
$GroupId = "GROUP_OBJECT_ID"
Get-MgGroupMember -GroupId $GroupId -All |
  Select-Object Id,AdditionalProperties
{% endcapture %}
{% include command.html shell="powershell" label="Microsoft Entra direct members" command=entra_membership_evidence %}

   <div class="expected"><strong>Expected result:</strong> The ticket contains a reproducible before-state showing whether the principal is already a direct member, only an indirect member, or not a member.</div>

4. **Confirm the change is appropriate for the group type.** For a dynamic group, validate or correct the membership rule through the approved group-management process instead of adding or removing a direct member. For a synchronised group, make the change in the source directory. For a role-assignable or PIM-managed group, use the privileged-governance workflow.

   <div class="expected"><strong>Expected result:</strong> The proposed action is being performed in the authoritative system with the correct governance controls.</div>

5. **Preview the on-premises Active Directory change.** Use `-WhatIf` first and review the target group and principal returned by the command.

{% capture ad_change_preview %}
Add-ADGroupMember -Identity "GROUP_SAM_OR_DN" -Members "USER_OR_OBJECT" -WhatIf
Remove-ADGroupMember -Identity "GROUP_SAM_OR_DN" -Members "USER_OR_OBJECT" -WhatIf
{% endcapture %}
{% include command.html shell="powershell" label="Preview the approved AD change" command=ad_change_preview %}

   <div class="expected"><strong>Expected result:</strong> The preview names only the approved group and principal and does not reveal an unexpected nested or similarly named object.</div>

6. **Apply only the approved change.** Run one of the following commands, not both. Retain confirmation for removals unless the organisation's controlled automation explicitly handles confirmation and audit logging.

{% capture ad_change_apply %}
# Approved addition
Add-ADGroupMember -Identity "GROUP_SAM_OR_DN" -Members "USER_OR_OBJECT" -Confirm

# Approved removal
Remove-ADGroupMember -Identity "GROUP_SAM_OR_DN" -Members "USER_OR_OBJECT" -Confirm
{% endcapture %}
{% include command.html shell="powershell" label="Apply the approved Active Directory change" command=ad_change_apply %}

For a Microsoft Entra assigned-membership group, use an approved Graph session with the least privilege required. Replace the placeholders with immutable object IDs.

{% capture entra_change_apply %}
Connect-MgGraph -Scopes "GroupMember.ReadWrite.All"
$GroupId = "GROUP_OBJECT_ID"
$DirectoryObjectId = "MEMBER_OBJECT_ID"

# Approved addition
$params = @{ "@odata.id" = "https://graph.microsoft.com/v1.0/directoryObjects/$DirectoryObjectId" }
New-MgGroupMemberByRef -GroupId $GroupId -BodyParameter $params

# Approved removal
Remove-MgGroupMemberByRef -GroupId $GroupId -DirectoryObjectId $DirectoryObjectId -Confirm
{% endcapture %}
{% include command.html shell="powershell" label="Apply the approved Microsoft Entra change" command=entra_change_apply %}

   <div class="expected"><strong>Expected result:</strong> Exactly one approved membership change is accepted by the authoritative directory without broadening the request.</div>

7. **Capture the after-state and compare it with the before-state.** Repeat the direct membership query and save the result in the ticket. Confirm that no unrelated member was added or removed.

   <div class="expected"><strong>Expected result:</strong> The group contains the intended principal after an addition, or no longer contains it after a removal, with no unauthorised side effects.</div>

8. **Allow directory convergence and refresh the user's token.** Replication, synchronisation and application-side authorisation caches may delay access changes. Use a new sign-in session or approved token-refresh method. Do not repeatedly alter membership to compensate for normal convergence time.

   <div class="expected"><strong>Expected result:</strong> The authoritative directory and consuming application show a consistent membership state.</div>

9. **Verify the original business task.** Test the exact resource named in the request. Confirm both positive access and least privilege: the user can perform the approved task but does not receive broader access.

   <div class="expected"><strong>Expected result:</strong> The approved business function works and the effective privilege matches the request.</div>

10. **Document and close.** Record the command or portal action, before-and-after evidence, object IDs, timestamps, directory source, approver, token-refresh method, test result and any delay or exception. Link related change, access-review, PIM or problem records.

   <div class="expected"><strong>Expected result:</strong> Another technician or auditor can reconstruct who approved the change, what changed, where it changed and how access was verified.</div>

## Rollback
- For an incorrect addition, remove the same principal from the same group after confirming that rollback is authorised.
- For an incorrect removal, re-add the same principal only when the prior membership was captured and restoration is authorised.
- Do not attempt rollback in the wrong directory for synchronised groups.
- If a privileged group change may have been unauthorised, stop normal remediation and invoke the security incident process.

## Verification checklist
- [ ] Requester, approver, principal and group were uniquely verified.
- [ ] Group type, source of authority and privileged status were checked.
- [ ] Before-state direct membership evidence was captured.
- [ ] Only the approved addition or removal was performed.
- [ ] After-state membership evidence was captured.
- [ ] Replication, synchronisation or token refresh was allowed to complete.
- [ ] The original business task was tested.
- [ ] Effective access does not exceed the approved scope.
- [ ] Ticket notes contain object IDs, timestamps, commands, results and rollback information.
