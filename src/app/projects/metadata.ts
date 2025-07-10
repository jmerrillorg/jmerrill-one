// src/app/projects/metadata.ts
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | J Merrill One",
  description:
    "Explore public-facing initiatives from J Merrill One across publishing, financial services, and nonprofit impact. Internal development projects are not listed.",
  openGraph: {
    title: "Projects | J Merrill One",
    description:
      "Explore public-facing initiatives from J Merrill One across publishing, financial services, and nonprofit impact. Internal development projects are not listed.",
    url: "https://jmerrill.one/projects",
    siteName: "J Merrill One",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://jmerrill.one/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "J Merrill One – Publishing. Financial Services. Nonprofit Impact",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | J Merrill One",
    description:
      "Explore public-facing initiatives from J Merrill One across publishing, financial services, and nonprofit impact. Internal development projects are not listed.",
    images: ["https://jmerrill.one/og-image.jpg"],
  },
};