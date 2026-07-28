using SplatDev.Umbraco.Workflow.Persistence.Migrations.Initial;
using Umbraco.Cms.Infrastructure.Migrations;

#pragma warning disable SA1649

namespace SplatDev.Umbraco.Workflow.Persistence.Migrations;

public sealed class SplatWorkflowMigrationPlan : MigrationPlan
{
    public SplatWorkflowMigrationPlan()
        : base("SplatDev.Workflow")
    {
        From(string.Empty)
            .To<M001_CreateSchema>("m001-create-schema");
    }
}
