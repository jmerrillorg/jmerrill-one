import Link from "next/link";
import HeroLogo from '@/components/shared/HeroLogo'

const brands = [
  {
    name: "Publishing",
    description:
      "From manuscript to market — we offer full-service publishing, blockchain-verified titles, audiobook production, branding, and marketing. Empowering authors with tools, tech, and tenacity every step of the way.",
    href: "/brands/publishing",
    border: "border-[#1E90FF]",
    hoverBorder: "hover:border-[#187bcd]",
    textColor: "text-[#1E90FF]",
    hoverTextColor: "hover:text-[#187bcd]",
  },
  {
    name: "Financial",
    description:
      "Pre-need funeral planning, life and health insurance, financial protection strategies, and educational workshops designed to help families plan with confidence, compassion, and clarity.",
    href: "/brands/financial",
    border: "border-[#007F5C]",
    hoverBorder: "hover:border-[#00664a]",
    textColor: "text-[#007F5C]",
    hoverTextColor: "hover:text-[#00664a]",
  },
  {
    name: "Foundation",
    description:
      "Trailblazing nonprofit impact through innovation labs, digital giving, grant partnerships, and tech-driven community transformation. We merge mission with measurable movement.",
    href: "/brands/foundation",
    border: "border-[#93329E]",
    hoverBorder: "hover:border-[#7a2784]",
    textColor: "text-[#93329E]",
    hoverTextColor: "hover:text-[#7a2784]",
  },
];

export default function BrandsPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col items-center text-center mb-10">
        <HeroLogo />
        <h1 className="text-4xl font-bold mt-6">Our Brands</h1>
        <p className="mt-2 text-lg text-muted max-w-2xl">
          J Merrill One is a collective of purpose-driven ventures – serving publishing, financial planning, and nonprofit innovation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            href={brand.href}
            className={`block p-6 rounded-2xl shadow-md bg-white transition-all duration-200 border-t-4 ${brand.border} ${brand.hoverBorder}`}
          >
            <h2 className="text-xl font-semibold mb-3">{brand.name}</h2>
            <p className="text-sm text-muted mb-4">{brand.description}</p>
            <span className={`text-sm font-medium ${brand.textColor} ${brand.hoverTextColor} transition`}>
              More Info →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}