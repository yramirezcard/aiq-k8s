// Custom Next.js server that bridges a browser terminal to a real shell
// (node-pty) over WebSocket. It runs on the same VM as the k3s cluster, with
// KUBECONFIG pointed at the cluster created by the launchable setup.
import { createServer } from "node:http";
import { parse } from "node:url";
import { spawn } from "node:child_process";
import next from "next";
import { WebSocketServer } from "ws";
import pty from "node-pty";

const dev = process.env.NODE_ENV !== "production";
const bindHostname = process.env.HOST || "0.0.0.0";
const nextHostname = process.env.NEXT_HOSTNAME || (bindHostname === "0.0.0.0" ? "localhost" : bindHostname);
const port = parseInt(process.env.PORT || "3000", 10);

const LAB_CWD = process.env.LAB_CWD || process.cwd();
const LAB_KUBECONFIG = process.env.LAB_KUBECONFIG || "/etc/rancher/k3s/k3s.yaml";
const LAB_RC = process.env.LAB_RC || `${process.cwd()}/lab/labrc`;
const MAX_SESSIONS = parseInt(process.env.LAB_MAX_SESSIONS || "25", 10);

const app = next({ dev, hostname: nextHostname, port });
const handle = app.getRequestHandler();
let sessions = 0;
await app.prepare();
const handleUpgrade = app.getUpgradeHandler();

function runCheck(cmd) {
  return new Promise((resolve) => {
    const p = spawn("/bin/bash", ["-lc", cmd], {
      cwd: LAB_CWD,
      env: { ...process.env, KUBECONFIG: LAB_KUBECONFIG, LAB_CWD },
      timeout: 25000,
    });
    let out = "";
    let errs = "";
    p.stdout.on("data", (d) => { out += d; });
    p.stderr.on("data", (d) => { errs += d; });
    p.on("close", (code) => resolve({ exitCode: code ?? 1, stdout: out.slice(0, 4000), stderr: errs.slice(0, 4000) }));
    p.on("error", (e) => resolve({ exitCode: 1, stdout: "", stderr: String(e) }));
  });
}

const server = createServer((req, res) => {
  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/check") {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 8192) req.destroy(); });
    req.on("end", async () => {
      try {
        const { cmd } = JSON.parse(body || "{}");
        if (!cmd || typeof cmd !== "string") {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ exitCode: 1, stderr: "missing cmd" }));
          return;
        }
        const r = await runCheck(cmd);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(r));
      } catch (e) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ exitCode: 1, stderr: String(e) }));
      }
    });
    return;
  }
  handle(req, res, parse(req.url, true));
});

const wss = new WebSocketServer({ noServer: true });

function createShellSession(ws) {
  const shellEnv = { ...process.env, KUBECONFIG: LAB_KUBECONFIG, TERM: "xterm-256color", LAB_CWD, AIQ_K8S_LAB: "1" };
  try {
    const shell = pty.spawn("/bin/bash", ["--rcfile", LAB_RC, "-i"], {
      name: "xterm-256color",
      cols: 100,
      rows: 28,
      cwd: LAB_CWD,
      env: shellEnv,
    });
    return {
      write: (msg) => shell.write(msg),
      resize: (cols, rows) => shell.resize(cols, rows),
      kill: () => shell.kill(),
      onData: (fn) => shell.onData(fn),
      onExit: (fn) => shell.onExit(fn),
    };
  } catch (err) {
    if (ws.readyState === ws.OPEN) {
      ws.send(`\r\nnode-pty failed to start (${String(err)}). Falling back to a non-PTY local shell.\r\n\r\n`);
    }
    const child = spawn("/bin/bash", ["--rcfile", LAB_RC, "-i"], {
      cwd: LAB_CWD,
      env: shellEnv,
      stdio: ["pipe", "pipe", "pipe"],
    });
    child.on("error", (e) => {
      if (ws.readyState === ws.OPEN) ws.send(`\r\nFailed to start fallback shell: ${String(e)}\r\n`);
      try { ws.close(); } catch {}
    });
    return {
      write: (msg) => {
        if (child.stdin.writable) child.stdin.write(msg);
      },
      resize: () => {},
      kill: () => child.kill(),
      onData: (fn) => {
        child.stdout.on("data", (d) => fn(d));
        child.stderr.on("data", (d) => fn(d));
      },
      onExit: (fn) => child.on("close", () => fn()),
    };
  }
}

server.on("upgrade", (req, socket, head) => {
  const { pathname } = parse(req.url || "");
  if (pathname !== "/ws/term") {
    handleUpgrade(req, socket, head).catch((err) => {
      console.error("Error handling Next.js upgrade request", err);
      try { socket.destroy(); } catch {}
    });
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    if (sessions >= MAX_SESSIONS) {
      ws.send("\r\nToo many active lab sessions. Try again shortly.\r\n");
      ws.close();
      return;
    }
    sessions++;
    const shell = createShellSession(ws);

    shell.onData((d) => { if (ws.readyState === ws.OPEN) ws.send(d); });
    shell.onExit(() => ws.readyState === ws.OPEN && ws.close());

    ws.isAlive = true;
    ws.on("pong", () => { ws.isAlive = true; });
    const keepalive = setInterval(() => {
      if (ws.readyState !== ws.OPEN) return;
      if (ws.isAlive === false) {
        try { ws.terminate(); } catch {}
        return;
      }
      ws.isAlive = false;
      try { ws.ping(); } catch {}
    }, 20000);

    ws.on("message", (raw) => {
      const msg = raw.toString();
      if (msg.startsWith("\x00resize:")) {
        const [, cols, rows] = msg.split(":");
        try { shell.resize(parseInt(cols, 10) || 100, parseInt(rows, 10) || 28); } catch {}
      } else {
        shell.write(msg);
      }
    });
    ws.on("close", () => {
      clearInterval(keepalive);
      try { shell.kill(); } catch {}
      sessions = Math.max(0, sessions - 1);
    });
  });
});

server.listen(port, bindHostname, () => {
  console.log(`> AIQ on Kubernetes ready on http://${nextHostname}:${port}  (listening on ${bindHostname}; shell bridge: /ws/term)`);
});
