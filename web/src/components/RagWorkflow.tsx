"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const STEPS = [
  {
    title: "Ingest documents",
    detail: "Files are uploaded through the UI or APIs. The ingestor extracts text and metadata, then prepares chunks for indexing.",
  },
  {
    title: "Create embeddings",
    detail: "Chunks are converted into vectors with a hosted NVIDIA embedding endpoint and stored in the vector database.",
  },
  {
    title: "Ask a question",
    detail: "The user submits a query through the RAG UI, API, or an upstream agent such as AI-Q.",
  },
  {
    title: "Retrieve and rerank",
    detail: "The RAG server searches the vector database and can rerank candidates so the best context reaches the generator.",
  },
  {
    title: "Generate grounded answer",
    detail: "The LLM receives the retrieved context and returns an answer grounded in the uploaded corpus, with citations when enabled.",
  },
];

export function RagWorkflow() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current >= STEPS.length - 1 ? 0 : current + 1));
    }, 1500);

    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className="not-prose my-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="flex flex-col gap-3 border-b border-[var(--color-line)] pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold text-[var(--color-fg)]">RAG workflow</div>
          <div className="mt-1 text-sm text-[var(--color-fg-mut)]">Follow the path from document upload to grounded answer.</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-fg-dim)] transition hover:border-[var(--color-nv-dim)] hover:text-[var(--color-fg)]"
            aria-label={playing ? "Pause workflow" : "Play workflow"}
            title={playing ? "Pause workflow" : "Play workflow"}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-fg-dim)] transition hover:border-[var(--color-nv-dim)] hover:text-[var(--color-fg)]"
            aria-label="Restart workflow"
            title="Restart workflow"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {STEPS.map((item, i) => {
          const active = i === step;
          const visited = i < step;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-md border p-3 text-left transition ${
                active
                  ? "border-[var(--color-nv-bright)] bg-[rgba(118,185,0,0.14)]"
                  : visited
                    ? "border-[var(--color-nv)] bg-[rgba(118,185,0,0.08)]"
                    : "border-[var(--color-line)] bg-[var(--color-panel-2)] hover:border-[var(--color-nv-dim)]"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                  active ? "border-[var(--color-nv-bright)] bg-[var(--color-nv)] text-black" : "border-[var(--color-line-2)] text-[var(--color-fg-mut)]"
                }`}
              >
                {i + 1}
              </span>
              <span className="mt-3 block text-sm font-semibold leading-5 text-[var(--color-fg)]">{item.title}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-[var(--color-line)] bg-[var(--color-bg-2)] p-4">
        <div className="text-xs font-semibold uppercase text-[var(--color-nv-bright)]">Current step</div>
        <div className="mt-1 text-lg font-semibold text-[var(--color-fg)]">{STEPS[step].title}</div>
        <p className="mt-2 text-sm leading-6 text-[var(--color-fg-dim)]">{STEPS[step].detail}</p>
      </div>
    </div>
  );
}
