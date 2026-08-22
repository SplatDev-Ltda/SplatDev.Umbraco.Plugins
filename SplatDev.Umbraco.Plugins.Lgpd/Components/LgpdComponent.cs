using SplatDev.Umbraco.Plugins.Lgpd.Migrations;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace SplatDev.Umbraco.Plugins.Lgpd.Components;

/// <summary>
/// Runs the LGPD schema migration on startup.
/// </summary>
/// <remarks>
/// Without this the migration class is dead code. CreateLgpdTables existed from the first
/// commit and nothing ever executed it, so a fresh install had no lgpd tables and every
/// endpoint failed — the dashboard rendered its frame and the panel that reads Painel came
/// back empty, which reads as "no data yet" rather than "the schema was never created".
/// Caught by screenshotting the plugin on a clean instance.
/// </remarks>
public class LgpdComponent(
    ICoreScopeProvider coreScopeProvider,
    IMigrationPlanExecutor migrationPlanExecutor,
    IKeyValueService keyValueService,
    IRuntimeState runtimeState) : IComponent
{
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run)
            return;

        var plan = new MigrationPlan("SplatDev.Lgpd");
        plan.From(string.Empty)
            .To<CreateLgpdTables>("lgpd-v1")
            // v1 created the tables under the entity names rather than the [Table] names the
            // DbContext queries, so it "succeeded" while leaving nothing the plugin could read.
            .To<CreateLgpdTablesFromModel>("lgpd-v2");

        new Upgrader(plan).Execute(migrationPlanExecutor, coreScopeProvider, keyValueService);
    }

    public void Terminate() { }
}
