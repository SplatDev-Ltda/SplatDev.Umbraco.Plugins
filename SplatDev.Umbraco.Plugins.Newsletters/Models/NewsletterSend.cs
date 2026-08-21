namespace SplatDev.Umbraco.Plugins.Newsletters.Models;

public class NewsletterSend
{
    public int Id { get; set; }
    public int CampaignId { get; set; }
    public int SubscriberId { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsOpened { get; set; }
    public DateTime? OpenedAt { get; set; }

    public NewsletterCampaign? Campaign { get; set; }
    public NewsletterSubscriber? Subscriber { get; set; }
}
