# CacheManager

Umbraco cache management and warming plugin — multi-layer caching with EF Core second-level cache, response caching, static file compression, and automated cache warming via background service. Consumes the `SplatDev.Cache` abstraction for ICacheService/ICacheProvider. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

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

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)
