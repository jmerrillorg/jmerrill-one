// 📁 /pages/card/[slug].tsx
'use client';

import { GetStaticPaths, GetStaticProps } from 'next';
import ProfileCard from '@/components/ProfileCard';
import teamData from '@/data/teamdirectory.json';
import { generateQRCode } from '@/utils/generateQRCode';

interface Params {
  slug: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = teamData.map((member) => ({
    params: { slug: member.profileSlug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as Params;
  const member = teamData.find((m) => m.profileSlug === slug);

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

export default function TeamMemberPage({ member, qrCodeDataUrl }: any) {
  return (
    <div className="min-h-screen py-12 px-4">
      <ProfileCard
        name={member.name}
        title={member.title}
        tagline={member.tagline}
        missionStatement={member.missionStatement}
        phones={member.phones}
        email={member.email}
        website={member.website}
        address={member.address}
        imageSrc={member.imageSrc}
        bookingLink={member.bookingLink}
        qrCodeDataUrl={qrCodeDataUrl}
        socials={member.socials}
        onDownloadVCard={() => {
          const blob = generateVCard({
            fullName: member.name,
            phone: member.phones[0].number,
            additionalPhones: member.phones.slice(1).map(p => p.number),
            email: member.email,
            website: member.website,
            org: 'J Merrill One',
            title: member.title,
          });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${member.profileSlug}.vcf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }}
      />
    </div>
  );
}