# SplatDev.Cache.Redis

StackExchange.Redis adapter for `SplatDev.Cache` abstractions — distributed caching with connection multiplexing.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Cache.Redis.svg)](https://www.nuget.org/packages/SplatDev.Cache.Redis)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

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
