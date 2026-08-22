# Tests and Health Readback

## One Repo

- Node version: v24.11.0
- npm version: 11.6.1
- npm ci: PASS
- type-check: PASS via npx tsc --noEmit
- lint: PASS with one retained warning for custom font loading
- build: PASS via Next.js 16.3.2
- npm audit: PASS, 0 vulnerabilities

## Azure / TLS

- Storage readback: all four targeted accounts report TLS1_2.
- Public health after TLS: jmerrill.one, jmerrill.pub, jmerrill.financial, jmerrill.foundation, jmerrill.productions, jackiesmithjr.com all returned HTTP 200.
- Function state readback: func-jm1-fin-prod, func-jm1-acs-email-relay, and func-jm1-diagnostic-ai-runner Running/Normal.
- Application Insights sampled exceptions: 0 in last 30 minutes for sampled One, Publishing, Financial, Financial Function, ACS relay.
- ACS relay requests query: 35 total, 0 failures in last 30 minutes.
