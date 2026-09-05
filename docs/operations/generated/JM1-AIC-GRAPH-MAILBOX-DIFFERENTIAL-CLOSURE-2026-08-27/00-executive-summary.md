# JM1 AIC Graph Mailbox Differential Closure

Last verified: 2026-08-27T18:56:11Z

## Objective

Differentiate the working Publishing mailbox from the previously failing AIC mailbox using the same production Graph Mail.Read runtime path, Exchange mailbox evidence, and scoped Exchange authorization.

## Result

| Item | Result |
| --- | --- |
| PR #21 | MERGED |
| PR #21 merge SHA | `18c52aaa3960c7a168d2981f38aeda222d394d51` |
| Publishing control mailbox folder readback | PASS |
| AIC mailbox folder readback | PASS |
| AIC Inbox readback | PASS |
| AIC Sent Items readback | PASS |
| AIC mailbox provisioning | FULLY PROVISIONED SHARED MAILBOX |
| AIC Exchange Application Access Policy | GRANTED |
| Identifier cause | RULED OUT |
| Microsoft escalation | NOT REQUIRED |
| Existing proof located | NO |
| Controlled proof resend | ATTEMPTED / BLOCKED BY ACS RELAY 503 BEFORE ACCEPTANCE |

## Classification

Primary root cause:

`AIC_GRAPH_AUTHORIZATION_DEFECT`

The prior 403 condition cleared without application-code change after the scoped Exchange authorization repair. Current evidence supports a Graph/Exchange authorization enforcement/propagation condition rather than mailbox provisioning, identifier routing, or application route logic.

AIC:

`AIC_MAILBOX_READBACK_CONTROLLED_COMMISSIONING`

Reason: folder readback now passes, but full AIC ACS sender commissioning still requires a controlled proof message to be present and readable. The proof resend could not complete because the ACS relay host returned HTTP 503.

Enterprise ACS:

`JM1_ACS_SENDER_IDENTITY_CONTROLLED_COMMISSIONING`

Reason: AIC mailbox readback is healthy, but the final AIC proof send/readback could not be completed while the ACS relay host was unavailable.

