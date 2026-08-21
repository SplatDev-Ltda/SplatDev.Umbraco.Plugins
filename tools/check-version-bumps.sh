#!/usr/bin/env bash
# Fails when a plugin's source changed since the last release tag but its <Version> did not.
#
# publish.yml skips any version already on NuGet.org — correctly, but silently. A plugin
# whose code changed without a version bump is therefore packed, found to exist, skipped,
# and reported as a normal no-op. The change simply never ships.
#
# That is how the ShopCart cart-isolation fix nearly went out: the fix was committed, the
# version was not bumped (a sed matched the wrong string), and the publish would have
# reported success while shipping nothing.
set -uo pipefail

TAG="${1:-$(git describe --tags --abbrev=0 --match 'v*' 2>/dev/null)}"
[ -z "$TAG" ] && { echo "No release tag found; nothing to compare against."; exit 0; }

echo "Comparing against $TAG"
missing=0

for dir in $(git diff --name-only "$TAG"..HEAD 2>/dev/null \
             | grep -oP '^SplatDev\.Umbraco\.Plugins\.[A-Za-z.]+' | sort -u); do
  # Test projects carry no <Version> and ship nothing.
  case "$dir" in *.Tests) continue;; esac
  # Excluded from publishing anyway.
  echo "$dir" | grep -qE "PdfCurator|BackupManager|FormsClone|CodeFirst" && continue

  csproj=$(ls "$dir"/*.csproj 2>/dev/null | head -1)
  [ -z "$csproj" ] && continue

  # A plugin whose only changed files cannot reach the package does not need a bump.
  # Removing a development node_modules symlink from source control is the case that
  # prompted this: nothing under node_modules is packed, so bumping would publish an
  # identical package purely to satisfy this check.
  shipping=$(git diff --name-only "$TAG"..HEAD -- "$dir" 2>/dev/null \
             | grep -vE '(^|/)node_modules(/|$)' | wc -l)
  [ "$shipping" -eq 0 ] && continue

  now=$(grep -oP '(?<=<Version>)[^<]+' "$csproj" | head -1)
  was=$(git show "$TAG:$csproj" 2>/dev/null | grep -oP '(?<=<Version>)[^<]+' | head -1)

  # A project that did not exist at the tag is new, so there is nothing to bump.
  [ -z "$was" ] && continue

  if [ "$now" = "$was" ]; then
    echo "::error file=$csproj::$dir changed since $TAG but <Version> is still $now — publish.yml will skip it as already-published and the change will not ship"
    missing=$((missing+1))
  fi
done

if [ "$missing" -gt 0 ]; then
  echo ""
  echo "$missing plugin(s) changed without a version bump."
  exit 1
fi
echo "Every changed plugin has a new version."
