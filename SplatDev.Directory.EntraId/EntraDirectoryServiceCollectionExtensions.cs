using Microsoft.Extensions.DependencyInjection;

using SplatDev.Directory.Abstractions;

namespace SplatDev.Directory.EntraId;

/// <summary>Adds the Entra ID provider.</summary>
public static class EntraDirectoryServiceCollectionExtensions
{
    public static IServiceCollection AddSplatEntraDirectory(this IServiceCollection services)
    {
        services.AddHttpClient("SplatDev.Directory.EntraId");
        services.AddSingleton<IDirectoryProvider, EntraDirectoryProvider>();
        return services;
    }
}
