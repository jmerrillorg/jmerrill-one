// 📁 /src/app/card/[slug]/page.tsx

import { notFound } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import teamData from '@/data/teamdirectory.json';
import { generateQRCode } from '@/utils/generateQRCode';

// -------------------------
// Types
// -------------------------
interface TeamEntry {
  type: 'group' | 'member';
  slug: string;
  profileSlug?: string;
  name?: string;
  fullName?: string;
  title: string;
  tagline?: string;
  missionStatement?: string;
  phones?: { label: string; number: string }[];
  email?: string;
  website?: string;
  address?: string;
  imageSrc?: string;
  bookingLink?: string;
  socials?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
}

// -------------------------
// Static Params
// -------------------------
export async function generateStaticParams() {
  const entries = teamData as TeamEntry[];

  return entries.map((entry) => ({
    slug: entry.profileSlug ?? entry.slug,
  }));
}

// -------------------------
// Dynamic Page Component
// -------------------------
export default async function TeamMemberPage(props: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ FIX: unwrap the params Promise (Next.js 14+ behavior)
  const { slug } = await props.params;

  const entries = teamData as TeamEntry[];

  // Find match by profileSlug first, fallback to slug
  const entry =
    entries.find((e) => e.profileSlug === slug) ??
    entries.find((e) => e.slug === slug);

  if (!entry) notFound();

  // Generate QR Code
  const qrCodeDataUrl = await generateQRCode(
    `https://www.jmerrill.one/card/${slug}`
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <ProfileCard
        name={entry.name ?? entry.fullName ?? entry.slug}
        title={entry.title}
        tagline={entry.tagline}
        missionStatement={entry.missionStatement}
        phones={entry.phones ?? []}
        email={entry.email ?? ''}
        website={entry.website}
        address={entry.address}
        imageSrc={entry.imageSrc}
        bookingLink={entry.bookingLink}
        socials={entry.socials}
        qrCodeDataUrl={qrCodeDataUrl}
      />
    </div>
  );
}