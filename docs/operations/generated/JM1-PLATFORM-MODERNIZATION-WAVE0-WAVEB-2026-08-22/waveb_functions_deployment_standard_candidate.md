# Wave B Functions Deployment Standard Candidate

Status: CANON-CANDIDATE

- Node 24 is the target production runtime for new Azure Functions where the hosting plan supports it.
- Linux Consumption Node 22 is a temporary exception only.
- Flex Consumption deployments must use Flex-compatible package deployment and must not inherit WEBSITE_RUN_FROM_PACKAGE blindly.
- Parallel-app cutover is the rollback pattern because Flex deployment slots are not supported.
- Every Function migration must include trigger inventory, consumer register, secret architecture, App Insights validation, smoke proof, rollback register, and observation window.
