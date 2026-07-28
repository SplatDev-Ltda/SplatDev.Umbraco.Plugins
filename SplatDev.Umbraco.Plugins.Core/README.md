# UmbracoCms.Plugins

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
