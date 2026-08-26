# Mailbox Authority Evidence

Last verified: 2026-08-26T21:08:40Z

Microsoft Graph directory readback confirmed the governed mailbox authorities:

| Address | Display name | Mail | Proxy / alias evidence |
| --- | --- | --- | --- |
| `info@jmerrill.one` | JM1 Info | `info@jmerrill.one` | includes `smtp:one@jmerrill.one` |
| `publishing@jmerrill.one` | J Merrill Publishing | `publishing@jmerrill.one` | primary SMTP |
| `financial@jmerrill.one` | J Merrill Financial | `financial@jmerrill.one` | primary SMTP |
| `foundation@jmerrill.one` | J Merrill Foundation | `foundation@jmerrill.one` | primary SMTP |
| `productions@jmerrill.one` | J Merrill Productions | `productions@jmerrill.one` | primary SMTP |

J Merrill One alias rule:

`one@jmerrill.one` is a public alias on `info@jmerrill.one`; it is not treated as a separate mailbox authority.

Mailbox readback:

| Mailbox | Connector readback | Result |
| --- | --- | --- |
| `publishing@jmerrill.one` | Outlook shared mailbox connector | PASS; received `Publishing email check` from `publishing@email.jmerrill.one` at `2026-08-26T21:08:40Z` |
| `info@jmerrill.one` | Outlook shared mailbox connector | ACCESS_LIMITED; connector returned default-folder not found |
| `financial@jmerrill.one` | Outlook shared mailbox connector | ACCESS_LIMITED; connector returned default-folder not found |
| `foundation@jmerrill.one` | Outlook shared mailbox connector | ACCESS_LIMITED; connector returned default-folder not found |
| `productions@jmerrill.one` | Outlook shared mailbox connector | ACCESS_LIMITED; connector returned default-folder not found |

The non-Publishing readback limitation is connector/delegated-store access evidence, not sender-runtime failure evidence. ACS accepted the live synthetic sends for those brands and Graph confirmed their mailbox authority objects exist.
