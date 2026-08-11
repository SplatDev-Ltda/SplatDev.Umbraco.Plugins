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
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PREFIX = "umbraco-marketplace-"

# Directories that hold restored packages or scratch sites rather than our source.
SKIP_DIRS = {"packages", "node_modules", "test-environments", "bin", "obj", ".git"}

# Mirrors the enums in https://marketplace.umbraco.com/umbraco-marketplace-schema.json.
# These are checked here because a wrong value fails validation silently as far as the
# listing is concerned - the Marketplace just keeps showing the bare NuGet metadata. 65 of
# our manifests carried invented categories ("Utilities", "Communication", ...) that are
# not in the taxonomy, so nothing they declared was ever applied.
VALID_CATEGORIES = {
    "Analytics & Insights", "Artificial Intelligence", "Campaign & Marketing", "Commerce",
    "Developer Tools", "Editor Tools", "Headless", "PIM & DAM", "Search",
    "Themes & Starter Kits", "Translations",
}
VALID_PACKAGE_TYPES = {"Package", "Integration"}
VALID_LICENSE_TYPES = {"Free", "Purchase", "Subscription"}


def validate(data, label):
    """Return a list of human-readable problems with one manifest."""
    problems = []

    for field, allowed in (("Category", VALID_CATEGORIES),
                           ("AlternateCategory", VALID_CATEGORIES),
                           ("PackageType", VALID_PACKAGE_TYPES)):
        value = data.get(field)
        if value is not None and value not in allowed:
            problems.append(f"{label}: {field} {value!r} is not one of {sorted(allowed)}")

    for licence in data.get("LicenseTypes") or []:
        if licence not in VALID_LICENSE_TYPES:
            problems.append(f"{label}: LicenseTypes {licence!r} is not one of {sorted(VALID_LICENSE_TYPES)}")

    return problems


def find_csprojs():
    """Walk the repo for .csproj files, pruning SKIP_DIRS as we go.

    Pruning rather than rglob-then-filter: packages/ alone holds tens of thousands of
    restored files, and walking it makes this take minutes on a mounted filesystem.
    """
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for filename in filenames:
            if filename.endswith(".csproj"):
                yield pathlib.Path(dirpath) / filename


def iter_projects():
    """Yield (csproj_path, package_id) for each packable project tagged for the Marketplace."""
    for csproj in sorted(find_csprojs()):
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

    written, stale, skipped, problems = [], [], [], []

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

        problems.extend(validate(data, str(source.relative_to(ROOT))))

        target = ROOT / f"{PREFIX}{package_id.lower()}.json"
        rendered = json.dumps(data, indent=2, ensure_ascii=False) + "\n"

        if target.exists() and target.read_text(encoding="utf-8") == rendered:
            continue

        if check_only:
            stale.append(target.name)
        else:
            target.write_text(rendered, encoding="utf-8")
            written.append(target.name)

    if problems:
        print(f"{len(problems)} schema problem(s) - the Marketplace will ignore these listings:")
        for problem in problems:
            print(f"   {problem}")
        return 1

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
