# Exif

EXIF metadata extractor for Umbraco media — reads camera, GPS, and image EXIF data using MetadataExtractor.


<!-- screenshot:start -->

![Exif dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Exif/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Exif.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Exif)

## Compatibility

| Umbraco | .NET | Package Version | Dashboard |
|---------|------|-----------------|-----------|
| 13.x    | 8.0  | 1.0.0           | AngularJS |
| 17.x    | 10.0 | 1.0.1           | Lit (Bellissima) |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Exif
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddExif()   // <-- add this
    .Build();
```

The EXIF Viewer dashboard appears under the **Settings** section in the Umbraco backoffice. You can look up EXIF metadata by:

- **Media Key (GUID)** — the Umbraco media item GUID
- **Physical File Path** — absolute path to the media file on disk

## U17 Bellissima Dashboard (Lit)

The U17 dashboard is built as a Lit Web Component using Vite and TypeScript.

### Development

```bash
cd client
npm install  # or pnpm install
npm run dev  # watch mode during development
npm run build  # production build
```

The build output is placed at `App_Plugins/Exif/dist/exif-dashboard.element.js` and registered in `umbraco-package.json`.

### Architecture

- `client/` — Vite + TypeScript + Lit source
- `client/src/exif-dashboard.element.ts` — Lit element wrapping the EXIF lookup UI
- `Controllers/ExifApiController.cs` — Back-end API returning EXIF metadata
- `Services/` — EXIF extraction service (MetadataExtractor)

## Changelog

### 1.2.3 — 2026-08-22
- You pick the image from the media library instead of pasting a GUID. The field asked for a media key, which the backoffice never shows you. The picker is filtered to images, since EXIF is image metadata.
- Reading by file path is now confined to the site. The path came from the query string and was passed straight to the file system, so a signed-in backoffice user could name anything the site process could reach — another site's media on a shared host, a backup directory — and learn from the response whether it existed. Reads are now limited to the site's own web and content roots, with `..` resolved before the check rather than after.

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)