# JM1 Marketing Microsoft Architecture

Status: CANON-CANDIDATE

## Target Operating Model

JM1 Canonical Content -> Content Registry / Dataverse -> AI-assisted derivatives -> Human approval -> Channel execution layer -> Engagement/conversion signals -> Dataverse + Dynamics 365 -> Customer Insights / Sales / Analytics

## Channel Execution Layer

Meta Business Suite is approved for Facebook and Instagram execution:

- Facebook publishing and scheduling
- Instagram publishing and scheduling
- Reels
- Stories where supported
- Meta inbox/community management
- native Meta analytics
- page/account administration
- campaign/ad execution when separately authorized

LinkedIn and YouTube should use their native/API execution surfaces when account ownership, permissions, and compliance boundaries are confirmed.

## Microsoft System Responsibilities

Microsoft should remain the enterprise backbone for:

- canonical content registry
- approval and audit evidence
- audience/customer records
- consent and compliance classification
- campaign governance
- lead/opportunity management in Dynamics 365 Sales
- Customer Insights - Journeys for consented lifecycle and nurture communications
- attribution and analytics
- AI orchestration through governed agents
- Power Automate for internal workflow and deterministic integration
- Power Apps/model-driven views where implementation is later authorized
- Azure/API services for governed integrations only when justified

## Dynamics/Journeys Boundary

Customer Insights - Journeys should not be designed as the Facebook/Instagram social publishing engine.

It should receive and act on approved engagement, conversion, consent, segment, and journey signals where legally and operationally appropriate.

## Power Automate Boundary

Power Automate may coordinate internal approvals, notifications, record updates, and deterministic handoffs. It must not become a custom social publisher or custom journey/nurture engine when channel-native tools or Customer Insights fit better.

## Immediate Versus Parallel Build

Immediate:

- Use Meta Business Suite for founder-approved profile remediation, scheduling, and publishing after admin verification.

Parallel build:

- Define Dataverse content registry, approval evidence, campaign metadata, attribution, and reporting standards.

Next integration:

- Automate the handoff between approved canonical content and channel execution only where APIs, connectors, DLP policy, and platform terms justify it.

## DLP and Integration Considerations

Existing Power Platform governance should be checked before activating any social connector. Consumer/social connectors may require explicit DLP review or connector exception. This P1 package does not authorize connector activation.
