# Dropzone

Dropzone.js file upload integration for Umbraco — drag-and-drop upload straight into the Umbraco Media library, with progress feedback.


<!-- screenshot:start -->

![Dropzone dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Dropzone/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Dropzone.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Dropzone)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.2.9           |
| 17.x    | 10.0 | 1.2.9           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Dropzone
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Changelog

### 1.2.9 — 2026-08-26

The NuGet listing now shows the dashboard. It had no screenshot before, so the listing gave no picture of what the plugin looks like in the backoffice.

### 1.2.8 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 1.2.7 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at. The summary line also now says where uploads land: the Umbraco Media library.

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
