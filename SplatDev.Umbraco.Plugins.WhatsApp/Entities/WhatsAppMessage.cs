using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Entities;

/// <summary>A single sent or received message.</summary>
public class WhatsAppMessage
{
    [Key]
    public int Id { get; set; }

    public int ConversationId { get; set; }

    /// <summary>
    /// Meta's <c>wamid.*</c>. Unique when present, which is what makes webhook processing
    /// idempotent — Meta retries deliveries and will resend the same message.
    /// </summary>
    [MaxLength(128)]
    public string? WhatsAppMessageId { get; set; }

    /// <summary>True when received from the user, false when sent by the business.</summary>
    public bool Inbound { get; set; }

    [MaxLength(32)]
    public string MessageType { get; set; } = "text";

    public string? Body { get; set; }

    /// <summary>Template used, for outbound template sends.</summary>
    [MaxLength(256)]
    public string? TemplateName { get; set; }

    /// <summary>received | accepted | sent | delivered | read | failed</summary>
    [MaxLength(32)]
    public string Status { get; set; } = "accepted";

    public string? ErrorMessage { get; set; }

    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
}
