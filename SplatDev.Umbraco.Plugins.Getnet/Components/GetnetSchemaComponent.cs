using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.Getnet.Migrations;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;
using Umbraco.Cms.Core;

namespace SplatDev.Umbraco.Plugins.Getnet.Components;

/// <summary>
/// Runs the schema migration once the site is actually running.
/// </summary>
public class GetnetSchemaComponent(
    ICoreScopeProvider coreScopeProvider,
    IMigrationPlanExecutor migrationPlanExecutor,
    IKeyValueService keyValueService,
    IRuntimeState runtimeState) : IComponent
{
    public void Initialize()
    {
        // Below Run the database may not be upgraded yet, and migrating into a half-installed
        // site is how a plugin bricks a boot it had no business touching.
        if (runtimeState.Level < RuntimeLevel.Run)
        {
            return;
        }

        var plan = new MigrationPlan("SplatDev.Getnet.Schema");
        plan.From(string.Empty)
            .To<CreateGetnetTables>("getnet-schema-v1");

        new Upgrader(plan).Execute(migrationPlanExecutor, coreScopeProvider, keyValueService);
    }

    public void Terminate()
    {
    }
}
