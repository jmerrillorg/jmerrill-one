/**
 * JM1 Canonical Copy
 * Source: JM1 Web Canon v1 + Addendum v1.1 (March 2026)
 * GOVERNANCE: LOCKED — Verbatim. No variation without CEO approval.
 */

export const canon = {
  siteName:    "J Merrill One",
  siteTagline: "What people build should last. One system. Four divisions. In service of legacy.",
  location:    "Headquartered in Columbus, OH",   // v1.1: no street address on any public page
  domain:      "jmerrill.one",
  year:        "2026",

  nav: {
    wordmark:    "J Merrill",
    wordmarkSup: "ONE",
    links: ["Why We Exist", "Divisions", "Operating Model", "Contact"],
    cta: "Start Here",
  },

  // ── Hero — WHY-first per Canon v1.1 governance rule ─────────────────────
  hero: {
    eyebrow:   "Enterprise Platform · Columbus, OH",
    headline:  ["What you", "build should", "last."],
    heEmphasis: "build should",   // italic word
    bridge:    "Most people never build the system to protect it. J Merrill One does that — for your family, your words, your legacy, and your community.",
    body:      "J Merrill One is the system that structures, protects, and carries forward what people build — across publishing, financial strategy, community impact, and media production.",
    cta1:      "Protect Your Family",
    cta2:      "Start Your Legacy",
    stats: [
      { value: "125+", label: "Authors published and owning their work" },
      { value: "4",    label: "Integrated Operating Divisions" },
      { value: "01",   label: "Unified Enterprise System" },
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
    statement: "Ideas. Families. Wealth. Communities. Too often, they don't. J Merrill One exists to change that — by building the system that structures, protects, and carries them forward.",
  },

  bridge: {
    kicker:   "Built for Real People",
    headline: "Real families.\nReal decisions.\nReal moments.",
    sub:      "The system exists to serve people — not the other way around. Whatever you're trying to move forward, there is a path here for you.",
  },

  sysdef: {
    kicker:   "What Is J Merrill One",
    headline: ["One system.", "Four expressions.", "Infinite leverage."],
    title:    "J Merrill One is not a company with multiple services.",
    body:     "It is an integrated enterprise platform that unifies intellectual property, financial strategy, community impact, and media production into a single operating system. Every division shares one data layer, one governance model, and one intelligence infrastructure — creating leverage that no single-brand company can replicate.",
    layers: [
      { tag: "Layer 01", name: "One Data Layer",          desc: "A single contact record, a single relationship model, and shared intelligence across every division and every client interaction." },
      { tag: "Layer 02", name: "One Governance Model",    desc: "Canon control, AI standards, brand architecture, and technology decisions governed centrally — not duplicated per brand." },
      { tag: "Layer 03", name: "One Intelligence System", desc: "AI agents, workflow automation, and cross-division opportunity routing — built at the enterprise level, not bolted on after the fact." },
    ],
  },

  divisions: {
    kicker:   "The Divisions",
    headline: ["Four divisions.", "Outputs of the system."],
    sub:      "Each division is a precision expression of the JM1 platform — purpose-built for its domain, governed by the parent architecture, connected to every other division through shared infrastructure.",
  },

  statement: {
    pre:  "Enterprise Position",
    line1: "We are not building a company.",
    line2: "We are building the infrastructure for generational legacy.",
    sub:  "Every system, every workflow, and every tool at J Merrill One is engineered to protect what people build — and carry it forward for the people they love.",
  },

  flow: {
    kicker:   "System Intelligence",
    headline: ["The power is in", "the orchestration."],
    sub:      "The JM1 advantage is the intelligence that routes, connects, and compounds value across all four divisions.",
    note:     "One representative pathway — not the only one.",
    steps: [
      { num: "01", head: "Idea",    body: "A story, vision, or message ready to move from concept to impact", brand: null },
      { num: "02", head: "Publish", body: "Transformed into a book — owned, distributed, and legacy-building",  brand: "Publishing" },
      { num: "03", head: "Amplify", body: "Media and content extend reach and build a platform for the message", brand: "Productions" },
      { num: "04", head: "Protect", body: "Income structured, estate organized, wealth preserved for loved ones", brand: "Financial" },
      { num: "05", head: "Legacy",  body: "Impact sustained and passed forward through community and giving",    brand: "Foundation" },
    ],
  },

  opmodel: {
    kicker:   "Operating Model",
    headline: ["The architecture", "that runs it all."],
    sub:      "J Merrill One operates on a three-layer infrastructure that gives every division intelligence, governance, and automation that would otherwise require separate enterprise investments.",
    cards: [
      { icon: "DV", name: "Unified\nData Layer",        desc: "Microsoft Dataverse as the single source of truth. One contact record. One relationship model. Every client is known across all four divisions.", items: ["One contact across all divisions","Shared relationship intelligence","Lifetime value made visible"] },
      { icon: "AI", name: "AI\nOrchestration",          desc: "A governed agent operating system with dedicated AI support for Publishing, Financial, Marketing, and Executive decisions within the JM1 governance framework.", items: ["Division-specific AI agents","Enterprise governance layer","Azure AI Foundry integration"] },
      { icon: "PA", name: "Cross-Division\nExecution",  desc: "Power Automate routing that detects cross-brand opportunities in real time — every client touchpoint becomes enterprise-wide intelligence and action.", items: ["Publishing → Financial routing","Financial → Foundation pathways","Productions amplifies all divisions"] },
    ],
  },

  entry: {
    kicker:   "Find Your Path",
    headline: ["What are you", "trying to move forward?"],
    sub:      "Every person arrives at J Merrill One from a different moment in life. Tell us where you are, and we'll route you to the right division.",
  },

  // ── Proof Layer — added v1.1 ─────────────────────────────────────────────
  proof: {
    kicker:   "What This Looks Like",
    headline: ["Real people.", "Real outcomes."],
    sub:      "The system exists to serve real moments in real lives. Here is what that looks like in practice.",
    stories: [
      { division: "Publishing", accent: "#1E90FF", headline: "A first-time author.\nNow distributed globally.", body: "A manuscript that lived in a drawer became a published title available in bookstores, on Amazon, and in libraries — owned entirely by its author.", why: "What you write should not disappear." },
      { division: "Financial",  accent: "#007F5C", headline: "A family.\nFully protected.", body: "A widow with no estate plan had a complete will, trust, and healthcare directive in place within days — clear, affordable, and without intimidation.", why: "What you build should not leave your family unprotected." },
      { division: "Foundation", accent: "#93329E", headline: "A community initiative.\nStill running years later.", body: "A Thanksgiving meal program that started as a single event became a sustained community institution — serving hundreds of families year after year.", why: "What you give should not be temporary." },
      { division: "Productions", accent: "#FF6F00", headline: "A message.\nExpanded across platforms.", body: "A speaker with expertise and no platform became a podcaster, a content creator, and a recognized voice in their field — reaching audiences they couldn't reach alone.", why: "What you create should reach further than you can alone." },
    ],
  },

  authority: {
    kicker:   "Proof of System",
    headline: ["Operational at", "enterprise scale."],
    sub:      "Built with the rigor of public institutions. Operated with the precision of modern technology. In service of real people and real outcomes.",
    stats: [
      { value: "125+", label: "Intellectual assets\ndistributed" },
      { value: "4",    label: "Integrated operating\ndivisions" },
    ],
    badges: [
      "GPO Registered Vendor",
      "SAM.gov Active Entity",
      "IngramSpark Distribution Partner",
      "Microsoft Power Platform Ecosystem",
      "Dynamics 365 · Business Central · Azure",
      "Headquartered in Columbus, OH",
    ],
  },

  footerSig: "J Merrill One operates as a unified enterprise system across publishing, financial strategy, community impact, and media production — built to serve real people, governed by a single architecture, powered by a single intelligence layer.",

  footer: {
    tagline: "What people build should last.\nOne system. Four divisions.\nIn service of legacy.",
    cols: [
      { head: "Divisions",  links: [["Publishing","https://jmerrill.pub"],["Financial","https://jmerrill.financial"],["Foundation","https://jmerrill.foundation"],["Productions","https://jmerrill.productions"]] },
      { head: "Enterprise", links: [["Why We Exist","/why-we-exist"],["Operating Model","/operating-model"],["Ecosystem","/ecosystem"],["Contact","/contact"]] },
      { head: "Connect",    links: [["Contact","/contact"],["Appointments","https://jmerrill.financial"],["Partnership","/contact?type=partnership"],["Vendor Portal","/contact?type=vendor"]] },
    ],
    copy:  "© 2026 J Merrill One. All rights reserved. Headquartered in Columbus, OH.",
    legal: ["Privacy","Terms","Legal"],
  },

  // ── Intake form routing — v1.1 ───────────────────────────────────────────
  // Phase 1: mailto routing per division inbox
  // Phase 2: replace with Power Automate HTTP trigger (see contact page comment)
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
