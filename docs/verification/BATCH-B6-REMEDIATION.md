# ShiftStart Batch B-6 Remediation — Final P1 Audit Batch

This package applies the final 28-procedure P1 audit supplied for Batch B-6.

## Corrected Batch B-6 ledger

The individual classifications total:

- 12 Keep P1
- 11 Demote to P2
- 5 Demote to P3
- 0 Promote to P0
- 6 procedures explicitly marked `Blocked` in the individual Final Verdicts

The source correction table says 9 P1, but actually lists 12 P1 procedures. Its detailed Final Verdicts explicitly mark six procedures Blocked. This package uses the 28 individual audits as the authoritative classification record.

## Merge/consolidation actions

- No Dial Tone -> existing `troubleshoot-a-teams-phone-device` P2 runbook.
- Server High CPU -> existing B-5 `troubleshoot-high-cpu-utilisation` P1 runbook, with a server/service branch.
- Server High Memory -> existing B-5 `troubleshoot-high-memory-utilisation` P1 runbook, with a server/service branch.
- SharePoint Document Synchronisation -> `troubleshoot-onedrive-synchronisation`, with a SharePoint-library branch.
- Unlock a User Account -> `password-reset` becomes the canonical User Account Access Recovery decision path; repeated lockouts still route to `trace-an-active-directory-account-lockout-source`.

Compatibility pages remain in the repository as deprecated URLs so the procedure count remains 421 and historical links do not break.

## Governance and safety corrections

- One-way audio: provider/service-health Step 0 plus media-path diagnostics.
- OneDrive: Microsoft 365 health + local/cloud source-of-truth protection.
- SharePoint External Sharing: explicit owner/sponsor authorization before granting access.
- SSO: IdP/application service-health Step 0, SAML/OIDC evidence and configuration rollback.
- Backup restore validation: explicit restore authority, restore-point validation, alternate destination/overwrite protection.
- USB storage: no security-policy bypass.
- RDP/SSH: approved console/out-of-band recovery path, not a “backdoor”.
- WSL: preserve/export distributions before unregister/reinstall.
- Migration validation: source remains protected until integrity and acceptance checks pass.
- No procedure is promoted to Verified.

## Apply

Apply only after Batch B-5 has passed and its audit record exists.

```bash
git status
```

If clean:

```bash
git fetch origin
git pull --rebase origin main
```

Then:

```bash
unzip -q shiftstart-batch-b6-remediation.zip
python3 shiftstart-batch-b6-remediation/apply-batch-b6-remediation.py
```

Expected:

```text
Batch B-6 remediation validation passed.
Corrected ledger: P1=12, P2=11, P3=5, P0=0.
Explicit detailed Blocked verdicts remediated: 6.
All 28 final P1 audit procedures are accounted for.
No Batch B-6 procedure was promoted to Verified.
```

Then:

```bash
npm install --no-audit --no-fund

npm run verification:v2:apply
npm run verification:queue
npm run verification:queue:check
npm run verification:batches
npm run verification:batches:check

npm run batch:b6:check
npm run check
npm run build
```

After the full gate passes, regenerate the queue and use the resulting P2/revalidation population for the next audit phase. Do not manufacture another P1 batch if no unaudited P1 items remain.

## Important

“P1 audit complete” means the P1 taxonomy/content review is complete. It does **not** mean the procedures are operationally Verified. Verification v2 still requires live execution evidence, rollback/irreversibility evidence, reviewers, owner sign-off and the applicable environment/test requirements.
