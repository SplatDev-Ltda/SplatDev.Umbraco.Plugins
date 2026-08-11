using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Entities;

/// <summary>
/// An operator-maintained contact record for a WhatsApp number.
/// </summary>
/// <remarks>
/// Separate from <see cref="WhatsAppConversation"/> on purpose. A conversation's
/// <c>ProfileName</c> is whatever WhatsApp sends and cannot be edited — it is absent for
/// anyone who has not set a profile name, and it changes under you when they do. This row
/// is the name your team chose, so it survives that and is the one the inbox prefers.
///
/// Keyed by <c>wa_id</c> rather than by conversation, so a contact can be created before
/// anyone has messaged in and survives a conversation being cleared.
/// </remarks>
public class WhatsAppContact
{
    [Key]
    public int Id { get; set; }

    /// <summary>The contact's WhatsApp ID — E.164 digits without the leading '+'.</summary>
    [MaxLength(32)]
    public string WaId { get; set; } = string.Empty;

    /// <summary>The name your team gave this contact. Preferred over the WhatsApp profile name.</summary>
    [MaxLength(256)]
    public string? DisplayName { get; set; }

    [MaxLength(256)]
    public string? Company { get; set; }

    [MaxLength(320)]
    public string? Email { get; set; }

    /// <summary>Free-form operator notes. Not sent to WhatsApp, never leaves the site.</summary>
    [MaxLength(4000)]
    public string? Notes { get; set; }

    public DateTime CreatedUtc { get; set; }

    public DateTime UpdatedUtc { get; set; }
}
