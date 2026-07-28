using System.Text.Json;

using StackExchange.Redis;

using SplatDev.Cache;

namespace SplatDev.Cache.Redis.Services;

public sealed class RedisCacheProvider : ICacheProvider, IDisposable
{
    private readonly IDatabase _database;
    private readonly IConnectionMultiplexer _connection;

    public RedisCacheProvider(string connectionString)
    {
        _connection = ConnectionMultiplexer.Connect(new ConfigurationOptions
        {
            EndPoints = { connectionString },
            AbortOnConnectFail = false,
            ConnectTimeout = 5000,
        });
        _database = _connection.GetDatabase();
    }

    public RedisCacheProvider(IConnectionMultiplexer connection)
    {
        _connection = connection;
        _database = connection.GetDatabase();
    }

    public T? Get<T>(string key)
    {
            var value = _database.StringGet(key);
            return value.HasValue ? JsonSerializer.Deserialize<T>((string)value!) : default;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var value = await _database.StringGetAsync(key);
        return value.HasValue ? JsonSerializer.Deserialize<T>((string)value!) : default;
    }

    public void Set<T>(string key, T value, CacheEntryOptions? options = null)
    {
        var serialized = JsonSerializer.Serialize(value);
        var expiry = GetExpiry(options);
        _database.StringSet(key, serialized, expiry);
    }

    public async Task SetAsync<T>(
        string key,
        T value,
        CacheEntryOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var serialized = JsonSerializer.Serialize(value);
        var expiry = GetExpiry(options);
        await _database.StringSetAsync(key, serialized, expiry);
    }

    public T? GetOrCreate<T>(string key, Func<T> factory, CacheEntryOptions? options = null)
    {
        var value = _database.StringGet(key);
        if (value.HasValue)
            return JsonSerializer.Deserialize<T>((string)value!);

        var created = factory();
        Set(key, created, options);
        return created;
    }

    public async Task<T?> GetOrCreateAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        CacheEntryOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var value = await _database.StringGetAsync(key);
        if (value.HasValue)
            return JsonSerializer.Deserialize<T>((string)value!);

        var created = await factory(cancellationToken);
        await SetAsync(key, created, options, cancellationToken);
        return created;
    }

    public void Remove(string key)
    {
        _database.KeyDelete(key);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        await _database.KeyDeleteAsync(key);
    }

    private static TimeSpan? GetExpiry(CacheEntryOptions? options)
    {
        if (options?.AbsoluteExpiration is { } absolute)
            return absolute;
        if (options?.SlidingExpiration is { } sliding)
            return sliding;
        return null;
    }

    public void Dispose()
    {
        _connection?.Dispose();
    }
}
