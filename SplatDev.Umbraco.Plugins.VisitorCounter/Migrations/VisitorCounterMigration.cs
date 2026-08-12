using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.VisitorCounter.Models;
using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Plugins.VisitorCounter.Migrations;

#if NET10_0_OR_GREATER
public sealed class VisitorCounterMigration(
    IMigrationContext context,
    ILogger<VisitorCounterMigration> logger) : AsyncMigrationBase(context)
{
    protected override async Task MigrateAsync()
#else
public sealed class VisitorCounterMigration(
    IMigrationContext context,
    ILogger<VisitorCounterMigration> logger) : MigrationBase(context)
{
    protected override void Migrate()
#endif
    {
        logger.LogDebug("Running migration {MigrationStep}", "VisitorCounter-v1");

        if (!TableExists("VisitorCounter_Session"))
        {
            Create.Table<VisitorSession>().Do();
            logger.LogInformation("Created table {Table}", "VisitorCounter_Session");
        }

        if (!TableExists("VisitorCounter_DailyCount"))
        {
            Create.Table<DailyVisitorCount>().Do();
            logger.LogInformation("Created table {Table}", "VisitorCounter_DailyCount");
        }
#if NET10_0_OR_GREATER
        await Task.CompletedTask;
    }
#else
    }
#endif
}
