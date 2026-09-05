# J Merrill Productions Adoption Evidence

Last verified: 2026-08-26T15:57:26Z

## Repository

`jmerrillorg/jmerrill-productions`

Branch: `codex/jmproductions-human-first-runtime-20260826`

## Files

- `lib/humanFirstWhyFirstPolicy.ts`
- `app/api/health/route.ts`
- `scripts/human_first_why_first_tests.mjs`
- `package.json`

## Classification

`PRE_PUBLISH_GUARD_READY`

No live outbound communication sender runtime was found in this pass.

Live send/runtime commissioning is therefore `SEPARATE_WAVE_REQUIRED`.

## Validation

`pnpm run test:human-first`: PASS

`pnpm run build`: PASS

Engine warning observed because local Node was v26 while the repo declares Node `>=24 <25`.

## Negative Proof

Productions communications sent: 0

Productions Dataverse writes: 0

Productions public deployment: 0
