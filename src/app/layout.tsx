// src/app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";
import Navbar from "@/components/Navbar"; // ✅ exact casing
import Footer from "@/components/Footer";
import { siteMetadata } from "@/lib/seo";

// -------------------------
// Fonts
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
// Metadata
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
    <html lang="en" data-theme="light">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground transition-colors`}
      >
        <Navbar />

        <main className="min-h-screen flex flex-col">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}