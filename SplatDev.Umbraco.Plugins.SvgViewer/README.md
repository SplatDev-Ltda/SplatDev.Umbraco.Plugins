# SvgViewer

SVG file viewer plugin for Umbraco — renders inline SVG files from the Umbraco media library safely.


<!-- screenshot:start -->

![SvgViewer dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SvgViewer/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.SvgViewer.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.SvgViewer)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.0           |
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SvgViewer
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddSvgViewer()   // <-- add this
    .Build();
```

## Changelog

### 1.1.6 — 2026-08-22
- You pick the SVG from the media library instead of pasting a GUID. The field asked for `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` — a media key, which the backoffice never shows you — so using it meant going and finding one first. The picker is filtered to vector graphics, since that is all this viewer renders.

### 1.1.5 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)