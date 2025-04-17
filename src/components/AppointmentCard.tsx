'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AppointmentCard({
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
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="bg-accent rounded-2xl shadow-md p-6 hover:ring-2 hover:ring-primary"
    >
      <h2 className="text-xl font-semibold text-primary mb-2">{title}</h2>
      <p className="text-foreground mb-4">{description}</p>
      <Link
        href={href}
        className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-700 transition"
      >
        Book Now
      </Link>
    </motion.div>
  );
}