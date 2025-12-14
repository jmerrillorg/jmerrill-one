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
  className?: string; // ✅ NEW: Allow optional className prop
}

const borderClasses: Record<ServiceCardProps["borderColor"], string> = {
  publishing: "border-publishing text-publishing dark:border-publishing dark:text-publishing",
  foundation: "border-foundation text-foundation dark:border-foundation dark:text-foundation",
  financial: "border-financial text-financial dark:border-financial dark:text-financial",
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
  className = "", // ✅ NEW: default empty string
}) => {
  const borderClass = borderClasses[borderColor] ?? "border-gray-300 text-gray-700 dark:text-gray-200";
  const ringClass = ringClasses[ringColor] ?? "hover:ring-2 hover:ring-gray-400";

  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 bg-white dark:bg-gray-900 border-2 rounded-xl shadow-md transition duration-200 ease-in-out text-center ${borderClass} ${ringClass} ${className}`}
    >
      <h2 className="text-2xl font-semibold">
        {emoji} {title}
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </motion.a>
  );
};