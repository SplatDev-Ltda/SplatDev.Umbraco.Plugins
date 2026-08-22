using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using SplatDev.Directory.Abstractions;
using SplatDev.Directory.Configuration;

namespace SplatDev.Directory.Extensions;

/// <summary>Registers the directory abstraction and whatever providers a site adds.</summary>
public static class DirectoryServiceCollectionExtensions
{
    /// <summary>
    /// Binds <see cref="DirectoryOptions"/> from the Directory section and registers the
    /// resolver. Providers are added separately, so a site takes only the dependencies of
    /// the directories it actually uses.
    /// </summary>
    public static IServiceCollection AddSplatDirectory(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DirectoryOptions>(configuration.GetSection(DirectoryOptions.SectionName));
        services.AddSingleton<IDirectoryProviderResolver, DirectoryProviderResolver>();
        return services;
    }
}
