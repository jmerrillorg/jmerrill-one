# MAINT-01 Cleanup Execution Waves
**Date:** 2026-08-17  
**Status:** PREPARED — awaiting Founder decisions FD-001 through FD-006 for Waves 4–6  
**Authority:** No wave executes destructive actions without explicit Founder approval

---

## Wave Order

| Wave | Name | FD Required | Status |
|------|------|------------|--------|
| Wave 1 | Security / Credential Risk | None | READY (assessment only) |
| Wave 2 | License Rationalization | None (informed by FD-004/006) | READY after Wave 1 |
| Wave 3 | Service Account Modernization | None | READY (assessment only) |
| Wave 4 | Mailbox Rationalization | **FD-005** | PENDING |
| Wave 5 | Teams / Group Rationalization | **FD-004, FD-006** | PENDING |
| Wave 6 | SharePoint Alignment | **FD-001, FD-002, FD-003** | PENDING |
| Wave 7 | App Registration Retirement | None (audit first) | PENDING audit |
| Wave 8 | Repository Archive | None | NO ACTION — all repos kept |

---

## Wave 1 — Security / Credential Risk

**Prerequisite:** None  
**Objects:** All 112 app registrations (credential expiry audit)

**Actions:**
1. Query Graph API for credential expiration dates across all app registrations
2. Flag P0 (expired) and P1 (<30 days) for immediate rotation
3. Flag password-based workload identities for eventual OIDC migration
4. No credentials rotated unless a P0 active failure is confirmed

**Stop condition:** P0 credential on production publishing or financial automation — escalate immediately

---

## Wave 2 — License Rationalization

**Prerequisite:** Wave 1 complete; informed by FD-004/FD-006 outcomes  
**Objects:** Per-user license assignments (after Team archival decisions)

**Actions:** After FD-004/FD-006 resolve which accounts no longer need Teams collaboration — perform per-user dependency check and present removal candidates to Founder.

**No licenses removed without explicit Founder approval of each user.**

---

## Wave 3 — Service Account Modernization

**Prerequisite:** Wave 1 complete  
**Objects:** jm1-admin@jmerrill.one (review only)

**Actions:** Confirm service account type and licensing need. Assessment only — no migration in this package.

---

## Wave 4 — Mailbox Rationalization *(Requires FD-005)*

**For each mailbox per FD-005 decision:**

- **KEEP — CORE:** No action
- **KEEP — ALIAS:** Set forwarding rule; document alias; no active monitoring required
- **RETIRE:** 90-day forwarding to info@ → confirm no active use → remove

**Prerequisites per mailbox:** No Power Automate flows, no Dynamics/Bookings references, no public contact form routing, no active partner contact at the address.

**Rollback:** Exchange Online mailbox recovery (30-day window)

---

## Wave 5 — Teams / Group Rationalization *(Requires FD-004, FD-006)*

### Step 5.1 — Sales Team *(if FD-004 Sales: ARCHIVE)*
1. Migrate pricing sheets to shared library
2. Remove members → Archive Team → Read-only site → Archive Group (30-day hold)

### Step 5.2 — Voicemail Team *(only if routing decouple confirmed)*
1. Confirm routing does not require Team identity
2. If confirmed: Archive Team → read-only site → archive Group
3. If not confirmed: Retain indefinitely

### Step 5.3 — Projects Team *(if FD-006: ARCHIVE; after Wave 6 Step 2)*
1. Archive Team → read-only site → archive Group (30-day hold)

**Stop conditions:** Active scheduled meeting, active Power Automate reference, voicemail delivery failure

---

## Wave 6 — SharePoint Alignment *(Requires FD-001, FD-002, FD-003)*

### Step 6.1 — foundation_comm *(if FD-001: CONSOLIDATE)*
1. Full file enumeration
2. Confirm owner
3. Migrate Programs & Events → foundation_div
4. Verify content accessible in destination
5. Set foundation_comm to read-only for 30 days
6. After 30-day hold: retire site

### Step 6.2 — Projects dev artifacts *(if FD-003: ARCHIVE/CLEAN)*
1. Verify no CI/CD or Power Automate reads from sites/projects
2. Archive ZIP of unique non-GitHub content
3. Remove JS bundles, build outputs, repo mirrors
4. Retain Team shell pending FD-006

### Step 6.3 — Enterprise canon label *(if FD-002 approved)*
1. Add reference header note to publishing/Enterprise Governance folder
2. No files moved or deleted

---

## Wave 7 — App Registration Retirement *(Audit first)*

**Prerequisite:** Full line-item dependency audit of 112 app registrations  
**Current state:** No retirement candidates identified without the audit  
**Action:** Complete Graph sweep → present candidates to Founder → explicit approval required

---

## Wave 8 — Repository Archive

**No action.** All 19 GitHub repos classified KEEP.

---

## Regression After Each Wave

After each wave, verify relevant systems per `maint01_wave_regression_standard.json`:  
identity sign-in → mail delivery → Teams → SharePoint → automation → web presence → GitHub/OIDC

**Do not treat a command returning success as proof the wave succeeded. Test actual functionality.**
