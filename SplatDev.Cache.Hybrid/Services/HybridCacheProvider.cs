using Microsoft.Extensions.Caching.Hybrid;

using SplatDev.Cache;

namespace SplatDev.Cache.Hybrid.Services;

public sealed class HybridCacheProvider : ICacheProvider
{
    private readonly HybridCache _hybridCache;

    public HybridCacheProvider(HybridCache hybridCache)
    {
        _hybridCache = hybridCache;
    }

    public T? Get<T>(string key)
    {
        return GetOrCreate<T>(key, () => throw new InvalidOperationException(
            "Synchronous cache retrieval is not supported by HybridCache. Use GetOrCreate<T> or async methods."));
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
#pragma warning disable CS8619
        var result = await _hybridCache.GetOrCreateAsync<T>(
            key,
            _ => new ValueTask<T>((T)default!),
            cancellationToken: cancellationToken);
#pragma warning restore CS8619
        return result;
    }

    public void Set<T>(string key, T value, CacheEntryOptions? options = null)
    {
        var entryOptions = ToHybridOptions(options);
        _hybridCache.SetAsync(key, value, entryOptions).AsTask().GetAwaiter().GetResult();
    }

    public async Task SetAsync<T>(
        string key,
        T value,
        CacheEntryOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var entryOptions = ToHybridOptions(options);
        await _hybridCache.SetAsync(key, value, entryOptions, cancellationToken: cancellationToken);
    }

    public T? GetOrCreate<T>(string key, Func<T> factory, CacheEntryOptions? options = null)
    {
        var entryOptions = ToHybridOptions(options);
#pragma warning disable CS8619
        return _hybridCache.GetOrCreateAsync<T>(
            key,
            _ => ValueTask.FromResult(factory()),
            entryOptions).AsTask().GetAwaiter().GetResult();
#pragma warning restore CS8619
    }

    public async Task<T?> GetOrCreateAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        CacheEntryOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var entryOptions = ToHybridOptions(options);
        return await _hybridCache.GetOrCreateAsync(
            key,
            async (CancellationToken ct) => await factory(ct),
            entryOptions,
            cancellationToken: cancellationToken);
    }

    public void Remove(string key)
    {
        _hybridCache.RemoveAsync(key).AsTask().GetAwaiter().GetResult();
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        await _hybridCache.RemoveAsync(key, cancellationToken);
    }

    public async Task RemoveByTagAsync(string tag, CancellationToken cancellationToken = default)
    {
        await _hybridCache.RemoveByTagAsync(tag, cancellationToken);
    }

    private static HybridCacheEntryOptions? ToHybridOptions(CacheEntryOptions? options)
    {
        if (options is null)
            return null;

        return new HybridCacheEntryOptions
        {
            Expiration = options.AbsoluteExpiration,
            LocalCacheExpiration = options.SlidingExpiration ?? options.AbsoluteExpiration,
        };
    }
}
