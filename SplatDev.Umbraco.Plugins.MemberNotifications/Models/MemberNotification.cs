using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Models;

[TableName(MemberNotification.TableName)]
[PrimaryKey("id", AutoIncrement = true)]
[ExplicitColumns]
public class MemberNotification
{
    public const string TableName = "splatdev_notifications";

    [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
    [Column("id")]
    public int Id { get; set; }

    [Column("member_key")]
    public Guid MemberKey { get; set; }

    /// <summary>contract | payment | system | newsletter</summary>
    [Column("type")]
    [Length(50)]
    public string Type { get; set; } = "system";

    [Column("title")]
    [Length(300)]
    public string Title { get; set; } = string.Empty;

    [Column("body")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    public string Body { get; set; } = string.Empty;

    [Column("read_at")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public DateTime? ReadAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Optional JSON payload for notification-specific data.</summary>
    [Column("data_json")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? DataJson { get; set; }
}
