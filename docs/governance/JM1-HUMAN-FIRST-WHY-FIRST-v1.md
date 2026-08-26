# JM1 Human-First / Why-First Enterprise Policy v1

Status: CANON

Effective date: 2026-08-26

Authority: Jackie Smith, Jr. — Governance Authority

Policy ID: `JM1-HUMAN-FIRST-WHY-FIRST-v1`

## Purpose

JM1 communications, author packages, portals, and other human-facing outputs must begin with the human relationship and the reason the recipient is receiving the output.

This policy turns that standard into executable enterprise policy. It applies before any governed output is sent, published, surfaced, or released to a person outside the internal operating context.

## Core Rule

Before creating or sending human-facing output, the system must know:

- who the recipient is;
- which JM1 division or application is speaking;
- the recipient's relationship to JM1;
- what happened;
- why it matters to the recipient;
- what the recipient needs to know or do;
- what JM1 will do next;
- what internal system details the recipient does not need.

If those facts are missing, conflicted, or unsafe, the output must fail closed or require human review.

## Why-First Standard

Why-first means human context comes before mechanics. It does not require a literal heading named "Why you are receiving this."

Routine messages may be short, natural, and professional. A valid message can be two to five paragraphs with no section headings when the purpose, action, and next step are clear.

## Human-First Standard

Human-first output must use plain language appropriate to the recipient and relationship. Domain language is allowed when it is normal language for that relationship.

Publishing may say manuscript, developmental edit, line edit, copyedit, proof, cover, interior, publication, distribution, royalty statement, and similar publishing terms.

Financial may use ordinary client-facing financial planning terms when they are accurate and compliant.

The standard prohibits exposing internal system language merely because the runtime used it.

## Internal Language Guard

Human-facing output must not expose internal terms unless the recipient specifically needs them. Prohibited internal language includes:

- artifact;
- artifact ID;
- canonical;
- runtime;
- correlation;
- manifest;
- workstream;
- execution state;
- package-grade;
- governed source;
- system attention;
- lifecycle event;
- technical validation;
- queue;
- GUID;
- checksum;
- worker;
- Dataverse row;
- state machine token.

The executable policy must also detect obvious GUIDs, checksum-like hashes, raw manifest names, execution IDs, and provider/runtime diagnostics in human-facing output.

## Outcomes

The executable resolver must return one of:

- `ALLOW`
- `ALLOW_WITH_WARNING`
- `DENY`
- `HUMAN_REVIEW_REQUIRED`

Hard safety, identity, authority, privacy, or artifact-delivery violations must return `DENY` or `HUMAN_REVIEW_REQUIRED`.

## Brand Overlay Requirement

Every consuming brand must supply a brand profile before human-facing output is allowed:

- approved sender identity;
- reply path;
- brand voice boundaries;
- relationship vocabulary;
- privacy constraints;
- prohibited terms;
- escalation requirements.

Publishing is the first proving implementation. Other JM1 branches must not be reported as commissioned until they have integrated, deployed, and proven the policy.

## Cross-Brand Adoption Register

Publishing is the commissioned reference implementation.

Financial, Foundation, Productions, and AIC must consume this enterprise policy through branch-specific overlays. A branch may be classified as guard-ready or pre-publish-ready before it is classified as live outbound commissioned.

Current adoption classifications:

| Branch | Overlay | Current classification | Live outbound commissioning |
| --- | --- | --- | --- |
| J Merrill Publishing | `publishing` | COMMISSIONED_REFERENCE_IMPLEMENTATION | PROVEN |
| J Merrill Financial | `financial` | CONTROLLED_GUARD_READY | NOT_PROVEN |
| J Merrill Foundation | `foundation` | PRE_PUBLISH_GUARD_READY | SEPARATE_WAVE_REQUIRED |
| J Merrill Productions | `productions` | PRE_PUBLISH_GUARD_READY | SEPARATE_WAVE_REQUIRED |
| Agape International Cathedral | `aic` | PRE_PUBLISH_GUARD_READY | SEPARATE_WAVE_REQUIRED |

Guard-ready means the branch has an executable policy check and passing branch tests. It does not mean real external sends or public deployment are active unless separately proven.

## Artifact Release Requirement

When a human-facing package requires an artifact, the system must prove the artifact is the intended human-facing artifact, not a filename-matched internal report.

For author-review manuscripts, the package must prove:

- readable document;
- full structural span;
- expected opening and ending content;
- manuscript continuity;
- source lineage;
- reasonable word-count relationship to the source;
- no raw runtime metadata;
- correct title, author, stage, version, checksum, and QA evidence.

An invalid delivery does not start or continue an author response clock. A corrected delivery must preserve original delivery evidence and start the response clock only from the corrected valid delivery.

## Required Artifact Classifications

Every artifact considered for human delivery must be classified as exactly one of:

- `INTERNAL_ONLY`
- `AUTHOR_REVIEW`
- `AUTHOR_DELIVERABLE`
- `PUBLIC_RELEASE`
- `VENDOR_DELIVERABLE`
- `EVIDENCE_ONLY`

Artifacts classified `INTERNAL_ONLY` or `EVIDENCE_ONLY` must not be sent as author-facing deliverables.

## Policy Registry Values

- `POLICY_ID`: `JM1-HUMAN-FIRST-WHY-FIRST-v1`
- `SCOPE`: `ENTERPRISE`
- `STATUS`: `CANON`
- `EXECUTABLE_POLICY`: `YES`
- `OWNER`: `J MERRILL ONE`
- `BRAND_OVERLAYS_REQUIRED`: `YES`
- `PRE_SEND_ENFORCEMENT`: `YES`
- `DRIFT_MONITOR`: `YES`

## Boundary

This policy does not itself send communications, mutate Dataverse, publish websites, alter agreements, change pricing, or activate branch runtimes.

Each consuming implementation must separately prove enforcement before being classified as commissioned.
