# MAINT-01 — Founder Decision Packet
**Date:** 2026-08-17  
**Classification:** MAINT-01 COMPLETE — ESTATE RATIONALIZED; FOUNDER POLICY/CLEANUP DECISIONS REQUIRED  
**For:** Jackie Smith Jr., Founder  
**Required action:** Answer six decisions. Nothing destructive proceeds without your approval.

---

## Executive Summary

The J Merrill One estate has been fully rationalized. All evidence domains are complete. No tenant objects will be deleted during this phase — the purpose of this packet is to get your answers to six policy questions so that the cleanup execution package can be authorized.

**High-confidence retirement candidates: 0**  
No object can be safely deleted without your input on at least one of these decisions.

---

## The Six Decisions

---

### FD-001 — Foundation Communication Site

**Decision required:** Should the standalone Foundation communication site be kept as a separate site, or merged into the main Foundation team site and retired?

**Current state:** A standalone SharePoint site (`sites/foundation_comm`) exists with no Team or M365 Group backing it. It has a Programs & Events folder structure. Last updated September 2025.

**Why this exists:** This appears to be either (A) a public-facing/informational portal for the JM Merrill Foundation — the kind of page grant applicants or external stakeholders might land on — or (B) a legacy site from an earlier SharePoint build that the Foundation Team site (`foundation_div`) has since superseded.

**Recommendation:** Consolidate. If the site is not serving an active external audience, migrate the Programs & Events content to `sites/foundation_div` and retire the standalone site. Two Foundation sites without a clear distinction creates governance confusion.

**If you approve (consolidate):** Content is migrated to foundation_div, site is placed in read-only for 30 days, then retired.  
**If you retain:** Both Foundation sites remain active. You must tell us the distinct public purpose of foundation_comm so it can be documented.  
**If you defer:** Both sites remain; no action taken.

**Affected:** `sites/foundation_comm` (standalone), `sites/foundation_div` (destination if consolidating)

> **Exact approval:** `APPROVE FD-001 — CONSOLIDATE foundation_comm into foundation_div and retire`  
> **OR:** `APPROVE FD-001 — RETAIN foundation_comm as [describe public purpose]`

---

### FD-002 — Enterprise Canon Location

**Decision required:** Which SharePoint folder is the single authoritative home for enterprise governance documents?

**Current state:** Enterprise governance documents exist in two active locations:
- `sites/ImplementationHQ` → Architecture/00_CANON *(last modified July 2026)*
- `sites/publishing` → JM1 Shared Services/Enterprise Governance *(last modified July 2026)*

**Why this exists:** ImplementationHQ was built as the architecture/governance hub. The publishing site also accumulated enterprise governance materials as the publishing pipeline matured. Both are currently active — neither is wrong to exist, but having two authoritative sources for the same documents causes editors and automation to disagree on which version is current.

**Recommendation:** ImplementationHQ/Architecture/00_CANON is the single authoritative source. The publishing site's Enterprise Governance folder becomes a clearly labeled reference copy with a note pointing to ImplementationHQ. No files need to be deleted or moved — only a governance label added.

**If you approve:** A header note is added to the publishing copy. Future governance edits go to ImplementationHQ only.  
**If you defer:** Both remain active without a documented priority; version drift continues.

**Affected:** `ImplementationHQ/Architecture/00_CANON`, `publishing/JM1 Shared Services/Enterprise Governance`

> **Exact approval:** `APPROVE FD-002 — ImplementationHQ/Architecture/00_CANON is the authoritative enterprise canon; publishing copy becomes reference`

---

### FD-003 — Projects Site Dev Artifacts

**Decision required:** Should the stale developer build files stored in SharePoint's Projects site be cleaned out?

**Current state:** `sites/projects` contains a large collection of JavaScript bundles, Next.js build outputs, and repository branch mirrors (jm1-agape, jmerrill-pub brands). These were stored in SharePoint during early development. Last significant update: January 2026. GitHub and the production App Service estate are now the authoritative code stores.

**Why this exists:** During early development, SharePoint was used as a secondary storage area for build outputs. HOST-02 is now complete; GitHub holds all canonical source code. These SharePoint copies are stale.

**Recommendation:** Archive and remove the build artifacts from SharePoint. Retain the Projects Team shell if any planning/coordination still happens there (see FD-006). Before any removal, CI/CD pipelines will be verified to confirm nothing reads from this site.

**If you approve:** CI/CD verified → unique non-GitHub content archived → stale artifacts removed from SharePoint. Team shell retained pending FD-006.  
**If you retain as-is:** Stale artifacts remain. Storage cost continues. Source of truth ambiguity continues.  
**If you defer:** Tied to FD-006 status; both remain unchanged.

**Affected:** `sites/projects` (content only — Team shell addressed in FD-006)

> **Exact approval:** `APPROVE FD-003 — archive and remove dev build artifacts from sites/projects`

---

### FD-004 — Sales Team and Voicemail Team

**Decision required (two parts):**
1. Is the Sales Team still being used for collaboration, or has that activity ended?
2. Does voicemail routing require the Voicemail Team identity, or can routing be decoupled?

**Current state:**
- **Sales Team:** Last SharePoint activity September 2025 (pricing sheets only). No recent channel activity confirmed.
- **Voicemail Team:** Last SharePoint activity March 2025. Team may be required for Teams calling voicemail delivery routing.

**Why this exists:** Sales was created for pricing/deal collaboration. Voicemail was created to support Teams calling infrastructure. Both are in low-to-inactive state on documents, but the Voicemail Team may have an invisible functional dependency on voicemail routing.

