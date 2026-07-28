using Microsoft.Extensions.DependencyInjection;

using SplatDev.Search.Meilisearch.Models;
using SplatDev.Search.Meilisearch.Services;

namespace SplatDev.Search.Meilisearch.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSplatDevMeilisearchAdmin(
        this IServiceCollection services,
        Action<MeilisearchOptions> configure)
    {
        var options = new MeilisearchOptions();
        configure(options);

        services.AddSingleton(_ => new MeilisearchProvider(options.Host, options.MasterKey));
        return services;
    }

    public static IServiceCollection AddSplatDevMeilisearchClient(
        this IServiceCollection services,
        Action<MeilisearchOptions> configure)
    {
        var options = new MeilisearchOptions();
        configure(options);

        var apiKey = options.SearchKey ?? options.MasterKey;
        services.AddSingleton(_ => new MeilisearchProvider(options.Host, apiKey));
        return services;
    }
}
