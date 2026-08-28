# Post-Repair Proof

Last verified: 2026-08-27T18:56:11Z

## Folder Readback

| Probe | Result |
| --- | --- |
| AIC `/mailFolders` | 200 / PASS |
| AIC `/mailFolders/inbox/messages` | 200 / PASS |
| AIC `/mailFolders/sentitems/messages` | 200 / PASS |

## Folder Counts

AIC returned eight folders:

- Archive
- Conversation History
- Deleted Items
- Drafts
- Inbox
- Junk Email
- Outbox
- Sent Items

All currently reported zero items in the production route folder summary, while Exchange statistics reported six total items. This is not a folder-access failure.

## Existing Proof Search

- Search string: `AIC-POST-JSJ-REGRESSION-PROOF`
- Window: after `2026-08-27T00:00:00Z`
- Probe: PASS
- Match count: 0

## Controlled Resend

- Attempted: YES
- Accepted by ACS: NO
- Result: HTTP 503 text response, `The service is unavailable.`
- Public/member recipient: NO
- Mailbox mutation: NO

## AIC Proof Status

The AIC folder readback problem is resolved. The final recipient-surface proof remains incomplete because ACS relay was unavailable before accepting the controlled proof resend.

