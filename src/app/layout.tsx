import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <Footer />
      </body>
    </html>
  );
}