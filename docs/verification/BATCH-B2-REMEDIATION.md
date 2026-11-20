# ShiftStart Batch B-2 Remediation

This package applies the corrected Batch B-2 audit.

## Corrected ledger

The 30 individual verdicts produce:

- 9 Keep P1
- 18 Demote to P2
- 3 Demote to P3
- 0 Promote to P0

Because `troubleshoot-dns-name-resolution` is merged into the existing P1 `triage-a-dns-service-issue`, the final active result from this batch is:

- 8 active P1 procedures
- 1 deprecated P1 DNS duplicate retained for URL/history compatibility
- 18 P2 procedures
- 3 P3 procedures

## Important remediation

- DNS Name Resolution is merged into the canonical DNS service runbook.
- Outlook procedures receive a failure-mode decision path without collapsing distinct symptoms.
- Teams Phone, Teams sign-in and Teams calling get explicit Microsoft 365 service-health checks.
- DHCP gets scope/service/relay checks, configuration backup and safe network rollback.
- Print queue clearing checks scope/disk first and preserves spool evidence instead of deleting first.
- Security incident evidence begins with chain of custody, approved volatile-evidence handling and SHA-256 integrity tracking.
- No procedure is marked Verified.

## Apply

From the ShiftStart repository root:

```bash
git status
```

If the worktree is clean:

```bash
git fetch origin
git pull --rebase origin main
```

If it is not clean, commit or stash safely before pulling.

Then:

```bash
unzip -q shiftstart-batch-b2-remediation.zip
python3 shiftstart-batch-b2-remediation/apply-batch-b2-remediation.py
```

The installer and its validator are pure Python and do not require `node_modules`.

After the installer passes:

```bash
npm install --no-audit --no-fund

npm run verification:v2:apply
npm run verification:queue
npm run verification:queue:check
npm run verification:batches
npm run verification:batches:check

npm run batch:b2:check
npm run check
npm run build
```

Expected validator output:

```text
Batch B-2 remediation validation passed.
Individual verdict ledger: P1=9, P2=18, P3=3, P0=0.
Active P1 after DNS merge: 8 + 1 deprecated P1 duplicate.
No Batch B-2 procedure was promoted to Verified.
```

Commit only after all gates pass:

```bash
rm -f shiftstart-batch-b2-remediation.zip
rm -rf shiftstart-batch-b2-remediation
rm -rf .shiftstart-backups

git restore reports/content-audit.json 2>/dev/null || true

git add -A
git status
git commit -m "Apply Batch B-2 audit remediation"
git push origin main
```
