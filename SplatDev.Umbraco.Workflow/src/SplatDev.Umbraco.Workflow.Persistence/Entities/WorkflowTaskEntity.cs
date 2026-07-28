using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Workflow.Persistence.Entities;

[TableName(TableName)]
[PrimaryKey(nameof(Id))]
[ExplicitColumns]
public sealed class WorkflowTaskEntity
{
    public const string TableName = "splatWorkflowTask";

    [Column("id")]
    [PrimaryKeyColumn(AutoIncrement = true)]
    public long Id { get; set; }

    [Column("instanceId")]
    public long InstanceId { get; set; }

    [Column("alias")]
    public string Alias { get; set; } = string.Empty;

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    [NullSetting(NullSetting = NullSettings.Null)]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    public string? Description { get; set; }

    [Column("isCompleted")]
    public bool IsCompleted { get; set; }

    [Column("completedAt")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public DateTime? CompletedAt { get; set; }

    [Column("completedBy")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? CompletedBy { get; set; }

    [Column("departmentId")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public int? DepartmentId { get; set; }
}
