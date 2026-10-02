# Three-brand social presence: 2026-10-02 readback and readiness

Status: evidence and draft queue only. Nothing in this document is an approval, a native booking, or a publication instruction. Times below are America/New_York (EDT in October; EST in November). Sintra is retired.

## Native schedule baseline

The checked Meta Business Suite Scheduled views and LinkedIn organization scheduling views showed **no verified future posts** for any of the nine brand/channel combinations on October 2. Historical Meta calendars ended September 25 for One and September 30 for Publishing; they are not future coverage. LinkedIn organization IDs: One `106683183`, Publishing `13048648`, Financial `146207089`. Publishing Meta Facebook Page `307480763084670`, Instagram Graph account `17841410046020869`; One Meta Facebook Page `101196349506906`. Two Financial Facebook Pages remain candidates: `1270611542802820` and `104395329284856`. The official page and Instagram connection are not confirmed. Native scheduling is not inferred from Dataverse requested times.

| Brand | Facebook | Instagram | LinkedIn | Next verified native post |
| --- | --- | --- | --- | --- |
| J Merrill One | Empty future schedule | Empty future schedule | Empty future schedule | None |
| J Merrill Publishing | Empty future schedule | Empty future schedule | Empty future schedule | None |
| J Merrill Financial | Empty on both candidate Pages | No confirmed connected account | Empty future schedule | None |

Native Meta planner: [Publishing calendar](https://business.facebook.com/latest/content_calendar?business_id=846921439784613&asset_id=307480763084670&global_scope_id=846921439784613&calendar_type=MONTH). LinkedIn scheduling is read from each organization administrator's native Scheduled Posts view. These are account-scoped views, not public proof of a future booking.

## October campaign collision control

Dataverse campaign `d42fae45-90a6-f111-b8de-00224820105b` is `SYSTEM_AUTHORITY_CREATED_HELD_FOR_DOWNSTREAM_PROOF`. [PR #56](https://github.com/jmerrillorg/jmerrill-one/pull/56) deployed the worker guard: new Publishing Meta and LinkedIn publication requires this exact campaign to be `PUBLIC_EXECUTION_APPROVED` and the exact content stage to be `PASS`. Existing platform-object reconciliation remains available. No change to the campaign state or assets was made.

| Row | Requested EDT | Current evidence | Disposition |
| --- | --- | --- | --- |
| Oct 3 FB `8668125b-baa6-f111-b8de-6045bdd69435` | 10:00 | No platform ID; `title_discovery` content held; no durable media URL | Hold; do not add native duplicate |
| Oct 3 IG `d8f0155e-baa6-f111-b8de-6045bdd69678` | 12:00 | Same campaign/content/media hold; no platform ID | Hold; do not add native duplicate |
| Oct 21 FB `c4510039-92a7-f111-b8de-00224820105b` | 10:00 | Durable media and content `PASS`; campaign held; no platform ID | Verify destination and duplicate status separately before release |
| Oct 21 IG `6495ca3c-92a7-f111-b8de-7c1e525b15c2` | 12:00 | Durable media and content `PASS`; campaign held; no platform ID | Verify destination and duplicate status separately before release |

The requested destination text differs across rows and is not proof of exact native account binding. Publishing LinkedIn API execution remains held by platform permission; its future channel owner is the existing native LinkedIn scheduler until API authority is proven. Do not dual-schedule API rows and native posts.

## Author coverage

Only posts actually published or booked in the correct calendar month count. The September 2 Meta publication of the October introduction does not count toward October. The October 1 Publishing LinkedIn post is not an Iyorwuese Hagher spotlight. Verified October Iyorwuese weeks covered: **0/5** (Oct 1-7, 8-14, 15-21, 22-28, 29-31). Verified November Kimberly Reeder weeks covered: **0/5** (Nov 1-7, 8-14, 15-21, 22-28, 29-30). These are coverage gaps, not authorization to publish ten posts. Confirm author identity (including Reeder/Reeder-Heard ambiguity), title facts, image/license and likeness rights, stage copy, and approvals before booking. Do not invent biographies, endorsements, or book details.

## Draft queue, not scheduled

The following themes can be adapted for Facebook, Instagram, and LinkedIn with platform-native formatting and accessible alt text. Each post still needs a content record, approval, traceable asset rights, exact destination, and a verified free slot. No artwork or third-party likeness is implied.

| Brand | Next two non-author themes | Approval boundary |
| --- | --- | --- |
| One | How to find the right JM1 division; a concise guide to choosing an inquiry route | Verify live division links and use approved umbrella-brand media; do not promise division results |
| Publishing | What to prepare before a manuscript conversation; questions writers can ask about editorial and distribution timelines | Avoid implying a specific publishing service or outcome without the current offer registry |
| Financial | Estate-readiness conversation checklist; funeral-preplanning information a family may want to gather | Educational only; no legal, insurance, portability, provider, or public `ADM-300` offer claim |

Proposed opening copy, pending brand approval:

- One: "J Merrill One brings distinct teams together. Start with the area that fits your question, and we will help you find the right next conversation."
- Publishing: "Before your next manuscript conversation, write down your goals, intended readers, and questions about the publishing process. A clear starting point makes the conversation more useful."
- Financial, estate readiness: "An estate-readiness conversation can begin with a simple inventory: the people you want involved, the documents you already have, and the questions you need answered by qualified professionals."
- Financial, funeral preplanning: "A helpful first step in funeral preplanning is to record preferences, identify who should be involved, and ask the chosen provider which arrangements and costs it actually handles."

No proposed Financial copy names Blue Nebula, Marlan Gary, Precoa, or Funeral Directors Life. Jackie's separate Blue Nebula employment role must not be represented as a JMF partnership. JMF's intended provider-neutral `ADM-300` offer and public inquiry destination await the consolidated founder/compliance decision. [JMF draft PR #184](https://github.com/jmerrillorg/jmerrill-financial/pull/184) removes the sales-only item from public listings pending that decision; the live site still lists it.

## Execution ownership and continuation gap

Dataverse is the target content/approval/schedule/result authority, but historical native posts have not been proven to have equivalent Dataverse records. Today Publishing Meta's existing Azure worker owns its API rows, subject to the campaign/content/media gates; Publishing LinkedIn is native while API permission is held. One and Financial have no commissioned autonomous publisher, so their native schedulers remain the only currently evidenced scheduling surfaces. Financial's exact Meta destination is unresolved. A post is not complete until its owning scheduler shows the booking or the destination platform returns a post ID and Dataverse retains the result.

The existing Publishing queue policy and worker do not prove automatic replenishment or failure alerting for all three brands. Required continuing operating control: review each native/API queue by exact page/account and EDT time at least weekly, maintain a rolling 14-day approved horizon, alert the JM1 marketing runtime owner on failed or empty horizons, and reconcile platform IDs/results into Dataverse. This is a **required control**, not a claim that it is already running. Founder/compliance owns business approvals, not routine monthly calendar assembly. Do not build a second publisher to solve this.

## Gates

One consolidated Jackie/compliance decision remains: official Financial Facebook Page and Instagram authority; JMF `ADM-300` public wording, disclosure, and provider-neutral inquiry route; external organization naming/logo/referral/appointment permissions; and Iyorwuese/Kimberly identity and asset rights. LinkedIn API permission is a separate platform gate. Until those are resolved, preserve the held API rows, avoid native duplicates, and keep unapproved copy as drafts.
