#!/bin/bash
# Build every Umbraco 17 (Lit 3) plugin frontend in the repo.
#
# The previous version hardcoded a list of nine plugins, three of which were named
# without the mandatory "SplatDev." prefix and so silently hit the "client/ directory
# not found" skip. It also linked node_modules from CacheManager, which does not have
# vite installed, so that fast path never fired either. Both meant a run could report
# success having built almost nothing. The list is now derived from the tree.

set -uo pipefail

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Any client/ with a vite config is buildable. Sorted so runs are reproducible.
mapfile -t CLIENTS < <(
  find "$BASE" -maxdepth 4 -type d -name client -not -path '*/node_modules/*' \
    | while read -r c; do
        [ -f "$c/vite.config.ts" ] || [ -f "$c/vite.config.js" ] && echo "$c"
      done | sort
)

# A donor node_modules saves a full install per plugin. Pick one that actually has
# vite in it rather than assuming a particular plugin does.
DONOR=""
for c in "${CLIENTS[@]}"; do
  if [ -x "$c/node_modules/vite/bin/vite.js" ] || [ -f "$c/node_modules/vite/bin/vite.js" ]; then
    DONOR="$c/node_modules"; break
  fi
done

echo "Found ${#CLIENTS[@]} plugin client(s)."
[ -n "$DONOR" ] && echo "Reusing node_modules from: ${DONOR#$BASE/}" \
                || echo "No donor node_modules found; each plugin will npm install."

ok=0; failed=()
for CLIENT_DIR in "${CLIENTS[@]}"; do
  name="${CLIENT_DIR#$BASE/}"; name="${name%/client}"
  echo ""
  echo "=== $name ==="

  if [ ! -f "$CLIENT_DIR/node_modules/vite/bin/vite.js" ]; then
    if [ -n "$DONOR" ] && [ "$CLIENT_DIR/node_modules" != "$DONOR" ]; then
      echo "  Linking node_modules..."
      rm -f "$CLIENT_DIR/node_modules"
      ln -sfn "$DONOR" "$CLIENT_DIR/node_modules"
    fi
  fi
  if [ ! -f "$CLIENT_DIR/node_modules/vite/bin/vite.js" ]; then
    echo "  Installing dependencies..."
    ( cd "$CLIENT_DIR" && npm install --include=dev --silent ) || { failed+=("$name"); continue; }
  fi

  # Call vite through the donor's real path: a symlinked node_modules/.bin uses
  # relative links that do not resolve from the borrowing directory.
  VITE="$CLIENT_DIR/node_modules/vite/bin/vite.js"
  if ( cd "$CLIENT_DIR" && node "$VITE" build ); then
    ok=$((ok+1))
  else
    failed+=("$name")
  fi
done

echo ""
echo "Built $ok/${#CLIENTS[@]} plugin client(s)."
if [ ${#failed[@]} -gt 0 ]; then
  echo "Failed:"
  printf '  %s\n' "${failed[@]}"
  exit 1
fi
