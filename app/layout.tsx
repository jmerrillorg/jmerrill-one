import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "J Merrill One — The System Behind the Legacy",
  description: "J Merrill One is the system that structures, protects, and carries forward what people build — across publishing, financial strategy, community impact, and media production.",
  openGraph: {
    title: "J Merrill One",
    description: "What people build should last.",
    url: "https://jmerrill.one",
    siteName: "J Merrill One",
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("https://jmerrill.one"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#002C54" />
        {/* Google Fonts — exact same stack as approved HTML design */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
