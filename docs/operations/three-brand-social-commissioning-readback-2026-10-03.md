# Three-brand social commissioning readback: October 3, 2026

Packet: `JM1-THREE-BRAND-SOCIAL-PRESENCE-001`. Times below are Eastern. This is a native-platform and Dataverse checkpoint, not a claim that the rolling calendar is commissioned. The [October-November proposal](three-brand-calendar-approval-2026-10-11.md) is placement inventory, not approval or a native booking. Sintra is retired.

## Publication and queue truth

| Brand | Channel and destination | Execution owner | Current verified state | Next booked item | Approval / coverage |
| --- | --- | --- | --- | --- | --- |
| One | Facebook Page `101196349506906` | Meta native | No scheduled posts after Oct 7 item `2137055240571356` returned to Drafts | None | Exact-copy approval and visual needed; 14-day approved coverage absent |
| One | Instagram | Meta native | Connected account indicated in Meta; exact destination ID and future queue not proved in this readback | None proved | Identity/readback gate |
| One | LinkedIn org `106683183` | LinkedIn native | Oct 9 10:00 booking preserved, text/link preview, prepublication ID not exposed | Oct 9 10:00 | Exact-copy approval unverified; not approved coverage |
| Publishing | Facebook Page `307480763084670` | Guarded Azure worker | Native author posts remain Drafts; Oct 3/21 API rows held | None approved | Campaign/content/media/destination and duplicate checks required |
| Publishing | Instagram Graph account `17841410046020869` | Guarded Azure worker | No approved future booking proved; held API requests are not bookings | None approved | Same campaign gate; do not native-book duplicates |
| Publishing | LinkedIn org `13048648` | LinkedIn native | Hagher visual post published Oct 3; Oct 8 writer tip and Nov 3 Reeder item still native-scheduled | Oct 8 11:00 | Future exact-copy approval unverified; no weekly coverage beyond first October week |
| Financial | Official Facebook Page `1270611542802820` in One portfolio `846921439784613` | Meta native | Oct 5 item `2145183373031235` and Oct 14 visual item `1408327554100595` retained as Drafts; no scheduled posts | None | Financial Dataverse campaign authority not found; no approved 14-day coverage |
| Financial | Instagram handle `jmerrillfinancial` | Meta native, if connected under approved access | Connection/permissions not proved; no booking proved | None | Do not click cross-account connection prompt without authorization |
| Financial | LinkedIn org `146207089` | LinkedIn native | Oct 12 10:00 booking preserved, text/link preview, prepublication ID not exposed | Oct 12 10:00 | Exact-copy/JMF claims approval unverified; not approved coverage |

The separate Financial LLC Facebook Page `104395329284856` was not posted to or migrated. LinkedIn API permission remains held; native LinkedIn is the only authorized LinkedIn execution path. Meta native is not a Publishing fallback while the guarded worker owns Publishing Facebook and Instagram. The Oct 3/21 Publishing requests remain held, and the Oct 21 row was not treated as approved by proximity to an earlier campaign.

## Proven publication

