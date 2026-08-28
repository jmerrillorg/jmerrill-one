# Policy Differential

Last verified: 2026-08-27T18:53:36Z

## Conditional Access / App Restriction

No evidence was found in this pass that a separate Conditional Access or Graph policy differentiates AIC from Publishing for the production managed identity.

The material access-control evidence is the Exchange Application Access Policy:

- Publishing: Granted
- AIC UPN: Granted
- AIC primary SMTP: Granted
- Unrelated admin mailbox: Denied

## Domain / Identifier Differential

AIC has:

- Primary SMTP: `aic@agapeic.org`
- UPN: `aic@jmerrill.one`
- Object ID: `516ec810-7be4-4bfe-97b4-7d7756732111`

The production route selected `aic@agapeic.org` and Graph folder readback passed. Therefore:

`IDENTIFIER_CAUSE_RULED_OUT = YES`

## Licensing

- Publishing: licensed user mailbox.
- AIC: unlicensed shared mailbox.
- AIC mailbox size: 339.4 KB.
- AIC quota: 50 GB send/receive.

`SHARED_MAILBOX_LICENSE_REQUIRED = NOT_PROVEN`

`LICENSE_CAUSAL = NO`

