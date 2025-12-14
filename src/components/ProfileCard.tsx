'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface PhoneEntry {
  label: string;
  number: string;
}

interface Socials {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
}

interface ProfileCardProps {
  name: string;
  title: string;
  tagline?: string;
  missionStatement?: string;
  phones?: PhoneEntry[];
  email?: string;
  website?: string;
  address?: string;
  workPhone?: string; // used for divisions + AI staff
  availabilityNote?: string;
  skills?: string[];
  keywords?: string[];
  bookingLink?: string;
  qrCodeDataUrl: string;
  imageSrc?: string;
  socials?: Socials;
  profileSlug?: string;
}

export default function ProfileCard(props: ProfileCardProps) {
  const {
    name,
    title,
    tagline,
    missionStatement,
    phones = [],
    email,
    website,
    address,
    workPhone,
    availabilityNote,
    skills = [],
    keywords = [],
    bookingLink,
    qrCodeDataUrl,
    imageSrc,
    socials,
    profileSlug
  } = props;

  const [copied, setCopied] = useState(false);

  // ---------------------------
  // vCard Generator
  // ---------------------------
  const handleDownloadVCard = () => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      `TITLE:${title}`,
      email ? `EMAIL;TYPE=WORK:${email}` : '',
      workPhone ? `TEL;TYPE=WORK,VOICE:${workPhone}` : '',
      phones.length > 0 ? phones.map(p => `TEL;TYPE=${p.label}:${p.number}`).join('\n') : '',
      website ? `URL:${website}` : '',
      address ? `ADR;TYPE=WORK:;;${address.replace(/,/g, '\\,')};;;` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');

    const blob = new Blob([lines], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}.vcf`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // ---------------------------
  // Copy Link
  // ---------------------------
  const handleCopy = () => {
    navigator.clipboard.writeText(`https://www.jmerrill.one/card/${profileSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ---------------------------
  // Share Profile (Web Share API)
  // ---------------------------
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${name} – J Merrill One`,
        text: `View the profile for ${name}`,
        url: `https://www.jmerrill.one/card/${profileSlug}`,
      });
    }
  };

  // ---------------------------
  // Determine Booking Link
  // If JSON provides one, use it.
  // Otherwise fallback to central booking portal.
  // ---------------------------
  const finalBookingLink =
    bookingLink ??
    `https://www.jmerrill.one/appointments`;

  return (
    <div className="max-w-3xl mx-auto text-center py-12">

      {/* Avatar */}
      <div className="w-40 h-40 mx-auto rounded-full overflow-hidden shadow-lg mb-6">
        <Image
          src={imageSrc ?? '/images/team/logo.jpg'}
          alt={name}
          width={300}
          height={300}
          className="object-cover"
        />
      </div>

      {/* Name + Title */}
      <h1 className="text-4xl font-bold text-primary mb-2">{name}</h1>
      <h2 className="text-lg text-secondary mb-2">{title}</h2>

      {/* Tagline */}
      {tagline && (
        <p className="text-blue-600 font-medium italic mb-4">
          {tagline}
        </p>
      )}

      {/* Mission Statement */}
      {missionStatement && (
        <p className="max-w-2xl mx-auto text-base text-secondary mb-6">
          {missionStatement}
        </p>
      )}

      {/* Availability */}
      {availabilityNote && (
        <p className="text-sm text-gray-500 mb-6 italic">
          {availabilityNote}
        </p>
      )}

      {/* Contact Card */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow p-6 max-w-xl mx-auto mb-8 text-left border border-gray-200 dark:border-gray-700">

        {/* Work Phone */}
        {workPhone && (
          <p className="mb-2">
            <span className="font-semibold">Work: </span>
            <a href={`tel:${workPhone}`} className="text-primary hover:underline">
              {workPhone}
            </a>
          </p>
        )}

        {/* Personal/Direct Phones */}
        {phones.length > 0 &&
          phones.map((p, index) => (
            <p key={index} className="mb-2">
              <span className="font-semibold">{p.label}: </span>
              <a href={`tel:${p.number}`} className="text-primary hover:underline">
                {p.number}
              </a>
            </p>
          ))
        }

        {/* Email */}
        {email && (
          <p className="mb-2">
            <span className="font-semibold">Email: </span>
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
          </p>
        )}

        {/* Website */}
        {website && (
          <p className="mb-2">
            <span className="font-semibold">Website: </span>
            <a href={website} className="text-primary hover:underline" target="_blank">
              {website}
            </a>
          </p>
        )}

        {/* Address */}
        {address && (
          <p className="mt-3 text-secondary">
            <span className="font-semibold">Office: </span>
            {address}
          </p>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {skills.map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="mb-10">
          <h3 className="font-semibold mb-2">Keywords</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {keywords.map((k, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-sm">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">

        <Link
          href={finalBookingLink}
          target="_blank"
          className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          Book Appointment
        </Link>

        <button
          onClick={handleDownloadVCard}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Download Contact (vCard)
        </button>

        <button
          onClick={handleShare}
          className="px-6 py-2 rounded-lg bg-gray-800 text-white font-semibold hover:bg-black transition"
        >
          Share Profile
        </button>

        <button
          onClick={handleCopy}
          className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 transition"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

      </div>

      {/* Directory Button */}
      <Link
        href="/card/directory"
        className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 transition font-medium"
      >
        View Team Directory
      </Link>

      {/* QR Code */}
      <div className="mt-10">
        <p className="text-secondary mb-2">Scan to save profile</p>
        <Image
          src={qrCodeDataUrl}
          alt="QR Code"
          width={180}
          height={180}
          className="mx-auto"
        />
      </div>
    </div>
  );
}