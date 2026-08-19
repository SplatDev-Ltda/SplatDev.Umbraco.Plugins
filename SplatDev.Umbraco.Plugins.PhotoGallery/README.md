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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)