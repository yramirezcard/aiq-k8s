"use client";
import { useEffect, useState, type ReactNode, isValidElement } from "react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/github-dark.css";
import { runInShell } from "@/lib/labBus";
import { useShellUi } from "@/lib/shellUi";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("json", json);

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) return extractText((node.props as { children?: ReactNode }).children);
  return "";
}

function getLang(node: ReactNode): string {
  if (Array.isArray(node)) {
    for (const c of node) {
      const l = getLang(c);
      if (l) return l;
    }
    return "";
  }
  if (isValidElement(node)) {
    const cn = String((node.props as { className?: string }).className || "");
    const m = /language-([\w-]+)/.exec(cn);
    if (m) return m[1];
    return getLang((node.props as { children?: ReactNode }).children);
  }
  return "";
}

const SHELL_LANGS = ["bash", "sh", "shell", "console", "zsh"];
const REF_LANGS = ["bash-ref", "sh-ref", "ref"];

function hljsLang(lang: string): string | null {
  if (lang === "" || SHELL_LANGS.includes(lang) || REF_LANGS.includes(lang)) return "bash";
  if (lang === "yaml" || lang === "yml") return "yaml";
  if (lang === "json") return "json";
  return null;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function CodeBlock({ children }: { children?: ReactNode }) {
  const code = extractText(children).replace(/\n$/, "");
  const lang = getLang(children);
  const [copied, setCopied] = useState(false);
  const shellUi = useShellUi();

  const isRef = REF_LANGS.includes(lang);
  const isShell = lang === "" || SHELL_LANGS.includes(lang);
  const hasCommand = code.split("\n").some((line) => line.trim() !== "" && !/^\s*#/.test(line));
  const runnable = isShell && hasCommand && !isRef;
  const label = isRef ? "reference" : isShell ? "shell" : lang;
  const grammar = hljsLang(lang);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!grammar) {
      setHtml(null);
      return;
    }
    try { setHtml(hljs.highlight(code, { language: grammar }).value); } catch { setHtml(null); }
  }, [code, grammar]);

  return (
    <div className="group relative my-5 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-code-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-3 py-1.5">
        <span className="font-mono text-[11px] text-[var(--color-fg-mut)]">{label}</span>
        <div className="flex gap-2">
          {runnable && (
            <button
              type="button"
              onClick={() => {
                shellUi?.openShell();
                runInShell(code);
              }}
              className="rounded border border-[var(--color-nv-dim)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-nv-bright)] hover:bg-[var(--color-panel)]"
              title="Run this in the lab shell"
            >
              Run in shell
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              copyText(code)
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1400);
                })
                .catch(() => setCopied(false));
            }}
            className="rounded border border-[var(--color-line-2)] px-2 py-0.5 text-[11px] text-[var(--color-fg-mut)] hover:text-[var(--color-fg)]"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed">
        {html
          ? <code className={`hljs language-${grammar}`} style={{ background: "transparent", padding: 0 }} dangerouslySetInnerHTML={{ __html: html }} />
          : <code className="text-[var(--color-code-fg)]">{code}</code>}
      </pre>
    </div>
  );
}
