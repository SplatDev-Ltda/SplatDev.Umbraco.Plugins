#!/usr/bin/env python3
"""Keeps each README's Compatibility table in step with its project's <Version>.

Every plugin README carries a table whose last column is the package version:

    | Umbraco | .NET | Package Version |
    |---------|------|-----------------|
    | 13.x    | 8.0  | 1.2.6           |
    | 17.x    | 10.0 | 1.2.6           |

Nothing kept that column current. `tools/check-version-bumps.sh` guards that <Version>
moved when the code did, and CLAUDE.md requires a changelog entry with every bump, but
the table was written once and never touched again — so when this was first measured,
96 of 96 READMEs with a version table disagreed with their csproj and not one was
right. Several still advertised 1.0.0 for packages on their fourth release.

That column is the first thing a reader checks to see whether a package supports their
Umbraco, and it is the package's front page on nuget.org.

  --check   exit 1 and list the drift, changing nothing (CI)
  --write   rewrite the column from <Version>
"""
import argparse
import os
import re
import subprocess
import sys

SKIP = re.compile(r"Tests|test-environments|customers|Old Versions|/obj/|/bin/")

# The last column of a table row whose final cell is a version. Anchored on the row
# shape rather than the header, because the first two columns are ordered both ways
# (".NET | Umbraco" and "Umbraco | .NET") across the repo.
ROW = re.compile(
    r"^(\|[^|\n]*\|[^|\n]*\|)(\s*)([0-9]+\.[0-9][^|\s]*)(\s*)\|",
    re.M,
)


def projects():
    out = subprocess.run(
        ["git", "ls-files", "-z", "*.csproj"], capture_output=True, text=True, check=True
    ).stdout
    for csproj in (p for p in out.split("\0") if p):
        if SKIP.search(csproj):
            continue
        readme = os.path.join(os.path.dirname(csproj), "README.md")
        if not os.path.isfile(readme):
            continue
        try:
            text = open(csproj, encoding="utf-8-sig", errors="ignore").read()
        except OSError:
            continue
        match = re.search(r"<Version>([^<]+)</Version>", text)
        if match:
            yield csproj, readme, match.group(1).strip()


def main():
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--check", action="store_true")
    group.add_argument("--write", action="store_true")
    args = parser.parse_args()

    drifted, fixed, no_table = [], 0, 0

    for csproj, readme, version in projects():
        # newline='' so a CRLF README round-trips unchanged; rewriting the whole file
        # with translated endings would bury a one-line change in hundreds.
        with open(readme, encoding="utf-8", newline="") as handle:
            body = handle.read()

        found = ROW.findall(body)
        if not found:
            no_table += 1
            continue

        current = sorted({row[2] for row in found})
        if current == [version]:
            continue

        drifted.append((os.path.dirname(csproj), ",".join(current), version))
        if args.write:
            body = ROW.sub(
                lambda m: f"{m.group(1)}{m.group(2)}{version}"
                + " " * max(0, len(m.group(3)) + len(m.group(4)) - len(version))
                + "|",
                body,
            )
            with open(readme, "w", encoding="utf-8", newline="") as handle:
                handle.write(body)
            fixed += 1

    if args.check:
        if drifted:
            for path, table, version in drifted:
                print(
                    f"::error file={path}/README.md::Compatibility table says {table}, "
                    f"<Version> is {version} — run tools/sync-readme-versions.py --write"
                )
            print(
                f"\n{len(drifted)} README(s) advertise a version the project does not ship."
            )
            return 1
        print(f"All README version tables match <Version>. ({no_table} have no table.)")
        return 0

    print(f"Updated {fixed} README(s). ({no_table} have no version table.)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
