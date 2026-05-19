#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST_DIR="${ROOT_DIR}/deploy/kubernetes"

if [[ "${1:-}" == "--commit" ]]; then
  kubectl apply -k "${MANIFEST_DIR}"
else
  kubectl kustomize "${MANIFEST_DIR}"
fi
