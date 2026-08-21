namespace SplatDev.Umbraco.Plugins.EmailNotifications.Models;

public enum CampaignStatus
{
    Draft = 0,
    Scheduled = 1,
    Sending = 2,
    Sent = 3,
    Failed = 4,
    Cancelled = 5
}

public class Campaign
{
    public int Id { get; set; }
    public int? TemplateId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? ListId { get; set; }
    public CampaignStatus Status { get; set; } = CampaignStatus.Draft;
    public DateTime? SendAt { get; set; }
    public DateTime? SentAt { get; set; }
    public int RecipientCount { get; set; }
    public int SentCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public EmailTemplate? Template { get; set; }
}
