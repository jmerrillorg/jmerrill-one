import { ServiceCard } from "@/components/ServiceCard";
import HeroLogo from "@/components/shared/HeroLogo";
import Link from "next/link";

export const metadata = {
  title: "Publishing Services | J Merrill Publishing, Inc.",
  description:
    "Explore full-service publishing, blockchain books, audiobooks, and more with J Merrill Publishing, Inc.",
  metadataBase: new URL("https://jmerrill.one"),
  openGraph: {
    title: "Publishing Services | J Merrill Publishing, Inc.",
    description:
      "Helping authors help themselves with full-service publishing, blockchain, audiobooks, and more.",
    url: "https://jmerrill.one/publishing",
    siteName: "J Merrill One",
    type: "website",
    images: [
      {
        url: "https://jmerrill.one/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "J Merrill Publishing Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Publishing Services | J Merrill Publishing, Inc.",
    description:
      "Helping authors help themselves — explore full-service, blockchain, audiobooks, and more.",
    images: ["https://jmerrill.one/og-image.jpg"],
  },
};

// Define allowed color types
type ServiceColor = "publishing" | "foundation" | "financial";

interface PublishingService {
  title: string;
  description: string;
  cta: string;
  emoji: string;
  borderColor: ServiceColor;
  ringColor: ServiceColor;
}

const services: PublishingService[] = [
  {
    title: "Full-Service Publishing",
    description: "From manuscript to market — editing, design, ISBN, and distribution included.",
    cta: "/services/full-service",
    emoji: "📚",
    borderColor: "publishing",
    ringColor: "publishing",
  },
  {
    title: "Blockchain Publishing",
    description: "Protect your work with verified blockchain metadata and smart contract royalties.",
    cta: "/services/blockchain",
    emoji: "🔗",
    borderColor: "publishing",
    ringColor: "publishing",
  },
  {
    title: "Audiobook Production",
    description: "Studio-quality audiobooks with AI or human narrators — mastered and ready for Audible.",
    cta: "/services/audiobook",
    emoji: "🎧",
    borderColor: "publishing",
    ringColor: "publishing",
  },
  {
    title: "Branding",
    description: "Logos, author photos, personal branding kits, and Amazon-ready bios.",
    cta: "/services/branding",
    emoji: "🖼️",
    borderColor: "publishing",
    ringColor: "publishing",
  },
  {
    title: "Legacy Publishing",
    description: "Memoirs and family stories preserved beautifully for future generations.",
    cta: "/services/legacy",
    emoji: "🕊️",
    borderColor: "publishing",
    ringColor: "publishing",
  },
  {
    title: "Marketing & Promotion",
    description: "Launch campaigns, book trailers, and PR to boost visibility and connect with readers.",
    cta: "/services/marketing",
    emoji: "📣",
    borderColor: "publishing",
    ringColor: "publishing",
  },
];

export default function PublishingPage() {
  return (
    <div className="flex flex-col items-center text-center px-4 pb-12 bg-white text-[#111111]">
      <HeroLogo />
      <h1 className="text-4xl font-bold mt-6 text-publishing">J Merrill Publishing, Inc.</h1>
      <p className="text-lg mt-2 max-w-2xl text-[#1E90FF]">
        Helping authors help themselves — with tools, tech, and tenacity.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 max-w-6xl w-full">
        {services.map((service) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            description={service.description}
            href={service.cta}
            emoji={service.emoji}
            borderColor={service.borderColor}
            ringColor={service.ringColor}
          />
        ))}
      </section>

      <div className="mt-10 text-sm text-[#1E90FF]">
        Ready to join the J Merrill Publishing family?
        <Link href="/join" className="text-publishing font-medium ml-1 hover:underline">
          Submit your manuscript to get started
        </Link>
      </div>
    </div>
  );
}