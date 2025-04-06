import type { Metadata } from "next";
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Styled Navbar */}
        <header className="bg-blue-600 shadow-md text-white px-6 py-4 flex justify-between items-center">
          <a
            href="/"
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "1.25rem",
              textDecoration: "none",
            }}
          >
            J Merrill One
          </a>

          <nav style={{ display: "flex", gap: "1.5rem" }}>
            <a href="https://jmerrill.pub" style={{ color: "white", textDecoration: "none" }}>
              Publishing
            </a>
            <a href="https://jmerrill.financial" style={{ color: "white", textDecoration: "none" }}>
              Financial
            </a>
            <a href="https://jmerrill.org" style={{ color: "white", textDecoration: "none" }}>
              Foundation
            </a>
            <a href="/legal/legal_hub.html" style={{ color: "white", textDecoration: "none" }}>
              Legal
            </a>
          </nav>
        </header>

        {children}

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            padding: "1rem",
            borderTop: "1px solid #eaeaea",
            marginTop: "2rem",
            color: "#666",
          }}
        >
          <p>
            © {new Date().getFullYear()} J Merrill One. All rights reserved. |{" "}
            <a
              href="/legal/legal_hub.html"
              style={{ textDecoration: "underline", color: "#1E90FF" }}
            >
              Legal Information
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}