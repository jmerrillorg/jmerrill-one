# JM1 Azure Functions Hosting Standard v1

Status: CANON-CANDIDATE

Canonical runtime: Node 24 LTS where Azure Functions hosting supports it.

Allowed exceptions:

- Existing Linux Consumption Node 22 Functions until migrated.
- Workloads with unresolved dependency, timeout, trigger, or source-repo gates.

Required evidence for promotion:

- Runtime baseline.
- Trigger inventory.
- Consumer register.
- Secret architecture.
- App Insights validation.
- Cost guardrail.
- Rollback path.
- Production smoke proof.

Promotion state after this package: not yet canonical because B1/B2/B3 cutovers were not completed.
