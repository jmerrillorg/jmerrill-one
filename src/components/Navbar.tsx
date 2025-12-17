'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState, Fragment } from 'react';

import ThemeToggle from './ThemeToggle';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

/* --------------------------------------------------
   Primary JM1 divisions (route → brand mapping)
-------------------------------------------------- */
const primaryLinks = [
  { href: '/', label: 'Home', brand: 'jm1' },
  { href: '/publishing', label: 'Publishing', brand: 'publishing' },
  { href: '/financial', label: 'Financial', brand: 'financial' },
  { href: '/foundation', label: 'Foundation', brand: 'foundation' },
  { href: '/productions', label: 'Productions', brand: 'productions' },
] as const;

/* --------------------------------------------------
   Secondary / utility links
-------------------------------------------------- */
const utilityLinks = [
  { href: '/about', label: 'About' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/contact', label: 'Contact' },
  { href: '/projects', label: 'Projects' },
  { href: '/legal', label: 'Legal Hub' },
  { href: '/card/directory', label: 'Team Directory' },
];

/* --------------------------------------------------
   JM1 Canon NavBar
-------------------------------------------------- */
export default function NavBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 w-full border-b',
        'bg-background/85 backdrop-blur',
        'border-border'
      )}
    >
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* --------------------------------------------------
           Brand
        -------------------------------------------------- */}
        <Link
          href="/"
          className={clsx(
            'text-lg font-semibold tracking-tight transition-colors',
            'text-foreground hover:text-jm1-blue'
          )}
        >
          J Merrill One
        </Link>

        {/* --------------------------------------------------
           Navigation
        -------------------------------------------------- */}
        <nav className="flex items-center gap-6 text-sm">
          {/* Primary division links */}
          {primaryLinks.map(({ href, label, brand }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'transition-colors font-medium',
                  isActive
                    ? brand === 'jm1'
                      ? 'text-jm1-blue'
                      : `text-${brand}-primary`
                    : 'text-secondary hover:text-foreground'
                )}
              >
                {label}
              </Link>
            );
          })}

          {/* --------------------------------------------------
             Utility dropdown
          -------------------------------------------------- */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button
              className={clsx(
                'inline-flex items-center gap-1 font-medium transition-colors',
                'text-secondary hover:text-foreground'
              )}
            >
              More
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
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
              <Menu.Items
                className={clsx(
                  'absolute right-0 z-50 mt-2 w-48 origin-top-right',
                  'rounded-md bg-card shadow-lg',
                  'ring-1 ring-border focus:outline-none'
                )}
              >
                <div className="py-1">
                  {utilityLinks.map(({ href, label }) => (
                    <Menu.Item key={href}>
                      {({ active }) => (
                        <Link
                          href={href}
                          className={clsx(
                            'block px-4 py-2 text-sm transition-colors',
                            active
                              ? 'bg-border text-foreground font-medium'
                              : 'text-secondary hover:bg-border/60'
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
        </nav>
      </div>
    </header>
  );
}