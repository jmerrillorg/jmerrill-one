# JM1_RUNTIME_SUPPORT_POLICY_v1.0

Status: CANON-CANDIDATE

## Node

- Primary production baseline: Node 24 LTS.
- Node 22: permitted only as a documented Azure exception where the hosting plan does not support Node 24, especially Linux Consumption Functions.
- Node 26: compatibility lane only until Node 26 becomes LTS and JM1 validates it across repo, CI, Azure hosting, package dependencies, and rollback.

## Azure Functions

- Do not create new Linux Consumption Function Apps.
- Existing Linux Consumption Function Apps must have a Flex Consumption migration plan.
- Target runtime after hosting migration: Node 24 where supported.

## CI

- Build/test with the target production runtime.
- Optional next-major jobs may exist only as compatibility lanes and must not define production baseline.

## Runtime Drift

- Runtime major version must align across package engines, .nvmrc/.node-version, CI, and Azure runtime unless an exception record exists.
- Drift classes: REPO_ENGINE_DRIFT, CI_DRIFT, HOSTING_DRIFT, LOCAL_VALIDATION_DRIFT, AZURE_EXCEPTION.
