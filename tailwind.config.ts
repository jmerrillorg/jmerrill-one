import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      /* ==================================================
       * Core Semantic Tokens (aligned with globals.css)
       * ================================================== */
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: {
          DEFAULT: "var(--primary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          "20": "rgba(163, 196, 220, 0.2)",
          "50": "rgba(163, 196, 220, 0.5)",
          "90": "rgba(163, 196, 220, 0.9)",
        },
        accent: {
          DEFAULT: "var(--accent)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        /* ==================================================
         * JM1 Canon Brand Tokens
         * ================================================== */
        jm1: {
          ink: "#0F172A",
          slate: "#334155",
          mist: "#E5E7EB",
          brand: "#2563EB",
          accent: "#F97316",
        },

        /* ==================================================
         * Division-Level Brand Colors
         * ================================================== */
        publishing: "#1E90FF",
        financial: "#007F5C",
        foundation: "#93329E",
        productions: "#F97316",
        appointments: "#2563EB",
      },

      /* ==================================================
       * Typography + Layout
       * ================================================== */
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
    /* ==================================================
     * JM1 Utility Extensions (Safe + Minimal)
     * ================================================== */
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
        const color = theme(`colors.${name}`) as string | undefined;

        if (!color) return;

        addUtilities({
          [`.text-${name}`]: { color },
          [`.bg-${name}`]: { backgroundColor: color },
          [`.border-${name}`]: { borderColor: color },
          [`.hover\\:bg-${name}\\/90:hover`]: {
            backgroundColor: `${color}E6`,
          },
        });
      });
    }),

    animate,
  ],
};

export default config;