# Exchange Alias And Mailbox Evidence

Last verified: 2026-08-26T16:13:13Z

## J Merrill One

Public reply-to: `one@jmerrill.one`

Actual mailbox authority: `info@jmerrill.one`

Address type: ALIAS

Exchange result: `one@jmerrill.one` is present as `smtp:one@jmerrill.one` on mailbox `info@jmerrill.one`.

Duplicate proxy check: Graph returned exactly one user with `smtp:one@jmerrill.one`: `info@jmerrill.one`.

Graph/readback authority: `info@jmerrill.one`

## Branch Mailboxes

Graph verified these mailbox identities:

- `publishing@jmerrill.one`
- `financial@jmerrill.one`
- `foundation@jmerrill.one`
- `productions@jmerrill.one`

## Readback Limitation

Direct Graph message readback for `info@jmerrill.one`, `publishing@jmerrill.one`, `financial@jmerrill.one`, `foundation@jmerrill.one`, and `productions@jmerrill.one` returned `ErrorAccessDenied` under the Azure CLI token.

The Outlook shared-mailbox connector successfully read `publishing@jmerrill.one` and confirmed the Publishing probe. The same connector did not expose delegated stores for `info@jmerrill.one` or `financial@jmerrill.one` in this pass.
