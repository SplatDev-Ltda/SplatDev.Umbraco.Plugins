using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using PdfCurator.Core.Data;

using SplatDev.Umbraco.Plugins.PdfCurator.Migrations;

using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Components;

/// <summary>
/// Brings both plugin databases to a usable state at startup: the catalog
/// (owned by PdfCurator.Core, applied via its EF migrations) and the member
/// sidecar (plugin-owned, schema created in place — it has no migrations).
/// Without this, every member endpoint fails on first use.
/// </summary>
public class PdfCuratorDatabaseHandler : INotificationAsyncHandler<UmbracoApplicationStartingNotification>
{
    private readonly IDbContextFactory<CuratorDbContext> _curatorFactory;
    private readonly IDbContextFactory<MemberDbContext> _memberFactory;
    private readonly ILogger<PdfCuratorDatabaseHandler> _logger;

    public PdfCuratorDatabaseHandler(
        IDbContextFactory<CuratorDbContext> curatorFactory,
        IDbContextFactory<MemberDbContext> memberFactory,
        ILogger<PdfCuratorDatabaseHandler> logger)
    {
        _curatorFactory = curatorFactory;
        _memberFactory = memberFactory;
        _logger = logger;
    }

    public async Task HandleAsync(UmbracoApplicationStartingNotification notification, CancellationToken cancellationToken)
    {
        await using (var curatorDb = await _curatorFactory.CreateDbContextAsync(cancellationToken))
        {
            EnsureDataDirectory(curatorDb.Database.GetConnectionString());
            await curatorDb.Database.MigrateAsync(cancellationToken);
        }

        await using (var memberDb = await _memberFactory.CreateDbContextAsync(cancellationToken))
        {
            EnsureDataDirectory(memberDb.Database.GetConnectionString());
            await memberDb.Database.EnsureCreatedAsync(cancellationToken);
        }

        _logger.LogInformation("PdfCurator databases ready (catalog migrated, member schema ensured).");
    }

    private static void EnsureDataDirectory(string? connectionString)
    {
        if (string.IsNullOrEmpty(connectionString))
        {
            return;
        }

        var dataSource = new SqliteConnectionStringBuilder(connectionString).DataSource;
        var directory = Path.GetDirectoryName(Path.GetFullPath(dataSource));
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }
    }
}
