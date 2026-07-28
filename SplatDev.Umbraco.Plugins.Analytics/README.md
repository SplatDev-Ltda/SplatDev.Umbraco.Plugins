# Analytics

Google Analytics (GA4) integration for Umbraco — inject tracking scripts and view page analytics from a backoffice dashboard.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Analytics.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Analytics)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Analytics
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddAnalytics()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "Analytics": {
    "MeasurementId": "G-XXXXXXXXXX",
    "Enabled": true
  }
}
```

Find your Measurement ID in the Google Analytics admin panel under Data Streams.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/analytics/GetSettings` | Retrieve current analytics settings |
| POST | `/umbraco/api/analytics/SaveSettings` | Update analytics configuration |
| GET | `/umbraco/api/analytics/GetPageViews?measurementId=` | Fetch page view data from GA4 |

## Usage

Once configured with a valid Measurement ID, the plugin automatically injects the GA4 tracking script into front-end pages. View page analytics and manage settings from the Analytics dashboard in the Umbraco backoffice.

## Known Limitations

- Only supports Google Analytics 4 (GA4) — Universal Analytics (UA-*) properties are not supported
- `GetPageViews` endpoint requires the Google Analytics Data API to be enabled and properly authenticated
- No support for Google Tag Manager or other analytics platforms

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
