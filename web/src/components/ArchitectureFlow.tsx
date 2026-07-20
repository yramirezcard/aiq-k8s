"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

type NodeId = "user" | "intent" | "meta" | "shallow" | "clarifier" | "deep" | "answer";

type Scenario = {
  id: string;
  label: string;
  query: string;
  route: NodeId[];
  outcome: string;
  notes: string[];
};

const NODES: { id: NodeId; title: string; caption: string; x: number; y: number }[] = [
  { id: "user", title: "User query", caption: "Prompt enters AI-Q", x: 10, y: 44 },
  { id: "intent", title: "Intent Classifier", caption: "Meta, shallow, or deep", x: 30, y: 44 },
  { id: "meta", title: "Meta response", caption: "Direct system answer", x: 52, y: 17 },
  { id: "shallow", title: "Shallow Researcher", caption: "Fast tool-assisted lookup", x: 52, y: 44 },
  { id: "clarifier", title: "Clarifier Agent", caption: "Plan and approval", x: 52, y: 71 },
  { id: "deep", title: "Deep Researcher", caption: "Planner and researcher agents", x: 72, y: 71 },
  { id: "answer", title: "Final response", caption: "Cited answer or report", x: 90, y: 44 },
];

const SCENARIOS: Scenario[] = [
  {
    id: "meta",
    label: "Meta",
    query: "What can AI-Q help me do?",
    route: ["user", "intent", "meta", "answer"],
    outcome: "AI-Q can answer directly because the question is about the system itself.",
    notes: ["No external search required", "Shortest path", "Good for orientation questions"],
  },
  {
    id: "shallow",
    label: "Shallow",
    query: "Summarize the latest revenue trend for NVIDIA.",
    route: ["user", "intent", "shallow", "answer"],
    outcome: "AI-Q uses bounded tool-assisted research and returns a concise cited answer.",
    notes: ["Fast factual lookup", "Limited tool iterations", "Citation verification before the final answer"],
  },
  {
    id: "deep",
    label: "Deep",
    query: "Compare three enterprise RAG deployment patterns and recommend one for a regulated bank.",
    route: ["user", "intent", "clarifier", "deep", "answer"],
    outcome: "AI-Q prepares a plan, then runs a deeper multi-agent research workflow.",
    notes: ["Needs planning", "May ask clarifying questions", "Produces a report-style synthesis"],
  },
  {
    id: "escalation",
    label: "Escalation",
    query: "Which retrieval architecture should we standardize across all business units?",
    route: ["user", "intent", "shallow", "clarifier", "deep", "answer"],
    outcome: "AI-Q can start shallow, then escalate when the question needs broader analysis.",
    notes: ["Begins with quick research", "Escalates when scope is too broad", "Deep path adds planning and synthesis"],
  },
];

