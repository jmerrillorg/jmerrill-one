const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#111111',
        primary: '#002C54',
        secondary: {
          DEFAULT: '#A3C4DC',
          20: 'rgba(163, 196, 220, 0.2)',
          50: 'rgba(163, 196, 220, 0.5)',
          90: 'rgba(163, 196, 220, 0.9)',
        },
        accent: '#F4B400',
        card: '#FFFFFF',

        publishing: '#1E90FF',
        financial: '#007F5C',
        foundation: '#93329E',
        productions: '#F97316', // Keep defined for future use only
        appointments: '#2563EB',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        '.bg-card': { backgroundColor: theme('colors.card') },
        '.text-body': { color: theme('colors.foreground') },
        '.text-subtle': { color: theme('colors.secondary.DEFAULT') },
      });

      const brandColors = ['publishing', 'financial', 'foundation', 'appointments'];

      brandColors.forEach((name) => {
        const color = theme('colors')[name];

        // Add base, hover, and border utilities
        addUtilities({
          [`.text-${name}`]: { color },
          [`.bg-${name}`]: { backgroundColor: color },
          [`.hover\\:bg-${name}\\/90:hover`]: {
            backgroundColor: `${color}E6`, // optional, hex fallback with 90% opacity
          },
          [`.border-${name}`]: { borderColor: color },
        });
      });
    }),
  ],
};