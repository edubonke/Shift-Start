# ShiftStart Knowledge Model v2 — Phase 1A

## Purpose

Phase 1A separates the legacy `_symptoms` collection into five diagnostic object types without deleting, renaming or moving any of the 446 source records.

The legacy collection name and `/symptoms/.../` URLs remain intact for backward compatibility during migration.

## Object types

- `observable_symptom` — what can be observed before the cause is known.
- `service_request` — a request to provision, configure, change, restore or perform an approved service.
- `known_condition` — a technical condition already identified or diagnosed.
- `context` — user, business, scope or environment context that affects ranking/urgency.
- `incident_event` — a security, outage or other event requiring incident-response handling.

## Architecture

The source Markdown files remain unchanged.

`scripts/build-symptom-taxonomy-v2.js` classifies all 446 source records and produces:

- `reports/symptom-taxonomy-v2.json`
- `reports/symptom-taxonomy-v2.csv`

`_data/symptom-taxonomy-v2-overrides.json` contains reviewed overrides. This allows classification to be corrected centrally without breaking existing URLs or creating a 446-file front-matter migration before the taxonomy has been reviewed.

The wizard data generator consumes the generated taxonomy ledger and exposes `objectType`, `taxonomyConfidence`, and `taxonomyReviewRequired` for every legacy symptom record.

## Review workflow

1. Run `npm run taxonomy:v2:build`.
2. Open `reports/symptom-taxonomy-v2.csv`.
3. Review rows where `review_required=true` first.
4. Add reviewed decisions to `_data/symptom-taxonomy-v2-overrides.json`.
5. Run `npm run taxonomy:v2:build && npm run taxonomy:v2:check`.
6. Repeat until all 446 records have `review_required=false`.


## Final QA

Clearing `review_required` is necessary but is not, by itself, evidence that every accepted deterministic classification received an explicit QA decision.

After Review Pass 1, run the Phase 1A Final QA over the remaining deterministic-only records. The final authoritative baseline requires:

- all 446 records to have `classificationOrigin: review_override`;
- all 446 records to have a non-empty review source;
- `explicitReviewed: 446`;
- `explicitReviewRequired: 0`;
- `npm run taxonomy:v2:qa:check` to pass.

## Completion gate

Phase 1A is complete only when:

- source count remains 446;
- all 446 slugs are represented exactly once;
- every record has one of the five valid object types;
- every record has been reviewed/accepted;
- every record has an explicit reviewed override and review source;
- the final QA validator reports 446 explicit reviews and 0 deterministic-only records;
- no legacy URL is removed;
- procedure count remains 421;
- wizard data exposes the new taxonomy consistently.

Phase 1A does **not** change incident priority, procedure execution risk, or verification governance.
