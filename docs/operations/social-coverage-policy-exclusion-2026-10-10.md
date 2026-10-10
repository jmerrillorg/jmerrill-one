# Social Coverage Policy Exclusion and Readback Addendum

Observed 2026-10-10T14:34:34Z. This addendum supplements the native audit and records the current live Dataverse readback. It does not authorize publication, approval, retry, or held-row release.

## Publishing author-inquiry rows

The two overdue-looking rows are legacy social children of campaign marker `73808d18aaf4ca9b3294f74c`:

| Row | Platform | Requested time (UTC) | Destination text | Current state |
| --- | --- | --- | --- | --- |
| `b1a4b966-24a9-f111-aaac-7c1e525b15c2` | Facebook | 2026-09-24 14:00 | J Merrill Publishing Inc | `WAIT_CREATIVE_RUNTIME_REGISTRY_REQUIRED` |
| `b3a4b966-24a9-f111-aaac-7c1e525b15c2` | Instagram | 2026-09-24 16:00 | jmerrillpub | `WAIT_CREATIVE_RUNTIME_REGISTRY_REQUIRED` |

Authority/source readback: campaign `a8c39229-a7a8-f111-b8de-6045bdd69678` is `author_inquiry_nurture`, sourced from `JOIN_INQUIRY` / `author-inquiry-controlled-proof`, and remains `CAMPAIGN_AUTHORITY_DERIVED_FROM_LIFECYCLE`, not `PUBLIC_EXECUTION_APPROVED`. The governing `TRIGGER_POLICY.JOIN_INQUIRY` in `runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js` sets `socialEligible: false`; its contract is Dynamics content and Journey only. The related content row `e61cdf2c-a7a8-f111-b8de-7c1e525b15c2` has copy readiness `PASS`, which is not social approval. The creative row `3471a166-24a9-f111-aaab-000d3a14673b` is `REWORK`, with requested hash `406a72be0394b49a7a95f173681208cc65f86832f173671dccfcf74226798abe`. No current media-registry row matches that hash. Both social rows have no media URL or platform post ID.

Disposition: preserve both rows, do not retry, schedule, or count them as coverage. The readback now identifies these as `SOCIAL_INELIGIBLE_BY_LIFECYCLE_POLICY`, excludes them from overdue-social alerts, and emits the precise runtime-owner action `CLASSIFY_LEGACY_NON_SOCIAL_CHILD`. The related LinkedIn and other legacy siblings remain held and visible; they are not released. Six children for this ineligible campaign were observed: the two WAIT rows above, two `HELD_SCHEDULE_REVIEW_REQUIRED`, and two `HELD_EXTERNAL_PLATFORM_AUTHORITY`.

## Live nine-channel readback

Live Dataverse read at 2026-10-10T14:34:34Z mapped 100 rows with zero unclassified rows and zero actionable booking/execution reconciliation findings. The two WAIT rows are surfaced as policy exclusions, not overdue publishing failures.

| Brand | Facebook | Instagram | LinkedIn |
| --- | --- | --- | --- |
| J Merrill One | 1 verified booking; rolling gap and a separate unapproved reservation remain | 2 verified bookings; covered | Coverage unknown to the automated snapshot; held rows remain visible |
| J Merrill Publishing | 2 verified bookings; covered; mixed native/worker authority warning remains | 1 verified booking; rolling gap; policy-excluded author-inquiry rows are not bookings | Coverage unknown to the automated snapshot; held rows remain visible |
| J Merrill Financial | 1 verified booking; rolling gap and a separate unapproved reservation remain | 3 verified bookings; covered | Coverage unknown to the automated snapshot; held rows remain visible |

LinkedIn native scheduled-list observations were also read in the same October 10 session, but the list does not expose native booking IDs and the earlier JSON baseline still says `UNAVAILABLE`. Observed list entries (date/time Eastern): One Oct 16 10:00, Oct 19 10:00, Oct 26 10:00; Publishing Oct 10 11:00, Oct 15 11:00, Oct 17 10:00, Oct 22 11:00, Oct 25 10:00, Oct 29 11:00, Nov 3/10/17/24 11:00; Financial Oct 12 10:00, Oct 16 11:00, Oct 19 10:00, Oct 26 10:00. These list-only observations are not counted by the automated report as exact caption/approval matches. Detail review confirmed the Financial Oct 12 and Oct 19 educational posts and Publishing Oct 17, Oct 22, Oct 25, and Oct 29 Hagher author posts. The LinkedIn API remains unavailable; the native scheduler is the only verified LinkedIn execution path.

## Runtime/test boundary

The author-inquiry eligibility correction is in the local readback source and tests only; no Function deployment or production configuration change was made. Automated readback remains `REPORT_ONLY_WITH_STABLE_DEDUPE_KEYS`. The readback does not synthesize a failure alert for a campaign that policy excludes from social publishing. No social scheduler, Dataverse status, account permission, site, or public content was changed.
