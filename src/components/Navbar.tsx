'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment, useId } from 'react';

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
  { href: '/card/directory', label: 'Team Directory' }, // ✅ new
];

// -------------------------
// Production-Safe NavBar
// -------------------------
export default function NavBar() {
  const pathname = usePathname();

  // Ensures SSR + Client IDs remain identical
  const menuId = useId();

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
          <Menu as="div" className="relative inline-block text-left" id={menuId}>
            <div>
              <Menu.Button
                className="inline-flex items-center text-sm font-medium text-foreground hover:text-primary"
              >
                More
                <ChevronDownIcon className="w-4 h-4 ml-1" aria-hidden="true" />
              </Menu.Button>
            </div>

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
                className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black/5 focus:outline-none z-50"
              >
                <div className="px-1 py-1">
                  {moreLinks.map(({ href, label }) => (
                    <Menu.Item key={href}>
                      {({ active }) => (
                        <Link
                          href={href}
                          className={clsx(
                            'block px-4 py-2 text-sm rounded-sm',
                            active
                              ? 'text-primary font-semibold bg-accent/50'
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
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>

      </div>
    </header>
  );
}