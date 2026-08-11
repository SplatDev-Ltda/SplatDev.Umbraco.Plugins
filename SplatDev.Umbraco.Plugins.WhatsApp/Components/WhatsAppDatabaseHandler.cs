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
            await EnsureContactTableAsync(db, cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("WhatsApp conversation store ready.");
        }
        catch (Exception ex)
        {
            // A storage problem must not take the whole site down at boot. The dashboard
            // surfaces the failure when it cannot read conversations.
            _logger.LogError(ex, "Could not initialise the WhatsApp conversation store.");
        }
    }


    /// <summary>
    /// Adds the contact table to databases created before contacts existed.
    /// </summary>
    /// <remarks>
    /// EnsureCreatedAsync only builds the schema when the file is absent — it does not
    /// diff an existing database. Every install from before this feature therefore has a
    /// whatsapp.db with no contact table, and would 500 the moment the inbox asked for a
    /// contact.
    ///
    /// A plain CREATE TABLE IF NOT EXISTS is deliberate. Introducing EF migrations here
    /// would mean baselining every database already in the wild against an initial
    /// migration they were never stamped with; for one additive, side-effect-free table on
    /// a sidecar SQLite file, this is the smaller and safer change. Keep it in step with
    /// WhatsAppContact and the mapping in WhatsAppDbContext.
    /// </remarks>
    private static async Task EnsureContactTableAsync(
        WhatsAppDbContext db,
        CancellationToken cancellationToken)
    {
        await db.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS "whatsAppContact" (
                "Id"          INTEGER NOT NULL CONSTRAINT "PK_whatsAppContact" PRIMARY KEY AUTOINCREMENT,
                "WaId"        TEXT NOT NULL,
                "DisplayName" TEXT NULL,
                "Company"     TEXT NULL,
                "Email"       TEXT NULL,
                "Notes"       TEXT NULL,
                "CreatedUtc"  TEXT NOT NULL,
                "UpdatedUtc"  TEXT NOT NULL
            );
            """,
            cancellationToken).ConfigureAwait(false);

        await db.Database.ExecuteSqlRawAsync(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_whatsAppContact_WaId"
                ON "whatsAppContact" ("WaId");
            """,
            cancellationToken).ConfigureAwait(false);
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
