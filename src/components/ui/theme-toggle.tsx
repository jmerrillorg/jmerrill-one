"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark";
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      className="rounded border px-2 py-1 text-xs"
    >
      {theme === "light" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}