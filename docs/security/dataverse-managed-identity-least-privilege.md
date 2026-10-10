# Dataverse Runtime Identity and Least-Privilege Contract

Status: source contract and acceptance plan only. This change does not create Dataverse application users or roles, change Azure identity configuration, change Key Vault, or switch production authentication.

## Identity boundary

The Marketing Function and the One App Service have distinct system-assigned managed identities. The verified principal IDs are `38b09d6f-34d9-48b3-9627-f04c047fd534` (Function) and `f4744464-018b-4bd7-8df6-6e460149742f` (One App Service). A live production query found no matching Dataverse application-user record for either principal. The supported opt-in setting is `DATAVERSE_AUTH_MODE=system_assigned_managed_identity`; each host obtains a Dataverse `/.default` token using only its own system-assigned credential. There is no default-credential chain and no fallback between identities.

The current Dataverse app user `JM1-PUB-INTAKE-WEBAPI` is `71ec4dd0-d261-4ffc-9f5a-626d885ecc85` / directory object `ecc93d0c-029c-4a4a-9961-e0ba53492e99`, Dataverse system user `bc60cbc3-6b65-f111-a826-000d3a14673b`, in JM1 Headquarters. Live read-only production queries on 2026-10-10 confirmed four direct roles: `JM1 Publishing Intake API - Workspace Writeback` (25 privileges), `JM1 Publishing Intake API - Create Only` (20), `JM1 Public Catalog Reader` (11), and `System Administrator` (17,693 privileges from `RetrieveRolePrivilegesRole`). The custom roles do not supply the Marketing Function CRUD matrix; Create Only grants Global Create/Read/Write on ExecutionLog, Public Catalog Reader grants Global Read on Contact and Publishing Title, and System Administrator grants organization-wide access. This high privilege remains in place and is not a proposed steady state. Removing it now would break both public One intake and Function consumers because they currently use identical client-credential configuration references.

## Trigger and entity matrix

The machine-readable operation matrix, resource identity contracts, entity-set map, and known evidence limits are in [`dataverse-access-contract.json`](../../runtime/jm1-marketing-autonomous-functions/dataverse-access-contract.json). It distinguishes source-observed reads/writes from optional probes and relationship assignments. No Custom API Execute call is present in any of the eight Function triggers or `/api/intake`. Function `entitySet()` now accepts only the source-controlled logical-name allowlist; it no longer reads `EntityDefinitions` at runtime.

| Trigger / caller | Required source-observed Dataverse operations | Candidate minimum scope and unresolved test |
| --- | --- | --- |
| `catalogMarketingHealthTimer` | Read `jm1pub_titles`, read/create/update `jm1pub_titlemarketinghealths` | Local, subject to target app-user acceptance |
| `creativeWorkProcessorTimer` | Read campaigns/content/creatives/exceptions/social; create/update creatives, social executions, media assets, conditional exceptions; campaign lookup binding | Local for observed HQ rows; prove Append/AppendTo on campaign relationships |
| `credentialMonitorTimer` | Read/create/update credential monitors; synthetic-only exception create/update | Local; normal flow does not require exception rights |
| `marketingControlLoopTimer` | Read campaigns/content/creative/social/credential/journey/exception rows; create/update content and control-loop records; campaign lookup binding | Local for observed HQ rows; Dynamics marketing counts are optional and may be denied without blocking the control loop |
| `productionAssetRegistrationQueue` | Read/create/update Publishing production assets; read/update title-marketing health | Local; Azure Queue authorization is a separate authority |
| `publishingAssetEventOutboxTimer` | Read qualifying execution-log rows, editorial approval gates and artifacts; create emission execution-log rows | Deep is a conservative candidate pending full BU/row-scope proof; Queue send is separate |
| `socialExecutionWorkerTimer` | Read campaign/content/social/media state; update social execution; create/update exception records | Local for observed HQ rows; Meta/LinkedIn/media access is separate |
| `websiteIntakeReconciliationTimer` | Read/update execution-log receipts, read contacts/leads, update Leads in separately gated BP-09 paths | Deep candidate for cross-BU scan until full execution-log distribution is known; ACS relay uses Function MI but is not Dataverse |
| One `POST /api/intake` | Read/create/update receipt execution-log rows; read contacts by normalized email; create deterministic contacts/leads; Lead-to-Contact binding; optional Productions owner assignment | Contact Read likely needs Deep to deduplicate across child BUs. Lead/receipt scope must be proven against exact ownership and queries. Assign/owner target rights are required only for configured Productions routing. |

Depth names follow Dataverse SDK masks: Basic=user, Local=business unit, Deep=parent and child business units, Global=organization. Existing user-owned rows observed in the prior production inventory were predominantly JM1 Headquarters. Leads included two records in the child J Merrill Financial LLC BU. Execution-log and Contact inventory reads reached a 5,000-row cap; therefore full distribution and a sufficient scope for broad scans have not been proved. Do not infer Global as the replacement merely because the existing user has it. Contact lookup by exact email is intentionally cross-record to avoid creating a duplicate person; whether Deep covers all relevant contacts must be proven against a complete authorized inventory.

## Entity-set allowlist

The mapping in `src/lib/dataverse.js` is source-owned and was compared with live production entity metadata in the preceding read-only schema investigation. Unknown logical names throw before a request. This removes runtime `EntityDefinitions` privilege; optional `safeCount` calls against Dynamics 365 Customer Insights remain explicit optional reads.

## Release acceptance and rollback

Do not set either host to managed identity until the identity is separately present as a Dataverse application user, has the reviewed least-privilege role, and passes a same-resource acceptance run. Preserve the current shared service principal and roles through both cutovers.

1. In DEV, provision distinct Function and App Service app users and apply only the approved role artifact; verify effective privileges and BU scope.
2. Run permitted and denied tests for each consumer: allowed read/create/update paths, denied unlisted entity, denied out-of-scope BU row, exact email contact match, deterministic replay, campaign and parent-contact binding, and the configured Productions owner assignment. Verify optional Dynamics probes can fail without changing core readiness behavior.
3. Repeat with synthetic records in JM1-Test. Confirm no external sends, social posts, or real customer records.
4. In a governed production release, cut one host at a time, preserving the prior app settings and shared principal. Read back effective identity, receipt reconciliation, Function timers/social worker, and alert signals before considering the next host.
5. Roll back that host only by restoring its prior `DATAVERSE_AUTH_MODE=client_credentials` state and unchanged existing secret references, then verify health and durable intake/reconciliation. Do not remove the shared app user or roles in this change.

## Still blocked from a deployable role

`jm1_executionlog` and attribute `jm1_sourceentity` lack reliable source-solution provenance in this repository. The live table is unmanaged and appears in several unmanaged solutions; `jm1_sourceentity` has no `solutioncomponents` linkage. The tracked ONE solution does not own these components, and the Enterprise-Dev fixture does not model `jm1_sourceentity`. Therefore this repository cannot truthfully add a deployable role/privilege solution for the complete matrix. Required enterprise/platform action: the Dataverse/Core solution owner must designate the authoritative DEV solution and component owner for ExecutionLog plus `jm1_sourceentity`, reconcile the overlapping unmanaged memberships, and provide a managed artifact through the governed DEV → Test → Production path. This does not block reviewing or testing the source auth modes and entity map, but it blocks effective-rights acceptance and any identity cutover.
