"use client";
import { useState } from "react";
import Link from "next/link";
import { canon } from "@/content/canon";

const NAV_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M4 4 Q4 12 12 20 Q20 12 20 4" stroke="#002C54" strokeWidth="1.5" fill="none"/>
    <path d="M12 4 L12 20" stroke="#A3C4DC" strokeWidth="1" opacity="0.5"/>
    <path d="M8 6 Q12 10 16 6" stroke="#F4B400" strokeWidth="1.2" fill="none"/>
  </svg>
);

const navLinks = [
  { label: "Why We Exist",    href: "/why-we-exist" },
  { label: "Divisions",       href: "/#divisions" },
  { label: "Operating Model", href: "/operating-model" },
  { label: "Contact",         href: "/contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="jm1-nav">
        {/* Wordmark */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <Link href="/" className="jm1-nav-mark">{NAV_SVG}</Link>
          <Link href="/" className="jm1-nav-wm">
            {canon.nav.wordmark}<sup>{canon.nav.wordmarkSup}</sup>
          </Link>
        </div>

        {/* Desktop links */}
        <ul className="jm1-nav-links">
          {navLinks.map(({ label, href }) => (
            <li key={label}><Link href={href}>{label}</Link></li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Link href="/contact" className="jm1-nav-cta">
          {canon.nav.cta} ↗
        </Link>

        {/* Mobile hamburger */}
        <button
          className="jm1-nav-hamburger"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <div className={`jm1-nav-overlay${open ? " open" : ""}`}>
        <button
          className="jm1-nav-overlay-close"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="jm1-nav-overlay-links">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="jm1-nav-overlay-cta">
          <Link
            href="/contact"
            className="jm1-btn-fill"
            style={{ display:"block", textAlign:"center", width:"100%" }}
            onClick={() => setOpen(false)}
          >
            {canon.nav.cta} ↗
          </Link>
        </div>
      </div>
    </>
  );
}
