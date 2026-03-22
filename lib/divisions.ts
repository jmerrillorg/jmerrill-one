/**
 * JM1 Division Registry
 * Source: Canon v1 + Addendum v1.1 — Section 06 (Division Framework)
 * GOVERNANCE: WHY expressions LOCKED. CTAs accepted per v1.1.
 */

export interface Service {
  sku: string;
  name: string;
  desc: string;
  price: string;
}

export interface Division {
  id: string;
  num: string;
  label: string;
  fullName: string;
  accent: string;
  domain: string;
  parentLine: string;          // Canon v1.1: always "A J Merrill One Company"
  why: string;                 // LOCKED
  tagline: string;
  heroHeadline: string[];      // lines, last may be italic
  heroItalicLine: number;      // index of italic line
  heroBridge: string;
  heroBody: string;
  cta: string;                 // v1.1 accepted language
  ctaBook: string;
  stats: [string, string][];
  services: Service[];
  badges: string[];
  crossDiv: { label: string; href: string; why: string };
}

export const divisions: Division[] = [
  {
    id:       "publishing",
    num:      "01",
    label:    "Publishing",
    fullName: "J Merrill Publishing",
    accent:   "#1E90FF",
    domain:   "jmerrill.pub",
    parentLine: "A J Merrill One Company",
    why:      "What you write should not disappear.",
    tagline:  "Helping authors help themselves.",
    heroHeadline: ["Your words.", "Your legacy.", "Your rights."],
    heroItalicLine: 1,
    heroBridge: "We help you say it right — and make sure you own it.",
    heroBody:  "What you write should not disappear. J Merrill Publishing is a full-service publishing house for authors who want to own their intellectual property, control their narrative, and build lasting legacies through the written word.",
    cta:       "Start Your Book",
    ctaBook:   "Book a Consultation",
    stats:     [["125+", "Titles distributed"], ["3", "Distribution channels"]],
    services: [
      { sku: "ED-100",  name: "Manuscript Editing",   desc: "Professional developmental, line, and copy editing for authors at any stage.", price: "From $499" },
      { sku: "DES-200", name: "Book Design & Layout",  desc: "Interior typesetting, chapter design, and cover design meeting professional standards.", price: "From $799" },
      { sku: "PUB-300", name: "ISBN & Copyright",      desc: "ISBN registration, copyright filing, and Library of Congress application.", price: "From $149" },
      { sku: "DIST-100",name: "Print Distribution",    desc: "IngramSpark distribution to bookstores, Amazon, and wholesale channels worldwide.", price: "From $299" },
      { sku: "DIST-200",name: "Digital Distribution",  desc: "eBook and audiobook distribution via CoreSource across all major digital retailers.", price: "From $199" },
      { sku: "PKG-001", name: "Publishing Package",    desc: "Full-service: editing, design, ISBN, and distribution in one streamlined package.", price: "From $1,999" },
    ],
    badges: ["IngramSpark Distribution Partner","CoreSource Digital Distribution","GPO Registered Publisher","SAM.gov Active Entity"],
    crossDiv: {
      label: "Financial",
      href:  "/divisions/financial",
      why:   "Authors generating income from published titles are natural Financial candidates for estate planning — protecting the intellectual property and royalty streams they've built.",
    },
  },
  {
    id:       "financial",
    num:      "02",
    label:    "Financial",
    fullName: "J Merrill Financial",
    accent:   "#007F5C",
    domain:   "jmerrill.financial",
    parentLine: "A J Merrill One Company",
    why:      "What you build should not leave your family unprotected.",
    tagline:  "It's not about me — it's about our families.",
    heroHeadline: ["Your family.", "Protected.", "Prepared."],
    heroItalicLine: 1,
    heroBridge: "Wills, trusts, and estate structures — clarity and security for the people you love.",
    heroBody:  "What you build should not leave your family unprotected. J Merrill Financial provides advanced planning, estate readiness, and legacy structuring for individuals and families — clearly, affordably, and without the intimidation of traditional legal processes.",
    cta:       "Protect Your Family",
    ctaBook:   "Book a Consultation",
    stats:     [["60+", "Services offered"], ["5", "Estate plan bundles"]],
    services: [
      { sku: "EST-210", name: "Last Will & Testament",    desc: "A legally sound will that clearly expresses your final wishes and protects your loved ones.", price: "$195" },
      { sku: "TRU-310", name: "Revocable Living Trust",   desc: "Complete trust package — avoids probate and gives your family clarity and control.", price: "$1,695" },
      { sku: "EST-220", name: "Healthcare Directive",      desc: "Document your healthcare wishes and designate who makes medical decisions on your behalf.", price: "$95" },
      { sku: "EST-230", name: "Power of Attorney",         desc: "Financial power of attorney designating someone to act on your behalf if needed.", price: "$95" },
      { sku: "BND-100", name: "Estate Starter Bundle",    desc: "Will, healthcare directive, and power of attorney — the essential three-document package.", price: "$325" },
      { sku: "BND-300", name: "Legacy Plan Bundle",       desc: "Comprehensive estate plan: trust, will, DPOA, healthcare directive, and funding guidance.", price: "$2,495" },
    ],
    badges: ["Non-attorney planning firm","Rocket Lawyer partnership","Microsoft 365 integrated","Headquartered in Columbus, OH"],
    crossDiv: {
      label: "Publishing",
      href:  "/divisions/publishing",
      why:   "Clients with an estate to protect often have a story worth telling. A published legacy book becomes part of the estate — part of the family's inheritance beyond the financial.",
    },
  },
  {
    id:       "foundation",
    num:      "03",
    label:    "Foundation",
    fullName: "J Merrill Foundation",
    accent:   "#93329E",
    domain:   "jmerrill.foundation",
    parentLine: "A J Merrill One Company",
    why:      "What you give should not be temporary.",
    tagline:  "Impact that outlasts the moment.",
    heroHeadline: ["Your generosity.", "Compounding", "across generations."],
    heroItalicLine: 1,
    heroBridge: "From community programs to long-term initiatives — giving that outlasts the moment.",
    heroBody:  "What you give should not be temporary. J Merrill Foundation is the community impact and nonprofit arm of J Merrill One — building charitable infrastructure that creates lasting change, not just seasonal relief.",
    cta:       "Create Impact",
    ctaBook:   "Get Involved",
    stats:     [["100s", "Families served"], ["501(c)(3)", "Tax-exempt status"]],
    services: [
      { sku: "FND-100", name: "Community Meal Programs", desc: "Annual and seasonal community programs providing food security to families in need.", price: "Donate" },
      { sku: "FND-200", name: "Youth Development",       desc: "Programs supporting educational access and skills development for young people.", price: "Volunteer" },
      { sku: "FND-300", name: "Legacy Giving",           desc: "Structured charitable giving programs that create measurable long-term community impact.", price: "Partner" },
      { sku: "FND-400", name: "Corporate Partnership",   desc: "Partnership programs for organizations seeking to align CSR investments with community need.", price: "Connect" },
      { sku: "FND-500", name: "Donor Advised Fund",      desc: "Charitable giving structures that maximize tax efficiency and long-term impact alignment.", price: "From $1,000" },
      { sku: "FND-600", name: "Volunteer Program",       desc: "Structured volunteer opportunities that match skills and time with community programs.", price: "Free" },
    ],
    badges: ["501(c)(3) Tax-Exempt","Columbus Community Partner","SAM.gov Active","Headquartered in Columbus, OH"],
    crossDiv: {
      label: "Financial",
      href:  "/divisions/financial",
      why:   "Donors giving at significant levels are natural Financial candidates for Donor Advised Fund structures — maximizing tax efficiency while extending the impact of their generosity.",
    },
  },
  {
    id:       "productions",
    num:      "04",
    label:    "Productions",
    fullName: "J Merrill Productions",
    accent:   "#FF6F00",
    domain:   "productions.jmerrill.one",
    parentLine: "A J Merrill One Company",
    why:      "What you create should reach further than you can alone.",
    tagline:  "Message, mission, movement — amplified.",
    heroHeadline: ["Your message.", "Amplified.", "Further."],
    heroItalicLine: 1,
    heroBridge: "Video, audio, and storytelling that amplifies what you're building — so your message travels farther.",
    heroBody:  "What you create should reach further than you can alone. J Merrill Productions is the media and storytelling arm of J Merrill One — producing video, audio, and content that amplifies mission, message, and movement across every format and platform.",
    cta:       "Amplify Your Message",
    ctaBook:   "Book a Consultation",
    stats:     [["Multi", "Format capability"], ["All", "Major platforms"]],
    services: [
      { sku: "PRO-100", name: "Podcast Production",   desc: "End-to-end podcast production — concept, scripting, recording, editing, and distribution.", price: "From $299/ep" },
      { sku: "PRO-200", name: "Video Production",     desc: "Professional video for brand content, testimonials, event coverage, and promotional material.", price: "From $999" },
      { sku: "PRO-300", name: "Content Strategy",     desc: "Strategic content planning aligned to your mission, audience, and distribution channels.", price: "From $599" },
      { sku: "PRO-400", name: "Brand Storytelling",   desc: "Documentary-style storytelling that captures the WHY behind your mission.", price: "From $1,499" },
      { sku: "PRO-500", name: "Social Content",       desc: "Short-form content optimized for Reels, TikTok, LinkedIn, and YouTube Shorts.", price: "From $199/mo" },
      { sku: "PKG-PRO", name: "Production Package",   desc: "Comprehensive monthly package: strategy, video, podcast, and social content.", price: "From $2,499/mo" },
    ],
    badges: ["Multi-format production","All major platforms","Cross-division content","Headquartered in Columbus, OH"],
    crossDiv: {
      label: "Publishing",
      href:  "/divisions/publishing",
      why:   "Authors and thought leaders with content to share are natural Productions candidates — transforming their expertise into podcasts, video series, and social content that extends the reach of their published work.",
    },
  },
];

export function getDivision(id: string): Division | undefined {
  return divisions.find(d => d.id === id);
}
