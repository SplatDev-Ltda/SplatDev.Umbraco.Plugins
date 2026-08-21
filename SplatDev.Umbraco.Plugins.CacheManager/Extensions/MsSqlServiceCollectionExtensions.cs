using EFCoreSecondLevelCacheInterceptor;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using SplatDev.Umbraco.Plugins.CacheManager.Persistence;

namespace SplatDev.Umbraco.Plugins.CacheManager.Extensions
{
    /// <summary>
    /// Registers the pooled DbContext this plugin caches through.
    /// </summary>
    /// <remarks>
    /// The namespace used to be Umbraco.Plugins.Mailer.Extensions — a copy-paste leftover
    /// from the Mailer plugin, which also broke the repo rule that a project's root
    /// namespace matches its folder.
    /// </remarks>
    public static class MsSqlServiceCollectionExtensions
    {
        private static readonly int CommandTimeoutSeconds = (int)TimeSpan.FromMinutes(3).TotalSeconds;

        /// <summary>
        /// Registers the DbContext against whichever provider Umbraco is configured with.
        /// </summary>
        /// <remarks>
        /// This only ever called UseSqlServer, so on a SQLite install — the default the
        /// Umbraco installer offers — it failed with "Keyword not supported: 'cache'".
        /// The name is kept so existing callers still compile.
        /// </remarks>
        public static IServiceCollection AddConfiguredMsSqlDbContext(
            this IServiceCollection services, string connectionString, string? providerName = null)
        {
            var resolved = SplatDevDbContextConfig.ResolveDataDirectory(connectionString);
            var useSqlite = providerName?.Contains("Sqlite", StringComparison.OrdinalIgnoreCase) == true;

            services.AddDbContextPool<DbContext>((serviceProvider, optionsBuilder) =>
            {
                if (useSqlite)
                {
                    // EnableRetryOnFailure is a SQL Server execution strategy and has no
                    // SQLite equivalent; the rest carries over unchanged.
                    optionsBuilder.UseSqlite(resolved, sqliteOptionsBuilder =>
                        sqliteOptionsBuilder
                            .CommandTimeout(CommandTimeoutSeconds)
                            .MigrationsAssembly(typeof(MsSqlServiceCollectionExtensions).Assembly.FullName));
                }
                else
                {
                    optionsBuilder.UseSqlServer(resolved, sqlServerOptionsBuilder =>
                        sqlServerOptionsBuilder
                            .CommandTimeout(CommandTimeoutSeconds)
                            .EnableRetryOnFailure()
                            .MigrationsAssembly(typeof(MsSqlServiceCollectionExtensions).Assembly.FullName));
                }

                optionsBuilder.AddInterceptors(
                    serviceProvider.GetRequiredService<SecondLevelCacheInterceptor>());
            });

            return services;
        }
    }
}
