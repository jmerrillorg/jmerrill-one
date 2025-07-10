import type { Metadata } from "next";
<<<<<<< Updated upstream
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
=======
import type { ReactNode } from "react";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteMetadata } from "@/lib/seo";
>>>>>>> Stashed changes

export const metadata: Metadata = siteMetadata;

interface RootLayoutProps {
  children: ReactNode;
}

<<<<<<< Updated upstream
export const metadata: Metadata = {
  title: "J Merrill One",
  description: "Your hub for Publishing, Financial Services, and Community Development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-geist antialiased bg-background text-foreground transition-colors`}
      >
        {/* Top Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="min-h-screen flex flex-col">{children}</main>

        {/* Site Footer */}
=======
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
>>>>>>> Stashed changes
        <Footer />
      </body>
    </html>
  );
}