# One Dependency Security

## Before

- npm audit: 8 vulnerabilities: 7 high, 1 low.
- Direct runtime candidate: next 16.2.0.

## Change

- next: 16.2.0 -> 16.3.2.
- eslint-config-next: 16.2.0 -> 16.3.2.
- Safe npm audit fix executed without --force to patch transitive advisories.

## After

- npm audit: 0 vulnerabilities.

## Advisory Classification

- Direct runtime: Next.js advisories remediated.
- Transitive runtime/build packages: @babel/core, brace-expansion, js-yaml, picomatch remediated by safe non-force lockfile updates.
- Major upgrade used: no.
- npm audit --force used: no.
