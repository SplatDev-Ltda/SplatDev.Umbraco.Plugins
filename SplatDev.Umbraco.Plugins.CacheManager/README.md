# CacheManager

Umbraco cache management and warming plugin — multi-layer caching with EF Core second-level cache, response caching, static file compression, and automated cache warming via background service. Consumes the `SplatDev.Cache` abstraction for ICacheService/ICacheProvider. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![CacheManager dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.CacheManager/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.CacheManager.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.CacheManager)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.CacheManager
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddCacheManager()   // <-- add this
    .Build();
```

## Architecture — Cache Layers

The plugin wires multiple cache layers via `CacheManagerComposer`:

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| **EF Second-Level Cache** | `EFCoreSecondLevelCacheInterceptor` — MemoryCache provider, 30min absolute expiration | All EF queries |
| **Static File Caching** | Umbraco pipeline filter — `Cache-Control: public, max-age=1month` | CSS, JS, fonts, images |
| **Response Caching** | ASP.NET Core `UseResponseCaching` — 5min max-age via `Cache-Control` header | HTML page responses |
| **Method Caching** | `SplatDev.Cache` (`ICacheService`/`ICacheProvider`) singleton | App-level method results |

## Configuration

```json
// appsettings.json
{
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=.;Database=Umbraco;..."
  },
  "CacheManager": {
    "EFCacheMinutes": 30,
    "StaticFileMaxAgeDays": 30,
    "ResponseCacheMinutes": 5
  }
}
```

## Backoffice Dashboard

The plugin adds a **Cache Manager** dashboard under the Settings section:

| Endpoint | Action |
|----------|--------|
| `GET CleanCache` | Clear in-memory cache |
| `GET RefreshCache` | Clear + re-warm entire cache via background service |
| `GET GetLastTask` | View cache warmer history from DB |
| `GET GetUrlNotFound` | Top 100 URLs that returned 404 |
| `GET GetStatistics` | Cache key counts (DB keys, method keys) |

## Cache Warming

`CacheWarmerBackgroundService` runs as a hosted service:

1. Scrapes published content URLs from `CacheWarmerEntry` table
2. Issues HTTP GET requests to warm the response cache
3. Logs results to `CacheWarmerEntryRepository`
4. Tracks "not found" URLs in `UrlNotFoundRepository`

Trigger manually from the backoffice dashboard or let the background service run on schedule.

## Dependencies

- `SplatDev.Cache` — cache abstraction layer (`ICacheService`, `ICacheProvider`)
- `EFCoreSecondLevelCacheInterceptor` — EF query result caching
- `Microsoft.EntityFrameworkCore` — DB context for cache tracking tables

## Changelog

### 2.1.8 — 2026-08-22
- The dashboard can reach its API on Umbraco 17. Umbraco 13 routed the controller by convention at `/umbraco/backoffice/api/CacheWarmer/…`; Umbraco 17 does not route its management controllers that way, so nothing was mapped and every call 404'd. The controller now declares an explicit route on the Umbraco 17 target, and the dashboard calls it. Umbraco 13 keeps the URL its AngularJS bundle already uses.

### 2.1.7 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 2.1.6 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
- Internal extension namespace corrected — it was left over from another plugin.

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)