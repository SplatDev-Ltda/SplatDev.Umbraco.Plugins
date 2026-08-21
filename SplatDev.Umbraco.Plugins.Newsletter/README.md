# Newsletter

Newsletter subscriber lists, campaigns, Mailgun bulk send, and stats tracking for Umbraco 17 (net10.0). Depends on SplatDev.Umbraco.Plugins.EmailTemplates for rendering.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Newsletter.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Newsletter)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Newsletter
```

This plugin requires `SplatDev.Umbraco.Plugins.EmailTemplates` for email rendering:

```sh
dotnet add package SplatDev.Umbraco.Plugins.EmailTemplates
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddEmailTemplates()   // required dependency
    .AddNewsletter()       // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "Newsletter": {
    "Provider": "Mailgun",
    "FromAddress": "newsletter@example.com",
    "FromName": "My Newsletter"
  }
}
```

## Changelog

### 1.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
