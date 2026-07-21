"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

function buildAppUrl(path: string, port: number) {
  if (typeof window === "undefined") return "#";

  const url = new URL(window.location.href);
  url.port = String(port);
  url.pathname = path.startsWith("/") ? path : `/${path}`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function AppLaunchButton({ label, path, port = 3001 }: { label: string; path: string; port?: number }) {
  const [href, setHref] = useState("#");

  useEffect(() => {
    setHref(buildAppUrl(path, port));
  }, [path, port]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="my-5 inline-flex items-center gap-2 rounded-lg border border-[var(--color-nv-dim)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-nv-bright)] no-underline transition hover:border-[var(--color-nv)] hover:bg-[var(--color-bg-2)]"
    >
      <ExternalLink size={15} />
      {label}
    </a>
  );
}
