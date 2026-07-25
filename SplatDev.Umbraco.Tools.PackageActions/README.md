# SplatDev.Umbraco.Tools.PackageActions

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
