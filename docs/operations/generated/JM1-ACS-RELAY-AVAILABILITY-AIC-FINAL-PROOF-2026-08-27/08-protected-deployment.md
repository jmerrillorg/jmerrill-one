# Protected Deployment

Last verified: 2026-08-28T02:22:02Z

| Field | Value |
| --- | --- |
| Runtime repo | `jmerrillorg/jmerrill-pub` |
| Runtime PR | `#677` |
| Head SHA | `a5bb038a5e353ad6f5a83738bbdfb3c6892ff183` |
| Merge SHA | `0fb3ce01b60a891e37c74b661fee985b654aecbf` |
| Workflow | `Deploy ACS Email Relay (Node 22)` |
| Run ID | `33135589379` |
| Run URL | `https://github.com/jmerrillorg/jmerrill-pub/actions/runs/33135589379` |
| Conclusion | SUCCESS |

The protected workflow now validates:

- Node 22 build runtime;
- tests;
- lint;
- npm audit;
- package provenance;
- deployed runtime stack;
- real unauthenticated POST route health returning governed `401 UNAUTHORIZED`.

