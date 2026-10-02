# ONE Meta post-rotation validation

Owner of credential rotation: `jm1-ops / JM1-MPI-002`. This repository validates the Function runtime after that rotation; it does not issue, copy, or rotate the token.

Pre-rotation readback (2026-10-02): Function `func-jm1-marketing-runtime` is running with Meta token secret version `c8d340a1d16640c099e65ca4b2a0ae19`, rotation due `2026-10-17T12:02:43Z`, and expiry `2026-11-01T12:02:43Z`. The version is an identifier, not a token value.

After the ops-owned change, validate all of these before closing the rotation:

1. Read Function app settings by *name and nonsecret metadata only*. `JM1_META_TOKEN_SECRET_VERSION` must differ from the version above. `JM1_META_TOKEN_EXPIRES_AT` and `JM1_META_TOKEN_ROTATION_DUE_AT` must be later than the old dates and ordered correctly. The `JM1_META_SYSTEM_USER_TOKEN` setting must remain a Key Vault reference. Do not print its resolved value.
2. Read `func-jm1-marketing-runtime` health and function registrations. The app must be running; `credentialMonitorTimer`, `socialExecutionWorkerTimer`, and `websiteIntakeReconciliationTimer` must remain registered.
3. Invoke the existing credential monitor through its normal schedule or an already approved operational trigger. Read the newest Meta row in `jm1_credentialmonitors`: its `jm1_secretversion`, `jm1_expiresat`, `jm1_rotationdueat`, and `jm1_currentcredentialstate` must match the new settings and show a valid state. Do not create a second monitor.
4. Check Application Insights for Function auth failures and exceptions since rotation. The Meta publisher must show no new 401/403, `CREDENTIAL_FAILURE`, or failed timer invocation. Check the next scheduled social execution and destination/readback state; absence of a scheduled post is not proof of publishing health.
5. Confirm the existing critical-state alert still matches `CREDENTIAL_MONITOR_GOVERNED_DEBT` and targets the enabled `jm1-marketing-ops` action group. If the monitor reports debt, keep the rotation open and follow the ops-owned escalation path.

Do not mark `META_POST_ROTATION_VALIDATED=PASS` until all five readbacks succeed. Do not wait for the October rotation to release unrelated intake safety work.
