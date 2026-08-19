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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
