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
        card: 'var(--accent)',
        publishing: '#1E90FF',
        financial: '#007F5C',
        foundation: '#93329E',
        productions: '#F97316',
        appointments: '#2563EB',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        '.bg-card': { backgroundColor: 'var(--accent)' },
        '.text-body': { color: 'var(--foreground)' },
        '.text-subtle': { color: 'var(--secondary)' },
      });

      const brandColors = ['publishing', 'financial', 'foundation', 'productions', 'appointments'];

      brandColors.forEach((name) => {
        const hex = theme('colors')[name];
        if (!hex) return;

        addUtilities({
          [`.text-${name}`]: { color: hex },
          [`.bg-${name}`]: { backgroundColor: hex },
          [`.hover\\:bg-${name}\\/90:hover`]: {
            backgroundColor: hex + 'E6', // 90% opacity for hex
          },
          [`.border-${name}`]: { borderColor: hex },
        });
      });
    }),
  ],
};