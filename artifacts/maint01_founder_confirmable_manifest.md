# MAINT-01 — Founder-Confirmable Action Manifest
**Date:** 2026-08-17  
**Status:** AWAITING FD-001 THROUGH FD-006  
**This is the document Jackie signs off on to authorize cleanup execution.**

---

## What Needs Your Approval

Answer the six decisions in `maint01_founder_decision_packet.md`. Use the approval phrases listed there.

Nothing in this manifest executes without your approval of the corresponding FD.

---

## After Your Approvals: What Happens

### Immediate (no migration prerequisite)
- **FD-002 approved →** Canon reference label added to publishing site's Enterprise Governance folder. No files moved.

### Migrate first, then act
- **FD-001 approved (consolidate) →** Programs & Events migrated from foundation_comm to foundation_div. 30-day read-only hold on foundation_comm. Then retire.
- **FD-003 approved →** CI/CD verified → dev artifact archive ZIP → artifacts removed from sites/projects.
- **FD-004 (Sales) approved →** Pricing sheets migrated → Sales Team archived.
- **FD-004 (Voicemail) approved (decouple) →** Routing decoupled and verified → Voicemail Team archived.
- **FD-005 approved per mailbox →** Alias/forwarding configured → 90-day grace period → retirement for approved mailboxes.
- **FD-006 (archive) approved →** Projects Team archived after Wave 6 content cleanup.

---

## What Is Retained (No Decision Needed)

| Category | Count | Status |
|----------|-------|--------|
| SharePoint sites | 13 of 15 in scope | KEEP |
| Confirmed shared mailboxes | 9 | KEEP — CORE/SYSTEM |
| Teams | 11 of 14 | KEEP |
| Security groups | 9 | KEEP — SECURITY BOUNDARY |
| App registrations | 112 | KEEP — no audit yet |
| GitHub repos | 19 | KEEP |

---

## What Is Deferred (No Action Until Further Authorized)

- App registration retirement candidates — requires line-item dependency audit first
- License removals — requires per-user audit and explicit approval
- Deprecated - All Company M365 Group — mailbox/site content assessment needed first

---

*Full technical detail in `maint01_cleanup_execution_waves.md` and `maint01_cleanup_action_matrix_final.json`.*
