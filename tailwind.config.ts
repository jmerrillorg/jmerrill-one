import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── JM1 Color Tokens — Canon v1 Section 08 ──────────────
      colors: {
        navy:  "#002C54",
        gold:  "#F4B400",
        steel: "#A3C4DC",
        ink:   "#05111F",
        mid:   "#4A5568",
        pale:  "#F7F8FA",
        rule:  "rgba(0,44,84,0.09)",
        // Division accents
        pub:   "#1E90FF",
        fin:   "#007F5C",
        fnd:   "#93329E",
        pro:   "#FF6F00",
      },
      // ── Typography — Canon v1 Section 08 ────────────────────
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans:  ["Syne", "system-ui", "sans-serif"],
        mono:  ["DM Mono", "Courier New", "monospace"],
      },
      // ── Spacing — Canon v1 Section 08 ───────────────────────
      spacing: {
        "section":        "5.5rem",   // Desktop section padding
        "section-mobile": "3rem",     // Mobile section padding
      },
      // ── Border radius — 0 throughout per canon ───────────────
      borderRadius: {
        DEFAULT: "0",
        none: "0",
      },
    },
  },
  plugins: [],
};

export default config;
