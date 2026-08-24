# UmbracoCms.Plugins

<!-- screenshot:start -->
<!-- screenshot:end -->

Base/shared constants library for UmbracoCms plugin development.

## What it provides

Static constant classes grouped under the `UmbracoCms.Plugins` namespace, all as nested classes of the `Default` partial class:

- **Icons** - Umbraco back-office icon name constants
- **Colors** - Color alias constants used across Umbraco UI
- **DataTypes** - Umbraco built-in data type GUID constants
- **Permissions** - Umbraco user permission/action constants
- **Formats** - Common format string constants (date, number, etc.)
- **MediaTypes** - Umbraco media type alias constants

## Target frameworks

| Framework | Umbraco version |
|-----------|----------------|
| net8.0    | Umbraco 13     |
| net10.0   | Umbraco 17     |

## NuGet

Package ID: `UmbracoCms.Plugins`

```shell
dotnet add package UmbracoCms.Plugins
```

## Architecture

This is a **headless library** — no backoffice dashboard, property editors, or UI components. It operates purely as a shared constants/helpers package registered via DI composition.


## Architecture

This is a **headless library** — no backoffice dashboard, property editors, or UI components. It operates purely as a shared constants/helpers package registered via DI composition.

## Changelog

### 2.0.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.0.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.0.2 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

