# Exchange RBAC Effective Scope

Last verified: 2026-08-27T18:52:30Z

## Application Access Policy

| Field | Value |
| --- | --- |
| App ID | `dc8d1429-8c1b-473b-83ca-f9545fad8074` |
| Access right | `RestrictAccess` |
| Scope name | `JM1 Publishing Mail Read Scope` |
| Description | Restrict JM1 ACS/mailbox readback to governed JM1 shared mailboxes in the JM1 Publishing Mail Read Scope group. |

## Effective Access Tests

| Identity | Result |
| --- | --- |
| `publishing@jmerrill.one` | Granted |
| `aic@jmerrill.one` | Granted |
| `aic@agapeic.org` | Granted |
| `jm1-admin@jmerrill.one` | Denied |

## Result

The production service principal is restricted rather than tenant-wide, and AIC is inside the effective Exchange scope. The unrelated admin mailbox remains denied.

