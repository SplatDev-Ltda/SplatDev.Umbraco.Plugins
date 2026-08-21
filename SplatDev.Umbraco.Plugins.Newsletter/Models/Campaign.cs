using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Plugins.Newsletter.Models;

public enum CampaignStatus { Draft, Scheduled, Sending, Sent }

[TableName(Campaign.TableName)]
[PrimaryKey("id", AutoIncrement = true)]
[ExplicitColumns]
public class Campaign
{
    public const string TableName = "splatdev_newsletter_campaigns";

    [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [Length(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>References EmailTemplate.Id from SplatDev.Umbraco.Plugins.EmailTemplates.</summary>
    [Column("template_id")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public int? TemplateId { get; set; }

    [Column("list_id")]
    public int ListId { get; set; }

    [Column("subject")]
    [Length(500)]
    public string Subject { get; set; } = string.Empty;

    [Column("status")]
    [Length(20)]
    public string Status { get; set; } = nameof(CampaignStatus.Draft);

    [Column("scheduled_at")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public DateTime? ScheduledAt { get; set; }

    [Column("sent_at")]
    [NullSetting(NullSetting = NullSettings.Null)]
    public DateTime? SentAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
