'use client';

import React, { useEffect, useState } from 'react';
import { generateVCard } from '@/utils/vcard';
import { generateQRCode } from '@/utils/generateQRCode';
import ProfileCard from '@/components/ProfileCard';

export default function JackieCardPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const fullName = 'Jackie Smith, Jr.';
  const title = 'President & CEO | Founder';
  const tagline = 'J Merrill One – Publishing | Financial | Foundation';
  const missionStatement =
    'Empowering legacies through publishing, planning, and purpose — one family, one story, one vision at a time.';
  const officePhone = '(614) 965-6057'; // Voice Only
  const directPhone = '(614) 245-5560'; // Call/Text
  const email = 'jackie@jmerrill.one';
  const website = 'https://www.jmerrill.one';
  const address = '2323 W 5th Ave, Suite 120, Columbus, OH 43204';
  const imageSrc = '/images/team/jackie.jpg';
  const bookingLink = 'https://www.jmerrill.one/appointments';
  const cardUrl = 'https://www.jmerrill.one/card/jackie';

  useEffect(() => {
    setHydrated(true);
    generateQRCode(cardUrl).then(setQrCode);
  }, []);

  const handleVCardDownload = () => {
    const blob = generateVCard({
      fullName,
      phone: directPhone, // Primary (call/text)
      additionalPhones: [officePhone], // Secondary (voice only)
      email,
      website,
      org: 'J Merrill One',
      title,
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jackie-smith-jr.vcf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen px-6 py-12 bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <ProfileCard
          name={fullName}
          title={title}
          tagline={tagline}
          missionStatement={missionStatement}
          phones={[
            { label: '🏢 Office (Voice Only)', number: officePhone },
            { label: '📲 Direct (Call/Text)', number: directPhone },
          ]}
          email={email}
          website={website}
          address={address}
          imageSrc={imageSrc}
          bookingLink={bookingLink}
          qrCodeDataUrl={qrCode ?? ''}
          onDownloadVCard={handleVCardDownload} // ✅ now inside the card
          socials={{
            linkedin: 'https://www.linkedin.com/company/jmerrillone/',
            instagram: 'https://www.instagram.com/jmerrillone/',
            facebook: 'https://www.facebook.com/JMerrillOne',
          }}
        />
      </div>
    </div>
  );
}