- [Publishing LinkedIn October Hagher post](https://www.linkedin.com/feed/update/urn:li:activity:7512083179911168000/) was read back live on Oct 3 with platform share ID `urn:li:share:7512083179101601792`, exact October Author of the Month caption, *A Portrait of Paradise* cover, and alt text. This counts for the Sep 28-Oct 4 calendar week only. The former Oct 4 native schedule was published now, not duplicated.
- Source: [Hagher public author page](https://jmerrill.pub/authors/iyorwuese-hagher) and OneDrive distribution cover `JM1-PUB/08_Backlist/Hagher, Iyorwuese/2025-Hagher-APortraitOfParadise/08 Distribution Records/9781961475670_FC.jpg`, SHA-256 `5cf31e28bfd3eb7dbd091445a4ccbce5f9c65b5d3eb5d039fafae3d642033be3`. Founder confirmed general promotional name/image/likeness rights. No new blanket rights approval is needed.
- The post is live, but an exact-copy/content approval binding in Dataverse was **not** verified. Do not represent this publication as an approved campaign result until that evidence is reconciled.

## Creative and holds

| Asset | SHA-256 | Intended use | Current disposition |
| --- | --- | --- | --- |
| `financial-estate-readiness-desk.png` | `8434350433980461cb4ef66bf755b0509b4410358fa6df0ee6fb9adee5522b2c` | Oct 5 Financial estate-readiness caption, with alt text describing folder, checklist, pen, envelope and key | Uploaded in Meta; post `2145183373031235` is Draft pending review |
| `financial-preparation-folders.png` | `7448f4209a84cb8010c762971f4f0716cd7c3e18c028b4a5be00551e71ec8ef6` | Financial planning checklist caption, with alt text describing three folder pockets | Uploaded in Meta; post `1408327554100595` is Draft pending review |
| `one-four-paths.png` | `4368a1b662add171062e295c69ff146d5f28beeddab033a3311b43099bac1320` | Distinct One umbrella-brand visual | Prepared locally; not uploaded/booked |
| `publishing-revision-desk.png` | `e62c2125ec1bc07d8da0274014ec8987c7021a2a1b10666bbb57853d46196fe8` | Writer-tip visual for non-author Publishing slots | Prepared locally; not uploaded/booked |

All four illustrations were generated for this packet and have no third-party stock licensing dependency. `one-wayfinding.png` is preserved locally but excluded from publication because small invented text appears in the image. No Azure `jm1media` registration was made: a non-overwriting Azure Blob upload using signed-in identity was denied for lack of `Storage Blob Data Contributor`. No account-key fallback or IAM change was attempted. Native platform uploads do not establish a governed Dataverse media asset by themselves.

## Required review and operating rule

The [October 2 exact-item review](three-brand-native-booking-review-2026-10-02.md) remains the consolidated caption review baseline, amended by today's artwork and the shortened Reeder LinkedIn wording. Financial's Oct 5 and Oct 14 captions, One's Oct 7 caption, and the four future LinkedIn captions need named review, timestamp, exact caption/link/creative identity, and Dataverse binding before they may count as approved coverage. The Nov 3 Reeder item is still a native booking, not proof of November weekly coverage. Additional Hagher weeks and Reeder weeks cannot be backdated or counted from proposals.

The two exact-copy amendments for that single batch are:

- Financial Facebook, proposed Oct 14 10:00, Page `1270611542802820`, draft `1408327554100595`, `financial-preparation-folders.png`: “One folder can make a difficult conversation easier. Start with three lists: important documents, people to contact, and questions you want to ask. Keep the location of the folder known to someone you trust. Save this checklist for a future planning conversation. Educational information, not legal or insurance advice.” Alt text: “Top-down illustration of a teal planning folder with three pockets containing blank documents, contact cards, and question cards, beside a pen and a blank calendar.” The proposed date is no longer a booking.
- Publishing LinkedIn, Nov 3 11:00, org `13048648`: “November Author of the Month: Kimberly Reeder. Explore her J Merrill Publishing author page and Girl, Did You Know... ? in the catalog: https://jmerrill.pub/authors/kimberly-reeder”. This replaced the unverified subtitle in the earlier review sheet. Native schedule remains, but prepublication ID and approved creative are not proved.

The live Dataverse campaign marker `e60c47b5da7824de99976e0a` remains `SYSTEM_AUTHORITY_CREATED_HELD_FOR_DOWNSTREAM_PROOF`. A Financial campaign-authority search returned zero rows. Each daily 14-day readback must join approved content, native booking ID or LinkedIn caption/time proof, held API request, and later platform publication ID. Flag a gap where no approved booking exists, and page the named channel owner on failed publication or a missing platform ID; drafts, proposals, API requests and historical posts do not fill the gap. A monthly replenishment owner and failure-alert recipient have not been evidenced, so this operating loop is not commissioned.

JMF `ADM-300` stays publicly visible; draft JMF PR #184 must not hide it. The sales-only registry designation and website-disclosure rule still require the normal JMF compliance decision. That issue must not be generalized into a ban on independently reviewed estate-readiness or provider-neutral funeral-preplanning education. No Blue Nebula, Marlan Gary, Precoa or Funeral Directors Life relationship claim is approved for JMF social copy by this readback.

**Commissioning state:** PARTIAL. Publishing LinkedIn has one real visual publication. Approved rolling 14-day coverage is not proved for any of the nine channels. Do not release the guarded Publishing rows, schedule native duplicates, or count drafts as bookings.
