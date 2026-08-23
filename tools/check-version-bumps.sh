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

# Map each changed file to the nearest ancestor holding a .csproj, rather than taking the
# first path segment. Nested plugins live at SplatDev.Umbraco.Plugins.Yaml/SplatDev.Umbraco
# .Plugins.Schema2Yaml, whose first segment is a directory with no project in it — so the
# prefix form resolved them to the parent, found no .csproj and skipped them silently.
# That is the same depth blind spot that dropped Schema2Yaml from v2.1.5, and publish.yml
# discovers at -maxdepth 3, so this must look at least that deep.
for dir in $(git diff --name-only "$TAG"..HEAD 2>/dev/null \
             | grep '^SplatDev\.' \
             | while read -r f; do
                 d=$(dirname "$f")
                 while [ "$d" != "." ] && [ -n "$d" ]; do
                   if ls "$d"/*.csproj >/dev/null 2>&1; then echo "$d"; break; fi
                   d=$(dirname "$d")
                 done
               done | sort -u); do
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
  #
  # client/ is the same case. No .csproj includes it — the backoffice bundle reaches the
  # package as the built output committed under App_Plugins/, so editing a .ts without
  # rebuilding ships nothing and rebuilding shows up as an App_Plugins change that this
  # check still catches. docs/screenshots/ likewise: READMEs reference those images by
  # absolute URL rather than packing them. docs/ is not excluded wholesale, because
  # WhatsApp packs its icon from docs/brand/.
  shipping=$(git diff --name-only "$TAG"..HEAD -- "$dir" 2>/dev/null \
             | grep -vE '(^|/)node_modules(/|$)' \
             | grep -vE '(^|/)client/' \
             | grep -vE '(^|/)docs/screenshots/' | wc -l)
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
