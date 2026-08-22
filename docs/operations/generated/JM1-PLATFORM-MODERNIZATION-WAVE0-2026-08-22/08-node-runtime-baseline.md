# Node Runtime Baseline

Canonical baseline: Node 24 LTS.

Validation runtime used in Wave 0:

- Node: v24.11.0
- npm: 11.6.1

Repo declarations:

- package.json engines: >=24 <25
- .nvmrc: 24
- CI normal workflow: NODE_VERSION 24
- CI guard added: production workflow fails if actual Node major is not 24.

Node 26 remains compatibility-only. No Node 26 production migration performed.
