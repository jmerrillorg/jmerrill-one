# Runtime And Validation Evidence

Last verified: 2026-08-26T21:08:40Z

Runtime implementation:

| Repository | Branch | Head | Change |
| --- | --- | --- | --- |
| `jmerrillorg/jmerrill-pub` | `codex/jm1-acs-crossbrand-runtime-20260826` | `2bac48a42cbc79be9ec733ced71a976dabbd7f82` | Added reusable `send-enterprise-governed-email` route |
| `jmerrillorg/jmerrill-one` | `codex/jm1-acs-humanfirst-runtime-closure-20260826` | started from `81aafa53b8788e5b03a646cb6c8a7100f50135bc` | Aligned Human-First sender overlays and recorded closeout evidence |

Runtime route responsibilities implemented:

- brand sender resolution;
- reply routing;
- signature profile validation;
- sender / Reply-To identity validation;
- Human-First internal-language enforcement;
- duplicate signature guard;
- financial high-risk compliance review;
- Foundation promotional consent guard;
- Productions rights/contract human-review guard;
- ACS send through the shared relay;
- safe error responses.

Local validation:

| Check | Result |
| --- | --- |
| `npm ci` | PASS, 0 vulnerabilities |
| `npm test` | 79 / 79 PASS |
| `npm run lint` | PASS |
| Enterprise policy JSON parse | PASS |

Local environment note:

The local shell ran Node `v26.0.0`; the package declares Node `>=24 <25`, so `npm ci` emitted an engine warning. Tests and lint passed. Production is currently `Node|22`; this hosting/runtime version difference is preserved as an infrastructure follow-up and was not used to block the sender-runtime closure.
