'use client';

import React, { useEffect, useState } from 'react';
import { generateVCard } from '@/utils/vcard';
import { generateQRCode } from '@/utils/generateQRCode';
import ProfileCard from '@/components/ProfileCard';

export default function MarlaCardPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const fullName = 'Marla J. Smith';
  const title = 'Vice President | Publishing & Foundation';
  const tagline = 'J Merrill One – Publishing | Foundation';
  const phone = '(614) 965-6057';
  const email = 'marla@jmerrill.pub';
  const website = 'https://www.jmerrill.one';
  const address = '2323 W 5th Ave, Suite 120, Columbus, OH 43204';
  const imageSrc = '/images/team/marla.jpg';
  const bookingLink = 'https://outlook.office.com/book/jmerrillpublishinginc@jmerrill.pub/';
  const cardUrl = 'https://www.jmerrill.one/card/marla';

  useEffect(() => {
    setHydrated(true);
    generateQRCode(cardUrl).then(setQrCode);
    const mode = localStorage.getItem('theme');
    setDarkMode(mode === 'dark');
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleVCardDownload = () => {
    const blob = generateVCard({
      fullName,
      phone,
      email,
      website,
      org: 'J Merrill One',
      title,
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marla-smith.vcf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!hydrated) return null;

  return (
    <div
      className={`min-h-screen px-6 py-12 transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <ProfileCard
          name={fullName}
          title={title}
          tagline={tagline}
          phone={phone}
          email={email}
          website={website}
          address={address}
          imageSrc={imageSrc}
          bookingLink={bookingLink}
          qrCodeDataUrl={qrCode ?? ''}
          socials={{
            linkedin: 'https://www.linkedin.com/company/jmerrillone/',
            instagram: 'https://www.instagram.com/jmerrillone/',
            facebook: 'https://www.facebook.com/JMerrillOne',
          }}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleVCardDownload}
            className="px-5 py-2 rounded-lg font-medium bg-publishing text-white hover:bg-foundation transition"
          >
            Download Contact (vCard)
          </button>

          <button
            onClick={toggleTheme}
            className="px-5 py-2 rounded-lg font-medium border border-secondary text-secondary hover:bg-secondary/10 transition"
          >
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}