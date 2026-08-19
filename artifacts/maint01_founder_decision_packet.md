# MAINT-01 Founder Decision Packet
**Date:** 2026-08-18
**For:** Jackie Merrill
**From:** MAINT-01 Evidence Suite (Cody + Claude Code)

Read this document. Reply with the six approval phrases at the bottom. Cody executes authorized cleanup in order.

---

## FD-001 — foundation_comm Site

**Decision:** What to do with `sites/foundation_comm` — the only standalone SharePoint communication site in the tenant?

**Current state:** Active standalone site (no Team or Group), last active September 2025. Purpose: public/foundation communications. No active automation dependencies confirmed.

**Recommendation:** **CONSOLIDATE** — move all content into `sites/foundation_div` and retire foundation_comm. Foundation Division already serves the same audience. Maintaining a separate standalone site creates governance overhead with no operational benefit.

**If approved:** Content migrated to foundation_div; foundation_comm retired; links updated. Reversible within 93 days via SharePoint recycle bin.

**If deferred:** foundation_comm remains a standalone governance exception. No cleanup harm — just continued split surface.

**Affected objects:** `sites/foundation_comm` (standalone), `sites/foundation_div` (destination)

**Approval phrase:** `APPROVE FD-001 — CONSOLIDATE foundation_comm into foundation_div and retire`
*(or: `APPROVE FD-001 — RETAIN foundation_comm as standalone` if you want to keep it separate)*

---

## FD-002 — Enterprise Canon Location

**Decision:** Which copy of enterprise governance documentation is authoritative?

**Current state:** Two copies exist:
- `sites/ImplementationHQ/Architecture/00_CANON` — internal enterprise wiki
- `sites/publishing` (SharePoint) + `jm1-pub` (GitHub) — outward-facing rendered copy

**Recommendation:** **ImplementationHQ is authoritative.** The publishing copy is the rendered/distributed output. Label the publishing copy "Reference — see ImplementationHQ/Architecture/00_CANON for authoritative version." No files moved.

**If approved:** Labels applied only. Zero file moves or deletions.

**If deferred:** Dual-canon ambiguity continues. No operational harm.

**Affected objects:** `sites/ImplementationHQ/Architecture/00_CANON` (canon), `sites/publishing` (reference label)

**Approval phrase:** `APPROVE FD-002 — ImplementationHQ/Architecture/00_CANON is the authoritative enterprise canon`

---

## FD-003 — Projects Site Dev Artifacts

**Decision:** Should build artifacts / dev outputs in `sites/projects` SharePoint be removed?

**Current state:** `sites/projects` (Team-connected) contains legacy dev build artifacts — compiled outputs, CI logs, build binaries. GitHub is the authoritative source for all project code.

**Recommendation:** **ARCHIVE AND REMOVE** — ZIP and archive to a designated location, then remove from SharePoint. GitHub is the single source of truth for project work.

**If approved:** Dev artifacts ZIPped and archived first; then removed from SharePoint. `sites/projects` description updated to point to GitHub.

**If deferred:** Dev artifact sprawl continues in SharePoint. No operational harm, some storage cost.

**Affected objects:** Dev build artifacts in `sites/projects` (not the site itself)

**Approval phrase:** `APPROVE FD-003 — archive and remove dev build artifacts from sites/projects`

---

## FD-004 — Sales Team + Voicemail Team

**Two sub-decisions:**

### FD-004a — Sales Team
**Current state:** Sales Team — activity unclear. No active channel messages confirmed in 90 days (audit pending Wave 1/2).

**Recommendation:** **ARCHIVE** if no active channel messages in 90 days. Migrate pricing sheets from Teams/SharePoint first.

**If approved:** Pricing sheets migrated; Sales Team archived via Teams Admin.

**Approval phrase:** `APPROVE FD-004a — ARCHIVE Sales Team after pricing sheet migration`

### FD-004b — Voicemail Team
**Current state:** Voicemail Team has a suspected Teams Phone routing dependency. Cannot confirm it is safe to archive without verifying routing.

