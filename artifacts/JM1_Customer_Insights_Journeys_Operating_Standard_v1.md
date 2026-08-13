# JM1 Customer Insights Journeys Operating Standard v1

Status: CANON - v1.0

## Purpose

Customer Insights - Journeys is JM1's Microsoft-native capability for governed lifecycle, nurture, onboarding, event, stewardship, and campaign communications where consent, purpose, and context support that use.

## Ownership

J Merrill One owns the enterprise Journeys standard, sender/domain governance, reusable journey contracts, consent/compliance pattern, production readiness gates, and cross-division reuse matrix.

Divisions own division-specific audience definitions, message content, business timing, operating follow-up, and rollout decisions.

## Required Controls

Every Journey must have an approved purpose, topic or equivalent compliance classification, sender/domain, content owner, audience owner, suppression behavior, reporting visibility, and rollback/disable path.

Contact identity does not create marketing consent. Website intake does not create blanket journey consent.

## Power Automate Boundary

Power Automate may trigger internal workflow, notifications, integrations, and deterministic tasks. It must not become a custom journey or nurture engine when Customer Insights - Journeys fits.

## Production Criteria

Production activation requires tenant capability evidence, nonproduction proof, suppression validation, privacy validation, sender/domain proof, compliance profile validation, controlled production send validation, reporting visibility, and regression validation.

## Exclusions

Financial/advisory communications, sensitive assistance communications, and regulated communications require separate compliance approval before Journeys activation.
