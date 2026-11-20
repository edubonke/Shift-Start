# ShiftStart M1 Day 4–5 — Verification Batches and Evidence Capture

## What this stage does

Day 4–5 turns the verification queue into executable QA work.

It does four things:

1. Corrects the temporary demand proxy so it only uses procedure metadata
   (title, description, category, slug and tags), not generic procedure-body text.
2. Applies risk floors so P0 work cannot fall below Immediate and P1 cannot fall below Next.
3. Generates controlled verification batches.
4. Creates structured evidence work-items and a safe importer.

## Batch model

### Batch A — Critical P0 verification
All actionable P0 procedures.

### Batch B — High-demand P1 verification
Top 15 actionable P1 procedures after corrected ranking.

### Batch C — Historical verification revalidation
All procedures currently in `revalidation_required`.

A procedure may appear in both A/B and C when it is both risk-prioritised and historical revalidation work.
The reports expose those overlaps rather than hiding them.

## Evidence workflow

Generate a work-item:

```bash
npm run verification:evidence:create -- --batch A
```

This creates YAML files under:

`verification/evidence/pending/`

The files contain no positive test evidence. Testers must enter real observations.

Validate:

```bash
npm run verification:evidence:check
```

A `pending`, `in_test` or `blocked` work-item may be incomplete.

A work-item marked `completed` must meet the risk-specific Verification v2 requirements.

Preview importing completed evidence:

```bash
npm run verification:evidence:apply -- --slug respond-to-a-ransomware-alert
```

Actually import:

```bash
npm run verification:evidence:apply -- --slug respond-to-a-ransomware-alert --apply
```

The importer refuses to import a work-item that is not complete.

After import:

```bash
npm run verification:v2:apply
npm run readiness:promote
npm run check
```

Promotion remains a separate governance action.

## Safety

The workflow does not:
- fabricate evidence;
- generate reviewer names;
- mark tests as passed;
- auto-promote procedures;
- overwrite completed evidence silently;
- use the temporary topic proxy as real search telemetry.
