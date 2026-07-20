#!/bin/bash
# =============================================================================
# Brev Launchable lifecycle wrapper - aiq-k8s.
#
# Brev's "Code source: GitHub Repo" clones this repository onto the VM before
# running the setup script. This wrapper locates that clone, writes Launchable
# env-config values into .env, then delegates to scripts/setup.sh.
#
# Keep this wrapper small; the real setup logic belongs in scripts/setup.sh.
# =============================================================================
set -uo pipefail

echo "[brev-setup] locating repo..."
REPO="$(find "$HOME" /home /workspace . -maxdepth 5 -type d -name aiq-k8s 2>/dev/null | head -1 || true)"
if [ -z "${REPO:-}" ]; then
  echo "[brev-setup] ERROR: repo 'aiq-k8s' not found under \$HOME /home /workspace"
  ls -la "$HOME" || true
  exit 1
fi

cd "$REPO" || exit 1
echo "[brev-setup] repo: $REPO"
chmod +x scripts/setup.sh 2>/dev/null || true

echo "[brev-setup] writing .env from Launchable env-config..."
: > .env
for v in K3S_CHANNEL K3S_VERSION INSTALL_K3S INSTALL_HELM \
         ENVOY_GATEWAY_ENABLED ENVOY_HOST_PORT ENVOY_WEB_NODEPORT AIQ_ROUTE_PATH RAG_ROUTE_PATH \
         ENABLE_WORKSHOP WORKSHOP_PORT ANSIBLE_TAGS; do
  if [ -n "${!v:-}" ]; then
    printf '%s=%q\n' "$v" "${!v}" >> .env
  fi
done
chmod 600 .env

echo "[brev-setup] running setup.sh (tee -> \$HOME/aiq-k8s-setup.log)..."
bash scripts/setup.sh 2>&1 | tee "$HOME/aiq-k8s-setup.log"
