namespace SplatDev.Umbraco.Plugins.Newsletters.Models;

public enum CampaignStatus
{
    Draft = 0,
    Scheduled = 1,
    Sent = 2
}

public class NewsletterCampaign
{
    public int Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string HtmlContent { get; set; } = string.Empty;
    public string PlainTextContent { get; set; } = string.Empty;
    public CampaignStatus Status { get; set; } = CampaignStatus.Draft;
    public DateTime? ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
}