**Recommendation:** **RETAIN** until voice routing dependency is confirmed decoupled.

**If routing confirmed decoupled:** `APPROVE FD-004b — ARCHIVE Voicemail Team`
**Default (retain):** `APPROVE FD-004b — RETAIN Voicemail Team pending routing confirmation`

---

## FD-005 — Seven Shared Mailboxes

**Decision:** Classify each of 7 shared mailboxes: KEEP-CORE, KEEP-ALIAS, CONSOLIDATE, or RETIRE.

**Already confirmed KEEP (9 of 16):** logging@, info@, notifications@, no-reply@, legal@, preneeds@, royalties@, submissions@, tech@

**Pending classification (7 — all named below):**

| Mailbox | Items | Forwarding | Recommendation | Reasoning |
|---------|-------|-----------|---------------|-----------|
| accounting@jmerrill.one | 1617 | None | **KEEP-CORE** | Active billing/finance identity; 1617 items; aliases billing@, finance@ |
| board@jmerrill.one | 18 | foundation@ | **KEEP-CORE** | Governance-critical board identity |
| donations@jmerrill.one | 53 | foundation@ | **KEEP-CORE** | Revenue-critical donations intake |
| grants@jmerrill.one | 794 | foundation@ | **KEEP-CORE** | 794 items; active grants administration; revenue-critical |
| media@jmerrill.one | 54 | publishing@ | **KEEP-ALIAS** | Public-facing media/PR; aliases events@, social@, pr@ |
| volunteers@jmerrill.one | 18 | foundation@ | **KEEP-ALIAS** | Foundation volunteer intake; low volume |
| contacts@jmerrill.one | 6 | None | **CONSOLIDATE into info@** | 6 items; no forwarding; overlapping purpose with info@ |

**Approval phrase (recommended dispositions):**
`APPROVE FD-005 — accounting@ KEEP-CORE, board@ KEEP-CORE, donations@ KEEP-CORE, grants@ KEEP-CORE, media@ KEEP-ALIAS, volunteers@ KEEP-ALIAS, contacts@ CONSOLIDATE into info@`

*(Override any mailbox by naming it with a different disposition in your reply)*


---

## FD-006 — Projects Team

**Decision:** Archive Projects Team or retain for active collaboration?

**Current state:** Projects Team connected to `sites/projects`. If project collaboration has moved to GitHub, the Team has no ongoing purpose.

**Recommendation:** **ARCHIVE** if GitHub is confirmed authoritative for all project work and no active channel collaboration in 90 days.

**If approved:** Projects Team archived after Wave 6 Step 2 (sites/projects dev artifact cleanup) completes.

**If deferred/retained:** Projects Team remains active.

**Affected objects:** Projects Team, connected M365 Group, connected `sites/projects` SharePoint site

**Approval phrase:** `APPROVE FD-006 — ARCHIVE Projects Team` *(or: `APPROVE FD-006 — RETAIN Projects Team`)*

---

## Six Approval Phrases (Reply with these)

```
APPROVE FD-001 — [CONSOLIDATE foundation_comm into foundation_div and retire | RETAIN foundation_comm as standalone]
APPROVE FD-002 — ImplementationHQ/Architecture/00_CANON is the authoritative enterprise canon
APPROVE FD-003 — archive and remove dev build artifacts from sites/projects
APPROVE FD-004a — [ARCHIVE Sales Team after pricing sheet migration | RETAIN Sales Team]
APPROVE FD-004b — [ARCHIVE Voicemail Team | RETAIN Voicemail Team pending routing confirmation]
APPROVE FD-005 — board@ KEEP-CORE, donations@ KEEP-CORE, grants@ KEEP-CORE, contacts@ CONSOLIDATE into info@ [+ your 3 mailbox decisions]
APPROVE FD-006 — [ARCHIVE Projects Team | RETAIN Projects Team]
```

**Nothing executes until you reply with the approval phrases above.**
