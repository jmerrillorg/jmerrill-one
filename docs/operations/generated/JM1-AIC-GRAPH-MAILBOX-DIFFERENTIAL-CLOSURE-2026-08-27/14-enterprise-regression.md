# Enterprise Regression

Last verified: 2026-08-27T18:56:11Z

## Sender Policy

Prior PR #21 validation remains preserved:

- AIC/JSJ sender policy validation: PASS
- Diagnostic Runner focused mailbox tests: 37 / 37 PASS
- Diagnostic Runner full tests: 2194 / 2194 PASS

## Production Readback

| Control | Result |
| --- | --- |
| Publishing mailbox readback | PASS |
| AIC mailbox readback | PASS |
| Wrong-brand sender route | No change in this pass |
| Reply-To canon | AIC remains `aic@agapeic.org` |
| AIC ACS From canon | AIC remains `aic@email.agapeic.org` |

## Drift

`ACTIVE_SENDER_DRIFT = 0`

## ACS Relay Runtime Drift

The ACS relay host returned HTTP 503 for `/api/health` and for the controlled proof-send attempt during this pass. The run-from-package blob is reachable, and the app is reported as `Running` by Azure, but HTTP and SCM logstream both returned unavailable. This blocks final AIC proof resend/readback and should be handled as ACS relay availability follow-up, not as an AIC mailbox-readback defect.

