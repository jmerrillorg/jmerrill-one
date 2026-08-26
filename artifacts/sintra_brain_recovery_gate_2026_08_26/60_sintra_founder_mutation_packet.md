# Sintra Founder Mutation Packet

One approved mutation was executed in this pass: Inbox Manager was disabled after the final live dependency check returned SAFE TO DISABLE.

Workspace correction: all Brain review and lab evidence in this packet refers to the inspected J Merrill One workspace. J Merrill Publishing, J Merrill Financial, and J Merrill Foundation are confirmed sibling workspaces, but their Brain contents were not inspected and no cross-workspace mutation is authorized.

## Decision 1: Inbox Manager

Target: Inbox Manager automation.

Before state: automations list switch on; detail page showed "Turn on Inbox Manager" and "Get started" with no Gmail/Outlook account or active production dependency visible.

After state: disabled; reload verified Inbox Manager switch off.

Risk: possible competition with Outlook, Dynamics, Power Automate, and mailbox governance.

Rollback: re-enable in Sintra automation settings after documenting the prior enabled state and configuration.

Recommendation: completed. Keep disabled unless a governed mailbox use case is separately approved.

Exact Founder response: no further response required for this executed item.

Non-regression: Inbox Manager = OFF. Do not reopen this decision or re-enable it in this correction pass.

## Decision 2: Social Media Manager

Target: Social Media Manager automation.

Before state: enabled visually; possible Facebook, Instagram, and LinkedIn Organization dependencies.

Proposed after state: lab-only if non-public simulation exists; otherwise disabled until lab testing is complete.

Risk: scheduling or publishing could bypass Social Recovery governance.

Observed lab risk: Social/brand lane contamination remains moderate; do not let Social Media Manager publish or schedule outside Social Recovery governance.

Workspace-aware risk: separate Publishing, Financial, and Foundation workspaces make brand-scope correctness more important. Public scheduling or publishing remains high-risk/lab-only.

Rollback: re-enable after lab controls and approval flow are proven.

Recommendation: approve disable unless a safe lab-only mode is confirmed first.

Exact Founder response: `APPROVE DISABLE SOCIAL MEDIA MANAGER IF NO SAFE LAB MODE` or `KEEP SOCIAL MEDIA MANAGER ENABLED FOR LAB OBSERVATION`.

## Decision 3: Facebook Commenter

Target: Facebook Commenter automation.

Before state: enabled visually; possible Facebook dependency.

Proposed after state: hold with no production authority; lab-only only if non-public simulation exists.

Risk: public comments create external engagement, reputation, and governance exposure.

Rollback: restore only after explicit production approval, if ever.

Recommendation: hold; do not allow public commenting.

Exact Founder response: `APPROVE FACEBOOK COMMENTER HOLD / NO PUBLIC COMMENTS`.

## Decision 4: Focused Brain Quarantine/Rehome

Target: exact 17 quarantine records and exact 8 rehome/reference candidates only, all currently evaluated as J Merrill One Brain influence.

Before state: active in One Brain unless Sintra internally isolates them; safe primitive not proven.

Proposed after state: remove/isolate from J Merrill One Brain influence through reversible quarantine or source-backed reference/projection after exact body inspection.

Risk: active contamination if left in One Brain; data loss if deletion is improvised.

Observed lab risk: Publishing records were treated as a governing rulebook inside One Brain; this supports quarantine/rehome design, but not deletion or opaque batch mutation.

Potential destinations/references: J Merrill Publishing for Publishing-specific material, J Merrill Financial for Financial-specific material, J Merrill Foundation for Foundation-specific material, and authoritative external source/reference for governed canon. Do not assume physical rehome is required; authoritative source plus projection/reference is preferred.

Rollback: only use reversible methods with export/checksum evidence.

Recommendation: approve design, not execution, until Sintra quarantine/rehome primitive is proven and individual record bodies are inspected.

Exact Founder response: `APPROVE QUARANTINE DESIGN ONLY — NO DELETE`.

The 52 unseen records are excluded from this mutation packet.

No deletion authority is granted. Mutations authorized by this boundary correction pass: 0. Inbox Manager's prior disable remains the only executed recovery mutation.
