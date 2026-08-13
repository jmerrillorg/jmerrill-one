# BP-11 - Enterprise Semantic Reconciliation & Migration Closeout

Status: COMPLETE WITH DOCUMENTED EXCEPTIONS

Purpose: align existing JM1 Dataverse identity, prospect, relationship, referral, service, and pipeline data to BP-08 canonical meaning without redesigning CRM or deleting history.

Core rules:

- Natural person = Contact.
- Organization/entity = Account.
- Unqualified prospect = Lead.
- Qualified pipeline = Opportunity.
- Service/support issue = Case.
- Domain records remain domain-specific and link to canonical identity where evidence permits.
- Ambiguous identity decisions remain Founder & CEO decisions.

No live destructive migration was applied because source migration register evidence and dependency proof were incomplete.
