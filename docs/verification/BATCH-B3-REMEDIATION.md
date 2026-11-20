# ShiftStart Batch B-3 Remediation

This package applies the 30-procedure Batch B-3 audit.

## Corrected ledger

The individual verdicts in the supplied audit produce:

- 8 Keep P1
- 19 Demote to P2
- 3 Demote to P3
- 0 Promote to P0
- 10 explicitly Blocked procedures requiring governance fixes

The source table says 18 P2 and 8 Blocked, but its own listed individual verdicts total 19 P2 and 10 Blocked. This package follows the individual audits.

## Structural remediation

- Printer Driver + Clean Reinstall are merged into one definitive P2 printer-driver/device-management procedure; the old reinstall URL is retained as deprecated.
- Repeated Account Lockouts is merged into the existing canonical `trace-an-active-directory-account-lockout-source` P2 runbook.
- Provision/Deprovision remain separate but become a governed Identity Lifecycle module with cross-links.
- BitLocker/FileVault-specific recovery-key symptoms are changed from Critical to High where currently mapped, matching the audit's default P2 classification.
- All 30 procedures receive audit-derived pre-check/rollback controls except deprecated duplicate compatibility pages.
- The 10 blocked procedures receive literal Step 0 governance controls.
- No procedure is marked Verified.

## Apply

From the repository root:

```bash
git status
```

If clean:

```bash
git fetch origin
git pull --rebase origin main
```

If not clean, commit or stash safely first.

Then:

```bash
unzip -q shiftstart-batch-b3-remediation.zip
python3 shiftstart-batch-b3-remediation/apply-batch-b3-remediation.py
```

The installer and validator are pure Python and do not need Node packages.

After it passes:

```bash
npm install --no-audit --no-fund

npm run verification:v2:apply
npm run verification:queue
npm run verification:queue:check
npm run verification:batches
npm run verification:batches:check

npm run batch:b3:check
npm run check
npm run build
```

Expected validator:

```text
Batch B-3 remediation validation passed.
Corrected ledger: P1=8, P2=19, P3=3, P0=0.
Blocked governance procedures remediated: 10.
No Batch B-3 procedure was promoted to Verified.
```

Commit only after all gates pass:

```bash
rm -f shiftstart-batch-b3-remediation.zip
rm -rf shiftstart-batch-b3-remediation
rm -rf .shiftstart-backups

git restore reports/content-audit.json 2>/dev/null || true

git add -A
git status
git commit -m "Apply Batch B-3 audit remediation"
git push origin main
```
