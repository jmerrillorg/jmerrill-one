# Publishing Reference Readback

Last verified: 2026-08-26T15:57:26Z

## Repository

`jmerrillorg/jmerrill-pub`

Current canonical main observed: `a96a7134`

Prior production release pinned in evidence: `1c263018312ece2d4dd5dc767d6265ea1860b526`

## Regression Tests

`node --test scripts/author_communication_brand_guard.test.mjs scripts/author_review_package_engine.test.mjs`: 37 / 37 PASS

`npm test` in `azure-functions/acs-email-relay`: 62 / 62 PASS

The ACS relay suite includes a duplicate author-facing signature rejection test.

## Microsoft 365 Readback

Mailbox: `publishing@jmerrill.one`

Folder: Inbox

Subject: `Corrected Developmental Review - The General's Will and Last Testament`

Received: `2026-08-26T15:15:47Z`

Sender: `publishing@email.jmerrill.one`

Recipient: `hagher.hagher@ymail.com`

CC: `publishing@jmerrill.one`

Attachments: present

## Historical Artifact Caveat

The stored body of this already-sent message includes a duplicate Publishing signature block. This readback is preserved as production evidence and was not mutated or resent.

Current guard state remains PASS because duplicate author-facing signatures are rejected by the ACS relay validation suite.
