# JM1 Human-Facing Last-Mile Certification v1

Status: CANON

Effective date: 2026-08-27

Authority: Jackie Smith, Jr. — Governance Authority

Policy ID: `JM1-HUMAN-FACING-LAST-MILE-CERTIFICATION-v1`

## Purpose

JM1 human-facing capabilities are not fully commissioned until the actual recipient-facing output has been opened, inspected, and proven.

Internal success signals are necessary but not sufficient. A queue completion, API acceptance, checksum, Dataverse row, template test, or send log may prove that a system acted. It does not prove that the person received a trustworthy experience.

## Core Rule

For any human-facing surface, full commissioning requires:

1. Policy pass.
2. Runtime pass.
3. Data and identity pass.
4. Artifact pass.
5. Render pass.
6. Human-First / Why-First pass.
7. Controlled send or publish.
8. Recipient-surface readback.
9. Actual output opened and inspected.
10. Defects resolved or classified.

If the actual output has not been inspected, the capability may be classified as `TECHNICALLY_COMMISSIONED`, but it must not be classified as `HUMAN_LAST_MILE_COMMISSIONED`.

## Status Dimension

Human-facing capability status must distinguish:

- `TECHNICALLY_COMMISSIONED`
- `HUMAN_LAST_MILE_NOT_PROVEN`
- `HUMAN_LAST_MILE_COMMISSIONED`

Prior technical evidence is preserved. This policy does not erase or rewrite historical commissioning records.

## Test Object

The final test object is the actual thing the recipient sees:

- Email: rendered inbox message and actual attachments.
- SMS: rendered message text.
- Website: rendered public page.
- Portal: recipient view.
- DOCX: opened document.
- PDF: rendered pages.
- Image: rendered image.
- ZIP: included files.

Do not certify from template source, JSON payload, metadata, artifact filename, API request, send log, checksum, or queue status alone.

## Email Last-Mile Requirements

Human-facing email must prove:

- natural greeting and punctuation;
- correct name form for the relationship;
- plain language;
- Human-First / Why-First structure;
- no unnecessary internal system terminology;
- proportional heading structure;
- clear action and next step;
- correct brand, sender, Reply-To, signature, and footer;
- no broken placeholders, links, or HTML.

Routine author-review messages should normally use simple prose and no more than two headings.

## Attachment Last-Mile Requirements

When a human-facing package includes an attachment, the attachment content must match its declared role.

For author manuscripts, the system must prove:

- full book content;
- expected opening and ending content;
- reasonable word count;
- chapter or section continuity where applicable;
- no internal cover page;
- no automation metadata;
- no artifact ID, checksum, correlation ID, execution state, queue, raw QA evidence, or publisher-only review note.

Filename, artifact type, and checksum alone are not content authority.

## Defective Delivery Rule

When a delivery occurred but the human-facing package was defective:

- preserve `DELIVERY_OCCURRED = YES`;
- record `VALID_DELIVERY = NO`;
- record the defect reason;
- do not erase the historical send;
- do not let the defective delivery control an author-response clock;
- send one corrected package after certification;
- start the response clock from the corrected valid delivery.

## Invalidation Rule

Human-last-mile certification becomes stale when a material human-facing element changes, including:

- template;
- brand overlay;
- sender or reply routing;
- attachment generator;
- artifact selection logic;
- ACS or email relay transformation;
- portal rendering framework;
- website rendering framework;
- signature or footer system;
- document renderer.

Stale certification must be re-proven before the affected capability is labeled fully commissioned.

## Drift Monitor

Runtime and evidence sweeps must detect:

- machine language returning to human-facing copy;
- internal metadata leaks;
- attachment filename/content mismatch;
- wrong sender or Reply-To;
- duplicate signature/footer;
- broken CTA or link;
- bad greeting;
- template bloat;
- wrong attachment;
- missing last-mile proof after material change.

## Required Result Values

Certification decisions:

- `ALLOW`
- `ALLOW_WITH_WARNING`
- `DENY`
- `HUMAN_REVIEW_REQUIRED`

Commissioning results:

- `NOT_PROVEN`
- `TECHNICALLY_PROVEN`
- `HUMAN_LAST_MILE_PROVEN`

Hard recipient-surface defects must return `DENY` or `HUMAN_REVIEW_REQUIRED`.

## Enterprise Scope

This policy applies to all JM1 brands and human-facing surfaces:

- J Merrill One
- J Merrill Publishing
- J Merrill Financial
- J Merrill Foundation
- J Merrill Productions
- Agape International Cathedral
- Jackie Smith Jr.

Publishing is the first proving implementation for manuscript-package delivery.

## Boundary

This policy does not itself send communications, mutate Dataverse, deploy websites, generate customer documents, modify agreements, change prices, post to Business Central, or activate branch-specific runtime. Each implementation must separately prove technical authority and last-mile proof.
