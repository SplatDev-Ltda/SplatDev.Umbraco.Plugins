using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Workflow.Persistence.Entities;

[TableName(TableName)]
[PrimaryKey(nameof(Id))]
[ExplicitColumns]
internal sealed class WorkflowEventEntity
{
    public const string TableName = "splatWorkflowEvent";

    [Column("id")]
    [PrimaryKeyColumn(AutoIncrement = true)]
    public long Id { get; set; }

    [Column("instanceId")]
    public long InstanceId { get; set; }

    [Column("eventType")]
    public byte EventType { get; set; }

    [Column("fromStepKey")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? FromStepKey { get; set; }

    [Column("toStepKey")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? ToStepKey { get; set; }

    [Column("actionKey")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? ActionKey { get; set; }

    [Column("payloadJson")]
    [NullSetting(NullSetting = NullSettings.Null)]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    public string? PayloadJson { get; set; }

    [Column("actorUsername")]
    public string ActorUsername { get; set; } = string.Empty;

    [Column("occurredAt")]
    public DateTime OccurredAt { get; set; }
}
