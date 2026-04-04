/**
 * JM1 Design Tokens
 * Source: JM1 Web Canon v1 — Section 08 (Visual System)
 * GOVERNANCE: LOCKED — No changes without CEO approval
 * Change control: Major — requires CEO approval per Canon v1 Section 10
 */

export const colors = {
  // ── JM1 Master Palette ──────────────────────────────────
  navy:    "#002C54",   // Headlines, nav, CTAs, authority sections
  gold:    "#F4B400",   // Kickers, dividers, WHY highlights, borders
  steel:   "#A3C4DC",   // Subtle accents, dark section text
  ink:     "#05111F",   // Dark backgrounds, statement bands
  mid:     "#4A5568",   // Body text throughout
  pale:    "#F7F8FA",   // Card backgrounds, alternating sections
  white:   "#FFFFFF",   // Primary background
  rule:    "rgba(0,44,84,0.09)",

  // ── Division Accent Colors ───────────────────────────────
  // Usage: top bar on hover, tags, links — per division only
  pub:     "#1E90FF",   // J Merrill Publishing
  fin:     "#007F5C",   // J Merrill Financial
  fnd:     "#93329E",   // J Merrill Foundation
  pro:     "#FF6F00",   // J Merrill Productions
} as const;

export const fonts = {
  // Source: Canon v1 Section 08 — Typography
  serif:  "'Instrument Serif', Georgia, serif",           // Display / Headline
  sans:   "'Syne', system-ui, sans-serif",                // UI / Navigation / Labels
  mono:   "'DM Mono', 'Courier New', monospace",          // Kickers / Tags / Labels
} as const;

export const spacing = {
  sectionY: "5.5rem",    // All section padding — desktop
  sectionYMobile: "3rem", // Mobile
} as const;

/**
 * Division registry
 * Source: Canon v1 Section 06 — Division Framework
 */
export const divisions = [
  {
    id:         "publishing",
    num:        "01",
    label:      "Publishing",
    fullName:   "J Merrill Publishing",
    accent:     colors.pub,
    domain:     "jmerrill.pub",
    why:        "What you write should not disappear.",
    tagline:    "Helping authors help themselves.",
    desc:       "Full-service publishing for authors who want to own their intellectual property and build lasting legacies through the written word.",
    humanTitle: "You have something to say.",
    humanBody:  "We help you say it right — and own it. Helping authors help themselves every step of the way.",
    entryLabel: "I want to publish my book",
    entrySub:   "125+ authors published and owning their work. Your manuscript deserves the same. We handle everything from editing through distribution.",
    ctaLabel:   "Start publishing",
    heroBridge:  "We help you say it right — and make sure you own it.",
  },
  {
    id:         "financial",
    num:        "02",
    label:      "Financial",
    fullName:   "J Merrill Financial",
    accent:     colors.fin,
    domain:     "jmerrill.financial",
    why:        "What you build should not leave your family unprotected.",
    tagline:    "It's not about me — it's about our families.",
    desc:       "Advanced planning, estate readiness, and legacy structuring — protecting and organizing what matters most for families.",
    humanTitle: "Your family deserves to be protected.",
    humanBody:  "Wills, trusts, and estate structures that give the people you love clarity and security.",
    entryLabel: "I need to get my affairs in order",
    entrySub:   "No will. No trust. No plan. That is the situation most families are in right now. We fix that — starting with one conversation.",
    ctaLabel:   "Protect your family",
    heroBridge:  "Wills, trusts, and estate structures — clarity and security for the people you love.",
  },
  {
    id:         "foundation",
    num:        "03",
    label:      "Foundation",
    fullName:   "J Merrill Foundation",
    accent:     colors.fnd,
    domain:     "jmerrill.foundation",
    why:        "What you give should not be temporary.",
    tagline:    "Impact that outlasts the moment.",
    desc:       "Community impact, charitable infrastructure, and nonprofit operations designed for generosity that compounds over generations.",
    humanTitle: "Your generosity can outlast the moment.",
    // Governance note: meal programs referenced as representative example only — not centerpiece
    humanBody:  "From community programs to long-term initiatives — giving that creates lasting change, not just seasonal relief.",
    entryLabel: "I want to give or support my community",
    entrySub:   "75 families fed last Thanksgiving. The goal this year is 150. Volunteer, donate, or partner with us.",
    ctaLabel:   "Get involved",
    heroBridge:  "From community programs to long-term impact — giving that outlasts the moment.",
  },
  {
    id:         "productions",
    num:        "04",
    label:      "Productions",
    fullName:   "J Merrill Productions",
    accent:     colors.pro,
    domain:     "jmerrill.productions",
    why:        "What you create should reach further than you can alone.",
    tagline:    "Message, mission, movement — amplified.",
    desc:       "Media, storytelling, and content production that amplifies message, mission, and movement across every format and platform.",
    humanTitle: "Your message needs to reach further.",
    humanBody:  "Video, audio, and storytelling that amplifies what you're building — so your message travels farther than you can alone.",
    entryLabel: "I need to bring my message to life",
    entrySub:   "Your story is ready. Video, audio, and content production that carries it to the people who need to hear it — and beyond.",
    ctaLabel:   "Amplify your message",
    heroBridge:  "Video, audio, and storytelling that amplifies what you're building.",
  },
] as const;

export type Division = typeof divisions[number];
