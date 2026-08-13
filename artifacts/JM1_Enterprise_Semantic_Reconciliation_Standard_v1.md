# JM1 Enterprise Semantic Reconciliation Standard v1

Status: CANON-CANDIDATE - PENDING FOUNDER & CEO APPROVAL

## Purpose

This standard governs how JM1 reconciles existing, imported, acquired, and future records to enterprise semantic meaning. The target is one person, one enterprise identity, multiple governed relationships, and one canonical CRM meaning per business object.

## Canonical Ownership

Natural persons are Contacts. Organizations are Accounts. Unqualified prospective engagements are Leads. Qualified commercial or funding pipeline is Opportunity. Service/support issues requiring tracked resolution are Cases. Division-specific domain workflow remains domain-specific and links to canonical identity where evidence permits.

## Matching and Confidence

High-confidence matches require exact normalized email, exact normalized phone with supporting name, or exact canonical external ID. Medium-confidence matches and ambiguous matches are not automatically merged. Founder & CEO review is required for ambiguous identity and relationship decisions.

## Duplicate Governance

Duplicate cleanup must preserve activities, Leads, Opportunities, Cases, relationships, domain records, referrals, source attribution, and execution evidence. Historical test data may be cleaned only after dependency proof and approved cleanup authority.

## Referrals and Sources

Relational referrals are created only when the referring Contact or Account is confidently resolved. Original source text remains when useful for history or audit. Unknown source values must not be guessed.

## Legacy Retention and Write Prevention

Historical records are retained unless explicit deletion authority exists. Legacy write prevention uses the least disruptive supported mechanism: navigation cleanup, read-only/historical views, disabled legacy flows, create-privilege restriction, or redirected forms after dependency proof.

## Privacy and Audit

Enterprise identity must not broaden Financial, Publishing, Foundation, or Productions sensitive data. Every migration write requires before/after evidence, canonical target, action, actor, timestamp, rollback posture, and source proof.

## Future Imports

Future list imports, acquisitions, event loads, partner lists, or website-source records must run through this reconciliation standard before creating new identities or relationships.
