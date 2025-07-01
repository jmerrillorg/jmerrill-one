import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-gray-200 dark:border-gray-700 text-subtle text-sm py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-center md:text-left">

          {/* Contact Info */}
          <div className="space-y-2">
            <p><strong>© 2025 J Merrill One.</strong> All rights reserved.</p>
            <p>
              <strong>Headquarters:</strong><br />
              2323 W 5th Ave, Suite 120<br />
              Columbus, OH 43204
            </p>
            <p><strong>Main Line:</strong> (614) 965-6057</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:info@jmerrill.one" className="underline">
                info@jmerrill.one
              </a>
            </p>
            <p>
              <strong>Web:</strong>{' '}
              <a
                href="https://www.jmerrill.one"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.jmerrill.one
              </a>
            </p>
          </div>

          {/* Office Hours */}
          <div className="space-y-2">
            <p className="font-bold">Office Hours</p>
            <div className="grid grid-cols-2 gap-x-4 max-w-xs mx-auto md:mx-0">
              <p>Monday–Thursday:</p>
              <p>10:00 AM – 6:00 PM</p>
              <p>Friday:</p>
              <p>10:00 AM – 4:00 PM</p>
              <p>Saturday:</p>
              <p>By Appointment Only</p>
              <p>Sunday:</p>
              <p>Closed</p>
            </div>
          </div>

          {/* Ventures & Legal */}
          <div className="space-y-2">
            <p className="font-bold">J Merrill One Ventures</p>
            <p>
              📘{' '}
              <a
                href="https://www.jmerrill.pub"
                className="font-bold underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                J Merrill Publishing, Inc.
              </a>
            </p>
            <p>
              💼{' '}
              <a
                href="https://www.jmerrill.financial"
                className="font-bold underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                J Merrill Financial, LLC
              </a>
            </p>
            <p>
              🟣{' '}
              <a
                href="https://www.jmerrill.foundation"
                className="font-bold underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                J Merrill Foundation, Inc.
              </a>
            </p>
            <hr className="my-2 border-gray-300 dark:border-gray-600" />
            <p><strong>Registered in Ohio</strong></p>
            <p>EINs available upon request</p>
            <p>
              <strong>Tax-exempt status</strong> applies to{' '}
              <a
                href="https://www.jmerrill.foundation"
                className="font-bold underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                J Merrill Foundation, Inc.
              </a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}