# Exif

EXIF metadata extractor for Umbraco media — reads camera, GPS, and image EXIF data using MetadataExtractor.


<!-- screenshot:start -->

![Exif dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Exif/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Exif.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Exif)

## Compatibility

| Umbraco | .NET | Package Version | Dashboard |
|---------|------|-----------------|-----------|
| 13.x    | 8.0  | 1.3.0           | AngularJS |
| 17.x    | 10.0 | 1.3.0           | Lit (Bellissima) |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Exif
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

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

### 1.3.0 — 2026-08-26

Adds an EXIF tab to the media item itself. Open any image in the Media section and its camera, lens, date, exposure, aperture, ISO, dimensions and GPS position are read as the tab renders — no need to copy a media key into the dashboard first, which is where this data was only reachable before.

The dashboard's second lookup is now a content picker rather than a box for typing a server file path. Pick a page and it reports every image on it, which property each came from, and what EXIF each carries. A new `GetByContentKey` endpoint backs it, reading media references out of the node's properties whether the editor stored them as a GUID or a `umb://media/...` UDI.

An item with no EXIF now says so plainly. That is the normal case for SVGs, PDFs and images an editor has re-encoded, and it is reported differently from a request that was refused.

### 1.2.5 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 1.2.4 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.2.3 — 2026-08-22
- You pick the image from the media library instead of pasting a GUID. The field asked for a media key, which the backoffice never shows you. The picker is filtered to images, since EXIF is image metadata.
- Reading by file path is now confined to the site. The path came from the query string and was passed straight to the file system, so a signed-in backoffice user could name anything the site process could reach — another site's media on a shared host, a backup directory — and learn from the response whether it existed. Reads are now limited to the site's own web and content roots, with `..` resolved before the check rather than after.

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)