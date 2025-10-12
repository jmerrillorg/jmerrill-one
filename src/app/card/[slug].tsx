// 📁 /src/app/card/[slug].tsx
'use client';

import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { ParsedUrlQuery } from 'querystring';
import ProfileCard from '@/components/ProfileCard';
import teamData from '@/data/teamdirectory.json';
import { generateQRCode } from '@/utils/generateQRCode';
import { generateVCard } from '@/utils/vcard';

// ✅ Define interface (lenient for all JSON variations)
interface TeamMember {
  slug?: string;
  profileSlug?: string;
  fullName?: string;
  name?: string;
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

interface Params extends ParsedUrlQuery {
  slug: string;
}

// ✅ Generate static paths
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (teamData as unknown as TeamMember[]).map((member) => ({
    params: { slug: member.profileSlug ?? member.slug ?? '' },
  }));

  return {
    paths,
    fallback: false,
  };
};

// ✅ Fetch data and pre‑generate QR code
export const getStaticProps: GetStaticProps<{
  member: TeamMember;
  qrCodeDataUrl: string;
}> = async ({ params }) => {
  // ✅ Fix: safely cast via unknown before asserting type
  const { slug } = (params as unknown as Params) || { slug: '' };

  const members = teamData as unknown as TeamMember[];
  const member = members.find(
    (m) => m.profileSlug === slug || m.slug === slug
  );

  if (!member) return { notFound: true };

  const qrCodeDataUrl = await generateQRCode(
    `https://www.jmerrill.one/card/${slug}`
  );

  return {
    props: {
      member,
      qrCodeDataUrl,
    },
  };
};

// ✅ Component
export default function TeamMemberPage({
  member,
  qrCodeDataUrl,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const handleVCardDownload = () => {
    const blob = generateVCard({
      fullName: member.name ?? member.fullName ?? 'Team Member',
      phone: member.phones?.[0]?.number ?? '',
      additionalPhones: member.phones?.slice(1)?.map((p) => p.number) ?? [],
      email: member.email ?? '',
      website: member.website ?? '',
      org: 'J Merrill One',
      title: member.title,
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${member.profileSlug ?? member.slug ?? 'contact'}.vcf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <ProfileCard
        name={member.name ?? member.fullName ?? ''}
        title={member.title}
        tagline={member.tagline}
        missionStatement={member.missionStatement}
        phones={member.phones ?? []}
        email={member.email ?? ''}
        website={member.website}
        address={member.address}
        imageSrc={member.imageSrc}
        bookingLink={member.bookingLink}
        qrCodeDataUrl={qrCodeDataUrl}
        socials={member.socials}
        onDownloadVCard={handleVCardDownload}
      />
    </div>
  );
}