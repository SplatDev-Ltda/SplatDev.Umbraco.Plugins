# SplatDev.Cache.Hybrid

Microsoft.Extensions.Caching.Hybrid (HybridCache) adapter for `SplatDev.Cache` abstractions — L1/L2 caching with stampede protection. **Requires .NET 10+.**

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Cache.Hybrid.svg)](https://www.nuget.org/packages/SplatDev.Cache.Hybrid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 10.0 | 17      | 1.0.0           |

> This package targets **net10.0 only**. For Umbraco 13 (net8.0), use `SplatDev.Cache.Redis` or the built-in `IMemoryCache`.

## Installation

```sh
dotnet add package SplatDev.Cache.Hybrid
```

## Configuration

### Basic registration

```csharp
using SplatDev.Cache.Hybrid.Extensions;

builder.Services.AddHybridCacheProvider();
```

This registers `HybridCache` via `AddHybridCache()` (L1 = `IMemoryCache`, L2 = configured distributed cache) and exposes it as `ICacheProvider`.

### Custom options

```csharp
builder.Services.AddHybridCacheProvider(options =>
{
    options.MaximumKeyLength = 1024;
    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(30),
    };
});
```

### With distributed cache (L2)

If you also register a distributed cache (`IDistributedCache`), HybridCache automatically uses it as the L2 backend:

```csharp
// L1 = MemoryCache, L2 = Redis
builder.Services.AddStackExchangeRedisCache(o => o.Configuration = "...");
builder.Services.AddHybridCacheProvider();
```

## Usage

```csharp
using SplatDev.Cache;

public class SessionService
{
    private readonly ICacheProvider _cache;

    public SessionService(ICacheProvider cache) => _cache = cache;

    public async Task<Session?> GetSessionAsync(string sessionId)
    {
        return await _cache.GetOrCreateAsync(
            $"session:{sessionId}",
            async ct => await LoadFromDatabaseAsync(sessionId, ct),
            CacheEntryOptions.WithAbsoluteExpiration(TimeSpan.FromMinutes(20)),
            CancellationToken.None);
    }
}
```

## Features

- Full `ICacheProvider` implementation backed by `Microsoft.Extensions.Caching.Hybrid`
- **Stampede protection** — concurrent requests for the same key share a single factory execution
- L1 cache (`IMemoryCache`) with configurable local expiration
- Optional L2 distributed cache via `IDistributedCache`
- Thread-safe by design (HybridCache handles concurrency internally)
- Async-first with sync bridge via `GetAwaiter().GetResult()`

## Known limitations

- **Synchronous `Get<T>`** throws `InvalidOperationException` — use `GetOrCreate<T>` or async methods.
- **.NET 10+ only** — the `Microsoft.Extensions.Caching.Hybrid` package does not support .NET 8.

## Dependencies

| Package | Purpose |
|---------|---------|
| `SplatDev.Cache` | Core abstractions (`ICacheProvider`) |
| `Microsoft.Extensions.Caching.Hybrid` | HybridCache L1/L2 with stampede protection |

---

**SplatDev.Cache.Hybrid** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
