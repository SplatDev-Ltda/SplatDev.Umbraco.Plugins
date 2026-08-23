# SplatDev.Umbraco.Tools.T4.Themes

CLI code generator for Umbraco theme scaffolding. Creates theme structure with Razor views, CSS/JS bundles, and `theme.json` metadata from T4 templates.

## Package

**NuGet:** `SplatDev.Umbraco.Tools.T4.Themes` (v1.0.0)

## Compatibility

| Umbraco Version | .NET | Status |
|----------------|------|--------|
| v13 | net8.0 | Supported |
| v17 | net10.0 | Supported |

## Installation

```bash
dotnet tool install -g SplatDev.Umbraco.Tools.T4.Themes
```

## Usage

```bash
# Generate a new theme
umbraco-gen-theme --name MyTheme --output ./wwwroot/themes/

# Available templates
umbraco-gen-theme --list-templates
```

The tool generates:
- Theme folder structure (`css/`, `js/`, `images/`)
- `theme.json` manifest with name, version, and author metadata
- Entry CSS/JS files with Umbraco theme conventions
- Razor layout overrides (if applicable)

## Dependencies

- System.CommandLine

## Known Limitations

- Generated themes follow the SplatDev convention; customize the T4 templates for project-specific needs
- T4 template engine requires .NET SDK on the developer machine
- Themes are frontend-only — no backoffice UI generation
- CLI binary must be distributed separately or installed via `dotnet tool install`

## Changelog

### 1.0.2 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.

