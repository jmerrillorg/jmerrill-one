# Empty-Date Remediation

The repair is deliberately narrow:

1. Normalize null, empty, and absent expiration values to `EXPIRATION_UNKNOWN` for issued credentials.
2. Classify absent LinkedIn access token as `NOT_ISSUED` instead of monitor failure.
3. Send JSON null for nullable Dataverse DateTime columns instead of empty strings.
4. Reject malformed nonempty timestamps as `INVALID_METADATA`.
5. Process each credential independently so one failed write does not hide another record's state.
6. Preserve invocation failure for actual Dataverse write failures after all records have been attempted.
7. Emit bounded state telemetry without secret values.

No Dataverse schema change, new credential store, credential issuance, rotation, or identity migration was required.
