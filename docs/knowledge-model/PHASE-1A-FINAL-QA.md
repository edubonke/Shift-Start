# ShiftStart Knowledge Model v2 — Phase 1A Final QA

## Scope

Review Pass 1 cleared the 249 records that the deterministic classifier had flagged for review. Before that pass, the taxonomy reported **197 accepted records**, but that total consisted of **192 deterministic high-confidence classifications plus 5 pre-existing explicit review overrides**.

This final QA pass reviews the remaining **192 deterministic-only records** so the authoritative Phase 1A baseline no longer depends on classifier confidence alone.

## QA result

- Deterministic-only records reviewed: **192**
- Confirmed without object-type change: **188**
- Corrected: **4**
- Legacy symptom records preserved: **446**
- Procedure records preserved: **421**
- `_symptoms/*.md` files modified by this pass: **0**
- `_procedures/*.md` files modified by this pass: **0**

## Corrections

| Record | Previous | Final | QA basis |
|---|---|---|---|
| `a-default-gateway-failure` | `observable_symptom` | `known_condition` | The record identifies the gateway as the failing network condition; loss of connectivity is the observable symptom. |
| `memory-hardware-errors` | `observable_symptom` | `known_condition` | Hardware-memory errors are an identified technical condition; crashes/boot failures remain observations. |
| `reported-an-expiring-tls-certificate` | `incident_event` | `known_condition` | Certificate expiry is a lifecycle/configuration condition requiring planned remediation, not automatically an incident. |
| `vpn-certificate-failure` | `observable_symptom` | `known_condition` | The certificate failure is already the identified VPN authentication condition; connection failure remains the symptom. |

## Final expected distribution

```text
observable_symptom  204
service_request     119
known_condition      60
context              40
incident_event       23
-----------------------
total                446
```

## Explicit-review gate

The final QA converts every remaining deterministic-only record into an explicit reviewed override. After rebuilding, the taxonomy report must show:

```text
reviewed:                 446
reviewRequired:             0
explicitReviewed:         446
explicitReviewRequired:     0
explicitCompletionPercent: 100
```

The new `taxonomy:v2:qa:check` validator enforces that all 446 records have an explicit review source and `classificationOrigin: review_override`.

## Classifier hardening

The deterministic classifier is also corrected so known technical conditions are evaluated before the generic `reported ...` incident rule, and the four corrected technical states are included in the known-condition patterns. This prevents the same semantic errors from reappearing if future records are added.

## Governance boundary

Phase 1A taxonomy QA does **not** calculate incident priority, change procedure execution risk, alter approval requirements or support boundaries, or promote any procedure to Verification v2 `verified`.
