# SplatDev.Cache

Generic caching abstractions for SplatDev packages — provider-agnostic interfaces for Redis, HybridCache, MemoryCache, and other backends.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Cache.svg)](https://www.nuget.org/packages/SplatDev.Cache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Cache
```

This package has **zero external dependencies** — it defines only abstractions.

## Interfaces

### ICacheProvider

The core abstraction for pluggable cache backends:

```csharp
public interface ICacheProvider
{
    T? Get<T>(string key);
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);

    void Set<T>(string key, T value, CacheEntryOptions? options = null);
    Task SetAsync<T>(string key, T value, CacheEntryOptions? options = null, CancellationToken cancellationToken = default);

    T? GetOrCreate<T>(string key, Func<T> factory, CacheEntryOptions? options = null);
    Task<T?> GetOrCreateAsync<T>(string key, Func<CancellationToken, Task<T>> factory,
        CacheEntryOptions? options = null, CancellationToken cancellationToken = default);

    void Remove(string key);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
    Task<bool> RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
    Task<bool> RemoveByTagAsync(string tag, CancellationToken cancellationToken = default);
}
```

`RemoveByPatternAsync` and `RemoveByTagAsync` are optional — adapters that cannot support these operations may throw `NotSupportedException`.

### ICacheKeyBuilder

Canonical key composition for cache entries:

```csharp
public interface ICacheKeyBuilder
{
    string Build(params string[] segments);
    string BuildPattern(params string[] segments);
}
```

Default key format: `{KeyPrefix}:segment1:segment2:...`

### IDistributedLock

Distributed lock abstraction for coordinated cache operations:

```csharp
public interface IDistributedLock
{
    Task<LockResult> AcquireAsync(
        string resource,
        TimeSpan timeout,
        TimeSpan? autoRelease = null,
        CancellationToken cancellationToken = default);
}
```

### ICacheSerializer

Pluggable serialization for cache values:

```csharp
public interface ICacheSerializer
{
    byte[]? Serialize<T>(T? value);
    T? Deserialize<T>(byte[]? data);
}
```

## Models

### CacheOptions

```csharp
public class CacheOptions
{
    public string KeyPrefix { get; set; } = "";
    public TimeSpan DefaultTtl { get; set; } = TimeSpan.FromMinutes(30);
    public string KeySeparator { get; set; } = ":";
}
```

Bound from `IConfiguration` section `"SplatDev:Cache"`.

### CacheEntryOptions

```csharp
public class CacheEntryOptions
{
    public TimeSpan? AbsoluteExpiration { get; set; }
    public TimeSpan? SlidingExpiration { get; set; }

    public static CacheEntryOptions WithAbsoluteExpiration(TimeSpan duration);
    public static CacheEntryOptions WithSlidingExpiration(TimeSpan duration);
}
```

### CacheEntry\<T\>

```csharp
public record CacheEntry<T>(string Key, T Value, DateTimeOffset? ExpiresAt = null);
```

### LockResult

```csharp
public sealed class LockResult
{
    public bool Acquired { get; init; }
    public string Resource { get; init; }
    public IDisposable? Handle { get; init; }
}
```

## Helpers

### CacheKeyBuilder

Default implementation of `ICacheKeyBuilder`. Composes keys in `"splatdev:<app>:<domain>:<id>"` format using the configured `KeyPrefix` and `KeySeparator`.

### PatternMatcher

Glob-to-regex utility for cache key pattern matching:

```csharp
public static class PatternMatcher
{
    public static Regex GlobToRegex(string pattern, bool caseInsensitive = true);
    public static bool IsMatch(string input, string pattern, bool caseInsensitive = true);
}
```

### SystemTextJsonCacheSerializer

Default implementation of `ICacheSerializer` using `System.Text.Json` with camelCase naming policy.

### CacheStampedeGuard

Per-key `SemaphoreSlim` stampede protection for `GetOrCreateAsync` patterns. Registered as a singleton via the DI extension.

```csharp
public sealed class CacheStampedeGuard
{
    public Task<T?> GetOrCreateWithStampedeProtectionAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        Func<string, CancellationToken, Task<T?>> getAsync,
        Func<string, T, CacheEntryOptions?, CancellationToken, Task> setAsync,
        CacheEntryOptions? options = null,
        CancellationToken cancellationToken = default);
}
```

## Dependency Injection

Register all abstractions in one call:

```csharp
services.AddSplatDevCacheAbstractions(configuration);
```

This binds `CacheOptions` from `"SplatDev:Cache"` config section and registers:
- `CacheOptions` (singleton)
- `ICacheKeyBuilder` → `CacheKeyBuilder` (singleton)
- `ICacheSerializer` → `SystemTextJsonCacheSerializer` (singleton)
- `CacheStampedeGuard` (singleton)

**Note:** `ICacheProvider` is NOT registered — you must add a provider package (e.g. `SplatDev.Cache.Redis` or `SplatDev.Cache.Hybrid`).

### Configuration

```json
{
  "SplatDev": {
    "Cache": {
      "KeyPrefix": "myapp",
      "DefaultTtl": "00:10:00",
      "KeySeparator": ":"
    }
  }
}
```

## Available provider implementations

| Package | Backend | Description |
|---------|---------|-------------|
| `SplatDev.Cache.Redis` | StackExchange.Redis | Distributed Redis cache |
| `SplatDev.Cache.Hybrid` | .NET HybridCache | L1/L2 hybrid with stampede protection (.NET 10+) |

## Design decisions

- **Stampede protection**: Built into the foundation layer via per-key `SemaphoreSlim` (`CacheStampedeGuard`). Provider adapters may override with distributed locking.
- **Tag-based invalidation**: First-class in `ICacheProvider`. Adapters that cannot support it throw `NotSupportedException`.
- **Serializer scope**: Global default (`ICacheSerializer`) with per-call override support.
- **Cancellation semantics**: Cancellation token cancels the running factory in `GetOrCreateAsync`.

## Dependencies

None. This package has zero NuGet dependencies — it is pure interface and model definitions.

---

**SplatDev.Cache** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.
