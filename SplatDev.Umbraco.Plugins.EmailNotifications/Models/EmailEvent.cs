namespace SplatDev.Umbraco.Plugins.EmailNotifications.Models;

public enum EmailEventType
{
    Delivered = 0,
    Opened = 1,
    Clicked = 2,
    Bounced = 3,
    Unsubscribed = 4,
    SpamComplaint = 5,
    Failed = 6
}

public class EmailEvent
{
    public int Id { get; set; }
    public string MessageId { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
    public EmailEventType EventType { get; set; }
    public string? Url { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    public string? RawPayload { get; set; }
}
