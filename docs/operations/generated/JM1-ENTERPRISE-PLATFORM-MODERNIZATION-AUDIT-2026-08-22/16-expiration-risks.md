# Expiration Risks

## Expired

- BusinessCentralAPI secret expired 2025-09-03
- J Merrill Foundation Integration secret expired 2025-10-07
- BusinessCentralSharePoint secret expired 2025-10-21
- JM1 - BC SharePoint Integration secret expired 2025-10-21
- JM1 Graph Directory secret expired 2026-01-06
- Portals-J Merrill Publishing Inquiry certificate expired 2026-02-28
- JM1-Bookings-AppPublic secret expired 2026-03-18
- Bookings secret expired 2026-03-18
- github-aic-deploy secret expired 2026-04-03
- J Merrill One HQ - Power BI secret expired 2026-04-10
- Portals-Site 1 certificate expired 2026-04-19
- jm1-ed-functions secret expired 2026-04-27
- jm1-publishing-intake-api secret expired 2026-05-23
- JM1-Dataverse-ServicePrincipal secret expired 2026-06-07

## Less Than 30 Days

- None found from visible app registration dates as of 2026-08-22.

## Less Than 90 Days

- github-deploy-aic secret expires 2026-10-05 (<90 days)
- jm1-hq-app-sp secret expires 2026-11-03 (<90 days)
- JM1-Dataverse-ServicePrincipal secret expires 2026-11-08 (<90 days)

## Less Than 180 Days

- Same as <90 in visible data; no additional 90-180-day expirations found in the Entra query.

## Package URL Risk

- func-jm1-acs-email-relay uses an expiring package URL pattern. Expiration is long-dated, but the pattern is still a class of outage risk and should be replaced with canonical non-manual deployment.
