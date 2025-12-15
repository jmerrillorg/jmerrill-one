import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      /* --------------------------------------------------
       * Core semantic tokens (existing – preserved)
       * -------------------------------------------------- */
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          "20": "rgba(163, 196, 220, 0.2)",
          "50": "rgba(163, 196, 220, 0.5)",
          "90": "rgba(163, 196, 220, 0.9)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        /* --------------------------------------------------
         * JM1 Canon Brand Tokens (NEW – Phase 2)
         * -------------------------------------------------- */
        jm1: {
          ink: "#0F172A",     // primary text
          slate: "#334155",   // secondary text
          mist: "#E5E7EB",    // borders / dividers
          brand: "#2563EB",   // links / accents
          accent: "#F97316",  // CTAs / highlights
        },

        /* --------------------------------------------------
         * Division-level brand colors (existing – preserved)
         * -------------------------------------------------- */
        publishing: "#1E90FF",
        financial: "#007F5C",
        foundation: "#93329E",
        productions: "#F97316",
        appointments: "#2563EB",
      },

      /* --------------------------------------------------
       * Typography + layout extensions
       * -------------------------------------------------- */
      fontSize: {
        hero: ["2.75rem", { lineHeight: "1.1" }],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },

  plugins: [
    /* --------------------------------------------------
     * Utility extensions (existing + aligned)
     * -------------------------------------------------- */
    plugin(({ addUtilities, theme }) => {
      const brandColors = [
        "publishing",
        "financial",
        "foundation",
        "productions",
        "appointments",
      ];

      addUtilities({
        ".bg-card": {
          backgroundColor: theme("colors.card.DEFAULT"),
        },
        ".text-body": {
          color: theme("colors.foreground"),
        },
        ".text-subtle": {
          color: theme("colors.secondary.DEFAULT"),
        },
      });

      brandColors.forEach((name) => {
        const color = theme(`colors.${name}`) as string;
        if (color) {
          addUtilities({
            [`.text-${name}`]: { color },
            [`.bg-${name}`]: { backgroundColor: color },
            [`.border-${name}`]: { borderColor: color },
            [`.hover\\:bg-${name}\\/90:hover`]: {
              backgroundColor: `${color}E6`,
            },
          });
        }
      });
    }),

    animate,
  ],
};

export default config;