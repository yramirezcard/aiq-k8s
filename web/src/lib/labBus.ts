type Sender = (text: string) => void;

declare global {
  interface Window {
    __aiqOpenShell?: () => void;
  }
}

let sender: Sender | null = null;
const queue: string[] = [];

export function registerShellSender(s: Sender | null) {
  sender = s;
  if (s) {
    while (queue.length) s(queue.shift()!);
  }
}

export function runInShell(text: string) {
  const cmd = text.replace(/\s+$/, "");
  if (!cmd) return;
  if (typeof window !== "undefined") {
    window.__aiqOpenShell?.();
    window.dispatchEvent(new Event("aiq:start-shell"));
  }
  if (sender) sender(cmd);
  else queue.push(cmd);
}

export function runApiCheck(cmd: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return fetch("/api/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cmd }),
  })
    .then((r) => r.json())
    .catch((e) => ({ exitCode: 1, stdout: "", stderr: String(e) }));
}
