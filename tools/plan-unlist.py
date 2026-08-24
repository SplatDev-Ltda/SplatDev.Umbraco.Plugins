#!/usr/bin/env python3
"""Works out which published versions to unlist, keeping the one the repo ships.

The keeper is taken from each project's <Version>, never from sorting the published list.
Three ids carry Umbraco 8 builds whose numbers sort above the current release — Backups
8.18.7.2 over 3.3.2, CopyValue 8.18.8.1 over 2.4.0, DefaultValue 8.18.7.1 over 2.3.0 — so
"keep the highest" would unlist the current package and keep the Umbraco 8 one. That is
the failure this repo already hit once, when Backups served 8.18.7.2 over the release that
added authorization to its anonymous endpoints.

Prints one `id@version` per line, and refuses to plan anything for a package whose shipped
version is not on NuGet yet, because unlisting the rest would leave it with nothing listed.
"""
import json, os, re, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Ids with no Umbraco 13/17 release. Every version goes.
DELIST_ENTIRELY = [
    "SplatDev.Umbraco.Plugins.AdPreview",
    "SplatDev.Umbraco.Plugins.HideContent",
]

def published(pid):
    try:
        with urllib.request.urlopen(
            f"https://api.nuget.org/v3-flatcontainer/{pid.lower()}/index.json", timeout=30) as r:
            return json.load(r)["versions"]
    except Exception:
        return []

def main():
    listing = subprocess.run(["bash", "-c",
        'find . -maxdepth 3 -name "SplatDev.*.csproj" | grep -v "Tests\\|BackupManager\\|FormsClone\\|obj\\|bin\\|PdfCurator\\|/customers/\\|test-environments"'],
        cwd=ROOT, capture_output=True, text=True).stdout.split()

    plan, skipped = [], []
    for rel in sorted(listing):
        path = os.path.join(ROOT, rel.lstrip("./"))
        text = open(path, encoding="utf-8").read()
        pid = (re.search(r"<PackageId>(.*?)</PackageId>", text) or [None, os.path.basename(path)[:-7]])[1]
        shipped = (re.search(r"<Version>(.*?)</Version>", text) or [None, None])[1]
        versions = published(pid)
        if not versions:
            continue
        if not shipped:
            skipped.append(f"{pid}: no <Version> in the project"); continue
        if shipped not in versions:
            skipped.append(f"{pid}: ships {shipped}, which is not published yet — nothing unlisted"); continue
        for v in versions:
            if v != shipped:
                plan.append(f"{pid}@{v}")

    for pid in DELIST_ENTIRELY:
        for v in published(pid):
            plan.append(f"{pid}@{v}")

    for line in plan:
        print(line)
    for note in skipped:
        print(f"# skipped {note}", file=sys.stderr)
    print(f"# {len(plan)} version(s) to unlist, {len(skipped)} package(s) skipped", file=sys.stderr)

if __name__ == "__main__":
    main()
