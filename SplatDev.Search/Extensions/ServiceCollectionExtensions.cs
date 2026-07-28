using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace SplatDev.Search.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSplatDevSearchAbstractions(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var searchOptions = new SearchOptions();
        configuration.GetSection("SplatDev:Search").Bind(searchOptions);

        services.AddSingleton(searchOptions);
        services.AddSingleton<ISearchSerializer, SystemTextJsonSearchSerializer>();

        return services;
    }
}
