'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState, Fragment } from 'react';

import ThemeToggle from './ThemeToggle';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

// -------------------------
// Navigation link groups
// -------------------------
const mainLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/contact', label: 'Contact' },
];

const moreLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/legal', label: 'Legal Hub' },
  { href: '/card/directory', label: 'Team Directory' },
];

// -------------------------
// Production-Safe NavBar
// -------------------------
export default function NavBar() {
  const pathname = usePathname();

  // ✅ Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link href="/" className="font-bold text-lg text-primary">
          J Merrill One
        </Link>

        {/* Links + Menu */}
        <div className="flex items-center gap-6 text-sm">

          {/* Main links */}
          {mainLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'transition-colors hover:text-primary',
                pathname === href
                  ? 'text-primary font-semibold'
                  : 'text-foreground'
              )}
            >
              {label}
            </Link>
          ))}

          {/* More dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center text-sm font-medium text-foreground hover:text-primary">
              More
              <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div className="px-1 py-1">
                  {moreLinks.map(({ href, label }) => (
                    <Menu.Item key={href}>
                      {({ active }) => (
                        <Link
                          href={href}
                          className={clsx(
                            'block rounded-sm px-4 py-2 text-sm',
                            active
                              ? 'bg-accent/50 text-primary font-semibold'
                              : 'text-foreground'
                          )}
                        >
                          {label}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}