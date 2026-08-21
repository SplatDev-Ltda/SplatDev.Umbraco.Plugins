# EmailNotifications

Email template engine, Mailgun mail provider, newsletter campaigns, and member notifications for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![EmailNotifications dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.EmailNotifications/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.EmailNotifications.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.EmailNotifications)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 1.0.0           |
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.EmailNotifications
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddEmailNotifications()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "EmailNotifications": {
    "Provider": "Mailgun",
    "FromAddress": "noreply@example.com",
    "FromName": "My Site"
  }
}
```

## Changelog

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)

## Architecture

This is a **headless plugin** — no backoffice dashboard, property editors, or UI components. It operates as a notification service triggered by Umbraco events, registered via DI composition.