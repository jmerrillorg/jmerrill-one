/**
 * JM1 Canonical Copy
 * Source: JM1 Web Canon v1 + Addendum v1.1 (March 2026)
 * GOVERNANCE: LOCKED — Verbatim. No variation without CEO approval.
 */

export const canon = {
  siteName:    "J Merrill One",
  siteTagline: "What people build should last. Four companies. One commitment to legacy.",
  location:    "Headquartered in Columbus, OH",   // v1.1: no street address on any public page
  domain:      "jmerrill.one",
  year:        "2026",

  nav: {
    wordmark:    "J Merrill",
    wordmarkSup: "ONE",
    links: ["Why We Exist", "Divisions", "Contact"],
    cta: "Start Here",
  },

  // ── Hero — WHY-first per Canon v1.1 governance rule ─────────────────────
  hero: {
    eyebrow:   "Columbus, OH · Four Companies · One Commitment",
    headline:  ["What you", "build should", "last."],
    heEmphasis: "build should",   // italic word
    bridge:    "Your words, your family, your generosity, and your story deserve care that lasts beyond the moment.",
    body:      "J Merrill One helps people find the right path across publishing, family protection, community impact, and production work.",
    cta1:      "Start Here",
    cta2:      "Explore Our Companies",
    stats: [
      { value: "125+", label: "Authors published and owning their work" },
      { value: "4",    label: "Companies serving distinct human needs" },
      { value: "01",   label: "Shared commitment to what people build" },
      { value: "75",   label: "Families served last Thanksgiving — 150 is the goal" },
    ],
  },

  ticker: [
    "What you build should last",
    "Ideas deserve to outlive the moment",
    "Families deserve protection",
    "Communities deserve more",
    "Messages deserve to reach further",
    "Legacy is by design, not by chance",
  ],

  why: {
    kicker:    "Why We Exist",
    headline:  "What people build should last.",
    statement: "Ideas. Families. Wealth. Communities. Too often, they don't get the continuity they deserve. J Merrill One exists to help more of what people build carry forward.",
  },

  bridge: {
    kicker:   "Built for Real People",
    headline: "Real families.\nReal decisions.\nReal moments.",
    sub:      "Whatever you're trying to move forward, there is a path here for you.",
  },

  sysdef: {
    kicker:   "Why One",
    headline: ["Different needs.", "One commitment.", "A clearer path."],
    title:    "People should not have to start over when their needs change.",
    body:     "A person may become an author, need to protect a family, want to support a community, or need a story brought to life. J Merrill One exists so those paths can remain connected by care, continuity, and trust.",
    layers: [
      { tag: "Need 01", name: "Words and Ideas",       desc: "Books, manuscripts, and messages deserve a future beyond the moment they are created." },
      { tag: "Need 02", name: "Family and Legacy",     desc: "Families deserve clarity before crisis, protection before confusion, and plans that people can understand." },
      { tag: "Need 03", name: "Community and Story",   desc: "Generosity, service, and stories become stronger when they are given a path to continue." },
    ],
  },

  divisions: {
    kicker:   "The Divisions",
    headline: ["Four companies.", "One purpose."],
    sub:      "Each company serves a different human need. Together, they help people protect, publish, give, and bring meaningful work to life.",
  },

  statement: {
    pre:  "Human Position",
    line1: "We are not building a company.",
    line2: "We are helping what people build carry forward.",
    sub:  "The work is practical: clearer books, protected families, stronger communities, and stories that reach the people they were meant to reach.",
  },

  flow: {
    kicker:   "How Paths Continue",
    headline: ["Life does not stay", "in one box."],
    sub:      "Someone may arrive with one need and discover another later. J Merrill One helps the next conversation feel natural, not like starting over.",
    note:     "One representative pathway — not the only one.",
    steps: [
      { num: "01", head: "Idea",    body: "A story, vision, or message ready to move from concept to impact", brand: null },
      { num: "02", head: "Publish", body: "Transformed into a book — owned, distributed, and legacy-building",  brand: "Publishing" },
      { num: "03", head: "Amplify", body: "Media and content extend the message to more of the people who need it", brand: "Productions" },
      { num: "04", head: "Protect", body: "Income structured, estate organized, wealth preserved for loved ones", brand: "Financial" },
      { num: "05", head: "Continue",  body: "Impact sustained and carried forward for the people and communities connected to it",    brand: "Foundation" },
    ],
  },

  opmodel: {
    kicker:   "How We Work",
    headline: ["The structure", "that supports the care."],
    sub:      "J Merrill One keeps shared standards behind the scenes so each company can serve people with clarity, accountability, and continuity.",
    cards: [
      { icon: "01", name: "One Shared\nMemory",        desc: "People should not have to repeat their story every time a need changes. JM1 keeps the relationship clear across its companies.", items: ["Cleaner handoffs","Shared relationship context","Less starting over"] },
      { icon: "02", name: "One Care\nStandard",        desc: "Public language, service expectations, and division behavior stay aligned so people experience one level of trust.", items: ["Human-first language","Clear accountability","Consistent follow-through"] },
      { icon: "03", name: "One Next\nStep",            desc: "When publishing, family planning, giving, or storytelling creates a natural next need, JM1 helps the conversation continue.", items: ["Thoughtful referrals","Clear paths","Continuity across companies"] },
    ],
  },

  entry: {
    kicker:   "Find Your Path",
    headline: ["What are you", "trying to move forward?"],
    sub:      "Every person arrives at J Merrill One from a different moment in life. Tell us where you are, and we'll help your message reach the right team.",
  },

  // ── Proof Layer — added v1.1 ─────────────────────────────────────────────
  proof: {
    kicker:   "What This Looks Like",
    headline: ["Real people.", "Real outcomes."],
    sub:      "The work exists to serve real moments in real lives. Here is what that looks like in practice.",
    stories: [
      { division: "Publishing", accent: "#1E90FF", headline: "A first-time author.\nNow distributed globally.", body: "A manuscript that lived in a drawer became a published title available in bookstores, on Amazon, and in libraries — owned entirely by its author.", why: "What you write should not disappear." },
      { division: "Financial",  accent: "#007F5C", headline: "A family.\nFully protected.", body: "A widow with no estate plan had a complete will, trust, and healthcare directive in place within days — clear, affordable, and without intimidation.", why: "What you build should not leave your family unprotected." },
      { division: "Foundation", accent: "#93329E", headline: "A community initiative.\nStill running years later.", body: "A Thanksgiving meal program that started as a single event became a sustained community institution — serving hundreds of families year after year.", why: "What you give should not be temporary." },
      { division: "Productions", accent: "#FF6F00", headline: "A message.\nCarried further.", body: "A speaker with expertise and no clear path became a podcaster, a content creator, and a recognized voice in their field — reaching audiences they couldn't reach alone.", why: "What you create should reach further than you can alone." },
    ],
  },

  authority: {
    kicker:   "Trust & Proof",
    headline: ["Real work.", "Real continuity."],
    sub:      "Proof begins with people helped, families protected, authors published, and communities served.",
    stats: [
      { value: "125+", label: "Authors published\nand owning their work" },
      { value: "4",    label: "Companies. One\ncommitment. Clear paths." },
      { value: "75",   label: "Families served last Thanksgiving\n— 150 is the goal" },
    ],
    badges: [
      "GPO Registered Vendor",
      "SAM.gov Active Entity",
      "IngramSpark Distribution Partner",
      "Headquartered in Columbus, OH",
    ],
  },

  footerSig: "J Merrill One helps people protect and carry forward what they build across publishing, family planning, community impact, and media production.",

  footer: {
    tagline: "What people build should last.\nFour companies. One commitment.\nIn service of legacy.",
    cols: [
      { head: "Divisions",  links: [["Publishing","https://jmerrill.pub"],["Financial","https://jmerrill.financial"],["Foundation","https://jmerrill.foundation"],["Productions","/contact?division=productions"]] },
      { head: "J Merrill One", links: [["Why We Exist","/why-we-exist"],["Contact","/contact"],["Start Here","/contact"]] },
      { head: "Enterprise / Partners", links: [["How We Work","/operating-model"],["How Our Companies Connect","/ecosystem"]] },
    ],
    copy:  "© 2026 J Merrill One. All rights reserved. Headquartered in Columbus, OH.",
    legal: ["Privacy","Terms","Legal"],
  },

  // ── Intake form routing — v1.1 ───────────────────────────────────────────
  // Primary submit path: /api/intake receives website requests for the right team.
  // Email routes remain a visible fallback only when governed intake is unavailable.
  intake: {
    emailRoutes: {
      publishing:  "publishing@jmerrill.one",
      financial:   "financial@jmerrill.one",
      foundation:  "foundation@jmerrill.one",
      productions: "productions@jmerrill.one",
      fallback:    "info@jmerrill.one",
    },
  },
} as const;
