# JMP Marketing Operating Architecture

Status: DESIGNED / IMPLEMENTATION FOUNDATION

J Merrill Publishing marketing has two active lanes: evergreen portfolio marketing and lifecycle/business-event marketing. Dataverse determines when and why a title, author, or campaign is eligible. Sintra and JM1 AI may help determine how the public story is expressed. Customer Insights - Journeys handles consent-supported engagement only after tenant, sender, compliance, suppression, and proof criteria are satisfied. The JM1 Social Publishing Orchestrator is the target deterministic social execution layer.

Public prime directive: People-First and Why-First. Public content must not expose internal workflow vocabulary, governance names, Dataverse schema, scheduler mechanics, or evidence classifications.

Target flow:

```text
Dataverse lifecycle/business event
  -> Marketing eligibility and public-ready gate
  -> Campaign/creative authority
  -> Approved exact media asset
  -> Customer Insights - Journeys and/or JM1 Social Publishing Orchestrator
  -> Platform response, platform post ID, readback
  -> Dataverse evidence and performance return loop
```

Truth boundary: the current Publishing 30-day social run was scheduled through Sintra/Soshie UI and platform-native/browser execution, not through a JM1-owned API pipeline.
