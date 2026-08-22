# JM1_ENTERPRISE_CREDENTIAL_POLICY_v1.0

Status: CANON-CANDIDATE

## Preferred Authentication Hierarchy

1. Managed Identity / workload identity
2. Certificate-based service principal
3. Secret-based service principal only where required
4. Personal credentials prohibited for production service operation

## Secret Lifetime

Default maximum for new secret-based credentials: 180 days unless an approved exception is recorded. Longer lifetimes require explicit owner, consumer, rotation owner, and monitoring.

Every credential must have owner, consumer, createdOn, expiresOn, rotationOwner, monitoring, and nextReview.

## Certificate Rules

Track thumbprint/identifier, owner, consumer, issuedOn, expiresOn, and rotation state. Never store private keys in repo evidence.

## Monitoring

States: HEALTHY, EXPIRING_180, EXPIRING_90, EXPIRING_30, EXPIRING_7, EXPIRED.

## Emergency Procedure

Identify blast radius, create replacement, update consumers, validate, revoke compromised credential, investigate logs, document incident. Do not expose secret values.
