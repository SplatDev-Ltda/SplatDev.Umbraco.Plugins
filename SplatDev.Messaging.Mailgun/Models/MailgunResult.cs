namespace SplatDev.Messaging.Mailgun.Models;

public class MailgunResult
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? MessageId { get; set; }

    public int StatusCode { get; set; }
}
