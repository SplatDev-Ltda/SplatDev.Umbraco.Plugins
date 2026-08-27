#!/usr/bin/env python3
"""Generate the NuGet package icons for every Marketplace-listed plugin.

The Umbraco Marketplace takes a package's icon from its NuGet metadata (<PackageIcon>),
and renders it at 64x64 on a padded background. Packages without one get a generic box
glyph, which is what every SplatDev card showed.

House style, so 77 cards read as one family on a search page:

  * 128x128 (NuGet's recommendation; the Marketplace downsamples to 64)
  * SplatDev brand purple #8056D1 on a deep near-black plum, matching splatdev.com
  * one white line glyph per plugin, same 2px-at-24 stroke weight throughout
  * the glyph says what the plugin does; the colour says who made it

Glyphs are drawn in a 24x24 box (the de facto UI icon grid) and scaled up, so they can be
lifted from or matched against any standard icon set.

    python3 tools/generate-package-icons.py            # write icon.png next to each csproj
    python3 tools/generate-package-icons.py --check     # non-zero if any are missing/stale

Requires rsvg-convert (librsvg2-bin).
"""

from __future__ import annotations

import os
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_DIRS = {"packages", "node_modules", "test-environments", "bin", "obj", ".git"}

SIZE = 128
BRAND = "#8056D1"        # SplatDev purple, taken from splatdev.com's favicon
BRAND_LIGHT = "#A47FE3"
DEEP = "#41277F"         # deeper shade of the same purple, not a neutral dark

# One fixed diagonal for every icon. An earlier pass rotated the gradient per package to
# add variety; on a search grid that just read as uneven brightness, with some tiles nearly
# black and others bright. Established icon families hold the backdrop constant and let the
# glyph carry the meaning.
GRADIENT_ANGLE = 135

# --- glyphs -----------------------------------------------------------------------
# Drawn on a 24x24 grid, stroked (never filled) so weight stays even when scaled.
GLYPHS: dict[str, str] = {
    "chat":      '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4-.9L3 21l1.9-4.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>',
    "mail":      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    "bell":      '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    "cart":      '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    "card":      '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    "lock":      '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "shield":    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    "key":       '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.3-8.3M17 6l2.5 2.5M14.5 8.5 17 11"/>',
    "user":      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    "search":    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    "chart":     '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    "gauge":     '<path d="M12 20a8 8 0 1 1 8-8"/><path d="m12 12 5-3"/>',
    "database":  '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    "bolt":      '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    "refresh":   '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    "archive":   '<rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>',
    "cloud":     '<path d="M18 18H7A4.5 4.5 0 1 1 8 9a6 6 0 0 1 11.2 2.5A3.8 3.8 0 0 1 18 18z"/>',
    "image":     '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    "film":      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 12h20"/>',
    "doc":       '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/>',
    "docs":      '<path d="M15 2H8a2 2 0 0 0-2 2v14"/><rect x="9" y="6" width="12" height="16" rx="2"/>',
    "pen":       '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    "tag":       '<path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    "globe":     '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
    "language":  '<path d="M4 5h11M9 3v2c0 5-2.5 9-6 11"/><path d="M6 12c1.6 3 4 5.2 7 6"/><path d="m13 21 5-11 5 11M15.5 17h5"/>',
    "layout":    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    "grid":      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    "list":      '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    "sliders":   '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    "code":      '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    "terminal":  '<path d="m4 17 6-5-6-5"/><path d="M12 19h8"/>',
    "box":       '<path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"/><path d="m3.3 7.5 8.7 5 8.7-5M12 22V12.5"/>',
    "plug":      '<path d="M9 2v6M15 2v6"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
    "link":      '<path d="M10 13a5 5 0 0 0 7.5.5l3-3A5 5 0 0 0 13.5 3.5l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3A5 5 0 0 0 10.5 20.5l1.7-1.7"/>',
    "share":     '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    "map":       '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    "calendar":  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    "clock":     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "filter":    '<path d="M3 4h18l-7 8v7l-4 2v-9z"/>',
    "shuffle":   '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6M4 4l5 5"/>',
    "eye":       '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
    "power":     '<path d="M18.4 6.6a9 9 0 1 1-12.8 0"/><path d="M12 2v10"/>',
    "wrench":    '<path d="M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3z"/>',
    "flask":     '<path d="M9 2h6M10 2v6L4.5 18A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3L14 8V2"/><path d="M7 15h10"/>',
    "upload":    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 9 5-5 5 5M12 4v12"/>',
    "download":  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 11 5 5 5-5M12 16V4"/>',
    "star":      '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    "bug":       '<rect x="8" y="6" width="8" height="14" rx="4"/><path d="M8 12H3M21 12h-5M8 8 5 5M16 8l3-3M8 17l-3 3M16 17l3 3"/>',
    "sitemap":   '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-2h14v2"/>',
}

