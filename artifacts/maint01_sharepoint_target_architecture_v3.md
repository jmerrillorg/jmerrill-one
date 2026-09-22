# MAINT-01 SharePoint Target Architecture — v3
**Updated:** 2026-08-17  
**Basis:** Complete tenant site inventory via M365 connector (v3)  
**Status:** FOUNDER DECISION REQUIRED on 2 items; all others resolved

---

## Sites That Remain (All 14 Team-Connected Sites)

| Site | Team | Purpose | Keep Reason |
|------|------|---------|-------------|
| sites/ImplementationHQ | Implementation HQ | Enterprise architecture, governance canon, programs | KEEP — CORE: enterprise governance hub |
| sites/publishing | Publishing Team | Publishing pipeline, titles, editorial, production | KEEP — CORE: primary operational document store |
| sites/financial | Financial Team | Pre-need records, client files, financial docs | KEEP — CORE: entity-scoped sensitive records |
| sites/foundation_div | Foundation Team | Foundation programs, grants, operations | KEEP — ACTIVE: division operational store |
| sites/AgapeIC | Agape International Cathedral | Ministry programs, events | KEEP — ACTIVE: mission collaboration |
| sites/security | Security & Compliance | Security governance, compliance notebook | KEEP — SECURITY BOUNDARY |
| sites/marketing | Marketing | Cross-entity media assets | KEEP — LOW ACTIVITY: still needed for brand assets |
| sites/sales | Sales | Pricing sheets | KEEP — LOW ACTIVITY: retain until Founder decision on Sales Team |
| sites/support | Support | Support team collaboration | KEEP — LOW ACTIVITY: required for support function |
| sites/JMerrillOne | HQ | Enterprise HQ operational collaboration | KEEP — ACTIVE: distinct from ImplementationHQ |
| sites/events | Events | Events Team collaboration | KEEP — UNKNOWN activity; retain until reviewed |
| sites/productions | Productions Team | Productions collaboration | KEEP — UNKNOWN activity; retain until reviewed |
| sites/voicemail | Voicemail | Voicemail routing | KEEP — SYSTEM: functional necessity; minimal document role |
| sites/projects | Projects | Legacy dev artifact store | KEEP — FOUNDER DECISION: content may be archivable or migratable to GitHub |

---

## Standalone Sites (Non-Team-Connected)

| Site | Type | Status | Recommendation |
|------|------|--------|---------------|
| sites/foundation_comm | Communication Site | LOW ACTIVITY — last Sept 2025 | FOUNDER DECISION REQUIRED — see below |
| personal/jm1-admin_jmerrill_one | Admin OneDrive | ACTIVE | KEEP — out of scope for site cleanup |

---

## Authoritative Libraries

| Purpose | Authoritative Location |
|---------|----------------------|
| Enterprise governance canon | sites/ImplementationHQ — Architecture/00_CANON |
| Enterprise architecture programs | sites/ImplementationHQ — JM1 Enterprise Architecture/01_Programs |
| Enterprise ADR register | sites/ImplementationHQ — Architecture/09_REGISTERS |
| Enterprise standards | sites/ImplementationHQ — Architecture/10_STANDARDS |
| Publishing operational files | sites/publishing — numbered folder structure |
| Financial / pre-need records | sites/financial — Shared Documents |
| Foundation programs | sites/foundation_div — Shared Documents |
| Ministry (AIC) | sites/AgapeIC — Shared Documents |

---

## Enterprise vs Division Canon

- **Enterprise canon** lives in `sites/ImplementationHQ/Architecture/00_CANON`.
- `sites/publishing/JM1 Shared Services/Enterprise Governance` contains a reference copy of PROGRAM-004 evidence. This should be reconciled: either maintain a deliberate cross-reference pointer or consolidate into ImplementationHQ.
- **Division canon** lives in each entity's Team-connected site root.
- Do not mirror GitHub folder structures into SharePoint. They serve different purposes.

---

## Founder Decision Required

### Decision 1 — foundation_comm (Standalone Communication Site)
**Current state:** Standalone communication site at `sites/foundation_comm`. No Team. No Group. Programs & Events folders. Last activity September 2025.  
**Two possible purposes:**  
  A. Public-facing / informational communication site for JM Merrill Foundation (e.g., intranet page, public portal). → **Keep with documented purpose.**  
  B. Orphaned legacy site from early SharePoint build, now superseded by `sites/foundation_div`. → **Consolidate: migrate Programs & Events content to foundation_div, then retire.**  
**Consequence of inaction:** Duplicate Foundation sites with unclear authority.  
**Required action:** Jackie confirms which scenario applies.

### Decision 2 — sites/projects (Legacy Dev Archive)
**Current state:** Large Team-connected site containing mirrored dev repo content — JS bundles, branch checkouts, build artifacts. Last significant activity January 2026. Superseded by GitHub + App Service estate (HOST-02 complete).  
**Recommendation:** Archive or migrate significant content to GitHub; retire the SharePoint copy of dev artifacts. The Team shell can remain if Projects Team collaboration is still needed.  
**Risk:** Dev artifacts in SharePoint are not version-controlled in the same way as GitHub. Stale copies may cause confusion.  
**Required action:** Jackie confirms whether Projects dev content is needed in SharePoint.

---

## What Does Not Change

- No Financial content moves into One or Publishing.
- No canon is moved or renamed without explicit Founder direction.
- No Team or Group is removed without completing the full retirement hard gate.
- HOST-02 and JRN-01 are not touched.
