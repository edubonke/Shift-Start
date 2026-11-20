# ShiftStart Sprint 1 — Taxonomy + Governance Fix

This package executes Sprint 1 Phases 1–3 from the validated Batch A audit.

It applies:
- 7 retained P0s;
- 6 P1 reclassifications;
- 3 P2 reclassifications;
- 1 P3 reclassification;
- `windows-blue-screen` symptom severity -> medium;
- ransomware/data-leakage Step 0 containment;
- compromised-account identity containment plus Exchange Inbox-rule/mailbox-forwarding checks;
- Windows Server iDRAC/iLO/OOB-first triage;
- wireless PoE checks and Cisco IOS/IOS-XE `reload in 10` safety timer;
- site Internet/LAN network rollback timers;
- cloud-provider health checks;
- lost/stolen-device containment and irreversible-wipe controls;
- major-incident/site-outage command-and-control pre-checks;
- print-server-specific pre-checks and rollback;
- CI regression gate: `npm run sprint1:audit:check`.

It does **not** promote any procedure to Verified. Phase 4 remains gated by real test evidence, review and owner sign-off.

## Apply

```bash
git status
git fetch origin
git pull --rebase origin main

unzip -q shiftstart-sprint1-taxonomy-governance-fix.zip
python3 shiftstart-sprint1-taxonomy-governance-fix/apply-sprint1-taxonomy-governance-fix.py

npm install --no-audit --no-fund
npm run verification:v2:apply
npm run verification:queue
npm run verification:queue:check
npm run verification:batches
npm run verification:batches:check
npm run sprint1:audit:check
npm run check
npm run build
```

## Commit after all checks pass

```bash
rm -f shiftstart-sprint1-taxonomy-governance-fix.zip
rm -rf shiftstart-sprint1-taxonomy-governance-fix
rm -rf .shiftstart-backups

git diff -- reports/content-audit.json
git restore reports/content-audit.json 2>/dev/null || true

git add -A
git status
git commit -m "Correct Sprint 1 taxonomy and governance controls"
git push origin main
```

## Exchange command note

There is no standard Exchange PowerShell cmdlet named `Get-ForwardingAddress`. The patch implements the supported equivalent:

```powershell
Get-InboxRule -Mailbox $Mailbox -IncludeHidden
Get-Mailbox -Identity $Mailbox |
  Format-List ForwardingAddress,ForwardingSmtpAddress,DeliverToMailboxAndForward
```
