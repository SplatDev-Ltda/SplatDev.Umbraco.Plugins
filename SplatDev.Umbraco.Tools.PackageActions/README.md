# SplatDev.Umbraco.Tools.PackageActions

<!-- screenshot:start -->
<!-- screenshot:end -->

Umbraco package action helpers — run document type, data type, template, and content node setup automatically during package installation.

## Package

**NuGet:** `SplatDev.Umbraco.Tools.PackageActions` (v1.0.0)

## Compatibility

| Umbraco Version | .NET | Status |
|----------------|------|--------|
| v13 | net8.0 | Supported |
| v17 | net10.0 | Supported |

## Installation

```bash
dotnet add package SplatDev.Umbraco.Tools.PackageActions
```

## What's Included

- `IPackageAction` — Interface for implementing custom package actions
- `PackageActionRunner` — Executes registered actions during package install/uninstall
- Built-in actions:
  - `ContentNodeAction` — Create/update content nodes
  - `DataTypeAction` — Install data types
  - `DocumentTypeAction` — Create/update document types
  - `TemplateAction` — Install templates
  - `PermissionsAction` — Configure user group permissions

## Usage

Implement `IPackageAction` for custom setup logic, or use the built-in actions in your `package.manifest`:

```xml
<Action runat="install" alias="ContentNodeAction" ... />
```

## Dependencies

- Umbraco.Cms.Core
- Umbraco.Cms.Infrastructure

## Known Limitations

- Headless library — no backoffice UI or Bellissima dashboard
- Actions execute synchronously during package install; large datasets may block the install process

## Changelog

### 1.0.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.2 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.

