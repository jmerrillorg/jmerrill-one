// src/lib/seo.ts

const defaultImage = "https://jmerrill.one/og-image.jpg";

export function buildMetadata({
  title,
  description,
  path = "/",
  image = defaultImage,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}) {
  const url = `https://jmerrill.one${path}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "J Merrill One",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "J Merrill One – Your Hub for Publishing, Financial Services, and Community Development",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}