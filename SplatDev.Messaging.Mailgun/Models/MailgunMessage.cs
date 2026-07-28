namespace SplatDev.Messaging.Mailgun.Models;

public class MailgunMessage
{
    public string From { get; set; } = string.Empty;

    public string To { get; set; } = string.Empty;

    public string? Cc { get; set; }

    public string? Bcc { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string? Text { get; set; }

    public string? Html { get; set; }
}
