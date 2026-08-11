using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Entities;

/// <summary>One thread with one WhatsApp user, keyed by their <c>wa_id</c>.</summary>
public class WhatsAppConversation
{
    [Key]
    public int Id { get; set; }

    /// <summary>The user's WhatsApp ID — their phone number in E.164 without the leading '+'.</summary>
    [MaxLength(32)]
    public string WaId { get; set; } = string.Empty;

    /// <summary>Display name from the WhatsApp profile. Absent until they message in.</summary>
    [MaxLength(256)]
    public string? ProfileName { get; set; }

    /// <summary>
    /// When the user last messaged in. This — not the last outbound message — is what opens
    /// the 24-hour customer-service window.
    /// </summary>
    public DateTime? LastInboundUtc { get; set; }

    /// <summary>Timestamp of the most recent message in either direction, for inbox ordering.</summary>
    public DateTime? LastMessageUtc { get; set; }

    /// <summary>Inbound messages not yet opened in the backoffice.</summary>
    public int UnreadCount { get; set; }

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
