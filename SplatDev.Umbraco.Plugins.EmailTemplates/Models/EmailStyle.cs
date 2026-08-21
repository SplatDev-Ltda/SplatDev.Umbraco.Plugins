using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Plugins.EmailTemplates.Models;

/// <summary>
/// Singleton style configuration stored as a single row (id = 1).
/// </summary>
[TableName(EmailStyle.TableName)]
[PrimaryKey("id", AutoIncrement = false)]
[ExplicitColumns]
public class EmailStyle
{
    public const string TableName = "splatdev_email_style";

    /// <summary>Always 1 — this is a singleton row.</summary>
    [PrimaryKeyColumn(AutoIncrement = false)]
    [Column("id")]
    public int Id { get; set; } = 1;

    [Column("header_html")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? HeaderHtml { get; set; }

    [Column("footer_html")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? FooterHtml { get; set; }

    [Column("global_css")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? GlobalCss { get; set; }

    [Column("logo_url")]
    [Length(1000)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? LogoUrl { get; set; }

    [Column("primary_color")]
    [Length(20)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? PrimaryColor { get; set; }

    [Column("company_name")]
    [Length(200)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? CompanyName { get; set; }

    [Column("updated_at")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public DateTime? UpdatedAt { get; set; }
}
