'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-background shadow-md sticky top-0 z-50 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold text-primary">
          <Link href="/">J Merrill One</Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 font-medium text-foreground">
          <Link href="https://jmerrill.pub" className="text-publishing hover:text-publishing/80">Publishing</Link>
          <Link href="https://jmerrill.financial" className="text-financial hover:text-financial/80">Financial</Link>
          <Link href="https://jmerrill.foundation" className="text-foundation hover:text-foundation/80">Foundation</Link>
          <Link href="/appointments" className="text-appointments hover:text-appointments/80">Appointments</Link>

          {/* Dropdown with animation */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="text-foreground hover:text-primary"
              onClick={() => setIsOpen(!isOpen)}
            >
              More ▾
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key="dropdown"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute mt-2 right-0 w-48 bg-background border border-gray-200 shadow-md rounded-md p-2 space-y-2 text-sm z-50"
                >
                  <Link href="/legal" className="block hover:text-primary">Legal Hub</Link>
                  <Link href="/legal/privacy-policy" className="block hover:text-primary">Privacy Policy</Link>
                  <Link href="/legal/terms-and-conditions" className="block hover:text-primary">Terms & Conditions</Link>
                  <Link href="/legal/accessibility-statement" className="block hover:text-primary">Accessibility</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />
        </div>

        {/* Mobile Menu Placeholder */}
        {/* If you're ready to build out the mobile version, I can drop that too */}
      </nav>
    </header>
  );
}