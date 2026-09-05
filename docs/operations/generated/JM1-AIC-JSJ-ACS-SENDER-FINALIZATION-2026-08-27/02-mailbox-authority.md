# Mailbox Authority Evidence

Last verified: 2026-08-27T00:49:22Z

## JSJ Reply Authority

Microsoft Graph user readback:

| Field | Value |
| --- | --- |
| Display name | Jackie Smith, Jr. |
| User principal name | `jackie@jmerrill.one` |
| Mail | `jackie@jmerrill.one` |
| Primary SMTP | `SMTP:jackie@jmerrill.one` |

Observed proxy addresses:

- `SMTP:jackie@jmerrill.one`
- `smtp:jackie@jmerrill.financial`
- `smtp:jackie@jmerrill.org`

Disposition:

`jackie@jmerrill.one` is a Microsoft 365 user mailbox and is the governed JSJ human reply mailbox authority.

## AIC Reply Authority

Domain readback:

| Domain | Result |
| --- | --- |
| `agapeic.org` | Microsoft Graph domain exists and is verified |
| Supported services | Email |

AIC shared-mailbox delegated folder readback:

| Check | Result |
| --- | --- |
| Outlook shared mailbox folders for `aic@agapeic.org` | NOT_FOUND / `Default folder Root not found` |
| Microsoft Graph `/users/aic@agapeic.org` | NOT_FOUND |

Disposition:

AIC outbound sender runtime is proven and the domain is verified, but the shared mailbox remains in controlled status until Exchange/delegated folder readback is visible through the governed connector path. This does not change the approved sender identity:

- From: `aic@email.agapeic.org`
- Reply-To: `aic@agapeic.org`
