// src/app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";
import "@/lib/appInsights"; // ✅ Phase 5: Telemetry bootstrap (safe side-effect import)

import Navbar from "@/components/Navbar"; // exact casing
import Footer from "@/components/Footer";
import { siteMetadata } from "@/lib/seo";

// -------------------------
// Fonts (Canonical)
// -------------------------
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// -------------------------
// Metadata (Canonical)
// -------------------------
export const metadata: Metadata = siteMetadata;

interface RootLayoutProps {
  children: ReactNode;
}

// -------------------------
// Root Layout (Server Component)
// -------------------------
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body
        className={[
          inter.variable,
          geistMono.variable,
          "font-sans antialiased",
          "bg-background text-foreground",
          "transition-colors",
        ].join(" ")}
      >
        {/* Global Navigation */}
        <Navbar />

        {/* Page Content */}
        <main className="min-h-screen flex flex-col">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  );
}