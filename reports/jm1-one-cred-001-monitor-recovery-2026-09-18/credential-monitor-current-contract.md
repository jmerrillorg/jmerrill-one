# Credential Monitor Current Contract

- Trigger: Azure Functions timer `credentialMonitorTimer`.
- Production schedule setting: `0 7 12 * * *`.
- Credential inputs: Meta system-user token metadata and LinkedIn organization OAuth lifecycle metadata.
- Authority: secrets remain in governed secret storage; Dataverse stores monitor status and non-secret metadata.
- Idempotency: rows are upserted by a deterministic marker plus credential key.
- Output states: `KNOWN_VALID`, governed expiration windows, `EXPIRED`, `EXPIRATION_UNKNOWN`, `NONEXPIRING_PROVEN`, `INVALID_METADATA`, `READBACK_FAILED`, and `NOT_ISSUED`.
- Date contract: strict RFC3339 timestamps with a timezone; UTC is used for calculations and provider precision is retained in stored timestamps.
- Missing date contract: nullable Dataverse fields receive JSON null. Missing expiration is not expired and is not presumed nonexpiring.
- Failure contract: each credential is processed independently. A write failure becomes bounded `READBACK_FAILED` evidence, all remaining records are attempted, and the invocation fails after the scan if any write failed.
- Visibility: expiring, expired, unknown, invalid, and readback-failed states emit bounded governed-debt telemetry. Token values are never logged.
- Synthetic proof mode: disabled in production.
- Enterprise boundary: this runtime produces Marketing OS credential status; JM1-MPI-002 in `jmerrillorg/jm1-ops` remains the enterprise register/watch authority.
