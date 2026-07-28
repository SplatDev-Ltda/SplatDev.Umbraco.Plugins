using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Workflow.Persistence.Migrations.Initial;

public sealed class M001_CreateSchema(IMigrationContext context) : MigrationBase(context)
{
    protected override void Migrate()
    {
        Create.Table("splatWorkflowDefinition")
            .WithColumn("id").AsInt32().Identity().PrimaryKey()
            .WithColumn("key").AsString(64).NotNullable()
            .WithColumn("label").AsString(256).NotNullable()
            .WithColumn("version").AsInt32().NotNullable()
            .WithColumn("definitionJson").AsCustom("NVARCHAR(MAX)").NotNullable()
            .WithColumn("isActive").AsBoolean().NotNullable()
            .WithColumn("createdAt").AsDateTime().NotNullable()
            .WithColumn("createdBy").AsString(256).NotNullable();
        Create.UniqueConstraint("UQ_splatWorkflowDefinition_key_version")
            .OnTable("splatWorkflowDefinition").Columns(new[] { "key", "version" });

        Create.Table("splatWorkflowInstance")
            .WithColumn("id").AsInt64().Identity().PrimaryKey()
            .WithColumn("workflowKey").AsString(64).NotNullable()
            .WithColumn("workflowVersion").AsInt32().NotNullable()
            .WithColumn("currentStepKey").AsString(64).NotNullable()
            .WithColumn("status").AsByte().NotNullable()
            .WithColumn("metadataJson").AsCustom("NVARCHAR(MAX)").Nullable()
            .WithColumn("createdAt").AsDateTime().NotNullable()
            .WithColumn("createdBy").AsString(256).NotNullable()
            .WithColumn("updatedAt").AsDateTime().NotNullable()
            .WithColumn("updatedBy").AsString(256).NotNullable();
        Create.Index("IX_splatWorkflowInstance_workflow")
            .OnTable("splatWorkflowInstance")
            .OnColumn("workflowKey").Ascending()
            .OnColumn("status").Ascending()
            .OnColumn("currentStepKey").Ascending();

        Create.Table("splatWorkflowEvent")
            .WithColumn("id").AsInt64().Identity().PrimaryKey()
            .WithColumn("instanceId").AsInt64().NotNullable()
            .WithColumn("eventType").AsByte().NotNullable()
            .WithColumn("fromStepKey").AsString(64).Nullable()
            .WithColumn("toStepKey").AsString(64).Nullable()
            .WithColumn("actionKey").AsString(64).Nullable()
            .WithColumn("payloadJson").AsCustom("NVARCHAR(MAX)").Nullable()
            .WithColumn("actorUsername").AsString(256).NotNullable()
            .WithColumn("occurredAt").AsDateTime().NotNullable();
        Create.Index("IX_splatWorkflowEvent_instance")
            .OnTable("splatWorkflowEvent")
            .OnColumn("instanceId").Ascending()
            .OnColumn("occurredAt").Ascending();

        Create.Table("splatWorkflowAssignment")
            .WithColumn("id").AsInt64().Identity().PrimaryKey()
            .WithColumn("instanceId").AsInt64().NotNullable()
            .WithColumn("assignedTo").AsString(256).Nullable()
            .WithColumn("assignedToGroup").AsString(64).Nullable()
            .WithColumn("department").AsString(64).Nullable()
            .WithColumn("assignedAt").AsDateTime().NotNullable()
            .WithColumn("isActive").AsBoolean().NotNullable();
        Create.Index("IX_splatWorkflowAssignment_active")
            .OnTable("splatWorkflowAssignment")
            .OnColumn("isActive").Ascending()
            .OnColumn("instanceId").Ascending();

        Create.Table("splatWorkflowTask")
            .WithColumn("id").AsInt64().Identity().PrimaryKey()
            .WithColumn("instanceId").AsInt64().NotNullable()
            .WithColumn("alias").AsString(64).NotNullable()
            .WithColumn("name").AsString(256).NotNullable()
            .WithColumn("description").AsCustom("NVARCHAR(MAX)").Nullable()
            .WithColumn("isCompleted").AsBoolean().NotNullable()
            .WithColumn("completedAt").AsDateTime().Nullable()
            .WithColumn("completedBy").AsString(256).Nullable()
            .WithColumn("departmentId").AsInt32().Nullable();
        Create.Index("IX_splatWorkflowTask_instance")
            .OnTable("splatWorkflowTask")
            .OnColumn("instanceId").Ascending();
    }
}
