# Exchange Scope

Last verified: 2026-08-27T17:15:42Z

## Application Access Policy

| Field | Value |
| --- | --- |
| App ID | `dc8d1429-8c1b-473b-83ca-f9545fad8074` |
| Access right | RestrictAccess |
| Scope group | `JM1 Publishing Mail Read Scope` |
| Description | Restrict JM1 ACS/mailbox readback to governed JM1 shared mailboxes in the JM1 Publishing Mail Read Scope group. |

## Scope Group

| Field | Value |
| --- | --- |
| Display name | `JM1 Publishing Mail Read Scope` |
| Primary SMTP | `jm1-publishing-mail-read-scope@jmerrillfoundation.onmicrosoft.com` |
| Recipient type | MailUniversalSecurityGroup |
| External directory object ID | `47b91fad-a641-471a-b77f-71e39fc2627e` |

## Members

| Member | SMTP | Type |
| --- | --- | --- |
| J Merrill Publishing | `publishing@jmerrill.one` | UserMailbox |
| Agape International Cathedral | `aic@agapeic.org` | SharedMailbox |

## Policy Test Results

| Identity | Result |
| --- | --- |
| `publishing@jmerrill.one` | Granted |
| `aic@jmerrill.one` | Granted |
| `aic@agapeic.org` | Granted |
| `jm1-admin@jmerrill.one` | Denied |

This confirms a narrow scoped repair rather than a tenant-wide mailbox read grant.

