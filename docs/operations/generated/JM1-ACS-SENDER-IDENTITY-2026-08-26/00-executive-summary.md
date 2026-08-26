# JM1 ACS Sender Identity Commissioning Evidence

Last verified: 2026-08-26T16:13:13Z

## Scope

Policy: `JM1-ACS-SENDER-IDENTITY-v1`

Related policy: `JM1-HUMAN-FIRST-WHY-FIRST-v1`

Reference runtime: `func-jm1-acs-email-relay`

## Result

The decided JM1 ACS sender identities are provisioned in Azure Communication Services for:

- JM1: `one@email.jmerrill.one`
- JMP: `publishing@email.jmerrill.one`
- JMF: `financial@email.jmerrill.one`
- JMFN: `foundation@email.jmerrill.one`
- JMPRODUCTIONS: `productions@email.jmerrill.one`

`one@jmerrill.one` was added as an Exchange alias on `info@jmerrill.one`.

AIC sender identity remains Founder decision required and is not included in the completion denominator.

## Classification

`JM1_ACS_SENDER_IDENTITY_CONTROLLED_COMMISSIONING`

Reason: ACS sender usernames and relay enforcement are commissioned for the decided brands, but full mailbox readback could only be directly proven for Publishing with the currently delegated connector. Graph mailbox readback for the other mailboxes returned `ErrorAccessDenied`.

## No Unsafe External Communication

Live probes were internal diagnostic emails only. No customer, author, donor, member, vendor, royalty, or payment-response email was sent.
