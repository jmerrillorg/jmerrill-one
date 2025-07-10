// components/Timeline.tsx
'use client';

import { motion } from 'framer-motion';

const entries = [
  {
    year: '2017',
    title: 'J Merrill Publishing, Inc.',
    description:
      'Founded to help authors help themselves — offering full-service publishing and empowering tools for independent voices.',
  },
  {
    year: '2021',
    title: 'J Merrill Foundation, Inc.',
    description:
      'Launched with a mission to merge nonprofit purpose with cutting-edge innovation for community transformation.',
  },
  {
    year: '2023',
    title: 'J Merrill Financial, LLC.',
    description:
      'Established to bring compassionate financial strategy, life planning, and insurance services to individuals and families.',
  },
  {
    year: '2025',
    title: 'J Merrill One',
    description:
      'The umbrella is born — uniting all brands into one future-forward, AI-powered collective rooted in service, structure, and scale.',
  },
];

export default function Timeline() {
  return (
    <section className="mt-20 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">J Merrill One Timeline</h2>
      <div className="relative border-l-2 border-gray-300 dark:border-gray-700 pl-6 space-y-10">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.year}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="relative"
          >
            {/* Dot */}
            <div className="absolute left-[-10px] top-1.5 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-gray-800"></div>

            <div className="text-sm font-semibold text-foreground dark:text-white mb-1">
              {entry.year} — <span className="text-primary">{entry.title}</span>
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-300">
              {entry.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}