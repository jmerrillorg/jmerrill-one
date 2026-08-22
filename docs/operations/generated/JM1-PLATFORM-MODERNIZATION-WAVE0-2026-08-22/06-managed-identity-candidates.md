# Managed Identity Candidates

No bounded Managed Identity conversions were completed in Wave 0.

Candidates deferred:

- One/Financial/Foundation/Productions/Jackie App Services: identity currently absent; evaluate dependency-specific MI conversion later.
- Functions using storage account keys: move toward managed identity/RBAC where Functions plan/runtime and extension support permit.
- Dataverse consumers: evaluate application user + certificate or workload identity patterns; do not redesign during Wave 0.
- AIC GitHub deployment: OIDC/federated identity is the correct near-term target.
