# Validation

Last verified: 2026-08-26T15:57:26Z

| Repository | Focused guard | Build | Caveat |
| --- | --- | --- | --- |
| `jmerrill-financial` | PASS | PASS | Node 26 used; repo declares Node 24 |
| `jmerrillfoundation` | PASS | PASS | Node 26 used; repo declares Node 24 |
| `jmerrill-productions` | PASS | PASS | Node 26 used; repo declares Node 24 |
| `aic-online` | PASS | PASS | Node 26 used; repo declares Node 20-22; local Planning Center credentials absent |

Commands:

- `pnpm install --frozen-lockfile`
- `pnpm run test:human-first`
- `pnpm run build`

No destructive scripts were run.
