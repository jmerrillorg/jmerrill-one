import type { Division } from '@/lib/types';

/**
 * Canonical Journey IDs
 * (business-meaningful, analytics-safe)
 */
export type JourneyId =
  | 'FIN_PLANNING'
  | 'FIN_INSURANCE'
  | 'PUB_AUTHOR_ONBOARD'
  | 'FND_DONATE_VOLUNTEER'
  | 'PROD_BOOKING'
  | 'GEN_CONTACT'
  | 'GEN_EXPLORE';

/**
 * Canonical Journey Variant
 * (used for A/B messaging and UX tuning)
 */
export type JourneyVariant = 'A' | 'B';

/**
 * Canonical Journey Contract
 * REQUIRED across UI, persistence, telemetry
 */
export type Journey = {
  journeyId: JourneyId;
  variant: JourneyVariant;
  primary: Division; // ✅ REQUIRED — fixes JourneyBadge + Shell logic
  hero: string;
  subhead?: string;
  primaryCta: { label: string; href: string };
  secondaryCtas?: { label: string; href: string }[];
  nextBestActions?: { label: string; href: string }[];
  handoff?: { label: string; href: string; reason: string };
  createdAt: number;
};

/**
 * Stable per-session A/B variant
 */
function pickVariant(clientSessionId: string): JourneyVariant {
  let sum = 0;
  for (const ch of clientSessionId) sum += ch.charCodeAt(0);
  return sum % 2 === 0 ? 'A' : 'B';
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/**
 * JM1 Canon — Journey Computation Engine
 */
export function computeJourney(args: {
  primary: Division;
  confidence: Record<Division, number>;
  intent: string;
  clientSessionId: string;
}): Journey {
  const { primary, confidence, intent, clientSessionId } = args;

  const variant = pickVariant(clientSessionId);
  const createdAt = Date.now();

  const fin = clamp01(confidence.financial ?? 0);
  const pub = clamp01(confidence.publishing ?? 0);
  const fnd = clamp01(confidence.foundation ?? 0);
  const prod = clamp01(confidence.productions ?? 0);

  const intentLower = intent.toLowerCase();

  // --------------------------------------------------
  // Financial journeys
  // --------------------------------------------------
  if (primary === 'financial' || fin >= 0.7) {
    const insuranceSignals = [
      'insurance',
      'life',
      'policy',
      'coverage',
      'benefit',
    ];

    const isInsurance = insuranceSignals.some((s) =>
      intentLower.includes(s)
    );

    if (isInsurance) {
      return {
        journeyId: 'FIN_INSURANCE',
        variant,
        primary: 'financial',
        hero:
          variant === 'A'
            ? 'Let’s make life insurance make sense.'
            : 'Clarity first. Coverage second.',
        subhead:
          'Tell us what you have (or what you’re considering) and we’ll guide next steps.',
        primaryCta: {
          label: 'Schedule a call',
          href: '/appointments?brand=financial',
        },
        secondaryCtas: [
          { label: 'Explore Financial', href: '/financial' },
          { label: 'Contact us', href: '/contact' },
        ],
        nextBestActions: [
          {
            label: 'What is final expense coverage?',
            href: '/financial',
          },
          {
            label: 'Estate planning overview',
            href: '/financial',
          },
        ],
        createdAt,
      };
    }

    return {
      journeyId: 'FIN_PLANNING',
      variant,
      primary: 'financial',
      hero:
        variant === 'A'
          ? 'Plan today. Protect tomorrow.'
          : 'A clear plan beats a vague worry.',
      subhead:
        'We’ll help you map the right next step for your family and your goals.',
      primaryCta: {
        label: 'Schedule a planning call',
        href: '/appointments?brand=financial',
      },
      secondaryCtas: [
        { label: 'Explore Financial', href: '/financial' },
        { label: 'Contact us', href: '/contact' },
      ],
      nextBestActions: [
        {
          label: 'Pre-need planning basics',
          href: '/financial',
        },
        {
          label: 'What documents do I need?',
          href: '/financial',
        },
      ],
      createdAt,
    };
  }

  // --------------------------------------------------
  // Publishing journey
  // --------------------------------------------------
  if (primary === 'publishing' || pub >= 0.7) {
    return {
      journeyId: 'PUB_AUTHOR_ONBOARD',
      variant,
      primary: 'publishing',
      hero:
        variant === 'A'
          ? 'Turn your manuscript into a finished book.'
          : 'From draft to distribution—cleanly.',
      subhead:
        'We’ll guide your next step: editing, production, or publishing strategy.',
      primaryCta: {
        label: 'Book a publishing consult',
        href: '/appointments?brand=publishing',
      },
      secondaryCtas: [
        { label: 'Explore Publishing', href: '/publishing' },
        { label: 'Contact us', href: '/contact' },
      ],
      nextBestActions: [
        {
          label: 'What stage is your manuscript?',
          href: '/publishing',
        },
        {
          label: 'Editing & production overview',
          href: '/publishing',
        },
      ],
      createdAt,
    };
  }

  // --------------------------------------------------
  // Foundation journey
  // --------------------------------------------------
  if (primary === 'foundation' || fnd >= 0.7) {
    return {
      journeyId: 'FND_DONATE_VOLUNTEER',
      variant,
      primary: 'foundation',
      hero:
        variant === 'A'
          ? 'Let’s turn generosity into impact.'
          : 'Purpose becomes progress when we act.',
      subhead:
        'Support a program, partner with us, or bring a mission idea forward.',
      primaryCta: {
        label: 'Get involved',
        href: '/foundation',
      },
      secondaryCtas: [{ label: 'Contact us', href: '/contact' }],
      nextBestActions: [
        {
          label: 'Programs & community work',
          href: '/foundation',
        },
        {
          label: 'Partnership inquiry',
          href: '/contact',
        },
      ],
      createdAt,
    };
  }

  // --------------------------------------------------
  // Productions journey
  // --------------------------------------------------
  if (primary === 'productions' || prod >= 0.7) {
    return {
      journeyId: 'PROD_BOOKING',
      variant,
      primary: 'productions',
      hero:
        variant === 'A'
          ? 'Let’s capture your story with excellence.'
          : 'Production that feels premium—without waste.',
      subhead:
        'Tell us what you’re making, and we’ll propose the cleanest setup.',
      primaryCta: {
        label: 'Book a production consult',
        href: '/appointments?brand=productions',
      },
      secondaryCtas: [
        { label: 'Explore Productions', href: '/productions' },
        { label: 'Contact us', href: '/contact' },
      ],
      nextBestActions: [
        {
          label: 'Live switcher + recording packages',
          href: '/productions',
        },
        {
          label: 'Post-production options',
          href: '/productions',
        },
      ],
      createdAt,
    };
  }

  // --------------------------------------------------
  // General / unknown journey
  // --------------------------------------------------
  return {
    journeyId: 'GEN_EXPLORE',
    variant,
    primary: 'unknown',
    hero:
      variant === 'A'
        ? 'Tell us what you’re building.'
        : 'Start here. We’ll route you.',
    subhead:
      'Choose a path—or share a sentence and we’ll guide you.',
    primaryCta: { label: 'Contact us', href: '/contact' },
    secondaryCtas: [
      { label: 'Explore Publishing', href: '/publishing' },
      { label: 'Explore Financial', href: '/financial' },
      { label: 'Explore Foundation', href: '/foundation' },
      { label: 'Explore Productions', href: '/productions' },
    ],
    createdAt,
  };
}