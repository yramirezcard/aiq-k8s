"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("aiq-theme") as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("aiq-theme", next); } catch {}
    window.dispatchEvent(new CustomEvent("aiq:theme", { detail: next }));
  };

  return (
    <button
      onClick={toggle}
      title="Toggle light or dark theme"
      aria-label="Toggle theme"
      className="rounded-full border border-[var(--color-line-2)] p-1.5 text-[var(--color-fg-mut)] hover:text-[var(--color-fg)]"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
