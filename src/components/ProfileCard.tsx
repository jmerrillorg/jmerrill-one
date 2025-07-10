'use client';

import React from 'react';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

type ProfileCardProps = {
  name: string;
  title: string;
  tagline?: string;
  phone?: string;
  email: string;
  website?: string;
  address?: string;
  imageSrc?: string;
  qrCodeDataUrl?: string;
  bookingLink?: string;
  socials?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
};

export default function ProfileCard({
  name,
  title,
  tagline,
  phone,
  email,
  website,
  address,
  imageSrc,
  qrCodeDataUrl,
  bookingLink,
  socials = {},
}: ProfileCardProps) {
  const fallback = '/logo.png';
  const profileImage = imageSrc || `/api/photo/${email}`;

  return (
    <div className="text-center text-[#111] dark:text-white px-4">
      <Image
        src={profileImage}
        alt={name}
        width={120}
        height={120}
        className="rounded-full mx-auto mb-4 bg-white object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallback) target.src = fallback;
        }}
      />

      <h1 className="text-3xl font-bold">{name}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-300">{title}</p>
      {tagline && <p className="mt-2 italic text-blue-500">{tagline}</p>}

      <div className="mt-6 mx-auto max-w-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-3 text-left">
        {phone && (
          <p>
            <span className="font-medium">📞 Phone:</span>{' '}
            <a href={`tel:${phone}`} className="text-blue-600 dark:text-blue-400">{phone}</a>
          </p>
        )}
        <p>
          <span className="font-medium">✉️ Email:</span>{' '}
          <a href={`mailto:${email}`} className="text-blue-600 dark:text-blue-400">{email}</a>
        </p>
        {website && (
          <p>
            <span className="font-medium">🌐 Website:</span>{' '}
            <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400">
              {website}
            </a>
          </p>
        )}
        {address && (
          <p><span className="font-medium">🏢 Office:</span> {address}</p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {bookingLink && (
          <a
            href={bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Book Appointment
          </a>
        )}
        <a href="/card" className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition">
          View Team Directory
        </a>
      </div>

      {qrCodeDataUrl && (
        <div className="mt-10">
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Scan to save:</p>
          <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto w-32 h-32" />
        </div>
      )}

      <div className="mt-8 flex justify-center gap-6 text-2xl">
        {socials.linkedin && (
          <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-600">
            <Linkedin className="w-6 h-6" />
          </a>
        )}
        {socials.instagram && (
          <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-pink-500">
            <Instagram className="w-6 h-6" />
          </a>
        )}
        {socials.facebook && (
          <a href={socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-blue-700">
            <Facebook className="w-6 h-6" />
          </a>
        )}
      </div>
    </div>
  );
}