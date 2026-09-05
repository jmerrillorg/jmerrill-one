# JM1 Canon Enforcement & Runtime Policy Layer v1.0

Status: CANON

Effective date: 2026-08-25

Authority: Jackie Smith, Jr. — Governance Authority

## Purpose

JM1 canon must be executable policy, not only approved documentation.

Every governed runtime that performs a material action must resolve the applicable canon before mutation, execute only when the policy decision permits it, read back the result where applicable, and preserve evidence.

## Standard Decision Contract

Every resolver must return the same policy decision shape:

- `POLICY`
- `POLICY_VERSION`
- `DECISION`
- `AUTHORITY_SOURCE`
- `SOURCE_RECORD`
- `EVIDENCE`
- `REASON`
- `OVERRIDE_ALLOWED`
- `OVERRIDE_REQUIRED`
- `OVERRIDE_AUTHORITY`
- `LEGACY_ALLOWED`
- `MUTATION_ALLOWED`

Allowed decisions:

- `ALLOW`
- `ALLOW_WITH_DEFAULT`
- `HUMAN_GATE`
- `EXTERNAL_DEPENDENCY`
- `DENY`
- `LEGACY_RECONCILIATION_ONLY`

## Required Resolver Families

- `resolvePaymentAuthority`
- `resolveCommunicationAuthority`
- `resolveIdentityAuthority`
- `resolveArtifactAuthority`
- `resolveEditorialStageAuthority`
- `resolvePublicationIntentAuthority`
- `resolveProductionAuthority`
- `resolveDistributionAuthority`
- `resolveCadenceAuthority`
- `resolveWaitingOnAuthority`
- `resolveLegacySystemAuthority`
- `assertHumanFirstWhyFirst`

## Execution Principle

Canon resolution precedes model reasoning.

Chad, Cody, and future agents may determine who should act and how a task should be executed, but the runtime policy layer determines whether the action is allowed.

Executors must consume the resolver result and must not duplicate policy logic locally when a canonical resolver exists.

## First Publishing Enforcement Domains

The first consuming implementation is J Merrill Publishing.

Required Publishing enforcement domains:

- payment authority;
- communication authority;
- human-first / why-first output enforcement;
- author/title identity authority;
- author-facing artifact safety;
- artifact supersession;
- editorial gates;
- cadence;
- publication intent;
- Full Wrap / production authority;
- waiting-on classification;
- legacy routing.

## Legacy System Model

Legacy systems must be classified before use:

- `ACTIVE_CANONICAL`
- `GRANDFATHERED_ACTIVE`
- `READ_ONLY_EVIDENCE`
- `MIGRATION_REQUIRED`
- `PROHIBITED_FOR_NEW_WORK`

For Publishing payments, Stripe is canonical for new work. MoonClerk is legacy/grandfathered evidence only and must not be used as a fallback for new Publishing commercial activity.

## Communication Canon

Publishing author-facing email must use:

- From: `publishing@email.jmerrill.one`
- Reply-To: `publishing@jmerrill.one`
- CC: `publishing@jmerrill.one`
- Format: HTML

NoReply and plain-text-only author-facing Publishing mail are prohibited.

## Boundary

This canon document does not itself perform runtime mutation, schema mutation, Business Central posting, payment creation, author communication, or automation thaw.

Runtime implementation remains division/repository-specific and must be validated before activation.
