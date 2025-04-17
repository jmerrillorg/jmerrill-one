'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';

type BrandColor = 'publishing' | 'financial' | 'foundation' | 'productions' | 'appointments';

interface AppointmentCardProps {
  title: string;
  description: string;
  href: string;
  color: BrandColor;
}

export default function AppointmentCard({ title, description, href, color }: AppointmentCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={clsx(
        'rounded-2xl shadow-md p-6 border-2',
        {
          'border-publishing text-publishing': color === 'publishing',
          'border-financial text-financial': color === 'financial',
          'border-foundation text-foundation': color === 'foundation',
          'border-productions text-productions': color === 'productions',
          'border-appointments text-appointments': color === 'appointments',
        }
      )}
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-foreground mb-4">{description}</p>
      <Link
        href={href}
        className={clsx(
          'inline-block px-4 py-2 text-sm font-medium rounded-md transition',
          {
            'bg-publishing text-white hover:bg-publishing/90': color === 'publishing',
            'bg-financial text-white hover:bg-financial/90': color === 'financial',
            'bg-foundation text-white hover:bg-foundation/90': color === 'foundation',
            'bg-productions text-white hover:bg-productions/90': color === 'productions',
            'bg-appointments text-white hover:bg-appointments/90': color === 'appointments',
          }
        )}
      >
        Book Now
      </Link>
    </motion.div>
  );
}