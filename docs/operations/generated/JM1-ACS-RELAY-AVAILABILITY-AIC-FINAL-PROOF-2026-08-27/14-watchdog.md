# Watchdog

Last verified: 2026-08-28T02:33:47Z

The ACS relay deployment workflow now includes a route-level health guard. Future protected deployments must prove:

1. package provenance;
2. deployed runtime stack;
3. Function App `Running`;
4. POST `/api/send-enterprise-governed-email` returns governed `401 UNAUTHORIZED` without a key;
5. the response body contains `UNAUTHORIZED`, proving the route handler is active rather than merely the ARM resource.

This closes the specific defect where a deployment could pass while the live host still returned 503.

Maintenance note: the current watchdog is deployment-bound. A separate recurring operational monitor may still be added if Jackie wants proactive alerting independent of deployments.

