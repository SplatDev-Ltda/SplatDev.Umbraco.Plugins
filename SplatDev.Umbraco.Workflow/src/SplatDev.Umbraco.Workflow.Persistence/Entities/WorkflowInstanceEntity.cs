using NPoco;
using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Enums;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Workflow.Persistence.Entities;

[TableName(TableName)]
[PrimaryKey(nameof(Id))]
[ExplicitColumns]
internal sealed class WorkflowInstanceEntity : IWorkflowInstance
{
    public const string TableName = "splatWorkflowInstance";

    [Column("id")]
    [PrimaryKeyColumn(AutoIncrement = true)]
    public long Id { get; set; }

    [Column("workflowKey")]
    public string WorkflowKey { get; set; } = string.Empty;

    [Column("workflowVersion")]
    public int WorkflowVersion { get; set; }

    [Column("currentStepKey")]
    public string CurrentStepKey { get; set; } = string.Empty;

    [Column("status")]
    public WorkflowStatus Status { get; set; }

    [Column("metadataJson")]
    [NullSetting(NullSetting = NullSettings.Null)]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    public string? MetadataJson { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [Column("updatedBy")]
    public string UpdatedBy { get; set; } = string.Empty;
}
