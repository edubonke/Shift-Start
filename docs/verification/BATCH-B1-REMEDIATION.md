# ShiftStart Batch B-1 Remediation

Applies the corrected 30-procedure Batch B-1 audit.

Result:
- 14 remain P1
- 12 active procedures become P2
- 1 duplicate mapped-drive procedure is deprecated and points to the canonical P2 runbook
- 3 become P3
- 0 promoted to P0
- no procedure is marked Verified

The current repository already has the duplicate-IP symptom at `medium`, so this patch does not change it.

## Apply

```bash
git status
# Commit or stash local work first if needed.
git fetch origin
git pull --rebase origin main

unzip -q shiftstart-batch-b1-remediation.zip
python3 shiftstart-batch-b1-remediation/apply-batch-b1-remediation.py
```

Then:

```bash
npm install --no-audit --no-fund
npm run verification:v2:apply
npm run verification:queue
npm run verification:queue:check
npm run verification:batches
npm run verification:batches:check
npm run batch:b1:check
npm run check
npm run build
```

After all checks pass:

```bash
rm -f shiftstart-batch-b1-remediation.zip
rm -rf shiftstart-batch-b1-remediation
rm -rf .shiftstart-backups

git restore reports/content-audit.json 2>/dev/null || true
git add -A
git status
git commit -m "Apply Batch B-1 audit remediation"
git push origin main
```
