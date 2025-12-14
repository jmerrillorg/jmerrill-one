'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const labs = [
  {
    title: 'Blockchain Publishing Explorer',
    slug: 'blockchain-publishing',
    description: 'Visualize blockchain-verified books, royalties, and smart contracts.',
    status: 'In Development',
  },
  {
    title: 'AI Concierge for Donors',
    slug: 'ai-concierge',
    description: 'Conversational assistant that guides donors and volunteers via Copilot Studio.',
    status: 'Testing',
  },
  {
    title: 'Innovation Scorecard',
    slug: 'innovation-scorecard',
    description: 'Real-time feedback loop and engagement tracker powered by Power Automate.',
    status: 'Live',
  },
  {
    title: 'Legacy Vault',
    slug: 'legacy-vault',
    description: 'Digital time capsule for families, authors, and communities.',
    status: 'Coming Soon',
  },
];

export default function LabsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 py-16 bg-background text-foreground"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-primary">JMF Labs & Innovation</h1>
        <p className="mt-4 text-lg text-muted">
          Explore the experimental ideas and emerging tech we&apos;re testing across the J Merrill One ecosystem.
        </p>
      </div>

      <section className="mt-16 max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {labs.map(({ title, description, slug, status }) => (
          <motion.div
            key={slug}
            whileHover={{ scale: 1.03 }}
            className="border border-muted rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-white dark:bg-gray-900"
          >
            <Link href={`/labs/${slug}`} className="block h-full">
              <h3 className="text-xl font-semibold text-primary group-hover:text-primary mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{description}</p>
              <p className="mt-4 text-xs italic text-muted-foreground">{status}</p>
            </Link>
          </motion.div>
        ))}
      </section>
    </motion.div>
  );
}