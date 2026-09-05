# Runtime And Live Proofs

Last verified: 2026-08-27T00:49:22Z

Runtime app: `func-jm1-acs-email-relay`

Runtime release SHA: `f4029127403d26b976fa8a4234824d6f15814d3d`

Deployment notes:

- PR #655 merged AIC into the shared relay.
- PR #658 merged JSJ into the shared relay.
- Initial dependency-free package caused public route 404 after package-pointer update.
- Corrected package included production `node_modules`, was uploaded to `stjm1acsrelay/function-releases`, and restored live route responses.
- `JM1_RUNTIME_RELEASE_SHA` was corrected to the full merge SHA.

Route health:

| Probe | Result |
| --- | --- |
| `/api/send-author-acknowledgment` without relay key | 401 / `UNAUTHORIZED` |
| `/api/send-enterprise-governed-email` | ACTIVE |

Live route proofs:

| Probe | HTTP | Result |
| --- | --- | --- |
| JSJ valid internal proof `JSJ-ACS-SENDER-PROOF-20260827-005` | 202 | sender `jackie@email.jackiesmithjr.com`; Reply-To `jackie@jmerrill.one`; mailbox authority `jackie@jmerrill.one`; provider `acs-email` |
| JSJ with Publishing sender `JSJ-DENY-WRONG-SENDER-20260827-001` | 400 | `ACS_BRAND_SENDER_MISMATCH` |
| JMP using JSJ sender `JSJ-DENY-WRONG-CONTEXT-20260827-001` | 400 | `ACS_BRAND_SENDER_MISMATCH` |
| JSJ carrying divisional contract authority `JSJ-DENY-BOUNDARY-20260827-001` | 409 | `HUMAN_REVIEW_REQUIRED_JSJ_PERSONAL_BRAND_BOUNDARY` |
| AIC post-JSJ regression proof `AIC-POST-JSJ-REGRESSION-PROOF-20260827-001` | 202 | sender `aic@email.agapeic.org`; Reply-To `aic@agapeic.org`; mailbox authority `aic@agapeic.org`; provider `acs-email` |

Mailbox delivery readback:

The bounded Outlook current-mailbox search did not find `Personal-brand ACS sender commissioning proof` immediately after send. The live ACS relay acceptance response is preserved as the production send proof for this pass.
