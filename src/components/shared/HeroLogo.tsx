'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import clsx from 'clsx';

interface HeroLogoProps {
  className?: string;
}

export function HeroLogo({ className }: HeroLogoProps) {
  return (
    <motion.div
      className={clsx('h-full flex justify-center mt-10', className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Image
        src="/logo.jpg"
        alt="J Merrill Logo"
        width={200}
        height={200}
        className="rounded-full border-4 border-primary"
        priority
      />
    </motion.div>
  );
}

export default HeroLogo;