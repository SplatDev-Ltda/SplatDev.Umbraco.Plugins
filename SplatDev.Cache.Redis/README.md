# SplatDev.Cache.Redis

<!-- screenshot:start -->
<!-- screenshot:end -->

StackExchange.Redis adapter for `SplatDev.Cache` abstractions — distributed caching with connection multiplexing.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Cache.Redis.svg)](https://www.nuget.org/packages/SplatDev.Cache.Redis)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.2           |
| 10.0 | 17      | 1.0.2           |

## Installation

```sh
dotnet add package SplatDev.Cache.Redis
```

## Configuration

### DI registration

```csharp
using SplatDev.Cache.Redis.Extensions;

// Simple registration with connection string
builder.Services.AddRedisCache("localhost:6379,password=xxx,abortConnect=false");

// Or with options pattern
builder.Services.AddRedisCache(options =>
{
    options.ConnectionString = "localhost:6379,password=xxx,abortConnect=false";
});
```

### Appsettings integration

```csharp
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
builder.Services.AddRedisCache(redisConnectionString!);
```

## Usage

```csharp
using SplatDev.Cache;

public class ProductService
{
    private readonly ICacheProvider _cache;

    public ProductService(ICacheProvider cache) => _cache = cache;

    public async Task<Product?> GetProductAsync(string sku)
    {
        return await _cache.GetOrCreateAsync(
            $"product:{sku}",
            async ct => await FetchFromDatabaseAsync(sku, ct),
            CacheEntryOptions.WithAbsoluteExpiration(TimeSpan.FromMinutes(10)));
    }
}
```

## Features

- Full `ICacheProvider` implementation backed by `StackExchange.Redis`
- JSON serialization via `System.Text.Json`
- Connection multiplexing for efficient connection sharing
- Configurable connection (connect timeout 5s, abort-on-connect-fail disabled)
- Both sync and async support
- Graceful expiry via `CacheEntryOptions`

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Cache` | Core abstractions (`ICacheProvider`) |
| `StackExchange.Redis` | Redis client with connection multiplexing |
| `System.Text.Json` | Value serialization |

---

**SplatDev.Cache.Redis** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

