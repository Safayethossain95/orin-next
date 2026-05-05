#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

if [ -z "${THEME_VERSION:-}" ] || [ "${THEME_VERSION}" = "latest" ]; then
  THEME_VERSION="$(date -u +%Y%m%d%H%M%S)"
  export THEME_VERSION
fi

eval "$(
  cd "$ROOT_DIR"
  node --input-type=module <<'NODE'
import { getSiteConfigEnv } from "./site.config.ts";

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

for (const [key, value] of Object.entries(getSiteConfigEnv())) {
  console.log(`export ${key}=${shellQuote(value)}`);
}
NODE
)"

exec "$ROOT_DIR/../../../scripts/deploy-theme.sh"
