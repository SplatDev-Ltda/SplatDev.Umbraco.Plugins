using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.Analytics.Migrations;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace SplatDev.Umbraco.Plugins.Analytics.Components;

/// <summary>
/// Creates this plugin's schema on startup if it is not already there.
/// </summary>
/// <remarks>
/// Registering a DbContext without creating its tables is how thirty plugins in this repo
/// ended up querying objects that never existed, so the schema is created here rather than
/// left to the first request to discover.
/// </remarks>
public class AnalyticsSchemaComponent(
    ICoreScopeProvider coreScopeProvider,
    IMigrationPlanExecutor migrationPlanExecutor,
    IKeyValueService keyValueService,
    IRuntimeState runtimeState,
    ILogger<AnalyticsSchemaComponent> logger) : IComponent
{
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run)
            return;

        try
        {
            new Upgrader(new AnalyticsMigrationPlan())
                .Execute(migrationPlanExecutor, coreScopeProvider, keyValueService);
        }
        catch (Exception ex)
        {
            // A failed migration must not stop the site booting, but it must be visible:
            // every read afterwards fails against a table that is not there, and the
            // dashboard would otherwise just look like a site with no traffic.
            logger.LogError(ex, "Analytics: could not create its tables. The dashboard will have nothing to read.");
        }
    }

    public void Terminate() { }
}
