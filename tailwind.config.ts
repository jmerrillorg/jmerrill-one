import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      /* ==================================================
       * Core Semantic Tokens (CSS Variable Backed)
       * ================================================== */
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',

        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },

        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        /* ==================================================
         * 00 — JM1 Umbrella Brand
         * ================================================== */
        jm1: {
          blue: '#004CFF',
          black: '#000000',
          white: '#FFFFFF',
          slate: '#1A1F36',
          silver: '#D9DCE3',
          sky: '#2D8BFF',
          gold: '#F5C542',
        },

        /* ==================================================
         * 01 — J Merrill Publishing
         * ================================================== */
        publishing: {
          primary: '#7A1BFF',
          secondary: '#3A0B66',
          accent: '#A56BFF',
          surface: '#FAFAFA',
        },

        /* ==================================================
         * 02 — J Merrill Financial
         * ================================================== */
        financial: {
          primary: '#0A9E4A',
          secondary: '#064A24',
          accent: '#D4AF37',
          surface: '#FFFFFF',
        },

        /* ==================================================
         * 03 — J Merrill Foundation
         * ================================================== */
        foundation: {
          primary: '#007F7F',
          secondary: '#004B4B',
          accent: '#F0C674',
          surface: '#FFFFFF',
        },

        /* ==================================================
         * 04 — J Merrill Productions
         * ================================================== */
        productions: {
          primary: '#FF2D2D',
          secondary: '#0D0D0D',
          accent: '#FF4F4F',
          surface: '#FFFFFF',
        },

        /* ==================================================
         * Shared Utility (Bookings / Appointments)
         * ================================================== */
        appointments: {
          primary: '#004CFF',
        },
      },

      /* ==================================================
       * Typography & Layout
       * ================================================== */
      fontSize: {
        hero: ['2.75rem', { lineHeight: '1.1' }],
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },

  plugins: [
    /* ==================================================
     * JM1 Brand Utility Generator (Canonical)
     * ================================================== */
    plugin(({ addUtilities, theme }) => {
      const brands = [
        'publishing',
        'financial',
        'foundation',
        'productions',
        'appointments',
      ];

      const utilities: Record<string, any> = {
        /* Semantic helpers */
        '.bg-card': { backgroundColor: theme('colors.card.DEFAULT') },
        '.text-body': { color: theme('colors.foreground') },
        '.text-subtle': { color: theme('colors.secondary') },
      };

      brands.forEach((brand) => {
        const primary = theme(`colors.${brand}.primary`);
        const accent = theme(`colors.${brand}.accent`);

        if (primary) {
          utilities[`.text-${brand}`] = { color: primary };
          utilities[`.bg-${brand}`] = { backgroundColor: primary };
          utilities[`.border-${brand}`] = { borderColor: primary };
        }

        if (accent) {
          utilities[`.text-${brand}-accent`] = { color: accent };
          utilities[`.bg-${brand}-accent`] = { backgroundColor: accent };
        }
      });

      addUtilities(utilities);
    }),

    animate,
  ],
};

export default config;