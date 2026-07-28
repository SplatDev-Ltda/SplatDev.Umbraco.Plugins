using Microsoft.Extensions.DependencyInjection;

using SplatDev.Search.OpenSearch.Models;
using SplatDev.Search.OpenSearch.Services;

namespace SplatDev.Search.OpenSearch.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddOpenSearch(
        this IServiceCollection services,
        Action<OpenSearchOptions> configure)
    {
        var options = new OpenSearchOptions();
        configure(options);
        services.AddSingleton(options);

        services.AddSingleton<OpenSearchProvider>(_ =>
        {
            if (options.UseAwsSigV4 && !string.IsNullOrWhiteSpace(options.AwsRegion))
                return new OpenSearchProvider(new Uri(options.ConnectionString));

            return new OpenSearchProvider(new Uri(options.ConnectionString));
        });

        return services;
    }
}
