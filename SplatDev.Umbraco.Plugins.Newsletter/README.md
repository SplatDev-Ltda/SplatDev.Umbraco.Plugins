# Newsletter

<!-- screenshot:start -->
<!-- screenshot:end -->

Newsletter subscriber lists, campaigns, Mailgun bulk send, and stats tracking for Umbraco 17 (net10.0). Depends on SplatDev.Umbraco.Plugins.EmailTemplates for rendering.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Newsletter.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Newsletter)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 17.x    | 10.0 | 1.3.6           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Newsletter
```

This plugin requires `SplatDev.Umbraco.Plugins.EmailTemplates` for email rendering:

```sh
dotnet add package SplatDev.Umbraco.Plugins.EmailTemplates
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the
`AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the
package is referenced.

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

### 1.3.6 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 1.3.5 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.3.4 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.3.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 1.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
