# Google Analytics

Google Analytics GA4 integration for Umbraco. The package registers the GA4 integration and its backoffice assets; it does not claim to provide a Google Analytics Data API implementation or automatically inject a front-end script.


<!-- screenshot:start -->

![GoogleAnalytics dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.GoogleAnalytics/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.GoogleAnalytics.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.GoogleAnalytics)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x | 8.0 | 2.2.2 |
| 17.x | 10.0 | 2.2.2 |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.GoogleAnalytics
```

The package is discovered by Umbraco through its composer; there is no `.AddGoogleAnalytics()` builder method to call.

## Configuration

The service reads the following keys:

```json
{
  "UmbracoCms": {
    "GoogleAnalytics": {
      "MeasurementId": "G-XXXXXXXXXX",
      "Enabled": true
    }
  }
}
```

## API endpoints

- `GET /umbraco/api/analytics/GetSettings`
- `POST /umbraco/api/analytics/SaveSettings`
- `GET /umbraco/api/analytics/GetPageViews?measurementId=...` (currently returns an empty collection; no GA Data API credentials are used)

## Changelog

### 2.2.2 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)