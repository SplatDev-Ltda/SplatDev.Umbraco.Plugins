using Microsoft.Extensions.DependencyInjection;

using SplatDev.Cache;
using SplatDev.Cache.Hybrid.Services;

namespace SplatDev.Cache.Hybrid.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHybridCacheProvider(
        this IServiceCollection services)
    {
        services.AddHybridCache();
        services.AddSingleton<ICacheProvider, HybridCacheProvider>();
        return services;
    }

    public static IServiceCollection AddHybridCacheProvider(
        this IServiceCollection services,
        Action<HybridCacheOptions> configure)
    {
        var options = new HybridCacheOptions();
        configure(options);
        services.Configure<HybridCacheOptions>(o =>
        {
            o.MaximumKeyLength = options.MaximumKeyLength;
            o.DefaultEntryOptions = options.DefaultEntryOptions;
        });
        services.AddHybridCache();
        services.AddSingleton<ICacheProvider, HybridCacheProvider>();
        return services;
    }
}

public sealed class HybridCacheOptions
{
    public int MaximumKeyLength { get; set; } = 512;

    public Microsoft.Extensions.Caching.Hybrid.HybridCacheEntryOptions? DefaultEntryOptions { get; set; }
}
