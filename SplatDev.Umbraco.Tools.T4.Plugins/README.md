# SplatDev.Umbraco.Tools.T4.Plugins

<!-- screenshot:start -->
<!-- screenshot:end -->

CLI code generator for Umbraco plugin scaffolding. Creates Composer, Controller, Service, `package.manifest`, and language files from T4 templates.

## Package

**NuGet:** `SplatDev.Umbraco.Tools.T4.Plugins` (v1.0.0)  
**CLI command:** `umbraco-gen-plugin`

## Compatibility

| Umbraco Version | .NET | Status |
|----------------|------|--------|
| v13 | net8.0 | Supported |
| v17 | net10.0 | Supported |

## Installation

```bash
dotnet tool install -g SplatDev.Umbraco.Tools.T4.Plugins
```

## Usage

```bash
# Generate a new plugin
umbraco-gen-plugin --name MyPlugin --output ./src/

# Available templates
umbraco-gen-plugin --list-templates
```

The tool generates:
- Plugin `.csproj` with dual-targeting (net8.0 + net10.0)
- Composer class (`IComposer`)
- Management API Controller
- Service layer
- `package.manifest` / `umbraco-package.json`
- Language files (`lang/en-US.xml`)

## Dependencies

- System.CommandLine

## Known Limitations

- Generated code targets the SplatDev convention; may need customization for other projects
- T4 template engine requires the .NET SDK to be installed on the developer machine
- No Bellissima `client/` scaffolding yet — generated plugins are headless by default

## Changelog

### 1.0.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.2 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.

