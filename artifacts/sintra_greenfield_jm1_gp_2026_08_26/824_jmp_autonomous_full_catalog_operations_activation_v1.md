# JMP Autonomous Full-Catalog Operations Activation v1

Date: 2026-09-05  
Branch: J Merrill Publishing  
Operating authority: Dataverse and JM1-owned runtime

## Future Asset Event Integration

- Authoritative source: `PublishingTitleCloseoutService` in the J Merrill Publishing runtime.
- Existing event: `TITLE_CLOSEOUT_APPROVED_STAGE_V1` in `jm1_executionlog`.
- Source authority: approved current `jm1pub_editorialartifact` plus the closed title-stage gate.
- Available lineage: canonical work ID, editorial stage ID, deliverable artifact ID, SharePoint drive ID, SharePoint item ID, repository path, SHA-256, size, and current-approved state. Edition and format-product identifiers are resolved downstream when available; they are not invented at title-closeout time.
- Hookup: `publishingAssetEventOutboxTimer` reads the existing event log, resolves governed artifact lineage, emits to the existing `jmp-production-asset-events` queue, and writes a source-event emission marker.
- Consumer: `productionAssetRegistrationQueue` converges current/future events and historical `/08_Backlist` reconciliation on the same Dataverse ProductionAsset model.
- Revision rule: a new governed primary preserves the prior row as `HISTORICAL`; no prior file or registry row is deleted.

## Production Proof

Two existing non-public approved title-closeout events were observed through the production outbox. The first pass emitted two messages and registered two governed ProductionAsset rows. The second pass observed both source markers and emitted zero messages. Routine Founder touch and routine Cody touch were zero. No live title state was changed to manufacture the proof.

Result: `FUTURE_ASSET_EVENT_INTEGRATION_OPERATIONAL`  
Idempotency: `PASS — SAME SOURCE EVENT REPLAY EMITS ZERO ADDITIONAL MESSAGES`

## Queue Policy And Health

The first selected full-catalog candidate remains:

- Author: Adrean Young
- Work: Just What I Needed
- Campaign authority: `5dc24848-61a9-f111-aaab-000d3a4e360b`
- State: `QUEUE_POLICY_HELD`

The hold is currently correct. Production readback shows 20 `PUBLIC_READY_SCHEDULED_ELIGIBLE` social executions, alongside Sean A Crowley I's active September authority, the September 22 Strategies for Success launch runway, Publishing Brand work, Reader/Audience work, and Author Acquisition work. Available reactivation capacity is therefore zero during this observation point. The governed release condition is a normal queue/control-loop opportunity after scheduled depth and collision/fatigue policy permit another title allocation; the held campaign is not manually released.

No Content Work, Creative Work, governed media, Social Execution, Dynamics action, or platform object has been generated for the held campaign. That is the expected no-touch result while capacity remains occupied.

## Runtime Boundary Correction

The featured-author control-loop query previously admitted any campaign whose program contained `Author`, including backlist reactivation and acquisition programs that its resolver does not support. The query is now constrained to `featured_author_month`, matching the resolver's ownership. This prevents unrelated held campaigns from aborting the featured-author timer and does not release or mutate the reactivation campaign.

Regression results:

- Marketing OS regression: 33/33 PASS
- Full-catalog health regression: 9/9 PASS
- Function syntax checks: PASS
- Sean September authority: unchanged
- The Shift: `NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT`
- Strategies for Success: launch priority preserved
- Iyorwuese October authority: preserved as future/pre-staged
- Browser publishing: 0
- Sintra execution: 0

## Observation Boundary

The bounded production watch remains active. It observes the existing queue, event-outbox replay, health population, campaign/content/creative/media progression, Meta platform IDs/readback, fatigue updates, duplicate risk, and LinkedIn external-review state. It does not manufacture work or shorten cadence.

Current classification:

`JMP FULL-CATALOG MARKETING HEALTH — AUTONOMOUSLY COMMISSIONED; FUTURE ASSET EVENT INTEGRATION OPERATIONAL; NORMAL EXECUTION PROOF PENDING`

Promotion to autonomous operations remains prohibited until a natural production chain proves candidate selection through platform readback and next-action reevaluation.
