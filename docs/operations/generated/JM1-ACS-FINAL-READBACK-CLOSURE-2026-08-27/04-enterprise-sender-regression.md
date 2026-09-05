# Enterprise Sender Regression

Last verified: 2026-08-27T10:16:14Z

Validation commands:

- `node scripts/validate-aic-acs-sender-policy.mjs`
- Inline registry regression over all seven brands in `docs/governance/JM1-ACS-SENDER-IDENTITY-v1.policy.json`

Results:

| Check | Result |
| --- | --- |
| Valid brand senders | 7 / 7 ALLOW |
| Cross-brand senders | 42 / 42 DENY |
| Unknown brand | 7 / 7 DENY |
| Wrong Reply-To | 7 / 7 DENY |
| AIC sender | PASS / `aic@email.agapeic.org` |
| JSJ sender | PASS / `jackie@email.jackiesmithjr.com` |
| Registry-driven assertion | PASS |

The registry resolves:

| Brand | Sender |
| --- | --- |
| AIC | `aic@email.agapeic.org` |
| JSJ | `jackie@email.jackiesmithjr.com` |

No universal `@email.jmerrill.one` construction rule was used for AIC or JSJ.

