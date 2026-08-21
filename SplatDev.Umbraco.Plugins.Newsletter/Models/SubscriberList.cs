using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Plugins.Newsletter.Models;

[TableName(SubscriberList.TableName)]
[PrimaryKey("id", AutoIncrement = true)]
[ExplicitColumns]
public class SubscriberList
{
    public const string TableName = "splatdev_newsletter_lists";

    [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [Length(200)]
    public string Name { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
