'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';

type BrandColor = 'publishing' | 'financial' | 'foundation' | 'appointments';

interface AppointmentCardProps {
  title: string;
  description: string;
  href: string;
  color: BrandColor;
}

const borderColorMap: Record<BrandColor, string> = {
  publishing: 'border-publishing text-publishing',
  financial: 'border-financial text-financial',
  foundation: 'border-foundation text-foundation',
  appointments: 'border-appointments text-appointments',
};

const buttonColorMap: Record<BrandColor, string> = {
  publishing: 'bg-publishing text-white hover:bg-publishing/90 focus-visible:ring-2 focus-visible:ring-publishing',
  financial: 'bg-financial text-white hover:bg-financial/90 focus-visible:ring-2 focus-visible:ring-financial',
  foundation: 'bg-foundation text-white hover:bg-foundation/90 focus-visible:ring-2 focus-visible:ring-foundation',
  appointments: 'bg-appointments text-white hover:bg-appointments/90 focus-visible:ring-2 focus-visible:ring-appointments',
};

export default function AppointmentCard({ title, description, href, color }: AppointmentCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={clsx('rounded-2xl shadow-md p-6 border-2', borderColorMap[color])}
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-foreground mb-4">{description}</p>
      <Link
        href={href}
        aria-label={`Book an appointment for ${title}`}
        className={clsx(
          'inline-block px-4 py-2 text-sm font-medium rounded-md transition focus:outline-none',
          buttonColorMap[color]
        )}
      >
        Book Now
      </Link>
    </motion.div>
  );
}