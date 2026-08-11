#!/usr/bin/env python3
"""Declare icon.png in every Marketplace-listed .csproj.

Generating the artwork is not enough. NuGet only embeds an icon when the project both
declares <PackageIcon> and packs the file, and the Umbraco Marketplace reads the icon
straight from that NuGet metadata. Miss either half and the listing keeps the generic box
glyph - which is what all ~99 SplatDev packages showed.

    <PackageIcon>icon.png</PackageIcon>
    <None Include="icon.png" Pack="true" PackagePath="\" />

Idempotent: a project that already has both is left alone, including the ones with
hand-made artwork.
"""

from __future__ import annotations

import os
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_DIRS = {"packages", "node_modules", "test-environments", "bin", "obj", ".git"}

PACK_LINE = '    <None Include="icon.png" Pack="true" PackagePath="\\" />'


def find_csprojs():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for filename in filenames:
            if filename.endswith(".csproj"):
                yield pathlib.Path(dirpath) / filename


def main() -> int:
    check_only = "--check" in sys.argv
    changed, incomplete, no_art = [], [], []

    for csproj in sorted(find_csprojs()):
        text = csproj.read_text(encoding="utf-8", errors="replace")

        if re.search(r"<IsPackable>\s*false\s*</IsPackable>", text, re.I):
            continue
        if "umbraco-marketplace" not in text:
            continue

        # Match an icon packed from anywhere, not just the project root: WhatsApp keeps
        # its own at docs\brand\icon.png. Matching only "icon.png" made this add a second
        # <None>, and NuGet then dropped the real icon with NU5118 ("package already
        # contains file '/icon.png'") - shipping a generic glyph over a purpose-made one.
        declared = "<PackageIcon>" in text
        packed = re.search(r'<None\s+Include="[^"]*icon\.png"[^>]*Pack="true"', text) is not None
        if declared and packed:
            continue

        icon = csproj.parent / "icon.png"
        if not icon.exists():
            no_art.append(str(csproj.parent.relative_to(ROOT)))
            continue

        if check_only:
            incomplete.append(str(csproj.relative_to(ROOT)))
            continue

        updated = text
        if not declared:
            # Sit it next to PackageReadmeFile where one exists, so the packaging
            # metadata stays together; otherwise open the first PropertyGroup.
            if "<PackageReadmeFile>" in updated:
                updated = re.sub(
                    r"([ \t]*)(<PackageReadmeFile>[^<]*</PackageReadmeFile>)",
                    r"\1\2\n\1<PackageIcon>icon.png</PackageIcon>",
                    updated, count=1)
            else:
                updated = re.sub(r"(<PropertyGroup>)",
                                 r"\1\n    <PackageIcon>icon.png</PackageIcon>",
                                 updated, count=1)

        if not packed:
            # Prefer an ItemGroup that already packs loose package files (README and the
            # marketplace manifest live there), rather than adding another ItemGroup.
            anchor = re.search(r'([ \t]*)<None\s+Include="README\.md"[^>]*/>', updated)
            if anchor:
                updated = updated[:anchor.end()] + "\n" + PACK_LINE + updated[anchor.end():]
            else:
                updated = re.sub(r"(</PropertyGroup>)",
                                 r"\1\n\n  <ItemGroup>\n" + PACK_LINE + "\n  </ItemGroup>",
                                 updated, count=1)

        csproj.write_text(updated, encoding="utf-8")
        changed.append(str(csproj.relative_to(ROOT)))

    if check_only:
        if incomplete:
            print(f"{len(incomplete)} project(s) do not ship their icon; run tools/wire-package-icons.py")
            for name in incomplete[:10]:
                print(f"   {name}")
            return 1
        print("every listed package declares and packs its icon")
        return 0

    print(f"wired {len(changed)} project(s)")
    if no_art:
        print(f"{len(no_art)} listed project(s) have no icon.png; run tools/generate-package-icons.py")
        for name in no_art[:10]:
            print(f"   {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
