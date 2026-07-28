# EmailNotifications

Email template engine, Mailgun mail provider, newsletter campaigns, and member notifications for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)

## Architecture

This is a **headless plugin** — no backoffice dashboard, property editors, or UI components. It operates as a notification service triggered by Umbraco events, registered via DI composition.
