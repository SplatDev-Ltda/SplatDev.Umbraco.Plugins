using SplatDev.Umbraco.Plugins.Forums.Migrations;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace SplatDev.Umbraco.Plugins.Forums.Components;

/// <summary>
/// Creates this plugin's schema on startup if it is not already there.
/// </summary>
public class ForumsSchemaComponent(
    ICoreScopeProvider coreScopeProvider,
    IMigrationPlanExecutor migrationPlanExecutor,
    IKeyValueService keyValueService,
    IRuntimeState runtimeState) : IComponent
{
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run)
            return;

        var plan = new MigrationPlan("SplatDev.Forums.Schema");
        plan.From(string.Empty)
            .To<CreateForumsTables>("forums-schema-v1");

        new Upgrader(plan).Execute(migrationPlanExecutor, coreScopeProvider, keyValueService);
    }

    public void Terminate() { }
}
