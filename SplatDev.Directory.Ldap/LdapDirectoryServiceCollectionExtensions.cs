using Microsoft.Extensions.DependencyInjection;

using SplatDev.Directory.Abstractions;

namespace SplatDev.Directory.Ldap;

/// <summary>Adds the Active Directory / LDAP provider.</summary>
public static class LdapDirectoryServiceCollectionExtensions
{
    public static IServiceCollection AddSplatLdapDirectory(this IServiceCollection services)
    {
        services.AddSingleton<IDirectoryProvider, LdapDirectoryProvider>();
        return services;
    }
}
