# PhotoGallery

Photo gallery plugin for Umbraco — stores gallery albums and photos with EF Core, renders via view component.


<!-- screenshot:start -->

![PhotoGallery dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.PhotoGallery/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.PhotoGallery.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.PhotoGallery)

## Compatibility

| Umbraco | .NET | Package Version | Dashboard |
|---------|------|-----------------|-----------|
| 13.x    | 8.0  | 1.0.0           | AngularJS |
| 17.x    | 10.0 | 1.0.1           | Lit (Bellissima) |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.PhotoGallery
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddPhotoGallery()   // <-- add this
    .Build();
```

The Photo Gallery dashboard appears under the **Settings** section in the Umbraco backoffice. It displays albums and photos managed through the gallery.

## U17 Bellissima Dashboard (Lit)

The U17 dashboard is built as a Lit Web Component using Vite and TypeScript.

### Development

```bash
cd client
npm install  # or pnpm install
npm run dev  # watch mode during development
npm run build  # production build
```

The build output is placed at `App_Plugins/PhotoGallery/dist/photogallery-dashboard.element.js` and registered in `umbraco-package.json`.

### Architecture

- `client/` — Vite + TypeScript + Lit source
- `client/src/photogallery-dashboard.element.ts` — Lit element displaying albums with photo grids
- `Controllers/` — Back-end API endpoints for album/photo CRUD
- `Services/` — Gallery business logic with EF Core

## Changelog

### 1.2.3 — 2026-08-22
- The dashboard manages albums and photos, which is what it was for. It listed album names and offered no controls at all, while the API behind it had supported creating, renaming and deleting albums and adding and removing photos the whole time.
- Select an album to see its photos, with thumbnails, and add or remove them there.
- Images are chosen from the media library with a picker. Nothing asks you to type a URL, and what gets stored is the site-relative path, so the records survive the site moving domain.
- Deleting asks first and says what goes with it — and makes clear the media library itself is untouched.

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)