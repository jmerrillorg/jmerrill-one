# Enterprise Regression

Last verified: 2026-08-27T17:15:42Z

## Sender Policy

Command:

`node scripts/validate-aic-acs-sender-policy.mjs`

Result:

`AIC and JSJ ACS sender policy validation PASS`

## Diagnostic Runner

Focused validation:

`npm test -- --test-reporter=spec test/enterpriseMailboxReadbackHealth.test.js test/publishingMailboxReader.test.js`

Result:

37 / 37 PASS

Full Diagnostic Runner validation:

`npm test`

Result:

2194 / 2194 PASS

Local packaging caveat: local validation and package install emitted the existing Node engine warning because the local machine uses Node 26 while the runner declares Node `>=22 <25`. Production health reports Node `v22.23.2`.

