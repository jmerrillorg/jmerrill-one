# Recipient Surface Proof

Last verified: 2026-08-27T17:15:42Z

Recipient surface evidence remains controlled:

| Evidence | Result |
| --- | --- |
| AIC mailbox exists in Exchange | PASS |
| AIC mailbox has folders/items in Exchange statistics | PASS |
| AIC outbound proof accepted by ACS | PASS |
| AIC runtime Reply-To | `aic@agapeic.org` |
| AIC folder readback through production Graph | FAIL / `ErrorAccessDenied` |

Because folder readback did not pass, the AIC recipient surface is not classified fully commissioned in this package.

