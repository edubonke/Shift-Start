# ShiftStart Knowledge Model v2 — Phase 1A Review Pass 1

## Scope

This pass reviews the complete queue of **249** records that the Phase 1A deterministic classifier marked `review_required=true`.

The pass does not delete, rename or move any `_symptoms/*.md` files. Existing `/symptoms/.../` URLs remain compatibility URLs during the migration.

## Manual decisions

- Observable symptom: 121
- Service request / approved support task: 52
- Known condition / diagnosis: 31
- Context: 38
- Incident / event: 7

The decisions are stored centrally in `_data/symptom-taxonomy-v2-overrides.json`.

## Interpretation rule used in this pass

`observable_symptom` is used when the record describes user-visible or technician-observable behaviour before a root cause is established.

`service_request` is used when the record primarily asks for, requires, or represents an approved support action, change, provisioning, recovery, validation, handover or administrative task.

`known_condition` is used when the record states an already identified technical, configuration, capacity, compliance, data-state or physical condition.

`context` is used when the record primarily names the affected technology, component or environment and is useful to narrow procedure selection rather than representing a standalone fault.

`incident_event` is used for security events, outages, service degradation and similar events requiring incident handling.

## Important limitation

This is **Review Pass 1**. It resolves the 249 records that the classifier itself flagged as uncertain. The 197 records already accepted before this pass comprised 192 deterministic high-confidence classifications plus 5 pre-existing explicit review overrides. The remaining 192 deterministic-only records require a separate final QA pass before the taxonomy is frozen as the Knowledge Model v2 baseline.

## Expected post-build result

After applying this patch and running:

```bash
npm run taxonomy:v2:build
npm run taxonomy:v2:check
```

the current Phase 1A mechanism should report:

```text
Reviewed/accepted: 446
review required: 0
```

That means the *classifier review queue* is cleared. It does not replace the planned QA pass over the 197 deterministic high-confidence entries.

## Pages hygiene

This pass also adds a generic `shiftstart-phase1a-*` cleanup rule so Phase 1A installer ZIPs/folders are not included in the generated GitHub Pages artifact.
