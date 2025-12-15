"use client";

import { useState } from "react";
import Link from "next/link";
import { SERVICE_TAXONOMY } from "@/data/serviceTaxonomy";

export default function ServiceFinder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { key: keyof typeof SERVICE_TAXONOMY; confidence: number; rationale: string }[]
  >([]);

  async function analyze(input: string) {
    if (!input.trim()) {
      setResults([]);
      return;
    }

    const res = await fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    const data = await res.json();
    setResults(data);
  }

  return (
    <section className="px-6 py-8 border-t border-jm1-mist">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-xl font-semibold mb-2">
          Not sure where to start?
        </h2>

        <input
          type="text"
          placeholder="Describe what you’re looking to do…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            analyze(e.target.value);
          }}
          className="w-full rounded-md border border-jm1-mist px-3 py-2 mb-4"
        />

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((r) => {
              const svc = SERVICE_TAXONOMY[r.key];
              return (
                <Link
                  key={r.key}
                  href={svc.route}
                  className="block rounded-md bg-jm1-mist/60 p-4 hover:bg-jm1-mist transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-jm1-ink">
                      {svc.label}
                    </div>
                    <div className="text-xs text-jm1-slate">
                      {Math.round(r.confidence * 100)}%
                    </div>
                  </div>
                  <div className="text-sm text-jm1-slate">
                    {svc.description}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}