**Recommendation:**
- **Sales:** Archive the Team and site if active collaboration has ended. Pricing sheets can move to a shared library.
- **Voicemail:** Do **not** archive until routing dependency is confirmed. If `voicemail@jmerrill.pub` can receive voicemail routing independently, decouple and archive the Team. If the Team identity is required by Teams calling, retain it.

**If you approve (Sales archive):** Sales Team archived, Group dissolved, site placed in read-only, pricing sheets migrated.  
**If you approve (Voicemail decouple + archive):** Routing decoupled first (verified), then Voicemail Team archived.  
**If you defer:** Both Teams remain in low/inactive state with no documented plan.

**Affected:** `teams/Sales`, `sites/sales`, `teams/Voicemail`, `sites/voicemail`

> **Exact approval:**  
> `APPROVE FD-004 SALES — ARCHIVE Sales Team after pricing sheet migration`  
> `APPROVE FD-004 VOICEMAIL — RETAIN until routing dependency confirmed` *(recommended safe default)*  
> **OR:** `APPROVE FD-004 VOICEMAIL — DECOUPLE routing and ARCHIVE Voicemail Team`

---

### FD-005 — Seven Shared Mailboxes

**Decision required:** For each of the seven mailboxes below, tell us whether it is actively used, should be kept as a passive alias, or can be retired.

**Current state:** Seven shared mailboxes exist whose active operational status is unconfirmed:

| Mailbox | Likely purpose |
|---------|---------------|
| `accounting@jmerrill.one` | Financial correspondence |
| `board@jmerrill.one` | Foundation board communication |
| `donations@jmerrill.one` | Donor inquiries/receipts |
| `grants@jmerrill.one` | Grant applications and inquiries |
| `media@jmerrill.one` | Press/media inquiries |
| `volunteers@jmerrill.one` | Volunteer coordination |
| `contacts@jmerrill.one` | General contact / intake |

**Already confirmed (no decision needed):** `legal@`, `preneeds@`, `royalties@`, `submissions@`, `tech@`, `info@`, `no-reply@`, `notifications@`, `logging@` — all retained.

**Recommendation (per mailbox):**
- `board@`, `donations@`, `grants@` → **KEEP — CORE** (Foundation credibility/compliance; retiring these may confuse external grantors or donors)
- `accounting@`, `media@`, `volunteers@` → **KEEP if actively staffed; ALIAS if not**
- `contacts@` → **CONSOLIDATE into info@** if overlapping, otherwise **KEEP as alias**

**Options per mailbox:**
- **KEEP — CORE:** Actively staffed, external-facing
- **KEEP — ALIAS:** Retained as forwarding address; no active monitoring required
- **RETIRE:** No use, no external audience

**If you approve:** Wave 4 processes each mailbox per your decision — alias setup, forwarding rules, or retirement with forwarding grace period.  
**If you defer:** Mailboxes remain; some may receive unmonitored external email.

> **Exact approval (fill in per mailbox):**  
> `APPROVE FD-005 — accounting@: [KEEP-CORE/ALIAS/RETIRE], board@: KEEP-CORE, donations@: KEEP-CORE, grants@: KEEP-CORE, media@: [KEEP-CORE/ALIAS/RETIRE], volunteers@: [KEEP-CORE/ALIAS/RETIRE], contacts@: [KEEP-ALIAS/RETIRE/CONSOLIDATE-into-info]`

---

### FD-006 — Projects Team Collaboration

**Decision required:** Is the Projects Team channel still actively used for planning and coordination, or has that work moved to GitHub Issues/Projects?

**Current state:** The Projects Team has a SharePoint site with stale dev content (addressed in FD-003). The Team channel itself may or may not have active planning/coordination activity — channel post and meeting history was not audited.

**Why this exists:** Projects Team was created for cross-team project coordination. If that coordination has since moved to GitHub Issues or another tool, the Team shell is empty overhead.

**Recommendation:** If active planning happens in the Projects channel: **Retain**. If all coordination has moved to GitHub/other: **Archive** the Team shell after FD-003 content cleanup completes.

**If you approve (archive):** Projects Team archived after FD-003 content cleanup. GitHub Issues/Projects handles coordination going forward.  
**If you retain:** Projects Team stays active; FD-003 content cleanup proceeds independently.  
**If you defer:** Team and content remain in ambiguous state.

**Affected:** `teams/Projects`, `sites/projects` (coordination space — content addressed in FD-003)

> **Exact approval:**  
> `APPROVE FD-006 — ARCHIVE Projects Team (collaboration moved to GitHub)`  
> **OR:** `APPROVE FD-006 — RETAIN Projects Team (channel is actively used)`

---

## After Your Decisions

Once you provide approval phrases for FD-001 through FD-006, the following cleanup waves become executable in order:

| Wave | Authorized by | Action |
|------|--------------|--------|
| Wave 1 | No FD required | Security/credential corrections (no active risks identified) |
| Wave 2 | No FD required | License rationalization (no removals currently identified) |
| Wave 3 | No FD required | Service account review |
| Wave 4 | FD-005 | Mailbox rationalization per your decision |
| Wave 5 | FD-004, FD-006 | Sales/Voicemail/Projects Team archival |
| Wave 6 | FD-001, FD-002, FD-003 | SharePoint alignment (foundation_comm, enterprise canon, projects cleanup) |
| Wave 7 | No FD required | App registration/service principal review |
| Wave 8 | No FD required | Repository archive review |

**Nothing in Waves 4–6 executes without your approval of the corresponding FD.**  
Waves 1–3 and 7–8 may proceed without your direct input after a brief technical review confirms no active issues.

---

*All decisions are recorded in `maint01_founder_decision_packet.json`. Supporting evidence in `maint01_founder_decision_register_v2.json`.*
