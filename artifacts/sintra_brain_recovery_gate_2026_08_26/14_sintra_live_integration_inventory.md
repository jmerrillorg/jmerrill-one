# Sintra Live Integration Inventory

Inspection timestamp: 2026-08-26T04:45:27-04:00

Workspace: J Merrill One

## Connected Integrations

| Integration | ConnectedStatus | Visible capability | Scope detail | Business purpose | Risk | RecommendedDisposition |
|---|---|---|---|---|---|---|
| Facebook | Connected | Manage Facebook and Instagram pages, accounts, and posts | Exact OAuth scopes/account/page not visible | Social publishing/management candidate | HIGH until page/account/scope verified | REVIEW |
| Instagram | Connected | Manage Instagram Business or Creator account | Exact account/scope not visible | Social publishing/management candidate | HIGH until account/scope verified | REVIEW |
| Google Analytics | Connected | Access Google Analytics data and insights | Property/account not visible | Marketing measurement candidate | MEDIUM | REVIEW |
| LinkedIn (Organization) | Connected | Create and share posts on organization's behalf | Organization/scope not visible | Social publishing/management candidate | HIGH until organization/scope verified | REVIEW |

## Important Correction: QuickBooks

The prompt assumed QuickBooks was connected. Live J Merrill One integration evidence shows QuickBooks with a `Connect` button, not a connected badge.

Recommended QuickBooks disposition: DO_NOT_CONNECT / NO CURRENT JUSTIFICATION unless Jackie later approves a narrowly scoped finance use case outside the social operations lab.

## Visible Available But Unconnected Integrations

| Integration | Live status | Visible capability | RecommendedDisposition |
|---|---|---|---|
| GitHub | Connect | Manage issues and pull requests in GitHub repositories | DO_NOT_CONNECT_IN_SINTRA without security review |
| Gmail | Connect | Let helpers send emails and read inbox | DO_NOT_CONNECT for social pilot |
| Google Calendar | Connect | Allow helpers to see and schedule events | REVIEW only if scheduling use case approved |
| Google Drive | Connect | Create/read docs, sheets, and files | DO_NOT_CONNECT without data boundary review |
| Outlook | Connect | Handle Outlook emails | DO_NOT_CONNECT for social pilot |
| Shopify | Connect | Read/manage store orders/products | NO CURRENT JUSTIFICATION |
| Linear | Connect | Manage issues/projects/teams | NO CURRENT JUSTIFICATION |
| Notion | Connect | Read/update Notion data | NO CURRENT JUSTIFICATION |
| Dropbox | Connect | Read/update Dropbox data | NO CURRENT JUSTIFICATION |
| Stripe Connect | Connect | Connect Stripe account | NO CURRENT JUSTIFICATION / financial risk |
| TikTok | Connect | Upload/manage TikTok videos | REVIEW for future social channel only |
| YouTube | Connect | Upload/manage YouTube channel videos | REVIEW for future content channel only |
| LinkedIn (Personal) | Connect | Create/share posts with personal network | REVIEW only after personal brand approval |
| Meta Ads | Connect | Manage Facebook/Instagram ad campaigns | DO_NOT_CONNECT until ad governance exists |
| Google Workspace Admin | Connect | Manage domain users; list/view/create users | DO_NOT_CONNECT / too broad for Sintra social pilot |
| Slack | Connect | Send messages, manage channels, communicate with team | NO CURRENT JUSTIFICATION |
| Canva | Connect | Create social graphics/presentations/marketing materials with templates/element library | PARTIAL; useful candidate, do not connect before approval |
| Typeform | Connect | Build forms, collect data, accept payments, integrate tools | NO CURRENT JUSTIFICATION |
| Microsoft Teams | Connect | Chat, video, meetings, file storage within Microsoft 365 | DO_NOT_CONNECT without Microsoft governance review |
| Salesforce | Connect | CRM sales/service/marketing analytics | NO CURRENT JUSTIFICATION |
| Wix | Connect | Manage sites/products/orders/resources | NO CURRENT JUSTIFICATION |
| ClickUp | Connect | Tasks/docs/goals/chat | NO CURRENT JUSTIFICATION |
| Google Meet | Connect | Meetings/screen sharing/chat | NO CURRENT JUSTIFICATION |
| Intercom | Connect | Live chat, messaging, customer engagement | NO CURRENT JUSTIFICATION |
| Mailchimp | Connect | Campaign templates, audience segmentation, analytics | REVIEW only if email ownership moves outside Microsoft |
| Semrush | Connect | Keyword/competitor/Google Ads campaign optimization | REVIEW for marketing analytics only |

## Scope Limitation

Connector detail pages were not opened because the read-only control layer could not safely distinguish detail inspection from setup/connect/disconnect surfaces. Exact connected accounts, OAuth scopes, helper access, automation access, and last-used values remain UNKNOWN.
