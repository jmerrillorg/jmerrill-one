'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import HeroLogo from '@/components/shared/HeroLogo';
import Link from 'next/link';

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Your message has been sent to info@jmerrill.one');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 py-12 bg-background text-foreground"
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center">
        <HeroLogo />
        <h1 className="text-4xl font-bold mt-6 text-primary">Get in Touch</h1>
        <p className="mt-2 text-lg text-muted">
          Whether you’re ready to collaborate, have a question, or just want to say hello — we’d love to hear from you.
        </p>
      </div>

      {/* Grid Layout with Contact Info on Left */}
      <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Contact Info Block */}
        <div className="text-sm text-muted-foreground bg-muted/10 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Reach Us Directly</h3>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-foreground">📍 Headquarters</p>
              <p>
                2323 W 5th Ave, Suite 120
                <br />
                Columbus, OH 43204
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">📞 Contact</p>
              <p>
                Main Line: (614) 965-6057
                <br />
                Email:{' '}
                <Link
                  href="mailto:info@jmerrill.one"
                  className="text-primary hover:underline"
                >
                  info@jmerrill.one
                </Link>
                <br />
                Web:{' '}
                <Link
                  href="https://www.jmerrill.one"
                  className="text-primary hover:underline"
                >
                  jmerrill.one
                </Link>
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">⏰ Hours</p>
              <p>
                Mon–Thu: 10 AM – 6 PM
                <br />
                Fri: 10 AM – 4 PM
                <br />
                Sat: By Appointment Only
                <br />
                Sun: Closed
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 bg-muted p-8 rounded-2xl shadow-lg"
        >
          <div>
            <label htmlFor="name" className="block font-semibold mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full p-3 rounded-lg bg-background border border-border"
              onChange={handleChange}
              value={formData.name}
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-semibold mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full p-3 rounded-lg bg-background border border-border"
              onChange={handleChange}
              value={formData.email}
            />
          </div>

          <div>
            <label htmlFor="reason" className="block font-semibold mb-1">
              Reason for Contact
            </label>
            <select
              id="reason"
              name="reason"
              required
              className="w-full p-3 rounded-lg bg-background border border-border"
              onChange={handleChange}
              value={formData.reason}
            >
              <option value="">Select a reason</option>
              <option value="Publishing">Publishing</option>
              <option value="Financial">Financial</option>
              <option value="Foundation">Foundation</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block font-semibold mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full p-3 rounded-lg bg-background border border-border"
              onChange={handleChange}
              value={formData.message}
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}