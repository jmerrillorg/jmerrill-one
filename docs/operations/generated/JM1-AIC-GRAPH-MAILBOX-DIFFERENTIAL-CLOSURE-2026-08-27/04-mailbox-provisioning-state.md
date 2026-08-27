# Mailbox Provisioning State

Last verified: 2026-08-27T18:52:30Z

## Classification

`A. fully provisioned shared mailbox`

## Evidence

- RecipientTypeDetails: `SharedMailbox`
- IsMailboxEnabled: true
- ExchangeGuid present: `6e135ebb-0e16-4059-9e91-9a2d9fefdbe4`
- MailboxGuid present: `6e135ebb-0e16-4059-9e91-9a2d9fefdbe4`
- Database assigned: `namprd15.prod.outlook.com/f72a11e0-8e14-4b73-93c0-413c3795c80a`
- ServerName surfaced: `ph7pr15mb6081`
- Get-MailboxStatistics returned item count and size.
- Production Graph `/mailFolders`, `/mailFolders/inbox/messages`, and `/mailFolders/sentitems/messages` now return PASS.

## Ruled Out

- Mail-enabled contact-like object: NO
- Partially provisioned shared mailbox: NO
- Backend mailbox store missing: NO
- Soft-deleted mailbox: NO
- Inactive mailbox: NO

