const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        card: 'var(--accent)', // NEW: use in bg-card

        // ✅ Brand-Specific Colors
    publishing: '#1E90FF',
    financial: '#007F5C',
    foundation: '#93329E',
    productions: '#F97316',
      },
      
      fontFamily: {
        geist: ['var(--font-geist-sans)', 'sans-serif'],
        geistmono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.bg-card': {
          backgroundColor: 'var(--accent)',
        },
        '.text-body': {
          color: 'var(--foreground)',
        },
        '.text-subtle': {
          color: 'var(--secondary)',
        },
      });
    }),
  ],
};