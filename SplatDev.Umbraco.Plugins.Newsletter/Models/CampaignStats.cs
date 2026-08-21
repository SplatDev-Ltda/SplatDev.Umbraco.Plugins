using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Plugins.Newsletter.Models;

[TableName(CampaignStats.TableName)]
[PrimaryKey("id", AutoIncrement = true)]
[ExplicitColumns]
public class CampaignStats
{
    public const string TableName = "splatdev_newsletter_stats";

    [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
    [Column("id")]
    public int Id { get; set; }

    [Column("campaign_id")]
    public int CampaignId { get; set; }

    [Column("opens")]
    public int Opens { get; set; }

    [Column("clicks")]
    public int Clicks { get; set; }

    [Column("delivered")]
    public int Delivered { get; set; }

    [Column("bounced")]
    public int Bounced { get; set; }

    [Column("fetched_at")]
    public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
}
