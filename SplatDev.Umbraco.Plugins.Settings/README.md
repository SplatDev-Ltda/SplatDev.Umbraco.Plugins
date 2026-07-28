# Settings

Umbraco site-wide settings manager plugin — key-value configuration store with a grouped settings backoffice dashboard.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Settings.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Settings)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Settings
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddSettings()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "Settings": {
    "Groups": {
      "General": ["SiteName", "LogoUrl", "FooterText"],
      "SEO": ["MetaTitle", "MetaDescription", "GoogleSiteVerification"],
      "Social": ["FacebookUrl", "TwitterHandle", "InstagramUrl"]
    }
  }
}
```

## Usage

After registration, the Settings dashboard appears in the Umbraco backoffice. Administrators can define setting groups and keys, and editors can update values through the dashboard UI. Settings are persisted in the Umbraco database.

Programmatic access:

```csharp
var siteName = _settingsService.Get("SiteName");
_settingsService.Set("SiteName", "My New Site");
```

## Known Limitations

- Settings are stored as flat key-value pairs — no hierarchical or typed value support
- No built-in value validation beyond the backoffice UI
- Group definitions are configured in appsettings.json and require an application restart to apply changes

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
