# Drift Audit

Last verified: 2026-08-27T10:16:14Z

| Drift condition | Result |
| --- | --- |
| Wrong sender | DENY / covered |
| Wrong Reply-To | DENY / covered |
| Missing sender | DENY / covered by registry validation |
| Unknown brand fallback | DENY / covered |
| Unverified domain | No current evidence of unverified active canonical sender domain |
| Mailbox authority mismatch | DENY / covered by registry validation |
| Hardcoded Publishing fallback | 0 active in enterprise sender policy |
| Universal-domain string construction | 0 active in enterprise sender policy |
| Duplicate signature | DENY / covered in runtime guard evidence |
| Human-First failure | DENY / covered in Human-First policy/runtime evidence |
| Cross-brand misrouting | DENY / 42 / 42 |
| AIC readback failure | ACTIVE RESIDUAL GAP |

Current sender drift:

`ACTIVE_SENDER_DRIFT = 0`

Residual:

`AIC_MAILBOX_FOLDER_READBACK_ACCESS`

This is not a sender-address drift. It is a delegated readback/access gap for the AIC shared mailbox folders.
