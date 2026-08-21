using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Plugins.Newsletter.Models;

[TableName(Subscriber.TableName)]
[PrimaryKey("id", AutoIncrement = true)]
[ExplicitColumns]
public class Subscriber
{
    public const string TableName = "splatdev_newsletter_subscribers";

    [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
    [Column("id")]
    public int Id { get; set; }

    [Column("list_id")]
    public int ListId { get; set; }

    [Column("email")]
    [Length(320)]
    public string Email { get; set; } = string.Empty;

    [Column("name")]
    [Length(200)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string? Name { get; set; }

    [Column("active")]
    public bool Active { get; set; } = true;

    /// <summary>Optional link to an Umbraco member key.</summary>
    [Column("member_key")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public Guid? MemberKey { get; set; }

    [Column("subscribed_at")]
    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;

    [Column("unsubscribed_at")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public DateTime? UnsubscribedAt { get; set; }
}
