# J Merrill One — Web Scaffold v1
## Phase 1: Parent Layer (jmerrill.one)

Canon: JM1 Web Canon v1 | March 2026 | Confidential

---

## Quick Start

```bash
npm install
npm run dev      # localhost:3000
npm run build    # production build
```

## Structure

```
app/
  page.tsx                  Homepage — 14 sections, Canon v1 order (LOCKED)
  ecosystem/page.tsx        /ecosystem
  operating-model/page.tsx  /operating-model
  contact/page.tsx          /contact — division router
  why-we-exist/page.tsx     /why-we-exist

components/
  Nav.tsx                   Navigation (Canon v1 Sec 07 — LOCKED)
  Footer.tsx                Footer + signature (Canon v1 Sec 05 — LOCKED)
  sections/HomeSections.tsx All 11 homepage section components

lib/
  tokens.ts                 Design tokens + division registry (Canon v1 Sec 08)

content/
  canon.ts                  ALL locked copy (Canon v1 Sec 05 — LOCKED)
```

## Single Source of Truth

All copy: `content/canon.ts` — edit here, updates everywhere.
All tokens: `lib/tokens.ts` + `tailwind.config.ts`

## Deployment — Azure Static Web Apps

Framework: Next.js | Build: `npm run build` | Output: `.next`

## Phase 2 Next Steps

- [ ] Dataverse intake forms → /contact division router
- [ ] Microsoft Bookings embed per division
- [ ] Division sites: jmerrill.pub, jmerrill.financial, jmerrill.foundation
- [ ] Power Automate cross-brand routing
- [ ] Shared contact record across all four divisions

© 2026 J Merrill One
