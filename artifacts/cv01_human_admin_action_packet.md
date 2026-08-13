# CV-01 Human Admin Action Packet

Classification: HUMAN ADMIN ACTION REQUIRED.

1. Power Platform Admin Center: open `https://admin.powerplatform.microsoft.com/`, select `JM1-Enterprise-Dev`, open environment Dynamics 365 apps/resources, find `Dynamics 365 Customer Voice` / `MicrosoftFormsPro`, and install/provision it. Current state: app is visible in the catalog, but the Customer Voice solution is not present in the DEV solution inventory. Desired state: Customer Voice app provisioned in DEV. If Microsoft displays a new paid licensing or capacity prompt, stop and do not purchase.

2. Power Apps/Dynamics security: in `JM1-Enterprise-Dev`, assign `jm1-admin@jmerrill.one` the Customer Voice `Project Owner` role and any required Customer Voice add-on role. Assign `Survey Sender` only if Dynamics send proof is needed.

3. Customer Voice: open `https://customervoice.microsoft.com/`, select `JM1-Enterprise-Dev`, create `CV-01 Enterprise Feedback Proof`, create one short controlled survey, generate a supported test link/invitation, submit one synthetic response, and validate response storage in Customer Voice and Dataverse.

Validation after completion: PAC solution inventory must show Customer Voice in DEV; the proof packet must record project, survey, response timestamp, Dataverse response evidence, Contact linkage behavior, duplicate behavior, and privacy result.
