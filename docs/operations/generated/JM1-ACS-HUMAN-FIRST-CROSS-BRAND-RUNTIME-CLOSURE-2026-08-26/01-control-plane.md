# ACS Control Plane Evidence

Last verified: 2026-08-26T21:07:00Z

Azure subscription: `JM1 - Nonprofit Core (2025 Grant)`

Subscription ID: `9ee13245-2303-4010-8b6d-35f7cbcfdc0e`

Tenant ID: `352d075e-8e17-4169-9f8e-22e6946ce66d`

Resource group: `rg-jm1-communications`

ACS Communication Service: `acs-jm1-core`

ACS Email Service: `email-jm1-core`

ACS domain: `email.jmerrill.one`

Domain provisioning state: `Succeeded`

Domain verification:

| Verification | Status |
| --- | --- |
| Domain | Verified |
| SPF | Verified |
| DKIM | Verified |
| DKIM2 | Verified |
| DMARC | NotStarted |

Provisioned ACS sender usernames:

| Sender username | Display name | Address |
| --- | --- | --- |
| `one` | J Merrill One | `one@email.jmerrill.one` |
| `publishing` | J Merrill Publishing | `publishing@email.jmerrill.one` |
| `financial` | J Merrill Financial | `financial@email.jmerrill.one` |
| `foundation` | J Merrill Foundation | `foundation@email.jmerrill.one` |
| `productions` | J Merrill Productions | `productions@email.jmerrill.one` |
| `DoNotReply` | DoNotReply | `DoNotReply@email.jmerrill.one` |

`DoNotReply@email.jmerrill.one` remains historically provisioned but is not the canonical sender for the decided branch identities in `JM1-ACS-SENDER-IDENTITY-v1`.

Runtime target:

| Function App | State | Runtime |
| --- | --- | --- |
| `func-jm1-acs-email-relay` | Running | `Node|22` |

Hosting note: the repository workflow references `func-jm1-acs-email-relay-flex`, but that resource was not found in `rg-jm1-communications` during this pass. The existing production target `func-jm1-acs-email-relay` was therefore used.
