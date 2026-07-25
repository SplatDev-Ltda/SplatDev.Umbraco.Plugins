namespace SplatDev.Messaging.Newsletter.Models;

public sealed class NewsletterCampaign
{
    public string Id { get; set; } = string.Empty;

    public string ListId { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string FromName { get; set; } = string.Empty;

    public string FromEmail { get; set; } = string.Empty;

    public string BodyHtml { get; set; } = string.Empty;

    public string? BodyPlain { get; set; }

    public DateTime? ScheduledAt { get; set; }

    public bool TrackOpens { get; set; } = true;

    public bool TrackClicks { get; set; } = true;

    public string? TemplateId { get; set; }

    public string? ProviderCampaignId { get; set; }
}
