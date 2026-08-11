#!/usr/bin/env python3
"""Generate the repo-root marketplace manifests the Umbraco Marketplace actually reads.

The Marketplace does NOT read umbraco-marketplace.json out of the .nupkg. It fetches it
over HTTP from the location implied by the package's <PackageProjectUrl>, and for a GitHub
project URL that means the root of the default branch. It tries, in order:

    umbraco-marketplace-<lowercased package id>.json     (package-specific)
    umbraco-marketplace.json                             (fallback, whole owner)

In a monorepo the fallback is useless - one file cannot describe 99 packages - so every
package needs the package-specific form, and it has to sit at the REPO ROOT no matter
which subfolder the project lives in. A manifest colocated with its .csproj is never read.

So the colocated file stays the authored source of truth (it lives next to the plugin, and
gets packed for anyone reading the .nupkg), and this script projects it to the root under
the name the Marketplace looks for. Re-run it after editing any plugin's manifest:

    python3 tools/sync-marketplace-manifests.py          # write
    python3 tools/sync-marketplace-manifests.py --check  # verify, non-zero if stale

Verify a package end to end at https://marketplace.umbraco.com/validate - it reports the
exact URLs it tried.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PREFIX = "umbraco-marketplace-"

# Directories that hold restored packages or scratch sites rather than our source.
SKIP_DIRS = {"packages", "node_modules", "test-environments", "bin", "obj", ".git"}


def iter_projects():
    """Yield (csproj_path, package_id) for each packable project tagged for the Marketplace."""
    for csproj in ROOT.rglob("*.csproj"):
        if SKIP_DIRS & set(csproj.relative_to(ROOT).parts):
            continue

        text = csproj.read_text(encoding="utf-8", errors="replace")

        if re.search(r"<IsPackable>\s*false\s*</IsPackable>", text, re.I):
            continue
        # Only packages that opt into the Marketplace carry this tag.
        if "umbraco-marketplace" not in text:
            continue

        match = re.search(r"<PackageId>([^<]+)</PackageId>", text)
        package_id = match.group(1).strip() if match else csproj.stem

        # Schema2Yaml builds its id from MSBuild properties ($(_BasePackageId)...), and one
        # of them is a per-theme fan-out. Resolving MSBuild here is not worth it: the id we
        # want is the project name, which by repo convention is the same thing.
        if "$(" in package_id:
            package_id = csproj.stem

        yield csproj, package_id


def main() -> int:
    check_only = "--check" in sys.argv

    written, stale, skipped = [], [], []

    for csproj, package_id in iter_projects():
        source = csproj.parent / "umbraco-marketplace.json"
        if not source.exists():
            skipped.append(package_id)
            continue

        # Round-trip through json so a malformed manifest fails here, loudly, rather than
        # silently publishing something the Marketplace will reject.
        try:
            data = json.loads(source.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            print(f"  INVALID JSON  {source.relative_to(ROOT)}: {exc}")
            return 1

        target = ROOT / f"{PREFIX}{package_id.lower()}.json"
        rendered = json.dumps(data, indent=2, ensure_ascii=False) + "\n"

        if target.exists() and target.read_text(encoding="utf-8") == rendered:
            continue

        if check_only:
            stale.append(target.name)
        else:
            target.write_text(rendered, encoding="utf-8")
            written.append(target.name)

    if check_only:
        if stale:
            print(f"{len(stale)} root manifest(s) out of date; run tools/sync-marketplace-manifests.py")
            for name in sorted(stale)[:10]:
                print(f"   {name}")
            return 1
        print("root manifests are up to date")
        return 0

    print(f"wrote/updated {len(written)} root manifest(s)")
    if skipped:
        print(f"{len(skipped)} tagged package(s) have no colocated umbraco-marketplace.json:")
        for name in sorted(skipped):
            print(f"   {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
