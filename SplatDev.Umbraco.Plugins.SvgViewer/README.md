# SvgViewer

SVG file viewer plugin for Umbraco — renders inline SVG files from the Umbraco media library safely.


<!-- screenshot:start -->

![SvgViewer property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SvgViewer/docs/screenshots/02-property-editor.png)

![SvgViewer data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SvgViewer/docs/screenshots/03-data-type.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SvgViewer.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SvgViewer)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.2.3           |
| 17.x    | 10.0 | 1.2.3           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SvgViewer
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Changelog

### 1.2.3 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 1.2.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.2.0 — 2026-08-23

The property editor can now be used. Its manifest declared a property editor schema with no server-side editor behind it, so Umbraco refused to create a data type for it with "The targeted property editor was not found". It now stores its value with a schema the server actually provides.

The Umbraco Marketplace listing now shows every screenshot for this plugin, not just the dashboard. The listing keeps its own screenshot list rather than reading the README.

### 1.1.6 — 2026-08-22
- You pick the SVG from the media library instead of pasting a GUID. The field asked for `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` — a media key, which the backoffice never shows you — so using it meant going and finding one first. The picker is filtered to vector graphics, since that is all this viewer renders.

### 1.1.5 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)