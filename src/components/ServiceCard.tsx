"use client";

import { motion } from "framer-motion";
import { FC } from "react";

interface ServiceCardProps {
  href: string;
  emoji: string;
  title: string;
  description: string;
  borderColor: "publishing" | "foundation" | "financial";
  ringColor: "publishing" | "foundation" | "financial";
}

const borderClasses: Record<ServiceCardProps["borderColor"], string> = {
  publishing: "border-publishing text-publishing",
  foundation: "border-foundation text-foundation",
  financial: "border-financial text-financial",
};

const ringClasses: Record<ServiceCardProps["ringColor"], string> = {
  publishing: "hover:ring-2 hover:ring-publishing",
  foundation: "hover:ring-2 hover:ring-foundation",
  financial: "hover:ring-2 hover:ring-financial",
};

export const ServiceCard: FC<ServiceCardProps> = ({
  href,
  emoji,
  title,
  description,
  borderColor,
  ringColor,
}) => {
  const borderClass = borderClasses[borderColor] ?? "border-gray-300 text-gray-500";
  const ringClass = ringClasses[ringColor] ?? "hover:ring-2 hover:ring-gray-300";

  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 bg-accent border-2 rounded-xl shadow transition text-center ${borderClass} ${ringClass}`}
    >
      <h2 className="text-2xl font-semibold">
        {emoji} {title}
      </h2>
      <p className="text-foreground mt-2">{description}</p>
    </motion.a>
  );
};