// src/app/about/page.tsx

'use client';
import Link from "next/link";
import HeroLogo from '@/components/shared/HeroLogo'
import { motion } from "framer-motion";
import Image from "next/image";
import Timeline from "@/components/Timeline";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 py-12 bg-background text-foreground"
    >
      <div className="max-w-4xl mx-auto text-center">
        <HeroLogo />
        <h1 className="text-4xl font-bold mt-6">About J Merrill One</h1>
        <p className="mt-4 text-lg text-muted">
          A collective of purpose-driven ventures — publishing, financial services, and nonprofit innovation — built on tech, truth, and tenacity.
        </p>
      </div>

      <section className="max-w-5xl mx-auto mt-12 grid gap-10 md:grid-cols-3 text-center">
        <motion.div whileHover={{ scale: 1.02 }} className="border-2 border-blue-600 dark:border-blue-400 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">Publishing</h2>
          <p className="mt-2 text-sm text-muted">
            Helping authors help themselves — from manuscript to marketplace. Print, blockchain, and audio solutions.
          </p>
          <Link href="/brands/publishing" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
            Explore Publishing
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="border-2 border-teal-700 dark:border-teal-400 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-teal-700 dark:text-teal-300">Financial</h2>
          <p className="mt-2 text-sm text-muted">
            Planning with compassion. From advance planning to life & health coverage — all in one place.
          </p>
          <Link href="/brands/financial" className="inline-block mt-4 text-sm text-teal-700 hover:underline">
            Explore Financial
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="border-2 border-purple-700 dark:border-purple-400 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300">Foundation</h2>
          <p className="mt-2 text-sm text-muted">
            Bridging mission with innovation. Blockchain giving, AI pilots, and equity-forward tools for community growth.
          </p>
          <Link href="/brands/foundation" className="inline-block mt-4 text-sm text-purple-700 hover:underline">
            Explore Foundation
          </Link>
        </motion.div>
      </section>

      <section className="mt-20 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Our Story</h2>
        <p className="text-muted text-sm md:text-base leading-relaxed">
          J Merrill One began as a vision to integrate purpose with professionalism — not just to offer services, but to transform how people engage with publishing, finance, and nonprofits. 
          Every brand under our umbrella shares a unified commitment: modern tools, bold impact, and personal guidance.
        </p>
      </section>

      <section className="mt-20 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Meet the Founder</h2>
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/jackie-founder.jpg"
            alt="Jackie Smith, Jr."
            width={120}
            height={120}
            className="rounded-full border-4 border-primary"
          />
          <p className="text-muted max-w-xl text-sm md:text-base leading-relaxed">
            Jackie Smith, Jr. is the powerhouse behind J Merrill One — a visionary who blends AI strategy, enterprise-level automation, and a heart for people.
            With a footprint in publishing, insurance, and digital transformation, Jackie brings ideas to life through disciplined innovation and deep compassion.
          </p>
        </div>
      </section>

      <Timeline />

      <section className="mt-20 text-center">
        <p className="text-muted text-sm">Want to work with us?</p>
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
          <Link href="/appointments" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition">
            Book an Appointment
          </Link>
          <Link href="/#brands" className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition">
            View Our Brands
          </Link>
        </div>
      </section>

      <div className="mt-16 text-center text-sm text-muted">
        Built with bold vision. Powered by automation. Grounded in purpose.
      </div>
    </motion.div>
  );
}