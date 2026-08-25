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
import gzip, json, os, re, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Ids with no Umbraco 13/17 release at all, where every version goes.
#
# There are two AdPreview packages and this list had the wrong one.
#
#   AdPreview                            0.0.3, "Image Ad previewer for Umbraco v7.4.3+",
#                                        6,687 downloads, nothing in this repo builds it
#   SplatDev.Umbraco.Plugins.AdPreview   1.0.0, Umbraco 13 and 17, shipped in v2.9.0
#
# The list originally held the second — the live one — so it was removed, correctly. But the
# first was never on it, because CLAUDE.md recorded the dead package under the prefixed id
# and said a v17 port "will publish under the same id". It did not: the port publishes as
# SplatDev.Umbraco.Plugins.AdPreview, a different id, and the bare one was left listed.
#
# It matters more than the rest of this list. At 6,687 downloads against the replacement's
# 2,301, it ranks first for "adpreview" and for "umbraco ad preview" while the current
# package ranks third and second — so anyone searching finds an Umbraco 7.4.3 build first.
DELIST_ENTIRELY = [
    "AdPreview",
    "SplatDev.Umbraco.Plugins.HideContent",
]

def published(pid):
    """Versions that are still LISTED.

    The flat container returns unlisted versions too, so planning from it re-attempts every
    version that a previous run already unlisted — which on a rate-limited run means the
    retries are spent on work already done. Registration carries the listed flag.
    """
    try:
        req = urllib.request.Request(
            f"https://api.nuget.org/v3/registration5-gz-semver2/{pid.lower()}/index.json",
            headers={"Accept-Encoding": "gzip"})
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            if r.headers.get("Content-Encoding") == "gzip":
                raw = gzip.decompress(raw)
            data = json.loads(raw)
    except Exception:
        return []

    listed = []
    for page in data.get("items", []):
        for item in page.get("items", []):
            entry = item.get("catalogEntry", {})
            # listed defaults to true when the flag is absent.
            if entry.get("listed", True):
                listed.append(entry.get("version"))
    return [v for v in listed if v]

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
