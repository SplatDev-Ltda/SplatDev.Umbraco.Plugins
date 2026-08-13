using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Plugins.Analytics.Migrations;

internal sealed class AnalyticsMigration(IMigrationContext context, ILogger<AnalyticsMigration> logger) : MigrationBase(context)
{
    protected override void Migrate()
    {
        if (TableExists("Analytics_Visit"))
        {
            logger.LogDebug("Analytics visit table already exists; skipping creation");
            return;
        }

        Create.Table<AnalyticsVisit>().Do();
    }
}
