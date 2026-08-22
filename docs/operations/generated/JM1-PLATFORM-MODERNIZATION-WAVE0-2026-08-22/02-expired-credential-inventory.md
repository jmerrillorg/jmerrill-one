# Expired Credential Inventory

Total expired credential records discovered as of 2026-08-22: 15

| Application | App ID | Type | Credential ID | Expired | Classification | Recommended Action |
| --- | --- | --- | --- | --- | --- | --- |
| Portals-Site 1 | 3ddc8988-92ca-4993-b01b-a8a5e413a425 | certificate | 9b72d6e1-ca19-49bc-aed4-710c0980168c | 2026-04-19 | UNKNOWN_CONSUMER | No owner/federated credential; no repo/app-setting consumer proven. Do not delete. |
| jm1-publishing-intake-api | d8da73f7-c356-44ee-a312-a6d3096d5081 | secret | eb62f629-a371-4b31-b651-7e21d0e35d6d | 2026-05-23 | SUPERSEDED | Same app has two newer 2027 credentials; Publishing app/settings indicate Dataverse path active. Retire only after Publishing repo owner confirms replacement key in use. |
| JM1 BC SharePoint Integration | 38e16af0-bde0-4e99-9ab1-c6b1052502bb | secret | abfba5bf-eac0-462f-a302-970b7256326f | 2025-10-21 | UNKNOWN_CONSUMER | Business Central/SharePoint purpose evident; no active consumer proven. |
| Bookings | c1ec1c83-5a40-44f8-8896-e1273f2f5a0d | secret | 31609184-5f75-4e41-b317-5c7b5872fb4a | 2026-03-18 | UNKNOWN_CONSUMER | Bookings integration app. No live consumer proven. |
| jm1-ed-functions | 7502ba5f-d187-4ba7-a185-cf9022c0b79e | secret | ebc033b8-767c-4d9e-adf4-44e0af76219b | 2026-04-27 | SUPERSEDED | Same app has two later 2027 Power Platform connector credentials. jm1-ed-functions currently references Power BI client ID, not this key ID. |
| BusinessCentralAPI | 6dc1ffb9-363b-48ad-9a35-e9cbd8e94b2f | secret | 78aea30b-5a2d-41ec-9ec9-547dc5854133 | 2025-09-03 | UNKNOWN_CONSUMER | Business Central purpose evident; no active consumer proven. |
| Portals-J Merrill Publishing Inquiry | cea336f7-119c-4cc2-a195-0616a571f400 | certificate | 644887dc-8036-4c69-a9a6-7423a2860565 | 2026-02-28 | UNKNOWN_CONSUMER | Portal certificate expired. Need Power Pages/portal owner proof before removal. |
| BusinessCentralSharePoint | 767abadb-a4b9-4fc9-8a1c-0b62484c8c0c | secret | cab40e75-6fa1-4cdb-aa7c-ddcf4fecf7ca | 2025-10-21 | UNKNOWN_CONSUMER | Business Central/SharePoint app. No active consumer proven. |
| JM1 Graph Directory | 4b3d919a-677a-4bf4-b2a3-ff5e21348b30 | secret | 5d7af079-e126-4058-8da5-a04c53f320c7 | 2026-01-06 | UNKNOWN_CONSUMER | Graph directory purpose. No current app-setting consumer proven. |
| github-aic-deploy | 746b3307-1432-4ff8-ac36-e82fc1c9c021 | secret | 560a805a-cd08-4c01-852f-150f8090b8e1 | 2026-04-03 | SUPERSEDED | AIC active workflow uses OIDC-style azure/login with JM1_AZURE_CLIENT_ID and no client secret. This older app has contributor role but no recent sign-ins; do not delete until AIC repo confirms active app ID. |
| J Merrill Foundation Integration | 8d0ccfbb-fce3-4821-b1cb-79b599d9a6e4 | secret | e6b052a1-0cbb-4889-8961-70b6daeec646 | 2025-10-07 | UNKNOWN_CONSUMER | Foundation-specific integration; implementation remains Foundation repo boundary. |
| JM1-Bookings-AppPublic | d4e38a4f-50cf-44ae-90d4-1928312298a8 | secret | ea8bb1f9-a58f-41d2-9af9-d027a71b576b | 2026-03-21 | UNKNOWN_CONSUMER | Duplicate Bookings-named app; no consumer proven. |
| J Merrill One HQ - Power BI | c6605cb7-6058-41b8-a080-d2412600f81c | secret | 2d961c3d-63f3-4e13-a560-24342d7b7a32 | 2026-04-10 | BROKEN_DEPENDENCY | jm1-ed-functions references this app ID for Power BI settings. Expired secret suggests Power BI path is at-risk or broken until rotated/validated. |
| JM1-Bookings-AppPublic | 734157cd-6fe0-47cf-87aa-0eb05b57be9a | secret | 72af1c4a-dddf-4f40-825f-91b1abe5446e | 2026-03-18 | UNKNOWN_CONSUMER | Duplicate Bookings app; no consumer proven. |
| JM1-Dataverse-ServicePrincipal | abaed7aa-944f-4c41-8947-bf1bb6b9b111 | secret | 906b217d-20aa-4c14-a285-5f5015f2ceab | 2026-06-07 | SUPERSEDED | Same app has non-expired Dataverse Access Key through 2026-11-08; active Dataverse consumers exist in One/Publishing/Functions. Do not delete old key until active key ID confirmed. |


Credential values were not read into evidence or written to files.
