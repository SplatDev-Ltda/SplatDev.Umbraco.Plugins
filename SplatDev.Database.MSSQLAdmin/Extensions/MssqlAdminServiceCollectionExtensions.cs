using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SplatDev.Database.MSSQLAdmin.Models;

namespace SplatDev.Database.MSSQLAdmin.Extensions;

public static class MssqlAdminServiceCollectionExtensions
{
    public static IServiceCollection AddSplatDevMssqlAdmin(
        this IServiceCollection services,
        Action<MssqlAdminOptions> configure)
    {
        var options = new MssqlAdminOptions();
        configure(options);
        services.AddSingleton(options);

        services.TryAddSingleton<MssqlAdminService>();

        return services;
    }
}
