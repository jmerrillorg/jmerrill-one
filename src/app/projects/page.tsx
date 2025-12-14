'use client';

import { motion } from 'framer-motion';
import HeroLogo from '@/components/shared/HeroLogo';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 py-12 bg-background text-foreground"
    >
      <div className="max-w-4xl mx-auto text-center">
        <HeroLogo />
        <h1 className="text-4xl font-bold mt-6">Projects</h1>
        <p className="mt-4 text-lg text-muted">
          Discover the public-facing initiatives, pilots, and platforms we’re building across the J Merrill One ecosystem.
        </p>
      </div>

      <section className="mt-16 max-w-5xl mx-auto grid gap-10 md:grid-cols-2">
        <ProjectCard
          title="Author Portals"
          description="An intelligent, self-service experience for authors to manage their publishing journey from manuscript to royalties."
          href="/brands/publishing/portal"
        />
        <ProjectCard
          title="Financial Planning Hub"
          description="Streamlined access to pre-need appointments, insurance options, and digital intake forms."
          href="/brands/financial/appointments"
        />
        <ProjectCard
          title="JMF Labs"
          description="Live pilot space for experimenting with AI, blockchain giving, and innovation tools in the nonprofit sector."
          href="/labs"
        />
        <ProjectCard
          title="Digital HQ"
          description="Our all-in-one operations stack — connecting scheduling, documents, and CRM systems into a future-proof infrastructure."
          href="/about"
        />
      </section>

      <div className="mt-20 text-center text-sm text-muted">
        Want to suggest a new project or partnership?{' '}
        <Link href="/contact" className="underline text-primary">
          Get in touch
        </Link>.
      </div>
    </motion.div>
  );
}

function ProjectCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="border-2 border-muted p-6 rounded-2xl shadow-sm hover:shadow-md transition"
    >
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
      <Link href={href} className="inline-block mt-4 text-sm text-primary hover:underline">
        Learn More →
      </Link>
    </motion.div>
  );
}