"use client";
import { useEffect, useRef, useState } from "react";
import { PlugZap, RotateCcw, TerminalSquare } from "lucide-react";
import { registerShellSender } from "@/lib/labBus";

type Status = "idle" | "connecting" | "live" | "closed" | "error";

function xtermTheme() {
  const light = typeof document !== "undefined" && document.documentElement.dataset.theme === "light";
  return light
    ? {
        background: "#f8fafc",
        foreground: "#1f2937",
        cursor: "#4d7a00",
        selectionBackground: "#cde2a3",
        black: "#1f2937",
        red: "#b91c1c",
        green: "#4d7a00",
        yellow: "#a16207",
        blue: "#2563eb",
        magenta: "#7c3aed",
        cyan: "#0891b2",
        white: "#e5e7eb",
        brightBlack: "#64748b",
        brightRed: "#dc2626",
        brightGreen: "#76b900",
        brightYellow: "#ca8a04",
        brightBlue: "#3b82f6",
        brightMagenta: "#8b5cf6",
        brightCyan: "#06b6d4",
        brightWhite: "#ffffff",
      }
    : {
        background: "#0b111d",
        foreground: "#d6dde8",
        cursor: "#92e600",
        selectionBackground: "#263548",
        black: "#0b111d",
        red: "#ff6b6b",
        green: "#76b900",
        yellow: "#f7c948",
        blue: "#66a3ff",
        magenta: "#c084fc",
        cyan: "#38d6e8",
        white: "#d6dde8",
        brightBlack: "#6b7280",
        brightRed: "#ff8787",
        brightGreen: "#92e600",
        brightYellow: "#fde047",
        brightBlue: "#93c5fd",
        brightMagenta: "#d8b4fe",
        brightCyan: "#67e8f9",
        brightWhite: "#ffffff",
      };
}

export function Terminal({ title = "lab shell", fill = false }: { title?: string; fill?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const h = fill ? "h-[calc(100vh-9rem)] min-h-[440px]" : "h-[400px]";

  useEffect(() => {
    const onStart = () => setStarted(true);
    window.addEventListener("aiq:start-shell", onStart);
    return () => window.removeEventListener("aiq:start-shell", onStart);
  }, []);

  useEffect(() => {
    if (!started || !hostRef.current) return;
    let term: import("@xterm/xterm").Terminal | undefined;
    let fit: import("@xterm/addon-fit").FitAddon | undefined;
    let ws: WebSocket | undefined;
    let ro: ResizeObserver | undefined;
    let onTheme: (() => void) | undefined;
    let disposed = false;
    setErr(null);
    setStatus("connecting");

    const proto = location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${location.host}/ws/term`;
    const watchdog = setTimeout(() => {
      if (!disposed && ws && ws.readyState !== WebSocket.OPEN) {
        setStatus("error");
        setErr(`Could not open ${url} after 8s. Check that the workshop server is running and forwarding WebSocket upgrades.`);
        try { ws.close(); } catch {}
      }
    }, 8000);

    (async () => {
      try {
        const { Terminal: XTerm } = await import("@xterm/xterm");
        const { FitAddon } = await import("@xterm/addon-fit");
        await import("@xterm/xterm/css/xterm.css");
        if (disposed) return;

        term = new XTerm({
          fontFamily: "var(--font-mono), 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace",
          fontSize: 14,
          lineHeight: 1.18,
          cursorBlink: true,
          scrollback: 5000,
          theme: xtermTheme(),
        });
        fit = new FitAddon();
        term.loadAddon(fit);
        term.open(hostRef.current!);
        fit.fit();
        onTheme = () => { try { if (term) term.options.theme = xtermTheme(); } catch {} };
        window.addEventListener("aiq:theme", onTheme);
        term.write("\x1b[90mconnecting to " + url + " ...\x1b[0m\r\n");

        ws = new WebSocket(url);
        ws.onopen = () => {
          clearTimeout(watchdog);
          setStatus("live");
          registerShellSender((text) => {
            if (ws!.readyState === 1) ws!.send(text.replace(/\n/g, "\r") + "\r");
          });
          const sendResize = () => { try { ws!.send(`\x00resize:${term!.cols}:${term!.rows}`); } catch {} };
          sendResize();
          ro = new ResizeObserver(() => { try { fit!.fit(); sendResize(); } catch {} });
          ro.observe(hostRef.current!);
        };
        ws.onmessage = (e) => term && term.write(typeof e.data === "string" ? e.data : new Uint8Array(e.data as ArrayBuffer));
        ws.onclose = () => { if (!disposed) setStatus("closed"); registerShellSender(null); };
        ws.onerror = () => { if (!disposed) setStatus("error"); };
        term.onData((d) => { if (ws && ws.readyState === 1) ws.send(d); });
      } catch (e) {
        if (!disposed) { setStatus("error"); setErr(String(e)); }
      }
    })();

    return () => {
      disposed = true;
      clearTimeout(watchdog);
      registerShellSender(null);
      if (onTheme) window.removeEventListener("aiq:theme", onTheme);
      try { ro?.disconnect(); } catch {}
      try { ws?.close(); } catch {}
      try { term?.dispose(); } catch {}
    };
  }, [started, session]);

  const dot = status === "live" ? "#76b900" : status === "error" || status === "closed" ? "#ee0000" : "#8a93a3";
  const statusLabel = status === "live" ? "connected" : status;
  const reconnect = () => {
    if (!started) setStarted(true);
    else setSession((n) => n + 1);
  };

  return (
    <div className={`term-glow flex flex-col overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-term-bg)] ${h}`}>
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-panel)] px-3.5 py-2.5">
        <span className="flex items-center gap-[7px]">
          <span style={{ width: 11, height: 11, borderRadius: 11, background: "#ff5f56", display: "inline-block" }} />
          <span style={{ width: 11, height: 11, borderRadius: 11, background: "#ffbd2e", display: "inline-block" }} />
          <span style={{ width: 11, height: 11, borderRadius: 11, background: "#27c93f", display: "inline-block" }} />
        </span>
        <span className="font-mono text-[11px] tracking-wide text-[var(--color-fg-dim)]">{title}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-2)] px-2 py-[3px] text-[10px] font-medium uppercase tracking-wide text-[var(--color-fg-mut)]">
          <span className={status === "live" ? "animate-pulse" : ""} style={{ width: 7, height: 7, borderRadius: 7, background: dot, display: "inline-block" }} />
          {statusLabel}
        </span>
        {started && (
          <button
            onClick={reconnect}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-line-2)] text-[var(--color-fg-mut)] transition hover:bg-[var(--color-bg-2)] hover:text-[var(--color-fg)]"
            title="Reconnect shell"
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>
      {!started ? (
        <div className="m-auto flex flex-col items-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-line-2)] bg-[var(--color-panel)] text-[var(--color-nv-bright)]">
            <TerminalSquare size={22} />
          </div>
          <button onClick={() => setStarted(true)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-nv-dim)] px-5 py-2.5 text-sm font-semibold text-[var(--color-nv-bright)] transition hover:bg-[var(--color-panel)] hover:shadow-[0_0_0_3px_var(--color-nv-dim)]">
            <PlugZap size={15} /> Open lab shell
          </button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 px-3 pb-2 pt-2.5">
          <div ref={hostRef} className="h-full w-full" />
          {err && <div className="px-1 py-2 text-xs text-red-400">{err}</div>}
        </div>
      )}
    </div>
  );
}
