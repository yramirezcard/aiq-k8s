# Brev Launchable Notes

## Setup Script

Paste the contents of `brev/setup-wrapper.sh` into the Brev Launchable setup script field.

The wrapper intentionally stays small because Brev setup fields are size-limited. It locates the repository clone created by Brev, captures Launchable environment variables into `.env`, and delegates to `scripts/setup.sh`.

## Suggested Ports

- `3000`: tutorial UI with embedded terminals.
- `3001`: Envoy entry point for deployed application frontends, including `/aiq` and `/rag`.

## Suggested Environment Variables

- `K3S_CHANNEL`
- `K3S_VERSION`
- `ENABLE_WORKSHOP`
- `WORKSHOP_PORT`
- `ENVOY_HOST_PORT`
- `ENVOY_WEB_NODEPORT`
- `AIQ_ROUTE_PATH`
- `RAG_ROUTE_PATH`
- `ANSIBLE_TAGS`
