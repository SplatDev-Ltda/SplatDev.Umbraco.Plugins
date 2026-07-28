using Microsoft.Extensions.DependencyInjection;

using SplatDev.Cache;
using SplatDev.Cache.Redis.Services;

namespace SplatDev.Cache.Redis.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddRedisCache(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddSingleton<ICacheProvider>(_ => new RedisCacheProvider(connectionString));
        services.AddSingleton<IDistributedLock>(_ => new RedisDistributedLock(connectionString));
        return services;
    }

    public static IServiceCollection AddRedisCache(
        this IServiceCollection services,
        Action<RedisCacheOptions> configure)
    {
        var options = new RedisCacheOptions();
        configure(options);

        services.AddSingleton<ICacheProvider>(_ => new RedisCacheProvider(options.ConnectionString));
        services.AddSingleton<IDistributedLock>(_ => new RedisDistributedLock(options.ConnectionString));
        return services;
    }
}

public sealed class RedisCacheOptions
{
    public string ConnectionString { get; set; } = "localhost:6379";
}
