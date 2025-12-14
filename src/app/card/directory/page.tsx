"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import teamData from "@/data/teamdirectory.json";

interface DirectoryEntry {
  type: "group" | "member";
  category: string; // division | executive | ai-staff
  division?: string;
  slug: string;
  profileSlug?: string;
  name: string;
  title?: string;
  tagline?: string;
  imageSrc?: string;
  keywords?: string[];
  skills?: string[];
  availabilityNote?: string;
}

export default function TeamDirectoryPage() {
  const entries = teamData as DirectoryEntry[];

  // Canonical division order
  const divisionOrder = ["jm1", "publishing", "financial", "foundation", "productions", "aic"];

  const divisions = entries
    .filter((e) => e.type === "group")
    .sort(
      (a, b) =>
        divisionOrder.indexOf(a.division || "") -
        divisionOrder.indexOf(b.division || "")
    );

  const executives = entries.filter((e) => e.type === "member" && e.category === "executive");
  const aiStaff = entries.filter((e) => e.type === "member" && e.category === "ai-staff");

  // ====================================================
  // 🔥 Search + Filter State
  // ====================================================
  const [search, setSearch] = useState("");
  const [filterDivision, setFilterDivision] = useState<string | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string | "all">("all");
  const [filterSkill, setFilterSkill] = useState<string | "all">("all");
  const [filterKeyword, setFilterKeyword] = useState<string | "all">("all");

  // Collect all skills + keywords dynamically
  const allSkills = Array.from(
    new Set(entries.flatMap((e) => e.skills ?? []))
  );

  const allKeywords = Array.from(
    new Set(entries.flatMap((e) => e.keywords ?? []))
  );

  // ====================================================
  // 🔥 Filter Engine
  // ====================================================
  const filteredExecutives = useMemo(() => {
    return executives.filter((entry) => {
      const haystack = `${entry.name} ${entry.title} ${entry.tagline} ${entry.keywords} ${entry.skills}`.toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesDivision = filterDivision === "all" || entry.division === filterDivision;
      const matchesCategory = filterCategory === "all" || entry.category === filterCategory;
      const matchesSkill =
        filterSkill === "all" || entry.skills?.includes(filterSkill);
      const matchesKeyword =
        filterKeyword === "all" || entry.keywords?.includes(filterKeyword);

      return matchesSearch && matchesDivision && matchesCategory && matchesSkill && matchesKeyword;
    });
  }, [search, filterDivision, filterCategory, filterSkill, filterKeyword]);

  const filteredAI = useMemo(() => {
    return aiStaff.filter((entry) => {
      const haystack = `${entry.name} ${entry.title} ${entry.tagline} ${entry.keywords} ${entry.skills}`.toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesDivision = filterDivision === "all" || entry.division === filterDivision;
      const matchesCategory = filterCategory === "all" || entry.category === filterCategory;
      const matchesSkill =
        filterSkill === "all" || entry.skills?.includes(filterSkill);
      const matchesKeyword =
        filterKeyword === "all" || entry.keywords?.includes(filterKeyword);

      return matchesSearch && matchesDivision && matchesCategory && matchesSkill && matchesKeyword;
    });
  }, [search, filterDivision, filterCategory, filterSkill, filterKeyword]);

  // ================================
  // UI HELPERS
  // ================================
  const resetFilters = () => {
    setSearch("");
    setFilterDivision("all");
    setFilterCategory("all");
    setFilterSkill("all");
    setFilterKeyword("all");
  };

  // ================================
  // Card Component
  // ================================
  const Card = ({ entry }: { entry: DirectoryEntry }) => (
    <Link
      href={`/card/${entry.profileSlug ?? entry.slug}`}
      className="group block transition-all"
    >
      <div
        className="
          rounded-2xl overflow-hidden shadow-md border border-gray-200
          dark:border-gray-700 bg-white dark:bg-[#1f1f1f]
          hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]
          transition-all duration-300 ease-out
        "
      >
        <Image
          src={entry.imageSrc ?? "/images/team/logo.jpg"}
          alt={entry.name}
          width={500}
          height={500}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="p-5 text-center">
          <h3 className="text-xl font-semibold group-hover:text-primary transition">
            {entry.name}
          </h3>

          {entry.title && <p className="text-sm text-secondary mt-1">{entry.title}</p>}

          {entry.availabilityNote && (
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 italic">
              {entry.availabilityNote}
            </p>
          )}

          {entry.skills && entry.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {entry.skills.slice(0, 3).map((s, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen px-6 py-16 bg-white text-[#111] dark:bg-[#0f0f0f] dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto">

        {/* ========================================================= */}
        {/* TITLE */}
        {/* ========================================================= */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold mb-4">JM1 Directory</h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Explore divisions, executives, and AI intelligence powering JM1.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 🔥 SEARCH + FILTER BAR */}
        {/* ========================================================= */}
        <div className="mb-16 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            {/* Search Box */}
            <div>
              <label className="block text-sm mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, title, skills..."
                className="w-full px-4 py-2 rounded-lg border dark:bg-[#0f0f0f]"
              />
            </div>

            {/* Division Filter */}
            <div>
              <label className="block text-sm mb-1">Division</label>
              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border dark:bg-[#0f0f0f]"
              >
                <option value="all">All Divisions</option>
                {divisionOrder.map((d) => (
                  <option key={d} value={d}>
                    {d.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border dark:bg-[#0f0f0f]"
              >
                <option value="all">All Categories</option>
                <option value="executive">Executive</option>
                <option value="ai-staff">AI Staff</option>
                <option value="division">Division</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Skill Filter */}
            <div>
              <label className="block text-sm mb-1">Skill</label>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border dark:bg-[#0f0f0f]"
              >
                <option value="all">All Skills</option>
                {allSkills.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Keyword Filter */}
            <div>
              <label className="block text-sm mb-1">Keyword</label>
              <select
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border dark:bg-[#0f0f0f]"
              >
                <option value="all">All Keywords</option>
                {allKeywords.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
              >
                Clear Filters
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* DIVISIONS SECTION */}
        {/* ========================================================= */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-center">Divisions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {divisions.map((d) => (
              <Card key={d.slug} entry={d} />
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* EXECUTIVES */}
        {/* ========================================================= */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-center">Executive Team</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {filteredExecutives.map((m) => (
              <Card key={m.slug} entry={m} />
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* AI STAFF */}
        {/* ========================================================= */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-center">AI Staff</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {filteredAI.map((m) => (
              <Card key={m.slug} entry={m} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}