# --- plugin -> glyph --------------------------------------------------------------
# Matched against the project name, longest key first, so "EmailTemplates" beats "Email".
GLYPH_FOR: dict[str, str] = {
    "whatsapp": "chat", "sms": "chat", "twilio": "chat", "chat": "chat", "comments": "chat",
    "emailtemplates": "docs", "emailnotifications": "bell", "mailer": "mail",
    "email": "mail", "sendgrid": "mail", "newsletter": "mail", "smtp": "mail",
    "notification": "bell", "alerts": "bell",
    "shopcart": "cart", "commerce": "cart", "ecommerce": "cart", "cart": "cart",
    "payments": "card", "payment": "card", "stripe": "card", "mercadopago": "card",
    "bancointer": "card", "getnet": "card", "santander": "card", "pagseguro": "card",
    "2fa": "shield", "twofactor": "shield", "mfa": "shield",
    "auth": "lock", "authorization": "lock", "login": "key", "sso": "key", "ldap": "key",
    "permissions": "lock", "security": "shield", "members": "user", "membership": "user",
    "users": "user", "profile": "user",
    "search": "search", "examine": "search", "elastic": "search", "lucene": "search",
    "analytics": "chart", "insights": "chart", "stats": "chart", "metrics": "gauge",
    "seo": "tag", "sitemap": "sitemap", "redirects": "shuffle", "robots": "eye",
    # "adpreview" rather than a bare "preview": the matcher takes the longest keyword
    # present, and "preview" would outrank "video" and restyle VideoPreview too.
    "adpreview": "eye",
    "cache": "bolt", "cachemanager": "bolt", "redis": "bolt", "performance": "gauge",
    "backup": "archive", "backups": "archive", "restore": "archive", "export": "download",
    "import": "upload", "migration": "refresh", "sync": "refresh", "usync": "refresh",
    "database": "database", "sql": "database", "npoco": "database", "entityframework": "database",
    "media": "image", "image": "image", "images": "image", "gallery": "image",
    "dropzone": "upload", "upload": "upload", "video": "film", "pdf": "doc",
    "blog": "pen", "content": "doc", "contentpackages": "box", "articles": "doc",
    "forms": "list", "formbuilder": "list", "form": "list",
    "dictionary": "language", "dictionarymanager": "language", "translation": "language",
    "translations": "language", "localization": "globe", "language": "language",
    "theme": "layout", "themes": "layout", "starterkit": "layout",
    "blocks": "grid", "grid": "grid", "layout": "layout",
    "settings": "sliders", "config": "sliders", "configuration": "sliders",
    "adminbar": "terminal", "admin": "terminal", "devtools": "code", "codefirst": "code",
    "schema": "sitemap", "yaml": "code",
    # These two are a pair travelling in opposite directions, and mapping both to "code"
    # gave them the same picture - which is how they came to ship one icon between them.
    # Schema2Yaml exports the schema out to YAML; Yaml2Schema reads YAML back in.
    "schema2yaml": "download", "yaml2schema": "upload",
    "json": "code", "api": "plug", "webhooks": "plug", "integration": "plug",
    "exception": "bug", "exceptions": "bug", "errors": "bug", "logging": "bug",
    "logs": "list", "audit": "list",
    "maps": "map", "gmaps": "map", "location": "map",
    "states": "map", "usstates": "map", "brazilstates": "map", "regions": "map",
    "calendar": "calendar", "events": "calendar", "scheduler": "clock", "cron": "clock",
    "social": "share", "socialmedia": "share", "share": "share", "tweets": "share",
    "onoff": "power", "toggle": "power", "maintenance": "wrench", "tools": "wrench",
    "testing": "flask", "test": "flask",
    "favorites": "star", "ratings": "star", "reviews": "star",
    "charlimit": "sliders", "defaultvalue": "sliders", "copyvalue": "sliders",
    "datatypes": "grid", "propertyeditors": "grid",
    "d4sign": "pen", "enotassina": "pen", "signature": "pen",
    "cloudflare": "cloud", "azure": "cloud", "storage": "cloud",
    "exif": "image", "wordsapi": "language", "words": "language",
    "packages": "box", "packager": "box", "packageactions": "box",
    "customlogin": "key", "dashboard": "grid", "widgets": "grid",
    "pagination": "list", "querystringfilters": "filter", "filters": "filter",
    "markup": "code", "common": "box", "core": "box", "base": "box",
}

