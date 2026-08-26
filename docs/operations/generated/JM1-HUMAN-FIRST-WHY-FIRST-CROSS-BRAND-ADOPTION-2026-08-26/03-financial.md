# J Merrill Financial Adoption Evidence

Last verified: 2026-08-26T15:57:26Z

## Repository

`jmerrillorg/jmerrill-financial`

Branch: `codex/jmf-human-first-runtime-20260826`

## Files

- `api/shared/humanFirstWhyFirstPolicy.js`
- `api/shared/pilotRuntime.js`
- `scripts/human_first_why_first_tests.mjs`
- `package.json`

## Classification

`CONTROLLED_GUARD_READY`

The Financial branch has an existing communication gate. The Human-First / Why-First policy is now evaluated before queued communication is authorized when message content is present.

Live outbound Financial commissioning remains `NOT_PROVEN` in this pass.

## Validation

`pnpm run test:human-first`: PASS

`pnpm run build`: PASS

Engine warning observed because local Node was v26 while the repo declares Node `>=24 <25`.

## Negative Proof

Financial communications sent: 0

Financial Dataverse writes: 0

Financial public deployment: 0
