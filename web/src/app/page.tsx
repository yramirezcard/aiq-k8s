import Link from "next/link";
import { FIRST_SLUG, CURRICULUM } from "@/lib/curriculum";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-2)] px-3 py-1 text-xs text-[var(--color-fg-dim)]">
        NVIDIA AI-Q Blueprint on Kubernetes
      </div>
      <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">
        Deploy AI-Q on a live <span className="text-[var(--color-nv-bright)]">k3s cluster</span>.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-[var(--color-fg-dim)]">
        This launchable prepares Kubernetes for you. The tutorial walks you through the
        blueprint deployment step by step with commands you can run in the embedded terminal.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/learn/${FIRST_SLUG}`} className="rounded-lg bg-[var(--color-nv)] px-5 py-2.5 font-semibold text-[#06080b] hover:bg-[var(--color-nv-bright)]">Start tutorial</Link>
        <Link href="/learn/verify-cluster" className="rounded-lg border border-[var(--color-line-2)] px-5 py-2.5 font-semibold hover:border-[var(--color-nv)]">Verify the cluster</Link>
      </div>

      <h2 className="mt-14 text-lg font-bold">Chapters</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {CURRICULUM.map((p) => (
          <div key={p.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <div className="text-sm font-bold text-[var(--color-nv-bright)]">{p.title}</div>
            <div className="mt-1 text-sm text-[var(--color-fg-dim)]">{p.subtitle}</div>
            <ul className="mt-3 space-y-1 text-sm text-[var(--color-fg-mut)]">
              {p.lessons.map((l) => (
                <li key={l.slug}>
                  <Link href={`/learn/${l.slug}`} className="hover:text-[var(--color-nv-bright)]">{l.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
