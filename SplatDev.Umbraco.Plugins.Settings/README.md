# Settings

Umbraco site-wide settings manager plugin — key-value configuration store with a grouped settings backoffice dashboard.


<!-- screenshot:start -->
<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Settings.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Settings)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.4.3           |
| 17.x    | 10.0 | 2.4.3           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Settings
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

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

## Changelog

### 2.4.3 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.4.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

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