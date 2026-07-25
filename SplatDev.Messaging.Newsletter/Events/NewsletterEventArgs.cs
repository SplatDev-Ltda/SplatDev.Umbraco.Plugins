namespace SplatDev.Messaging.Newsletter.Events;

using SplatDev.Messaging.Newsletter.Models;

public class NewsletterEventArgs : EventArgs
{
    public string ListId { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? SubscriberId { get; set; }

    public string? CampaignId { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public Dictionary<string, string> Metadata { get; set; } = [];
}

public sealed class SubscribedEventArgs : NewsletterEventArgs;

public sealed class UnsubscribedEventArgs : NewsletterEventArgs;

public sealed class BouncedEventArgs : NewsletterEventArgs
{
    public string? BounceReason { get; set; }
}

public sealed class OpenedEventArgs : NewsletterEventArgs;

public sealed class ClickedEventArgs : NewsletterEventArgs
{
    public string? ClickedUrl { get; set; }
}