FALLBACK = "box"

# Hand-made artwork, never regenerated even with --force. Everything else with an
# icon.png in its project root came from this script and can be restyled.
BESPOKE = {
    "SplatDev.Umbraco.Plugins.OnOff",
    "SplatDev.Umbraco.Plugins.WhatsApp",
    "Umbraco.Community.AzureSSO",
}


def find_csprojs():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for filename in filenames:
            if filename.endswith(".csproj"):
                yield pathlib.Path(dirpath) / filename


def glyph_for(project_name: str) -> str:
    """Pick a glyph by matching the longest keyword present in the project name."""
    lowered = project_name.lower().replace(".", "").replace("-", "")
    best = None
    for keyword in GLYPH_FOR:
        if keyword in lowered and (best is None or len(keyword) > len(best)):
            best = keyword
    return GLYPHS[GLYPH_FOR[best]] if best else GLYPHS[FALLBACK]


def render_svg(project_name: str) -> str:
    glyph = glyph_for(project_name)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" width="{SIZE}" height="{SIZE}" role="img" aria-label="{project_name}">
  <title>{project_name}</title>
  <defs>
    <linearGradient id="bg" gradientTransform="rotate({GRADIENT_ANGLE} 0.5 0.5)">
      <stop offset="0%" stop-color="{BRAND}"/>
      <stop offset="100%" stop-color="{DEEP}"/>
    </linearGradient>
    <clipPath id="tile">
      <rect width="{SIZE}" height="{SIZE}" rx="28"/>
    </clipPath>
  </defs>
  <rect width="{SIZE}" height="{SIZE}" rx="28" fill="url(#bg)"/>
  <!-- SplatDev's mark as a watermark rather than a badge: two blobs, clipped to the tile
       and held at low opacity so it reads as texture behind the glyph instead of
       competing with it. Same treatment as the hand-made icons, so the set is one family. -->
  <g clip-path="url(#tile)" fill="#FFFFFF" opacity="0.13">
    <circle cx="104" cy="26" r="34"/>
    <circle cx="132" cy="66" r="18"/>
  </g>
  <g transform="translate(32 32) scale(2.667)" fill="none" stroke="#FFFFFF"
     stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    {glyph}
  </g>
</svg>
"""


def main() -> int:
    check_only = "--check" in sys.argv
    # --force restyles previously generated icons (a house-style change), while still
    # leaving BESPOKE artwork alone.
    force = "--force" in sys.argv

    if not check_only and not subprocess.run(["which", "rsvg-convert"],
                                             capture_output=True).returncode == 0:
        print("rsvg-convert not found - install librsvg2-bin")
        return 1

    written, missing = [], []

    for csproj in sorted(find_csprojs()):
        text = csproj.read_text(encoding="utf-8", errors="replace")
        if re.search(r"<IsPackable>\s*false\s*</IsPackable>", text, re.I):
            continue
        if "umbraco-marketplace" not in text and ".Themes." not in csproj.stem:
            continue

        # Leave any package that already has artwork alone, whether that is a
        # <PackageIcon> declaration (WhatsApp keeps its own in docs/brand/) or a loose
        # icon.png that was never wired up (OnOff). An earlier pass tested only for the
        # declaration and overwrote OnOff's file; a later one tested only for the file and
        # shipped a generic glyph in place of WhatsApp's purpose-made one.
        if csproj.stem in BESPOKE:
            continue

        png = csproj.parent / "icon.png"
        if not force:
            if "<PackageIcon>" in text or png.exists():
                continue

        if check_only:
            missing.append(str(csproj.parent.relative_to(ROOT)))
            continue

        svg = csproj.parent / "icon.svg"
        svg.write_text(render_svg(csproj.stem), encoding="utf-8")
        subprocess.run(
            ["rsvg-convert", "-w", str(SIZE), "-h", str(SIZE), str(svg), "-o", str(png)],
            check=True, capture_output=True)
        svg.unlink()
        written.append(png)

    if check_only:
        if missing:
            print(f"{len(missing)} package(s) have no icon; run tools/generate-package-icons.py")
            for name in missing[:10]:
                print(f"   {name}")
            return 1
        print("every listed package has an icon")
        return 0

    print(f"generated {len(written)} icon(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
