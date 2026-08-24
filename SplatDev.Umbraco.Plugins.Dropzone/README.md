# Dropzone

Dropzone.js file upload integration for Umbraco — drag-and-drop file upload with progress feedback.


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Dropzone.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Dropzone)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.0           |
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Dropzone
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDropzone()   // <-- add this
    .Build();
```

## Changelog

### 1.2.6 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.2.5 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.2.4 — 2026-08-21
- Uploads now actually store the file. The upload wrote the *filename* into the media item and never the bytes, so every upload produced a media item pointing at nothing.
- Files are filed under the media type that matches them — Image, Video, Audio, Vector Graphics or File — instead of everything becoming an Image.
- The destination is a folder picker in both backoffices, rather than a box asking for a numeric media id the backoffice never shows you.
- Added limits you can set in configuration under `Dropzone`: allowed extensions, a maximum file size, and whether a name already in use is given a suffix instead of duplicated. The dashboard shows the rules and rejects a file before spending the upload on it; the server enforces them regardless.
- A failed load or upload now says what went wrong instead of leaving an empty list.

### 1.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
