# Validation

Last verified: 2026-08-26T23:16:24Z

## Enterprise Policy Validation

Repository: `jmerrillorg/jmerrill-one`

Branch: `codex/aic-acs-sender-finalization-20260826`

Command:

`node scripts/validate-aic-acs-sender-policy.mjs`

Result:

`AIC ACS sender policy validation PASS`

## Shared ACS Relay Validation

Repository: `jmerrillorg/jmerrill-pub`

Branch: `codex/aic-acs-relay-runtime-20260826`

Commands:

- `npm run lint`
- `npm test`

Result:

| Suite | Result |
| --- | --- |
| Syntax lint | PASS |
| ACS relay tests | 84 / 84 PASS |

New/updated AIC regression coverage:

- AIC is a decided enterprise sender profile.
- AIC uses `aic@email.agapeic.org`.
- AIC Reply-To is `aic@agapeic.org`.
- AIC cannot use Publishing sender.
- AIC cannot use One sender.
- AIC wrong participant/event context denies.
- AIC Planning Center sender-authority misuse denies.
- AIC sensitive pastoral/legal/financial context requires human review.
- AIC duplicate signature denies.
- AIC permits one signature in each multipart body representation.

Node caveat:

Local validation ran under Node 26. The ACS relay declares Node `>=24 <25`; this produced an engine warning only. Tests and lint passed.
