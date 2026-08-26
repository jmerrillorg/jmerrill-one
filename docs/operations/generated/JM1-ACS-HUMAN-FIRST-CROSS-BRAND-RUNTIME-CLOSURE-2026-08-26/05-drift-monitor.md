# Drift Monitor

Last verified: 2026-08-26T21:08:40Z

Drift event:

`ACS_SENDER_IDENTITY_ATTENTION_REQUIRED`

The shared relay and policy evidence establish the following drift classes:

| Drift class | Current behavior |
| --- | --- |
| wrong or missing sender | deny / attention required |
| wrong Reply-To | deny / attention required |
| missing One alias | attention required |
| wrong mailbox authority | attention required |
| hardcoded Publishing sender on another brand | deny with `ACS_BRAND_SENDER_MISMATCH` |
| brand/runtime mismatch | deny |
| duplicate signature/footer | deny |
| unknown brand | deny |
| AIC attempted without Founder authority | deny / Founder decision required |
| high-risk financial/legal message | human review required |
| Productions rights/contract message | human review required |
| Foundation promotional message without consent | deny |

The relay must not fall back to Publishing for other branches.
