using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Workflow.Persistence.Entities;

[TableName(TableName)]
[PrimaryKey(nameof(Id))]
[ExplicitColumns]
public sealed class WorkflowAssignmentEntity
{
    public const string TableName = "splatWorkflowAssignment";

    [Column("id")]
    [PrimaryKeyColumn(AutoIncrement = true)]
    public long Id { get; set; }

    [Column("instanceId")]
    public long InstanceId { get; set; }

    [Column("assignedTo")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? AssignedTo { get; set; }

    [Column("assignedToGroup")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? AssignedToGroup { get; set; }

    [Column("department")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? Department { get; set; }

    [Column("assignedAt")]
    public DateTime AssignedAt { get; set; }

    [Column("isActive")]
    public bool IsActive { get; set; }
}
