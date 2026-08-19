#!/usr/bin/env python3
"""
Embeds each plugin's dashboard screenshot in its README.

NuGet will not render a relative image path, so the URL must be absolute and the host must
serve it unauthenticated. raw.githubusercontent works because this repository is public —
verified: an unauthenticated GET of a screenshot returns 200. If the repo ever goes
private every one of these silently becomes a broken image on the listing.

Pinned to the default branch rather than a tag: a tag would freeze the screenshot to the
release it was cut from, and these are regenerated whenever a dashboard changes.
"""
import pathlib, re, sys

RAW = "https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master"
APPLY = "--apply" in sys.argv
MARK_START = "<!-- screenshot:start -->"
MARK_END = "<!-- screenshot:end -->"

done, skipped = [], []
for shot in sorted(pathlib.Path(".").glob("SplatDev.Umbraco.Plugins.*/docs/screenshots/01-dashboard.png")):
    proj = shot.parts[0]
    readme = pathlib.Path(proj) / "README.md"
    if not readme.exists():
        skipped.append((proj, "no README.md")); continue

    text = readme.read_text(encoding="utf-8", errors="replace")
    url = f"{RAW}/{proj}/docs/screenshots/01-dashboard.png"
    block = (f"{MARK_START}\n\n"
             f"![{proj.replace('SplatDev.Umbraco.Plugins.', '')} dashboard]({url})\n\n"
             f"{MARK_END}")

    if MARK_START in text:
        new = re.sub(re.escape(MARK_START) + r".*?" + re.escape(MARK_END), block, text, flags=re.S)
    else:
        # After the first paragraph, so the reader sees what it is before what it looks like.
        lines = text.splitlines()
        insert = 1
        for i, l in enumerate(lines):
            if i and l.strip() == "" and i > 1:
                insert = i + 1
                break
        lines.insert(insert, "\n" + block + "\n")
        new = "\n".join(lines)

    if new != text:
        done.append(proj)
        if APPLY:
            readme.write_text(new, encoding="utf-8")

print(f"{'APPLIED' if APPLY else 'DRY RUN'}: {len(done)} README(s)")
for p, why in skipped:
    print(f"   skip {p}: {why}")
