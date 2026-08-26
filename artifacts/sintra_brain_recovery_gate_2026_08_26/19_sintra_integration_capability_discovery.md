# Sintra Integration Capability Discovery

Inspection timestamp: 2026-08-26T04:45:27-04:00

Workspace: J Merrill One

## Social Execution

| Capability | Live status | Observed support | Recommendation |
|---|---|---|---|
| Facebook | Connected | Manage Facebook and Instagram pages, accounts, and posts | REVIEW before lab |
| Instagram | Connected | Manage Instagram Business or Creator account | REVIEW before lab |
| LinkedIn Organization | Connected | Create/share posts on organization behalf | REVIEW before lab |
| LinkedIn Personal | Connect | Create/share posts with personal network | DO_NOT_CONNECT without approval |
| YouTube | Connect | Upload/manage videos | REVIEW later |
| TikTok | Connect | Upload/manage videos | REVIEW later |
| Meta Ads | Connect | Manage Facebook/Instagram ad campaigns | HOLD until ad governance |
| Ayrshare | Not visible in captured catalog pages | Unknown | INSUFFICIENT_EVIDENCE |
| Planly | Not visible in captured catalog pages | Unknown | INSUFFICIENT_EVIDENCE |

## Microsoft / Enterprise Connectors

| Capability | Live status | Observed support | Recommendation |
|---|---|---|---|
| Outlook | Connect | Handle Outlook emails | DO_NOT_CONNECT for social lab |
| Microsoft Teams | Connect | Chat, video, meetings, file storage within Microsoft 365 | SECURITY_REVIEW_REQUIRED |
| GitHub | Connect | Manage issues and PRs | SECURITY_REVIEW_REQUIRED |
| Google Drive | Connect | Create/read docs/sheets/files | SECURITY_REVIEW_REQUIRED despite non-Microsoft source |
| OneDrive | Not visible in captured catalog pages | Unknown | INSUFFICIENT_EVIDENCE |
| Excel | Not visible in captured catalog pages | Unknown | INSUFFICIENT_EVIDENCE |
| Microsoft Clarity | Not visible in captured catalog pages | Unknown | INSUFFICIENT_EVIDENCE |
| Dynamics 365 | Not visible in captured catalog pages | Unknown | INSUFFICIENT_EVIDENCE / DO_NOT_CONNECT |

Dynamics 365 classification: INSUFFICIENT_EVIDENCE. No live connector detail was opened; no OAuth scope, Dataverse table selection, read-only scoping, or helper/automation action surface was proven.

## Canva / Creative Pipeline

Canva is visible as available but unconnected. The catalog description says Canva offers a drag-and-drop design suite for social graphics, presentations, and marketing materials with templates and an element library.

Classification: PARTIAL. It may support social creative production, but no JM1 brand-kit/template access, export workflow, or social handoff has been verified.

## Integration-Orchestration

| Tool | Visible? | Potential use | Recommendation |
|---|---:|---|---|
| Make | Not confirmed | External orchestration | INSUFFICIENT_EVIDENCE |
| CustomJS | Not confirmed | Custom code actions | INSUFFICIENT_EVIDENCE |
| Nango | Not confirmed | Integration auth/orchestration | INSUFFICIENT_EVIDENCE |
| Hookdeck | Not confirmed | Webhook ingress/egress | INSUFFICIENT_EVIDENCE |
| Anchor Browser | Not confirmed | Browser automation | INSUFFICIENT_EVIDENCE |
| Browserbase | Not confirmed | Browser automation | INSUFFICIENT_EVIDENCE |
| Browserless | Not confirmed | Browser automation | INSUFFICIENT_EVIDENCE |
| Hyperbrowser | Not confirmed | Browser automation | INSUFFICIENT_EVIDENCE |
| Ayrshare | Not confirmed | Unified social publishing | INSUFFICIENT_EVIDENCE |

## Conclusion

Sintra can participate in social execution and helper-driven workflows in principle, but this pass does not prove it can safely serve as an externally orchestrated, least-privilege enterprise execution layer. Continue with lab-only recovery after Jackie approves the Brain/integration diff.
