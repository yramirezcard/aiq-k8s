# AIQ on Kubernetes

This repository is a Brev Launchable for a hands-on tutorial that deploys the NVIDIA AI-Q Blueprint on Kubernetes.

The launchable is being built in layers:

1. Provision a single-node Kubernetes cluster on the Brev VM with Ansible and k3s.
2. Add a tutorial UI with chapter navigation and embedded terminals, following the `openshell-on-k8s` pattern.
3. Teach the user how to deploy AI-Q with the Helm chart from `NVIDIA-AI-Blueprints/aiq/deploy/helm/deployment-k8s`.
4. Turn the setup into a guided lab that teaches deployment, verification, access, and troubleshooting.

## Current State

This first scaffold sets up the Brev lifecycle scripts and Ansible structure for a single-node k3s cluster. AI-Q is not installed by Ansible; the tutorial content will walk the user through those Kubernetes and Helm commands.

```bash
cp .env.example .env
./scripts/setup.sh
```

After setup:

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes
helm version
```

## Tutorial UI

Set `ENABLE_WORKSHOP=true` to build and run the Next.js tutorial UI with the embedded lab terminal.

```bash
ENABLE_WORKSHOP=true ./scripts/setup.sh
```

The site runs on port `3000` by default. The first hands-on lab page is `2.1 Verify the Cluster`, which includes a runnable `kubectl get nodes` command block and a live shell connected to the VM.

For local UI development, run the browser-safe local script and open `http://localhost:3000`:

```bash
cd web
npm run dev:local
```

Avoid opening `http://0.0.0.0:3000` in a browser. It is a bind address, not a browser origin, and can break the Next.js dev WebSocket and client-side interactions.

## Brev

Use `brev/setup-wrapper.sh` as the Brev Launchable setup script. Brev clones this repository first; the wrapper locates that clone, writes any Launchable environment variables into `.env`, and runs `scripts/setup.sh`.

## AI-Q Tutorial Path

The tutorial will deploy AI-Q from the official source chart path:

```text
NVIDIA-AI-Blueprints/aiq/deploy/helm/deployment-k8s
```

Those deployment commands belong in the hands-on lesson content, not in the launchable setup scripts.
