# AIC Mailbox Readback

Last verified: 2026-08-28T02:35:00Z

## Exchange trace

| Field | Value |
| --- | --- |
| MessageTraceId | `b7650d58-a81d-4b02-43d5-08df04ac4cd9` |
| Received | 2026-08-28T02:30:18.009Z |
| Sender | `aic@email.agapeic.org` |
| Recipient | `aic@agapeic.org` |
| Subject | Email confirmation |
| Status | Delivered |

Trace details:

- 2026-08-28T02:30:19.589Z: Message received by Exchange.
- 2026-08-28T02:30:22.905Z: The message was successfully delivered.

## Outlook shared mailbox readback

The Outlook connector returned the delivered message when the shared mailbox was addressed by its Microsoft mailbox UPN `aic@jmerrill.one`.

| Field | Value |
| --- | --- |
| Folder | Inbox |
| Subject | Email confirmation |
| Sender | `aic@email.agapeic.org` / Agape International Cathedral |
| Recipient | `aic@agapeic.org` / Agape International Cathedral |
| Received | 2026-08-28T02:30:22Z |
| Read state | unread |
| Attachments | false |

Listing by primary SMTP `aic@agapeic.org` continued to show folders but not message rows. Listing by UPN `aic@jmerrill.one` showed the Inbox item count and message. This is recorded as a connector addressing nuance, not a mailbox-readback failure.

