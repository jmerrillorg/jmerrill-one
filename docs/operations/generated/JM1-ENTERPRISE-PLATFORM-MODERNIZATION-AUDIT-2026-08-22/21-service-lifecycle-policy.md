# JM1_SERVICE_LIFECYCLE_POLICY_v1.0

Status: CANON-CANDIDATE

Every enterprise service must maintain:

- owner
- purpose
- repository or admin surface
- runtime or service version
- support status
- support end date or retirement date
- migration target
- migration status
- monitoring owner
- credential/secret expiration state

Allowed support statuses:

- CURRENT
- SUPPORTED_BUT_LEGACY
- DEPRECATED
- RETIREMENT_ANNOUNCED
- UNSUPPORTED
- UNKNOWN

No resource should remain indefinitely in UNKNOWN. Unknown means evidence is missing, not that risk is absent.
