# Runtime Equivalence Proof

## Compared Authorities

- Canonical main: `914176bed4bfa59dc906209e72a504c3246f0b10`
- Deployed release: `4c636acdbbbc414a465d7e29efcf2cc0dd5f25cf`
- Build/package authority: `4c636acdbbbc414a465d7e29efcf2cc0dd5f25cf`

## Classification

`RUNTIME_EQUIVALENCE = RUNTIME_EQUIVALENT / EVIDENCE_ONLY`

The main-only delta adds 19 credential-monitor evidence files and changes no runtime, source, package, public asset, configuration, or deployment-workflow path. Production health reports the exact deployed SHA, and deployment run `35411529302` passed every build/package/deploy/health step.

A clean canonical-main build completed successfully, including TypeScript and all 16 generated application routes. The validation shell used Node 22/npm 10 and therefore emitted an engine warning because the repository correctly requires Node 24/npm 11; production itself is on Node 24.

`npm audit --omit=dev` found one transitive moderate advisory and no high or critical production findings. The full development audit found seven transitive findings. These are normal dependency-currency follow-up, not evidence of production release drift and not a reason to deploy solely to equalize SHAs.

## Decision

Do not deploy canonical main merely to equalize the evidence SHA with the application release.
