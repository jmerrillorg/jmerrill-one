# Dataverse and Dynamics

Observed in JM1-Core solution inventory:

- DynamicsMKT real-time Journeys component family present.
- Dynamics Marketing Customer Voice Integration present.
- Microsoft Dynamics 365 Business Central Dataverse Base Integration and Business Central Integration present.
- JM1 Core, Governance, Foundation, Financial, Publishing, Production Command Center, Security Compliance, and related custom solutions present.

Risks:

- Multiple unmanaged custom solutions remain and should be classified by owner/change path.
- Classic workflows, business rules, BPFs, plug-ins, and table/field deprecation states require Dataverse metadata export, not schema mutation.

No Dataverse schema was changed.
