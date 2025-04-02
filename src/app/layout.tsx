// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "J Merrill One",
  description: "Your hub for Publishing, Financial Services, and Community Development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <footer className="text-center text-sm py-4">
          <p>
            © {new Date().getFullYear()} J Merrill One. All rights reserved. |{" "}
            <a href="/legal/legal_hub.html" className="underline hover:text-blue-500">
              Legal Information
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}