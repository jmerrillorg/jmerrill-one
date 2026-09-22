# MAINT-01 — Cece → Cody Handoff

**Generated:** 2026-08-19  
**Classification:** MAINT-01 CLEANUP EXECUTION BLOCKED — MICROSOFT ADMIN TOOL ACCESS REQUIRED

---

## Source State

| Field | Value |
|---|---|
| Repo path | `/home/user/jmerrill-one` |
| Branch | `claude/loving-planck-1cfoo2` |
| **Authoritative tip** | **`a38d8b4`** |
| Working tree | Clean |
| Artifact count | 198 MAINT-01 JSON files |
| JSON validation | PASS — 0 failures |
| All commits signed | Yes (`noreply@anthropic.com`, gpgsig) |

## Target

| Field | Value |
|---|---|
| Governed branch | `codex/maint01-estate-rationalization` |
| PR | #6 |

## Cody Git Recovery

```bash
# If /home/user/jmerrill-one is visible (same container):
git remote add cece-local /home/user/jmerrill-one
git fetch cece-local claude/loving-planck-1cfoo2
# Verify:
git rev-parse cece-local/claude/loving-planck-1cfoo2
# Expected: a38d8b4...

# Fallback — bundle:
git -C /home/user/jmerrill-one bundle create /tmp/maint01-cece.bundle claude/loving-planck-1cfoo2
```

## Approved FD Actions (Cody Execution Authority)

| FD | Action | Guard |
|---|---|---|
| FD-001 | Delete 1 certified stale guest | Re-verify dependency before deletion |
| FD-002 | Unassign 4 orphaned Premium licenses | Do not delete users |
| FD-003 | Disable sign-in for 2 inactive internal accounts | Do not delete; preserve mailbox/OneDrive |
| FD-004 | Archive 3 inactive Teams/M365 Groups | Do not delete; preserve SP/Planner/content |
| FD-005 | See table below | — |
| FD-006 | Delete 2 expired app regs **only if** dependency cert passes | Expiration alone is not evidence |

### FD-005 Mailbox Dispositions

| Mailbox | Disposition |
|---|---|
| `accounting@jmerrill.one` | KEEP-CORE |
| `board@jmerrill.one` | KEEP-CORE |
| `donations@jmerrill.one` | KEEP-CORE |
| `grants@jmerrill.one` | KEEP-CORE |
| `media@jmerrill.one` | KEEP-ALIAS (preserve `events@`, `social@`, `pr@`) |
| `volunteers@jmerrill.one` | KEEP-ALIAS |
| `contacts@jmerrill.one` | CONSOLIDATE into `info@` (preserve via alias/forwarding if required) |

## Cody Execution Sequence

1. Governed GitHub landing (`codex/maint01-estate-rationalization`, PR #6)
2. FD-001 — delete stale guest
3. FD-002 — unassign 4 licenses
4. FD-003 — disable 2 inactive accounts
5. FD-005 — consolidate contacts@ into info@
6. FD-004 — archive 3 Teams/Groups
7. FD-006 — certify + delete 2 app regs (conditional)
8. Full regression validation (identity/security, license, mail, collaboration)
9. Final MAINT-01 closeout → `MAINT-01 COMPLETE — APPROVED CLEANUP EXECUTED AND VALIDATED`

## Admin Surface Required

Use any available authorized path:
- Microsoft 365 Admin Center
- Entra Admin Center
- Exchange Admin Center
- Teams Admin Center
- Microsoft PowerShell (admin)
- Direct Graph API with admin credentials

## Not Authorized Under Current Approvals

- SharePoint site deletion or restructuring
- Repo deletion or archival
- App-registration cleanup beyond the 2 FD-006 candidates
- Moving enterprise canon
- Retiring `foundation_comm`

## Cece Stop Condition

Handoff is complete. Cece will not push to GitHub, amend commits, retry GitHub integration, execute cleanup, or create MAINT-02. Ownership returns to Cody.
