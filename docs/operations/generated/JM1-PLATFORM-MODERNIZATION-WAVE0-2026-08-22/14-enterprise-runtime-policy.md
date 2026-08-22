# JM1_RUNTIME_SUPPORT_POLICY_v1.0

Status: CANON-CANDIDATE

## Node

- Primary production baseline: Node 24 LTS.
- Node 22: documented Azure exception only, primarily Linux Consumption Functions until Flex migration.
- Node 26: compatibility lane only until LTS and JM1 validation.

## Azure Functions

- No new Linux Consumption workloads.
- Existing Linux Consumption workloads require migration records.
- Correct migration sequence: Linux Consumption -> Flex Consumption -> Node 24.

## CI

- Normal production CI must fail if actual Node major is not 24.
- Nonblocking Node 26 compatibility may be added later.

## Storage

- New production storage accounts must use minimum TLS >= 1.2 and secure transfer required.
