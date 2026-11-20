# ShiftStart Batch B-4 Remediation

Applies the 30-procedure Batch B-4 audit.

Corrected individual-verdict ledger:
- 13 Keep P1
- 15 -> P2
- 2 -> P3
- 0 -> P0
- 7 explicitly Blocked in the detailed individual verdicts

Important reconciliation:
- The source summary says 12 P1 / 16 P2 / 2 P3, but its listed individual verdicts total 13 / 15 / 2.
- The correction table gives conflicting blocked counts; the individual Final Verdict fields explicitly mark 7 procedures Blocked.
- `troubleshoot-a-print-server-outage` is not duplicated as two repo files: it is the same previously audited procedure re-surfacing in the regenerated queue. This package augments it rather than self-deprecating it.

Structural changes:
- External-monitor trio -> one definitive cross-platform P2 procedure with Windows/macOS/no-signal branches; two compatibility pages deprecated.
- Windows webcam becomes the generic P3 OS/hardware camera diagnostic; Teams Camera remains a P2 Teams-specific branch with cross-links.
- Shared-mailbox request and troubleshooting procedures remain distinct with cross-links.
- SAML, AWS, Azure and HTTP 403 receive explicit governance decision paths.
- No procedure is promoted to Verified.

Apply only after Batch B-3 is complete:

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
unzip -q shiftstart-batch-b4-remediation.zip
python3 shiftstart-batch-b4-remediation/apply-batch-b4-remediation.py
```

Expected:

```text
Batch B-4 remediation validation passed.
Corrected ledger: P1=13, P2=15, P3=2, P0=0.
Explicitly blocked individual verdicts remediated: 7.
No Batch B-4 procedure was promoted to Verified.
```

Then:

```bash
npm install --no-audit --no-fund
npm run verification:v2:apply
npm run verification:queue
npm run verification:queue:check
npm run verification:batches
npm run verification:batches:check
npm run batch:b4:check
npm run check
npm run build
```

Commit only after all gates pass.
