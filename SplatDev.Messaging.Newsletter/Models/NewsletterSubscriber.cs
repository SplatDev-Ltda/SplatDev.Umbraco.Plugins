namespace SplatDev.Messaging.Newsletter.Models;

public sealed class NewsletterSubscriber
{
    public string Id { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Name { get; set; }

    public Dictionary<string, string> CustomFields { get; set; } = [];

    public SubscriberStatus Status { get; set; } = SubscriberStatus.Pending;

    public DateTime? SubscribedAt { get; set; }

    public DateTime? UnsubscribedAt { get; set; }

    public string ListId { get; set; } = string.Empty;
}
