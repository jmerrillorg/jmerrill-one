# Microsoft 365 / Graph

Evidence source: Entra app registrations and repo/artifact references.

Findings:

- Microsoft Graph/Bookings/SharePoint/Business Central app registrations exist, several with expired credentials.
- No legacy EWS dependency was found by repo text search in One, but division repos still need source-level scan.
- Business Central and SharePoint integrations appear active or planned through app registrations and Dataverse solution inventory.

Target: Graph-first integrations, workload identity or managed identity where supported, no personal-owner secrets, and 180/90/30-day expiration warnings.
