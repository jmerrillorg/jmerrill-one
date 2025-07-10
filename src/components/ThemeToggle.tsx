'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme ?? (prefersDark ? 'dark' : 'light');
    setIsDark(initialTheme === 'dark');
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition text-sm dark:border-white dark:text-white"
      aria-label="Toggle theme"
    >
      {isDark ? '☀ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}