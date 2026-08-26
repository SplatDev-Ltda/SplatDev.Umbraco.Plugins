#!/usr/bin/env python3
"""
Embeds each plugin's dashboard screenshots in its README.

NuGet will not render a relative image path, so the URL must be absolute and the host must
serve it unauthenticated. raw.githubusercontent works because this repository is public —
verified: an unauthenticated GET of a screenshot returns 200. If the repo ever goes
private every one of these silently becomes a broken image on the listing.

Pinned to the default branch rather than a tag: a tag would freeze the screenshot to the
release it was cut from, and these are regenerated whenever a dashboard changes.

This wires *every* png under docs/screenshots/, not just 01-dashboard.png. It used to wire
only the dashboard while still replacing the whole marker block, so running it would have
silently cut 15 curated READMEs — OnOff, Slider, PhotoGallery and CopyValue each had four
images — down to one. Nothing had run it since those blocks were filled in by hand, so the
loss had not happened yet. Wiring the whole directory also makes the script idempotent:
re-running it reproduces the block it just wrote instead of shrinking it.
"""
import pathlib, re, sys

RAW = "https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master"
APPLY = "--apply" in sys.argv
MARK_START = "<!-- screenshot:start -->"
MARK_END = "<!-- screenshot:end -->"

# "04-front-end" reads as "on the front end" rather than "front end" — it is the only
# caption describing where the shot was taken instead of what it shows.
CAPTIONS = {"front-end": "on the front end"}


def caption(stem: str) -> str:
    slug = re.sub(r"^\d+-", "", stem)
    return CAPTIONS.get(slug, slug.replace("-", " "))


done, skipped = [], []
for shots_dir in sorted(pathlib.Path(".").glob("SplatDev.Umbraco.Plugins.*/docs/screenshots")):
    proj = shots_dir.parts[0]
    readme = pathlib.Path(proj) / "README.md"
    if not readme.exists():
        skipped.append((proj, "no README.md")); continue

    shots = sorted(shots_dir.glob("*.png"))
    if not shots:
        skipped.append((proj, "no screenshots on disk")); continue

    text = readme.read_text(encoding="utf-8", errors="replace")
    name = proj.replace("SplatDev.Umbraco.Plugins.", "")
    images = "\n\n".join(
        f"![{name} {caption(s.stem)}]({RAW}/{proj}/docs/screenshots/{s.name})" for s in shots
    )
    block = f"{MARK_START}\n\n{images}\n\n{MARK_END}"

    if MARK_START in text:
        new = re.sub(re.escape(MARK_START) + r".*?" + re.escape(MARK_END), lambda _: block, text, flags=re.S)
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
for p in done:
    print(f"   wire {p}")
for p, why in skipped:
    print(f"   skip {p}: {why}")
