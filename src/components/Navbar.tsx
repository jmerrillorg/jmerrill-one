'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const mainLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/brands', label: 'Brands' },
  { href: '/contact', label: 'Contact' },
];

const moreLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/legal', label: 'Legal Hub' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-bold text-lg text-primary">
          J Merrill One
        </Link>

        <div className="flex items-center gap-6 text-sm">
          {mainLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'transition-colors hover:text-primary',
                pathname === href ? 'text-primary font-semibold' : 'text-foreground'
              )}
            >
              {label}
            </Link>
          ))}

          {/* Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex items-center text-sm font-medium text-foreground hover:text-primary">
                More
                <ChevronDownIcon className="w-4 h-4 ml-1" aria-hidden="true" />
              </Menu.Button>
            </div>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-background shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                <div className="px-1 py-1">
                  {moreLinks.map(({ href, label }) => (
                    <Menu.Item key={href}>
                      {({ active }) => (
                        <Link
                          href={href}
                          className={clsx(
                            'block px-4 py-2 text-sm',
                            active ? 'text-primary font-semibold' : 'text-foreground'
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

          {/* Theme Toggle moved to the right */}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
} 