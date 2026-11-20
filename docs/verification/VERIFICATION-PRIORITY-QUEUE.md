# ShiftStart Verification Priority Queue — M1 Day 3

## Objective

Replace simple P0→P3 sorting with a transparent verification priority score.

## Score

Verification Priority Score =
- Risk: max 40
- Search demand: max 30
- Escalation frequency: max 15
- Business criticality: max 10
- Evidence readiness: max 10

Scores are capped at 100.

## Important telemetry rule

ShiftStart must not invent search demand.

`_data/verification-demand.yml` starts empty.

Until real search/ticket analytics are supplied, the engine may use a clearly labelled
`temporary_topic_proxy` for common support topics. Every queue row records whether the
demand input came from:
- procedure front matter;
- manual/analytics data;
- category data;
- temporary topic proxy;
- no demand signal.

The temporary proxy is not presented as observed user behaviour.

## Queue bands

- 70–100: Immediate verification
- 50–69: Next verification batch
- 30–49: Planned
- 0–29: Backlog

Procedures already `verified` or `deprecated` are excluded from the actionable queue.

## Evidence readiness

Higher verification-v2 completion scores receive a small boost because near-complete
procedures can be promoted quickly once real missing evidence is supplied.

Promotion-ready procedures are sorted to the top of the actionable list, but the queue
script never promotes them.

## Outputs

- `reports/verification-priority-queue.json`
- `reports/verification-priority-queue.csv`
- `_data/verification-priority-dashboard.json`

## Adding real demand signals

Edit `_data/verification-demand.yml`.

Example:

```yaml
procedures:
  vpn-not-connecting:
    search_demand: very_high
    escalation_frequency: high
    business_criticality: high
    source: "Support analytics export 2026-W33"
```

Then rerun:

```bash
npm run verification:queue
```
