# Wave B1 ACS Target Architecture

Target: Flex Consumption Function App on Node 24 with One Deploy package semantics and no WEBSITE_RUN_FROM_PACKAGE setting carried into Flex.

Authentication boundary: existing HTTP anonymous trigger remains only if relay-key enforcement remains the product gate and all callers are inventoried before cutover.

Cutover pattern: parallel Flex app, copy non-secret setting names with secret values sourced from Azure only, smoke test, swap callers one by one, observe, then retire old Linux Consumption app.

Current readiness: READY_FOR_B1_IMPLEMENTATION_IN_SOURCE_REPO.
