using System.Collections.Concurrent;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace SplatDev.Cache.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSplatDevCacheAbstractions(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var cacheOptions = new CacheOptions();
        configuration.GetSection("SplatDev:Cache").Bind(cacheOptions);

        services.AddSingleton(cacheOptions);
        services.AddSingleton<ICacheKeyBuilder, CacheKeyBuilder>();
        services.AddSingleton<ICacheSerializer, SystemTextJsonCacheSerializer>();
        services.AddSingleton<CacheStampedeGuard>();

        return services;
    }
}
