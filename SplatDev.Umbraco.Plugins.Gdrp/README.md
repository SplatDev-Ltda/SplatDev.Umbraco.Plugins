# Gdrp

GDPR compliance plugin for Umbraco — cookie consent banner, data export, and right-to-erasure request management.

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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
