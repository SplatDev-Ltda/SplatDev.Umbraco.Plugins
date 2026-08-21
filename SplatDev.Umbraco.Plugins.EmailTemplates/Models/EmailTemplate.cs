using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Plugins.EmailTemplates.Models;

[TableName(EmailTemplate.TableName)]
[PrimaryKey("id", AutoIncrement = true)]
[ExplicitColumns]
public class EmailTemplate
{
    public const string TableName = "splatdev_email_templates";

    [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [Length(200)]
    public string Name { get; set; } = string.Empty;

    [Column("subject")]
    [Length(500)]
    public string Subject { get; set; } = string.Empty;

    [Column("html_body")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    public string HtmlBody { get; set; } = string.Empty;

    [Column("text_body")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? TextBody { get; set; }

    /// <summary>
    /// Comma-separated variable names declared for this template (e.g. "MemberName,ContractRef").
    /// </summary>
    [Column("variables")]
    [Length(2000)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? Variables { get; set; }

    /// <summary>transactional or newsletter</summary>
    [Column("category")]
    [Length(50)]
    public string Category { get; set; } = "transactional";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public DateTime? UpdatedAt { get; set; }

    // Helpers — not mapped
    [Ignore]
    public List<string> VariableList
    {
        get => string.IsNullOrWhiteSpace(Variables)
            ? []
            : [.. Variables.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)];
        set => Variables = value.Count == 0 ? null : string.Join(',', value);
    }
}
