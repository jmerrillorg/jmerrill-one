# HFWEB-01 Public Site Inventory

Date: 2026-08-12
Baseline commit: 2badddc2d4d67f0e5f08385dd13a55e7a4e7beee
Scope: Public `jmerrill.one` routes excluding backend implementation under `/api/intake`.

## Inventory Summary

| Route | Purpose | Primary Audience | Pre-HFWEB Finding | Human-First | Why-First | Tech Density | Classification | Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Parent front door and path finder | General visitors, authors, families, donors, productions prospects | Strong brand but too much system/architecture framing | 3/5 | 4/5 | High | KEEP - REWRITE | Rebuilt copy around Why, needs, four companies, proof, and contact |
| `/why-we-exist` | Explain JM1 purpose | All public audiences | Still explained the company through system/infrastructure language | 3/5 | 4/5 | High | KEEP - REWRITE | Rewritten as least technical page |
| `/#divisions` | Four-company discovery | Visitors choosing a branch | Division identity was clear but framed as system outputs | 3/5 | 3/5 | Medium | KEEP - REWRITE | Reframed as four companies serving four human needs |
| `/divisions/[division]` | Parent-level bridge to each division | Division-specific prospects | Useful services and proof, but parent-system and routing language remained visible | 4/5 | 4/5 | Medium | KEEP - MINOR CLEANUP | Removed internal architecture and Microsoft proof badges |
| `/contact` | Start Here intake | All prospects | BP-09 functionality correct; visible copy exposed routing/intake wording | 5/5 | 4/5 | Low | KEEP - MINOR CLEANUP | Preserved `/api/intake`; softened visible language |
| `/operating-model` | Secondary enterprise reference | Partners, vendors, procurement, due diligence | Legitimate secondary value, but too prominent and architecture-led | 2/5 | 2/5 | High | MOVE TO SECONDARY ENTERPRISE SURFACE | Removed from primary nav and rewrote as "How We Work" |
| `/ecosystem` | Explain how companies connect | General/secondary visitors | Could serve visitors if rewritten away from architecture | 4/5 | 3/5 | Medium | KEEP - REWRITE | Repositioned as "How Our Companies Connect" |
| `/card/jackie` | Noindex digital card | Direct recipients | Minor system-first tagline in metadata/body | 4/5 | 3/5 | Low | KEEP - MINOR CLEANUP | Updated to four companies/one commitment |

## Navigation

Before: `Why We Exist | Divisions | Operating Model | Contact | Start Here`

After: `Why We Exist | Divisions | Contact | Start Here`

Footer retains secondary links for `How We Work` and `How Our Companies Connect` under `Enterprise / Partners`.

## Recommended Action Result

Inventory supported full HFWEB-01 remediation without backend changes. No route required retirement or redirect in this package.
