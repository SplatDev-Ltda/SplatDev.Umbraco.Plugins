using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Workflow.Persistence.Entities;

[TableName(TableName)]
[PrimaryKey(nameof(Id))]
[ExplicitColumns]
public sealed class WorkflowDefinitionEntity
{
    public const string TableName = "splatWorkflowDefinition";

    [Column("id")]
    [PrimaryKeyColumn(AutoIncrement = true)]
    public int Id { get; set; }

    [Column("key")]
    public string Key { get; set; } = string.Empty;

    [Column("label")]
    public string Label { get; set; } = string.Empty;

    [Column("version")]
    public int Version { get; set; }

    [Column("definitionJson")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    public string DefinitionJson { get; set; } = string.Empty;

    [Column("isActive")]
    public bool IsActive { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;
}
