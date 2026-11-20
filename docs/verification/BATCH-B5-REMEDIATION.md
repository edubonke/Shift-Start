# ShiftStart Batch B-5 Remediation

Applies the 30-procedure Batch B-5 audit.

Corrected individual-verdict ledger:
- 11 Keep P1
- 15 -> P2
- 4 -> P3
- 0 -> P0
- 3 procedures are explicitly `Blocked` in the detailed individual Final Verdicts

Source reconciliation:
- The audit summary says 10 P1 / 14 P2 / 6 P3, but the 30 individual classifications total 11 / 15 / 4.
- The summary says six Blocked, while the detailed Final Verdict fields explicitly mark HTTP 500, Directory Synchronisation and Multiple-Monitor Arrangement as Blocked.
- Other governance defects named in the source (disk encryption, endpoint protection, Gmail and Linux certificate trust) are still remediated, even though their detailed final verdict is `Needs rewrite`.

Structural changes:
- Multiple-monitor arrangement/resolution is merged into the definitive external-monitor runbook created by Batch B-4; its old URL becomes deprecated.
- Endpoint Protection Health remains distinct from active EDR alert investigation and routes active threats to `investigate-an-antivirus-or-edr-alert`.
- Directory Synchronisation remains P1; P0/major-incident escalation is based on actual impact/scope, not a hard elapsed-time threshold.
- Sync/data-remediation procedures preserve local/cloud source-of-truth before resets.
- Security-blocked downloads are not released automatically.
- No procedure is promoted to Verified.

Apply only after Batch B-4 has passed:

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
unzip -q shiftstart-batch-b5-remediation.zip
python3 shiftstart-batch-b5-remediation/apply-batch-b5-remediation.py
```

Expected:

```text
Batch B-5 remediation validation passed.
Corrected ledger: P1=11, P2=15, P3=4, P0=0.
Explicit detailed Blocked verdicts remediated: 3.
No Batch B-5 procedure was promoted to Verified.
```

Then:

```bash
npm install --no-audit --no-fund
npm run verification:v2:apply
npm run verification:queue
npm run verification:queue:check
npm run verification:batches
npm run verification:batches:check
npm run batch:b5:check
npm run check
npm run build
```

Commit only after all gates pass.
