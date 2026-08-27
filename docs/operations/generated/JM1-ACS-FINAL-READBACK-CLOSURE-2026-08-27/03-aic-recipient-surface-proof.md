# AIC Recipient Surface Proof

Last verified: 2026-08-27T10:16:14Z

Existing AIC outbound proof remains preserved from the prior commissioning package:

| Proof | Result |
| --- | --- |
| `AIC-POST-JSJ-REGRESSION-PROOF-20260827-001` | ACS accepted / HTTP 202 |
| Sender | `aic@email.agapeic.org` |
| Reply-To | `aic@agapeic.org` |
| Mailbox authority | `aic@agapeic.org` |
| Provider | `acs-email` |

Current recipient-surface readback:

| Check | Result |
| --- | --- |
| Existing proof located in AIC mailbox | NO / folder readback blocked |
| Existing proof located in signed-in Outlook mailbox by proof reference | NO |
| New proof resent | NO |

Reason no resend occurred:

The AIC mailbox/folder readback path remains blocked. Sending another diagnostic proof would only create another outbound accepted event without proving the actual recipient surface. The appropriate residual action is to repair delegated Graph/shared-mailbox folder access, then re-run readback against the existing proof or one new controlled proof if still necessary.

Current AIC status:

`CONTROLLED_COMMISSIONING`

