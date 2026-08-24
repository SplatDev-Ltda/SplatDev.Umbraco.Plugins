# Gdrp

GDPR compliance plugin for Umbraco — cookie consent banner, data export, and right-to-erasure request management.


<!-- screenshot:start -->

![Gdrp dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Gdrp/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Gdrp.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Gdrp)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Gdrp
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddGdrp()   // <-- add this
    .Build();
```

## Features

- Cookie consent banner with granular opt-in categories
- Member data export (download personal data as JSON)
- Right-to-erasure request submission and processing
- Backoffice dashboard for managing consent records and erasure requests

## Configuration

Add to `appsettings.json`:

```json
{
  "Gdrp": {
    "CookieConsentEnabled": true,
    "DataExportEnabled": true,
    "RightToErasureEnabled": true,
    "ConsentBannerPosition": "bottom"
  }
}
```

## Usage

After registration, the plugin injects a cookie consent banner on the front-end and adds a GDPR management section to the Umbraco backoffice. Members can request data export or account erasure through the front-end API.

## Known Limitations

- Front-end consent banner rendering requires the consuming application to include the plugin's assets
- Data export and erasure requests rely on Umbraco's built-in member service — custom member data stored outside Umbraco is not included
- Cookie consent categories are predefined; custom categories require source modification

## Changelog

### 2.4.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.4.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)