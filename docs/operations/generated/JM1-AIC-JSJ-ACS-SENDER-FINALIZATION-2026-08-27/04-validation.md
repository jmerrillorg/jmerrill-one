# Validation

Last verified: 2026-08-27T00:49:22Z

## Enterprise Policy Validation

Command:

`node scripts/validate-aic-acs-sender-policy.mjs`

Result:

`AIC and JSJ ACS sender policy validation PASS`

## Relay Runtime Validation

Executed under Node 24.19.0.

Commands:

- `npm run test:node-guard`
- `npm run lint`
- `npm test`

Results:

| Check | Result |
| --- | --- |
| Node 24 guard | PASS |
| Syntax/lint check | PASS |
| Relay tests | 89 / 89 PASS |

Coverage added:

- JSJ correct sender accepted only for `JSJ`.
- JSJ wrong JM1/JMP/JMF/JMFN/JMPRODUCTIONS/AIC sender denied.
- JMP/JMF/AIC using JSJ sender denied.
- JSJ personal-brand message with divisional legal/financial/contract/royalty/rights authority requires human review.
- AIC still passes post-JSJ regression proof.
- Duplicate signature guard remains active.
- Internal system language guard remains active.
