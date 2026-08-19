using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.MemberNotifications.Models;
using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Migrations;

/// <summary>
/// Creates the member notifications table.
/// </summary>
/// <remarks>
/// Forked by target framework because the migration base class changed: Umbraco 17 runs
/// migrations asynchronously through <c>AsyncMigrationBase.MigrateAsync</c>, while
/// Umbraco 13 has only the synchronous <c>MigrationBase.Migrate</c>. The body is the same
/// either way — the split is purely the shape the CMS calls it with.
/// </remarks>
public class CreateNotificationsTable(IMigrationContext context, ILogger<CreateNotificationsTable> logger)
#if NET10_0_OR_GREATER
    : AsyncMigrationBase(context)
{
    protected override Task MigrateAsync()
    {
        Run();
        return Task.CompletedTask;
    }
#else
    : MigrationBase(context)
{
    protected override void Migrate() => Run();
#endif

    private void Run()
    {
        logger.LogDebug("Running migration {MigrationStep}", "CreateNotificationsTable");

        if (!TableExists(MemberNotification.TableName))
        {
            Create.Table<MemberNotification>().Do();
            logger.LogInformation("Created table {Table}", MemberNotification.TableName);
        }
    }
}
