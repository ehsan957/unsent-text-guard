#!/usr/bin/env bash
# Builds the store packages into dist/ (macOS / Linux).
#   dist/chrome-edge/  and  dist/firefox/   unpacked, for testing
#   dist/unsent-text-guard-chrome-edge-<version>.zip
#   dist/unsent-text-guard-firefox-<version>.zip
set -euo pipefail
cd "$(dirname "$0")"
NAME="unsent-text-guard"

version_of() { sed -nE 's/^[[:space:]]*"version":[[:space:]]*"([^"]+)".*/\1/p' "$1" | head -n1; }
V_CHROME=$(version_of platform/chrome/manifest.json)
V_FIREFOX=$(version_of platform/firefox/manifest.json)
if [ "$V_CHROME" != "$V_FIREFOX" ]; then
  echo "Version mismatch: chrome $V_CHROME, firefox $V_FIREFOX" >&2
  exit 1
fi

rm -rf dist
mkdir -p dist
build() { # $1 = platform folder, $2 = output label
  local out="dist/$2"
  mkdir -p "$out"
  cp -R src/. "$out/"
  cp -R "platform/$1/." "$out/"          # platform files override shared ones
  (cd "$out" && zip -q -r -X "../$NAME-$2-$V_CHROME.zip" .)
  echo "Built dist/$NAME-$2-$V_CHROME.zip"
}
build chrome chrome-edge
build firefox firefox
