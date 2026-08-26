# ACS Relay Runtime Evidence

Last verified: 2026-08-26T16:13:13Z

Repository: `jmerrillorg/jmerrill-pub`

Branch: `codex/jmp-acs-sender-identity-20260826`

Runtime package: `azure-functions/acs-email-relay`

## Runtime Change

Added executable sender registry module:

`azure-functions/acs-email-relay/src/policy/acsSenderRegistry.js`

The existing Publishing relay routes now resolve Publishing sender and reply identity through the registry rather than relying only on local constants.

## Guard Behavior

The registry enforces:

- missing brand denied;
- unknown brand denied;
- AIC sender request denied / human gate;
- wrong-brand sender denied with `ACS_BRAND_SENDER_MISMATCH`;
- wrong Reply-To denied with `ACS_REPLY_TO_MISMATCH`;
- missing Publishing archive CC denied with `ACS_CC_ARCHIVE_MISSING`;
- duplicate signature denied with `ACS_DUPLICATE_SIGNATURE_BLOCKED`.

## Validation

`npm test`: 70 / 70 PASS

`npm run lint`: PASS

No customer/author send was executed by the relay test suite.
