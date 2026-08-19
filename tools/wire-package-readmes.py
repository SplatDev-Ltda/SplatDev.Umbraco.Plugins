#!/usr/bin/env python3
"""
Makes every packable project actually ship its README.

A README.md sitting in the project folder does nothing for NuGet on its own. Two things
are required and both were missing across most of the estate: <PackageReadmeFile> names
the file, and a <None ... Pack="true"> item puts it in the package. Declaring one without
the other is worse than neither — NuGet raises NU5039 and the pack fails — so they are
always written together.
"""
import pathlib, re, sys

APPLY = "--apply" in sys.argv
changed = []

for cs in sorted(pathlib.Path(".").glob("SplatDev.*/*.csproj")):
    if ".Tests" in cs.stem:
        continue

    txt = cs.read_text(encoding="utf-8", errors="replace")
    if "<PackageId>" not in txt and "<Version>" not in txt:
        continue                                   # not a packable project
    if not (cs.parent / "README.md").exists():
        continue                                   # nothing to ship

    declares = "<PackageReadmeFile>" in txt
    packs = bool(re.search(r'<None Include="README\.md"[^>]*Pack="true"', txt))
    if declares and packs:
        continue

    new = txt

    if not declares:
        # Put it beside the other package metadata rather than in a group of its own.
        anchor = re.search(r'^(\s*)<(Version|PackageId|Authors)>', new, re.M)
        indent = anchor.group(1) if anchor else "    "
        insert_at = new.index("\n", anchor.end()) + 1 if anchor else None
        line = f"{indent}<PackageReadmeFile>README.md</PackageReadmeFile>\n"
        if insert_at:
            new = new[:insert_at] + line + new[insert_at:]
        else:
            new = new.replace("</PropertyGroup>", line + "  </PropertyGroup>", 1)

    if not packs:
        item = '    <None Include="README.md" Pack="true" PackagePath="\\" />\n'
        # Reuse an existing <None ...Pack= group if there is one, else add a group.
        m = re.search(r'(\n  <ItemGroup>\n(?:[^\n]*<None Include="[^"]+"[^\n]*Pack="true"[^\n]*\n)+)', new)
        if m:
            new = new[:m.end()] + item + new[m.end():]
        else:
            new = new.replace("</Project>", f"  <ItemGroup>\n{item}  </ItemGroup>\n\n</Project>", 1)

    if new != txt:
        changed.append(cs.stem)
        if APPLY:
            cs.write_text(new, encoding="utf-8")

print(f"{'APPLIED' if APPLY else 'DRY RUN'}: {len(changed)} project(s)")
for c in changed[:60]:
    print("   ", c)
