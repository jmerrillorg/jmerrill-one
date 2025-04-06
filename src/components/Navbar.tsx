"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-black shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold text-blue-600">
          <Link href="/">J Merrill One</Link>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 font-medium text-gray-800 dark:text-gray-200">
          <li>
            <Link href="https://jmerrill.pub">Publishing</Link>
          </li>
          <li>
            <Link href="https://jmerrill.financial">Financial</Link>
          </li>
          <li>
            <Link href="https://jmerrill.org">Foundation</Link>
          </li>
          <li>
            <Link href="/legal/legal_hub.html">Legal</Link>
          </li>
        </ul>

        {/* Hamburger Icon */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6 text-gray-800 dark:text-gray-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-black px-4 pb-4 space-y-2 font-medium text-gray-800 dark:text-gray-200">
          <Link href="https://jmerrill.pub" onClick={() => setIsOpen(false)}>
            Publishing
          </Link>
          <Link href="https://jmerrill.financial" onClick={() => setIsOpen(false)}>
            Financial
          </Link>
          <Link href="https://jmerrill.org" onClick={() => setIsOpen(false)}>
            Foundation
          </Link>
          <Link href="/legal/legal_hub.html" onClick={() => setIsOpen(false)}>
            Legal
          </Link>
        </div>
      )}
    </header>
  );
}