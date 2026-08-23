# EmailTemplates

Email template engine with variable substitution, preview, and singleton style settings for Umbraco 17 (net10.0).


<!-- screenshot:start -->

![EmailTemplates dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.EmailTemplates/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.EmailTemplates.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.EmailTemplates)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 17.x    | 10.0 | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.EmailTemplates
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddEmailTemplates()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "EmailTemplates": {
    "DefaultFromAddress": "noreply@example.com",
    "DefaultFromName": "My Site"
  }
}
```

## Changelog

### 1.3.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 1.2.4 — 2026-08-22
- You can pick the logo from the media library instead of typing a URL, and the field still accepts a pasted URL for an image hosted elsewhere. A picked image is stored as an absolute URL on purpose — a mail client renders it on someone else's machine and has no site to resolve a relative path against.

### 1.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 1.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)