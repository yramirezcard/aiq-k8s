import Link from "next/link";
import { FIRST_SLUG } from "@/lib/curriculum";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--color-line)] bg-[rgba(10,12,16,0.82)] px-5 backdrop-blur">
      <Link href="/" className="flex items-center gap-2 font-bold">
        <span className="text-[var(--color-nv-bright)]">AIQ</span>
        <span className="hidden text-[var(--color-fg-dim)] sm:inline">on Kubernetes</span>
      </Link>
      <nav className="ml-auto flex items-center gap-2 text-[0.72rem] text-[var(--color-fg-mut)]">
        <Link href={`/learn/${FIRST_SLUG}`} className="rounded-full border border-[var(--color-line-2)] px-2.5 py-1 transition hover:border-[var(--color-nv)] hover:text-[var(--color-fg)]">Chapters</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