function nodeById(id: NodeId) {
  const node = NODES.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown architecture node: ${id}`);
  return node;
}

function FlowLine({ from, to, active, traversed }: { from: NodeId; to: NodeId; active: boolean; traversed: boolean }) {
  const a = nodeById(from);
  const b = nodeById(to);
  return (
    <line
      x1={`${a.x}%`}
      y1={`${a.y}%`}
      x2={`${b.x}%`}
      y2={`${b.y}%`}
      stroke={active || traversed ? "var(--color-nv)" : "var(--color-line-2)"}
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      opacity={active ? 0.42 : traversed ? 0.28 : 0.18}
      className="transition-all duration-300"
    />
  );
}

export function ArchitectureFlow() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const scenario = useMemo(() => SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0], [scenarioId]);

  useEffect(() => {
    setStep(0);
    setPlaying(true);
  }, [scenarioId]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= scenario.route.length - 1) {
          return 0;
        }
        return current + 1;
      });
    }, 1200);

    return () => window.clearInterval(timer);
  }, [playing, scenario.route.length]);

  const activeNode = scenario.route[step];
  const routeEdges = new Set(scenario.route.slice(0, -1).map((from, i) => `${from}-${scenario.route[i + 1]}`));
  const traversedEdges = new Set(scenario.route.slice(0, step).map((from, i) => `${from}-${scenario.route[i + 1]}`));
  const activeEdge = step > 0 ? `${scenario.route[step - 1]}-${scenario.route[step]}` : "";

  function isActiveEdge(from: NodeId, to: NodeId) {
    return activeEdge === `${from}-${to}`;
  }

  function isTraversedEdge(from: NodeId, to: NodeId) {
    const key = `${from}-${to}`;
    return routeEdges.has(key) && traversedEdges.has(key);
  }

  return (
    <div className="not-prose my-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="flex flex-col gap-3 border-b border-[var(--color-line)] pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold text-[var(--color-fg)]">Interactive request flow</div>
          <div className="mt-1 text-sm text-[var(--color-fg-mut)]">Pick a request type and watch how AI-Q routes it.</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-fg-dim)] transition hover:border-[var(--color-nv-dim)] hover:text-[var(--color-fg)]"
            aria-label={playing ? "Pause animation" : "Play animation"}
            title={playing ? "Pause animation" : "Play animation"}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-fg-dim)] transition hover:border-[var(--color-nv-dim)] hover:text-[var(--color-fg)]"
            aria-label="Restart animation"
            title="Restart animation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {SCENARIOS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setScenarioId(item.id)}
            className={`rounded-md border p-3 text-left transition ${
              item.id === scenario.id
                ? "border-[var(--color-nv)] bg-[rgba(118,185,0,0.12)]"
                : "border-[var(--color-line)] bg-[var(--color-panel-2)] hover:border-[var(--color-nv-dim)]"
            }`}
          >
            <span className="block text-sm font-semibold text-[var(--color-fg)]">{item.label}</span>
            <span className="mt-1 block text-xs leading-5 text-[var(--color-fg-mut)]">{item.query}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-2)] p-3">
        <div className="overflow-x-auto rounded-md border border-[var(--color-line)] bg-[var(--color-bg)]">
          <div className="relative h-[400px] min-w-[680px] md:h-[300px]">
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              <FlowLine from="user" to="intent" active={isActiveEdge("user", "intent")} traversed={isTraversedEdge("user", "intent")} />
              <FlowLine from="intent" to="meta" active={isActiveEdge("intent", "meta")} traversed={isTraversedEdge("intent", "meta")} />
              <FlowLine from="intent" to="shallow" active={isActiveEdge("intent", "shallow")} traversed={isTraversedEdge("intent", "shallow")} />
              <FlowLine from="intent" to="clarifier" active={isActiveEdge("intent", "clarifier")} traversed={isTraversedEdge("intent", "clarifier")} />
              <FlowLine from="shallow" to="clarifier" active={isActiveEdge("shallow", "clarifier")} traversed={isTraversedEdge("shallow", "clarifier")} />
              <FlowLine from="clarifier" to="deep" active={isActiveEdge("clarifier", "deep")} traversed={isTraversedEdge("clarifier", "deep")} />
              <FlowLine from="meta" to="answer" active={isActiveEdge("meta", "answer")} traversed={isTraversedEdge("meta", "answer")} />
              <FlowLine from="shallow" to="answer" active={isActiveEdge("shallow", "answer")} traversed={isTraversedEdge("shallow", "answer")} />
              <FlowLine from="deep" to="answer" active={isActiveEdge("deep", "answer")} traversed={isTraversedEdge("deep", "answer")} />
            </svg>

            {NODES.map((node) => {
              const inRoute = scenario.route.includes(node.id);
              const routeIndex = scenario.route.indexOf(node.id);
              const visited = routeIndex >= 0 && routeIndex < step;
              const active = activeNode === node.id;

              return (
                <div
                  key={node.id}
                  className={`absolute flex w-[124px] flex-col justify-center rounded-md border p-2.5 text-center shadow-sm transition-all duration-300 md:w-[132px] ${
                    active
                      ? "border-[var(--color-nv-bright)] bg-[var(--color-panel-2)]"
                      : visited
                        ? "border-[var(--color-nv)] bg-[var(--color-panel)]"
                        : inRoute
                          ? "border-[var(--color-line-2)] bg-[var(--color-panel)]"
                          : "border-[var(--color-line)] bg-[var(--color-panel)] opacity-45"
                  }`}
                  style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  {inRoute && (
                    <span
                      className={`absolute -left-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                        active
                          ? "border-[var(--color-nv-bright)] bg-[var(--color-nv)] text-black"
                          : visited
                            ? "border-[var(--color-nv)] bg-[var(--color-bg)] text-[var(--color-nv-bright)]"
                            : "border-[var(--color-line-2)] bg-[var(--color-bg)] text-[var(--color-fg-mut)]"
                      }`}
                    >
                      {routeIndex + 1}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold leading-4 text-[var(--color-fg)] md:text-xs">{node.title}</span>
                  <span className="mt-1 text-[10px] leading-4 text-[var(--color-fg-mut)] md:text-[11px]">{node.caption}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
          {scenario.route.map((nodeId, i) => {
            const node = nodeById(nodeId);
            const active = i === step;
            const visited = i < step;

            return (
              <div key={`${scenario.id}-${nodeId}-${i}`} className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-1 text-xs font-semibold transition ${
                    active
                      ? "border-[var(--color-nv-bright)] bg-[var(--color-nv)] text-black"
                      : visited
                        ? "border-[var(--color-nv)] bg-[rgba(118,185,0,0.1)] text-[var(--color-nv-bright)]"
                        : "border-[var(--color-line)] bg-[var(--color-panel-2)] text-[var(--color-fg-mut)]"
                  }`}
                >
                  {i + 1}. {node.title}
                </span>
                {i < scenario.route.length - 1 && <span className="text-xs text-[var(--color-fg-mut)]">-&gt;</span>}
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="text-xs font-semibold uppercase text-[var(--color-nv-bright)]">Example query</div>
            <div className="mt-1 rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] p-3 font-mono text-sm text-[var(--color-fg-dim)]">
              {scenario.query}
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--color-fg-dim)]">{scenario.outcome}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-[var(--color-nv-bright)]">Why this route</div>
            <ul className="mt-2 space-y-2 text-sm text-[var(--color-fg-dim)]">
              {scenario.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-nv)]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
