# ShiftStart Enterprise Metadata Schema

The architecture overhaul supports additional optional front matter. Nothing in this schema automatically promotes a procedure to Verified.

```yaml
root_cause: "Short root-cause summary under 50 words"
immediate_workaround: "Safe workaround under 50 words"
last_verified: 2026-08-10
next_review_due: 2026-11-10
verified_by_smes: 2
success_rate: 92
impact_scopes:
  - Single User
  - Department

sponsor:
  name: Microsoft
  logo: "https://example.com/approved-logo.svg"
  disclosure: "Vendor-funded publication. Verification remains independent."

affiliate_links:
  - id: tool-example
    label: Example Diagnostic Tool
    url: "https://example.com/affiliate-url"
    description: Optional diagnostic utility
    commission_model: "CPA"
```

## Sponsorship rule

A sponsor can fund content development, testing or publication. Sponsorship must never change risk, review status, verification evidence, rollback requirements or escalation criteria. Sponsored procedures are visibly disclosed.

## Affiliate rule

Affiliate links appear outside the remediation steps, use `rel="sponsored nofollow"`, and are tracked separately from technical outcome data. ShiftStart can record click events locally or post them to `enterprise.affiliateTrackingEndpoint` when configured.

## Compliance badges

The enterprise footer deliberately does not claim SOC 2 attestation or GDPR compliance. Those labels may only be changed after an appropriate legal/security assessment or formal attestation supports the claim.
