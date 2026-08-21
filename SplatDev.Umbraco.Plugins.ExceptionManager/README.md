# ExceptionManager

Umbraco exception handling middleware plugin — configures production error pages and developer exception pages based on the application environment.


<!-- screenshot:start -->

![ExceptionManager dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.ExceptionManager/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ExceptionManager.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ExceptionManager)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.ExceptionManager
```

## Quick Start

The plugin auto-registers via `ExceptionComposer` — no explicit `Program.cs` registration needed.

## Configuration

Add to `appsettings.json`:

```json
{
  "EnableExceptionManager": true
}
```

When `UmbracoApplicationUrl` is configured (via `Umbraco:CMS:WebRouting:UmbracoApplicationUrl`), the plugin uses `UseExceptionHandler("/Error")` for production-style error handling. When not set, it uses `UseDeveloperExceptionPage()`.

## How It Works

The `ExceptionComposer` hooks into the Umbraco pipeline via `UmbracoPipelineFilter`. Based on whether the Umbraco application URL is configured, it toggles between production error handling (redirects to `/Error`) and developer exception pages (detailed stack traces).

## Known Limitations

- Uses `UmbracoApplicationUrl` presence as a production detection heuristic rather than `IsProduction()` from the hosting environment
- No custom error logging, notification, or error storage beyond the standard `/Error` route
- Does not support custom error page paths or status-code-specific error pages

## Changelog

### 2.1.6 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)