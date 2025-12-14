// src/app/about/metadata.ts
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | J Merrill One",
  description: "Learn more about the mission, values, and vision behind J Merrill One.",
  openGraph: {
    title: "About | J Merrill One",
    description: "Learn more about the mission, values, and vision behind J Merrill One.",
    url: "https://jmerrill.one/about",
    siteName: "J Merrill One",
    type: "article",
    locale: "en_US",
    images: [
      {
        url: "https://jmerrill.one/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "J Merrill One – Publishing, Financial Services, and Nonprofit Impact",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | J Merrill One",
    description: "Learn more about the mission, values, and vision behind J Merrill One.",
    images: ["https://jmerrill.one/og-image.jpg"],
  },
};
