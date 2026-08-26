# JM1 ACS Sender Identity Policy v1

Status: CANON

Effective date: 2026-08-26

Authority: Jackie Smith, Jr. — Governance Authority

Policy ID: `JM1-ACS-SENDER-IDENTITY-v1`

Executable policy: YES

Related policy: `JM1-HUMAN-FIRST-WHY-FIRST-v1`

## Purpose

Every JM1 ACS email must use the correct brand sender, reply path, mailbox authority, and signature profile. Sender identity is a trust boundary, not a template detail.

## System Of Record

The Enterprise ACS Sender Registry is the canonical brand communication identity authority.

Azure Communication Services is the outbound email transport.

Exchange Online is the human reply mailbox authority.

An Exchange alias is a public reply-routing address only when explicitly governed.

Templates are not sender authority.

## Sender Registry

| Brand | ACS From | Public Reply-To | Mailbox authority | Address type | Inbound processing mailbox | CC/archive |
| --- | --- | --- | --- | --- | --- | --- |
| JM1 | `one@email.jmerrill.one` | `one@jmerrill.one` | `info@jmerrill.one` | ALIAS | `info@jmerrill.one` | Not required |
| JMP | `publishing@email.jmerrill.one` | `publishing@jmerrill.one` | `publishing@jmerrill.one` | MAILBOX | `publishing@jmerrill.one` | `publishing@jmerrill.one` required |
| JMF | `financial@email.jmerrill.one` | `financial@jmerrill.one` | `financial@jmerrill.one` | MAILBOX | `financial@jmerrill.one` | Not required |
| JMFN | `foundation@email.jmerrill.one` | `foundation@jmerrill.one` | `foundation@jmerrill.one` | MAILBOX | `foundation@jmerrill.one` | Not required |
| JMPRODUCTIONS | `productions@email.jmerrill.one` | `productions@jmerrill.one` | `productions@jmerrill.one` | MAILBOX | `productions@jmerrill.one` | Not required |

AIC sender identity is not decided in this policy. AIC ACS sender requests must fail closed or route to a Founder decision until explicitly governed.

## J Merrill One Alias Rule

`one@jmerrill.one` is not a standalone Exchange mailbox.

It is a public alias on `info@jmerrill.one`.

Mailbox operations, Graph readback, and inbound processing must use `info@jmerrill.one` unless a later governed decision creates a standalone One mailbox.

## Fail-Closed Rules

Missing brand: DENY.

Unknown brand: DENY.

Wrong ACS sender for brand: DENY with `ACS_BRAND_SENDER_MISMATCH`.

Wrong Reply-To for brand: DENY with `ACS_REPLY_TO_MISMATCH`.

Missing required Publishing CC/archive copy: DENY with `ACS_CC_ARCHIVE_MISSING`.

Duplicate signature/footer block: DENY.

AIC sender request: DENY or HUMAN_GATE with `AIC_SENDER_IDENTITY_FOUNDER_DECISION_REQUIRED`.

No branch may fall back to the Publishing sender.

Reply-To must be resolved from this registry, not derived from the ACS sender address.

## Pre-Send Sequence

Human-facing send validation must proceed in this order:

1. Relationship context
2. Brand resolution
3. ACS sender registry
4. Human-First / Why-First policy
5. Brand voice
6. Identity validation
7. Content and risk validation
8. Send

## Signature Profiles

| Brand | Organization display name | Signature name | Public contact | Website |
| --- | --- | --- | --- | --- |
| JM1 | J Merrill One | J Merrill One | `one@jmerrill.one` | `jmerrill.one` |
| JMP | J Merrill Publishing | The Publishing Team | `publishing@jmerrill.one` | `jmerrill.pub` |
| JMF | J Merrill Financial | J Merrill Financial | `financial@jmerrill.one` | `jmerrill.financial` |
| JMFN | J Merrill Foundation | J Merrill Foundation | `foundation@jmerrill.one` | `jmerrillfoundation.org` |
| JMPRODUCTIONS | J Merrill Productions | J Merrill Productions | `productions@jmerrill.one` | `jmerrill.productions` |

Signature profiles must not be inferred from the From address.

## Drift Monitor

Runtime and governance checks must detect:

- wrong From;
- wrong Reply-To;
- wrong mailbox authority;
- missing sender configuration;
- duplicate sender;
- sender not configured or verified in ACS;
- missing alias;
- alias attached to the wrong mailbox;
- hardcoded Publishing sender in a cross-brand path;
- unknown brand;
- duplicate footer;
- sender registry/runtime mismatch.

Detected drift must surface `ACS_SENDER_IDENTITY_ATTENTION_REQUIRED` with brand, expected value, actual value, runtime, and next action.
