using System.Diagnostics.CodeAnalysis;

using Microsoft.Extensions.Caching.Memory;

using SplatDev.Cache;

namespace SplatDev.Umbraco.Plugins.CacheManager.Services;

public class CacheService(IMemoryCache memoryCache) : ICacheService, ICacheProvider
{
    private readonly IMemoryCache _memoryCache = memoryCache;

    public async Task<T?> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? slidingExpiration = null, TimeSpan? absoluteExpiration = null)
    {
        if (!_memoryCache.TryGetValue(key, out T? cachedResult))
        {
            cachedResult = await factory();

            var cacheEntryOptions = new MemoryCacheEntryOptions();

            if (slidingExpiration.HasValue)
                cacheEntryOptions.SetSlidingExpiration(slidingExpiration.Value);

            if (absoluteExpiration.HasValue)
                cacheEntryOptions.SetAbsoluteExpiration(absoluteExpiration.Value);

            _memoryCache.Set(key, cachedResult, cacheEntryOptions);
        }

        return cachedResult;
    }

    public T? GetOrCreate<T>(string key, Func<T> factory, TimeSpan? slidingExpiration = null, TimeSpan? absoluteExpiration = null)
    {
        if (!_memoryCache.TryGetValue(key, out T? cachedResult))
        {
            cachedResult = factory();

            var cacheEntryOptions = new MemoryCacheEntryOptions();

            if (slidingExpiration.HasValue)
                cacheEntryOptions.SetSlidingExpiration(slidingExpiration.Value);

            if (absoluteExpiration.HasValue)
                cacheEntryOptions.SetAbsoluteExpiration(absoluteExpiration.Value);

            _memoryCache.Set(key, cachedResult, cacheEntryOptions);
        }

        return cachedResult;
    }

    public void Remove(string key)
    {
        _memoryCache.Remove(key);
    }

    public T Get<T>(string key)
    {
        return _memoryCache.TryGetValue(key, out T? value) ? value : default!;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        _memoryCache.TryGetValue(key, out T? value);
        return await System.Threading.Tasks.Task.FromResult(value);
    }

    public void Set<T>(string key, T value, CacheEntryOptions? options = null)
    {
        GetOrCreate(key, () => value, options?.SlidingExpiration, options?.AbsoluteExpiration);
    }

    public async Task SetAsync<T>(string key, T value, CacheEntryOptions? options = null, CancellationToken cancellationToken = default)
    {
        await GetOrCreateAsync(key, () => System.Threading.Tasks.Task.FromResult(value), options?.SlidingExpiration, options?.AbsoluteExpiration);
    }

    public T GetOrCreate<T>(string key, Func<T> factory, CacheEntryOptions? options)
    {
        return GetOrCreate(key, factory, options?.SlidingExpiration, options?.AbsoluteExpiration)!;
    }

    public async Task<T?> GetOrCreateAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        CacheEntryOptions? options,
        CancellationToken cancellationToken = default)
    {
        return await GetOrCreateAsync(
            key,
            async () => await factory(cancellationToken),
            options?.SlidingExpiration,
            options?.AbsoluteExpiration);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        _memoryCache.Remove(key);
        await System.Threading.Tasks.Task.CompletedTask;
    }
}
