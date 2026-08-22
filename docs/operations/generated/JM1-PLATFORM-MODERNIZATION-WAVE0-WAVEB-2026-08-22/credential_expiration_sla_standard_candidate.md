# Credential Expiration SLA Standard Candidate

Status: CANON-CANDIDATE

Credential classes:

- P0 production broken or expired active dependency: owner and remediation window within 1 business day.
- P1 production credential expiring under 90 days: owner, consumer map, and remediation plan within 5 business days; rotate or replace before 30 days to expiry.
- Unknown consumer: prove consumer or retire; do not rotate blindly.
- Superseded expired secret: retire only after active replacement proof and rollback-safe observation.

Promotion gate: prove through Wave B and next credential execution window.
