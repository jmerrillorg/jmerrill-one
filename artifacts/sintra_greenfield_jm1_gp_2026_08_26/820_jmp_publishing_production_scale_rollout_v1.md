# JMP Publishing Production-Scale Rollout v1

Generated: 2026-09-05T01:49:03Z

## Result

`JMP_PUBLISHING_PRODUCTION_SCALE_ROLLOUT_RUNTIME_DEPLOYED`

The Publishing Marketing OS has moved out of proof-only mode for the daily control loop. The deployed runtime now carries production-scale business controls for Strategies for Success, September schedule preservation, catalog health, exception-only governance, branch isolation, acquisition/reader gates, and outcome measurement baseline.

This step did not publish new platform content, delete scheduled posts, activate Financial, or use Sintra/browser execution as a routine runtime.

## Deployment

- Function App: `func-jm1-marketing-runtime`
- Resource Group: `rg-jm1-ai`
- Source commit: `6bb9bf209a1aac71882ed8acc315d3f58be464b0`
- Package SHA-256: `a690bb5195b75bce8eeb9c06bc92fca4c179edcf2f0bb7e414f409d3435c967d`
- Runtime: `Running`
- HTTPS-only: `true`
- Node runtime: `Node|22`
- Visible timers: `creativeWorkProcessorTimer`, `credentialMonitorTimer`, `marketingControlLoopTimer`, `socialExecutionWorkerTimer`

## Runtime Controls Added

- `Strategies for Success in Educational Leadership` remains the Sep. 22, 2026 P0 Title/Author campaign.
- Founder CTA remains `https://amzn.to/4y4udRZ`.
- `The Shift: Changing with God` remains `NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT`.
- Valid already scheduled September objects are preserved instead of duplicated.
- Readback/media mismatch states are held rather than certified.
- Routine waits, including LinkedIn external review, are suppressed from Founder action unless they become actionable.
- Publishing remains the first runtime consumer of the JM1 shared marketing engine.
- Financial remains `CONFIGURED_NOT_ACTIVATED`.
- October/Iyorwuese remains next/pre-staged during September.

## Verification

- Syntax check: PASS
- Marketing OS regression suite: PASS, 32 passed, 0 failed
- LinkedIn runtime regression suite: PASS, 7 passed, 0 failed
- App Insights exceptions in last 24 hours: 0
- Recent social worker: succeeded, Meta authority verified, LinkedIn held for product review, no eligible rows, zero platform objects created

## Classification

- `JMP_PUBLISHING_PRODUCTION_SCALE_ROLLOUT_RUNTIME_DEPLOYED`
- `JMP_PRODUCTION_SCALE_CONTROL_SURFACE_IMPLEMENTED`
- `JMP_EXCEPTION_ONLY_GOVERNANCE_IMPLEMENTED`
- `JMP_SEPTEMBER_EXISTING_SCHEDULE_PRESERVATION_GUARD_IMPLEMENTED`
- `JMP_THE_SHIFT_NEW_RELEASE_PROTECTION_PRESERVED`
- `LINKEDIN_EXTERNAL_REVIEW_ONLY_PRESERVED`

## Not Yet Claimed

`JMP MARKETING LIFECYCLE - AUTONOMOUSLY OPERATIONAL AT PRODUCTION SCALE` is not asserted by this package alone.

This package deploys the production-scale controls and verifies runtime health. Final certification still requires natural timer observation against real Dataverse rows and continued evidence that routine Founder/Cody marketing touch remains zero.
