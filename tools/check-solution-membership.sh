#!/usr/bin/env bash
# Fails when a plugin or test project is absent from SplatDev.Core.sln.
#
# Membership is load-bearing for both workflows and nothing else warns about it:
# publish.yml restores the solution then builds --no-restore, so a stray plugin is skipped
# from the release; build.yml runs `dotnet test` on the solution, so a stray test project
# is never executed and the build still passes.
set -uo pipefail
SLN="SplatDev.Core.sln"
missing=0

# SplatDev.Umbraco.Plugins.Tests targets .NET Framework 4.7.2 and cannot build on the CI SDK.
#
# PdfCurator used to be excluded here too, on the grounds that its private feed breaks
# restore without GITHUB_TOKEN. That was already untrue — the plugin itself has been in
# the solution for some time and build.yml supplies the token — and the exclusion hid
# SplatDev.Umbraco.Plugins.PdfCurator.Tests, which was absent from the solution and so
# never built by CI. It had not compiled on net8.0 for months and nothing said so.
EXCLUDE='^SplatDev\.Umbraco\.Plugins\.Tests$|BackupManager|FormsClone|CodeFirst'

while IFS= read -r csproj; do
  name=$(basename "$csproj" .csproj)
  echo "$name" | grep -qE "$EXCLUDE" && continue
  if ! grep -qF "$name" "$SLN"; then
    echo "::error file=$csproj::$name is not in $SLN — it will be skipped by publish.yml and never tested by build.yml"
    missing=$((missing+1))
  fi
# -maxdepth 3 matches publish.yml's own discovery. It used to be 2, which left nested
# plugins (SplatDev.Umbraco.Plugins.Yaml/SplatDev.Umbraco.Plugins.Schema2Yaml) invisible
# to this guard while publish.yml still tried to build them — exactly the gap the guard
# exists to close. Schema2Yaml was dropped from the v2.1.5 release that way.
# Matches publish.yml's discovery, which is now every SplatDev.*.csproj rather than a
# list of name patterns. The old pattern here only covered plugins and test projects, so
# the ~50 packages outside the plugin naming — DataTypes, Messaging, Search, Logger,
# Security — were unguarded as well as unpublished. Two of them (DigitalBookCurator.Core,
# Messaging.ClickSend) were in fact missing from the solution and would have failed the
# moment publish.yml started discovering them.
done < <(find . -maxdepth 3 -name "SplatDev.*.csproj" \
         -not -path "*/obj/*" -not -path "*/bin/*" \
         -not -path "*/customers/*" -not -path "*/test-environments/*" | sort)

if [ "$missing" -gt 0 ]; then
  echo ""
  echo "$missing project(s) missing from $SLN. Add with: dotnet sln $SLN add <path>"
  exit 1
fi
echo "All plugin and test projects are in $SLN."
