# Sintra Live Automation Inventory

Inspection timestamp: 2026-08-26T04:45:27-04:00

Workspace: J Merrill One

## Visible Automations

| AutomationName | Enabled | Status label | HelperUsed | ExternalSideEffects | CurrentValidity | Risk | RecommendedDisposition |
|---|---:|---|---|---|---|---|---|
| Social Media Manager | Enabled visually | Beta | Unknown; likely Soshie/social | Possible social publishing/scheduling | Requires review before lab | HIGH | REVIEW / DO_NOT_MUTATE |
| Inbox Manager | Enabled visually | Beta | Unknown; likely Cassie/email | Possible inbox read/write if email connected | No current approved inbox use | HIGH | REVIEW / DO_NOT_MUTATE |
| Daily Summarizer | Enabled visually | Beta | Unknown | Possible internal summary only | Unknown | MEDIUM | REVIEW |
| Facebook Commenter | Enabled visually | Beta | Unknown | Possible Facebook comment activity | High external side-effect risk | HIGH | REVIEW / DO_NOT_MUTATE |

## Scope Limitation

Automation cards were not opened because card detail actions may expose enable/disable or configuration mutation paths. Trigger, schedule, last-run, integration binding, and approval-gate details remain UNKNOWN.
