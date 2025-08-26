import React from 'react';
import Link from 'next/link';

interface BrandCardProps {
  brand: 'Publishing' | 'Financial' | 'Foundation';
  variant?: 'home' | 'about' | 'brands';
}

const brandConfig = {
  Publishing: {
    color: 'text-publishing border-publishing',
    desc: {
      home: 'Helping authors help themselves — with full-service, blockchain, audiobook, branding, legacy, and marketing.',
      about: 'Helping authors help themselves — from manuscript to marketplace. Print, blockchain, and audio solutions.',
      brands: 'From manuscript to market — we offer full-service publishing, blockchain-verified titles, audiobook production, branding, and marketing. Empowering authors with tools, tech, and tenacity every step of the way.',
    },
    link: '/publishing',
  },
  Financial: {
    color: 'text-financial border-financial',
    desc: {
      home: 'From insurance and advance planning to financial literacy and legacy protection — your future is in good hands.',
      about: 'Planning with compassion. From advance planning to life & health coverage — all in one place.',
      brands: 'Pre-need funeral planning, life and health insurance, financial protection strategies, and educational workshops designed to help families plan with confidence, compassion, and clarity.',
    },
    link: '/financial',
  },
  Foundation: {
    color: 'text-foundation border-foundation',
    desc: {
      home: 'Merging purpose with innovation — community programs, labs, and digital empowerment to drive change.',
      about: 'Bridging mission with innovation. Blockchain giving, AI pilots, and equity-forward tools for community growth.',
      brands: 'Trailblazing nonprofit impact through innovation labs, digital giving, grant partnerships, and tech-driven community transformation. We merge mission with measurable movement.',
    },
    link: '/foundation',
  },
};

export const BrandCard: React.FC<BrandCardProps> = ({ brand, variant = 'home' }) => {
  const { color, desc, link } = brandConfig[brand];

  return (
    <div className={`rounded-xl border p-6 shadow-sm transition hover:shadow-md ${color}`}>
      <h3 className="text-xl font-bold mb-2">{brand}</h3>
      <p className="text-sm mb-4">{desc[variant]}</p>
      {variant !== 'home' && (
        <Link href={link} className="text-sm font-medium underline">
          {variant === 'about' ? `Explore ${brand}` : 'More Info →'}
        </Link>
      )}
    </div>
  );
}; 