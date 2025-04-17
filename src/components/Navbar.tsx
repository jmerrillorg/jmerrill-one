'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const [showMoreDesktop, setShowMoreDesktop] = useState(false);

  return (
    <header className="bg-background shadow-md sticky top-0 z-50 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold text-primary">
          <Link href="/">J Merrill One</Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 font-medium text-foreground relative">
          <Link href="https://jmerrill.pub" className="hover:text-publishing text-publishing">Publishing</Link>
          <Link href="https://jmerrill.financial" className="hover:text-financial text-financial">Financial</Link>
          <Link href="/foundation" className="hover:text-foundation text-foundation">Foundation</Link>
          <Link href="/productions" className="hover:text-productions text-productions">Productions</Link>
          <Link href="/appointments" className="hover:text-primary text-primary">Appointments</Link>

          {/* More Dropdown (clickable with animation) */}
          <div className="relative">
            <button
              onClick={() => setShowMoreDesktop(!showMoreDesktop)}
              className="hover:text-primary focus:outline-none"
              aria-haspopup="true"
              aria-expanded={showMoreDesktop}
            >
              More ▾
            </button>

            <AnimatePresence>
              {showMoreDesktop && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700"
                >
                  <Link href="/legal" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground" onClick={() => setShowMoreDesktop(false)}>Legal Hub</Link>
                  <Link href="/legal/privacy-policy" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground" onClick={() => setShowMoreDesktop(false)}>Privacy Policy</Link>
                  <Link href="/legal/terms-and-conditions" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground" onClick={() => setShowMoreDesktop(false)}>Terms & Conditions</Link>
                  <Link href="/legal/accessibility-statement" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground" onClick={() => setShowMoreDesktop(false)}>Accessibility</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />
        </div>

        {/* Hamburger Icon */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-background px-4 pb-4 space-y-3 text-foreground font-medium">
          <Link href="https://jmerrill.pub" onClick={() => setIsOpen(false)} className="block hover:text-publishing text-publishing">Publishing</Link>
          <Link href="https://jmerrill.financial" onClick={() => setIsOpen(false)} className="block hover:text-financial text-financial">Financial</Link>
          <Link href="/foundation" onClick={() => setIsOpen(false)} className="block hover:text-foundation text-foundation">Foundation</Link>
          <Link href="/productions" onClick={() => setIsOpen(false)} className="block hover:text-productions text-productions">Productions</Link>
          <Link href="/appointments" onClick={() => setIsOpen(false)} className="block hover:text-primary text-primary">Appointments</Link>

          {/* Mobile More Dropdown (collapsible) */}
          <div>
            <button
              className="block w-full text-left text-sm text-foreground mt-3"
              onClick={() => setShowMoreMobile(!showMoreMobile)}
            >
              {showMoreMobile ? 'Less ▲' : 'More ▼'}
            </button>
            {showMoreMobile && (
              <div className="mt-2 space-y-2 pl-2 text-sm">
                <Link href="/legal" onClick={() => setIsOpen(false)} className="block hover:text-primary">Legal Hub</Link>
                <Link href="/legal/privacy-policy" onClick={() => setIsOpen(false)} className="block hover:text-primary">Privacy Policy</Link>
                <Link href="/legal/terms-and-conditions" onClick={() => setIsOpen(false)} className="block hover:text-primary">Terms & Conditions</Link>
                <Link href="/legal/accessibility-statement" onClick={() => setIsOpen(false)} className="block hover:text-primary">Accessibility</Link>
              </div>
            )}
          </div>

          <div className="pt-2">
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}