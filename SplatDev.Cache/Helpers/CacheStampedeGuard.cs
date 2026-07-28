using System.Collections.Concurrent;

namespace SplatDev.Cache;

public sealed class CacheStampedeGuard
{
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

    public async Task<T?> GetOrCreateWithStampedeProtectionAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        Func<string, CancellationToken, Task<T?>> getAsync,
        Func<string, T, CacheEntryOptions?, CancellationToken, Task> setAsync,
        CacheEntryOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var cached = await getAsync(key, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var semaphore = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));

        await semaphore.WaitAsync(cancellationToken);
        try
        {
            cached = await getAsync(key, cancellationToken);
            if (cached is not null)
            {
                return cached;
            }

            var value = await factory(cancellationToken);
            if (value is not null)
            {
                await setAsync(key, value, options, cancellationToken);
            }

            return value;
        }
        finally
        {
            semaphore.Release();
        }
    }
}
