# Brev Launchable Notes

## Setup Script

Paste the contents of `brev/setup-wrapper.sh` into the Brev Launchable setup script field.

The wrapper intentionally stays small because Brev setup fields are size-limited. It locates the repository clone created by Brev, captures Launchable environment variables into `.env`, and delegates to `scripts/setup.sh`.

## Suggested Ports

- `3000`: future tutorial UI with embedded terminals.
- `8000`: AI-Q backend port-forward target used by the tutorial after the user deploys AI-Q.

## Suggested Environment Variables

- `K3S_CHANNEL`
- `K3S_VERSION`
- `ENABLE_WORKSHOP`
- `WORKSHOP_PORT`
- `ANSIBLE_TAGS`
