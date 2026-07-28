using Microsoft.Extensions.DependencyInjection;

using SplatDev.Search.Elastic.Services;

namespace SplatDev.Search.Elastic.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddElasticSearch(
        this IServiceCollection services,
        string cloudId,
        string apiKey)
    {
        services.AddSingleton(_ => new ElasticSearchProvider(cloudId, apiKey));
        return services;
    }

    public static IServiceCollection AddElasticSearch(
        this IServiceCollection services,
        Uri nodeUri)
    {
        services.AddSingleton(_ => new ElasticSearchProvider(nodeUri));
        return services;
    }
}
