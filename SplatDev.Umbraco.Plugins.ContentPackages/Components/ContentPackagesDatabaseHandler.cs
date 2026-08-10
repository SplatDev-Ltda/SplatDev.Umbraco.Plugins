using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using SplatDev.Umbraco.Plugins.ContentPackages.Migrations;

using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Components;

/// <summary>Creates the leads/downloads schema at startup.</summary>
public class ContentPackagesDatabaseHandler
    : INotificationAsyncHandler<UmbracoApplicationStartingNotification>
{
    private readonly IDbContextFactory<ContentPackagesDbContext> _factory;
    private readonly ILogger<ContentPackagesDatabaseHandler> _logger;

    public ContentPackagesDatabaseHandler(
        IDbContextFactory<ContentPackagesDbContext> factory,
        ILogger<ContentPackagesDatabaseHandler> logger)
    {
        _factory = factory;
        _logger = logger;
    }

    public async Task HandleAsync(
        UmbracoApplicationStartingNotification notification, CancellationToken cancellationToken)
    {
        try
        {
            await using var db = await _factory.CreateDbContextAsync(cancellationToken).ConfigureAwait(false);

            EnsureDataDirectory(db.Database.GetConnectionString());
            await db.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("ContentPackages store ready.");
        }
        catch (Exception ex)
        {
            // A storage problem must not take the whole site down at boot.
            _logger.LogError(ex, "Could not initialise the ContentPackages store.");
        }
    }

    private static void EnsureDataDirectory(string? connectionString)
    {
        if (string.IsNullOrEmpty(connectionString))
        {
            return;
        }

        var dataSource = new SqliteConnectionStringBuilder(connectionString).DataSource;
        if (string.IsNullOrEmpty(dataSource))
        {
            return;
        }

        var directory = Path.GetDirectoryName(Path.GetFullPath(dataSource));
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }
    }
}
