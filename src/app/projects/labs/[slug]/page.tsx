import Link from "next/link";

const labs = [
  {
    title: "Blockchain Publishing Explorer",
    slug: "blockchain-publishing-explorer",
    description: "Visualize blockchain-verified books, royalties, and smart contracts.",
  },
  {
    title: "AI Concierge for Donors",
    slug: "ai-concierge",
    description: "Conversational assistant that guides donors and volunteers via Copilot Studio.",
  },
  {
    title: "Innovation Scorecard",
    slug: "innovation-scorecard",
    description: "Real-time feedback loop and engagement tracker powered by Power Automate.",
  },
  {
    title: "Legacy Vault",
    slug: "legacy-vault",
    description: "Digital time capsule for families, authors, and communities.",
  },
];

export default function LabsPage() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-10 text-center">JMF Labs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {labs.map(({ title, description, slug }) => (
          <Link
            key={slug}
            href={`/labs/${slug}`}
            className="group border border-muted rounded-xl p-6 hover:shadow-lg transition duration-200 bg-white dark:bg-gray-900"
          >
            <h3 className="text-xl font-semibold group-hover:text-primary mb-2">{title}</h3>
            <p className="text-muted text-sm">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}