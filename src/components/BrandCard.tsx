'use client';

import Link from 'next/link';

type Brand = 'Publishing' | 'Financial' | 'Foundation';
type Variant = 'home' | 'about' | 'brands';

type Props = {
  brand: Brand;
  variant?: Variant;
  /** If provided, the card will render the URL + “Visit site →” link */
  href?: string;
  /** Optional one-off copy override */
  descOverride?: string;
};

const brandConfig: Record<
  Brand,
  {
    color: string;
    border: string;
    desc: Record<Variant, string>;
    internalLink: string;
  }
> = {
  Publishing: {
    color: 'text-publishing',
    border: 'border-publishing/40',
    desc: {
      home:
        'Helping authors help themselves — with full-service publishing, blockchain titles, audiobooks, branding, legacy, and marketing.',
      about:
        'Helping authors help themselves — from manuscript to marketplace. Print, blockchain, and audio solutions.',
      brands:
        'From manuscript to market — full-service publishing, blockchain-verified titles, audiobook production, branding, and marketing.',
    },
    internalLink: '/publishing',
  },
  Financial: {
    color: 'text-financial',
    border: 'border-financial/40',
    desc: {
      // ✨ flows as a sentence (not a list)
      home:
        'Providing families with advanced planning, estate planning solutions, and final expense guidance — all with clarity and compassion.',
      about:
        'Planning with compassion — from advanced planning to life & health coverage, in one place.',
      brands:
        'Advanced planning, estate planning support, and final expense guidance designed to help families prepare with confidence and care.',
    },
    internalLink: '/financial',
  },
  Foundation: {
    color: 'text-foundation',
    border: 'border-foundation/40',
    desc: {
      home:
        'Merging purpose with innovation — community programs, labs, and digital empowerment to drive change.',
      about:
        'Bridging mission with innovation. Blockchain giving, AI pilots, and equity-forward tools for community growth.',
      brands:
        'Innovation labs, digital giving, grant partnerships, and tech-driven community transformation.',
    },
    internalLink: '/foundation',
  },
};

function prettyUrl(href?: string) {
  if (!href) return '';
  try {
    const u = new URL(href);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}

export default function BrandCard({
  brand,
  variant = 'home',
  href,
  descOverride,
}: Props) {
  const cfg = brandConfig[brand];

  return (
    <div
      className={[
        'rounded-xl border p-6 shadow-sm transition',
        'hover:shadow-md hover:-translate-y-0.5',
        'bg-background',
        cfg.border,
      ].join(' ')}
      style={{ borderColor: 'currentColor' }}
    >
      {/* Title + (optional) URL */}
      <h3 className={`text-xl font-bold mb-1 ${cfg.color}`}>{brand}</h3>

      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs underline opacity-90 hover:opacity-100"
        >
          {prettyUrl(href)}
        </a>
      )}

      <p className="text-sm mt-3 mb-4 text-foreground/80">
        {descOverride ?? cfg.desc[variant]}
      </p>

      {/* “Visit site” link only when href is provided */}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm font-medium underline hover:no-underline ${cfg.color}`}
        >
          Visit site →
        </a>
      ) : (
        <Link
          href={cfg.internalLink}
          className="text-sm font-medium underline hover:no-underline"
        >
          Learn more →
        </Link>
      )}
    </div>
  );
}