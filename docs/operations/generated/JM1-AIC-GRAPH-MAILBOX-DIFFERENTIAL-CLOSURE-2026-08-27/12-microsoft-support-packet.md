# Microsoft Support Packet

Last verified: 2026-08-27T18:56:11Z

## Required

NO

## Reason

The prior AIC Graph `ErrorAccessDenied` condition is no longer reproducible through the production route. Current production Graph mailbox folder, Inbox, and Sent Items probes pass for AIC using the same Diagnostic Runner managed identity.

## Escalation If The Defect Recurs

Preserve these non-secret facts for Microsoft support if AIC returns to 403:

- Tenant: `352d075e-8e17-4169-9f8e-22e6946ce66d`
- Runtime: `func-jm1-diagnostic-ai-runner`
- Managed identity app ID: `dc8d1429-8c1b-473b-83ca-f9545fad8074`
- Managed identity object ID: `e8c51a80-bdb0-46fa-b398-9109719d6427`
- Working control: `publishing@jmerrill.one`
- Failing mailbox: `aic@agapeic.org`
- AIC object ID: `516ec810-7be4-4bfe-97b4-7d7756732111`
- AIC ExchangeGuid: `6e135ebb-0e16-4059-9e91-9a2d9fefdbe4`
- Exchange Application Access Policy result for AIC: Granted

No confidential message content or raw token should be included.

