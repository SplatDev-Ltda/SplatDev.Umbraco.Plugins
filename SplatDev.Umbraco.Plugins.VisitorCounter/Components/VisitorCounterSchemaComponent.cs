using SplatDev.Umbraco.Plugins.VisitorCounter.Migrations;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace SplatDev.Umbraco.Plugins.VisitorCounter.Components;

public sealed class VisitorCounterSchemaComponent(
    ICoreScopeProvider coreScopeProvider,
    IMigrationPlanExecutor migrationPlanExecutor,
    IKeyValueService keyValueService,
    IRuntimeState runtimeState) : IComponent
{
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run)
        {
            return;
        }

        var migrationPlan = new MigrationPlan("SplatDev.VisitorCounter");
        migrationPlan.From(string.Empty)
            .To<VisitorCounterMigration>("visitor-counter-v1");

        new Upgrader(migrationPlan).Execute(
            migrationPlanExecutor,
            coreScopeProvider,
            keyValueService);
    }

    public void Terminate()
    {
    }
}
