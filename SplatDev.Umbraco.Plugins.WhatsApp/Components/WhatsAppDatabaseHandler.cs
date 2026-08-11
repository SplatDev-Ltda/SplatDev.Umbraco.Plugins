using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using SplatDev.Umbraco.Plugins.WhatsApp.Migrations;

using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Components;

/// <summary>
/// Creates the WhatsApp sidecar schema at startup. Without it, the first inbound webhook
/// or inbox request fails against a database that does not exist yet.
/// </summary>
public class WhatsAppDatabaseHandler : INotificationAsyncHandler<UmbracoApplicationStartingNotification>
{
    private readonly IDbContextFactory<WhatsAppDbContext> _factory;
    private readonly ILogger<WhatsAppDatabaseHandler> _logger;

    public WhatsAppDatabaseHandler(
        IDbContextFactory<WhatsAppDbContext> factory,
        ILogger<WhatsAppDatabaseHandler> logger)
    {
        _factory = factory;
        _logger = logger;
    }

    public async Task HandleAsync(
        UmbracoApplicationStartingNotification notification,
        CancellationToken cancellationToken)
    {
        try
        {
            await using var db = await _factory.CreateDbContextAsync(cancellationToken).ConfigureAwait(false);

            EnsureDataDirectory(db.Database.GetConnectionString());
            await db.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("WhatsApp conversation store ready.");
        }
        catch (Exception ex)
        {
            // A storage problem must not take the whole site down at boot. The dashboard
            // surfaces the failure when it cannot read conversations.
            _logger.LogError(ex, "Could not initialise the WhatsApp conversation store.");
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
