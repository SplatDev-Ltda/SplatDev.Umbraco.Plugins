using System.Text.Json.Serialization;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Models;

/// <summary>
/// Inbound webhook envelope. Meta batches changes, so a single POST can carry several
/// entries, each with several changes, each with both messages and statuses.
/// </summary>
public class WebhookPayload
{
    [JsonPropertyName("object")]
    public string? Object { get; set; }

    [JsonPropertyName("entry")]
    public List<WebhookEntry>? Entry { get; set; }
}

public class WebhookEntry
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("changes")]
    public List<WebhookChange>? Changes { get; set; }
}

public class WebhookChange
{
    [JsonPropertyName("field")]
    public string? Field { get; set; }

    [JsonPropertyName("value")]
    public WebhookValue? Value { get; set; }
}

public class WebhookValue
{
    [JsonPropertyName("messaging_product")]
    public string? MessagingProduct { get; set; }

    [JsonPropertyName("metadata")]
    public WebhookMetadata? Metadata { get; set; }

    [JsonPropertyName("contacts")]
    public List<WebhookContact>? Contacts { get; set; }

    [JsonPropertyName("messages")]
    public List<WebhookMessage>? Messages { get; set; }

    [JsonPropertyName("statuses")]
    public List<WebhookStatus>? Statuses { get; set; }
}

public class WebhookMetadata
{
    [JsonPropertyName("display_phone_number")]
    public string? DisplayPhoneNumber { get; set; }

    [JsonPropertyName("phone_number_id")]
    public string? PhoneNumberId { get; set; }
}

public class WebhookContact
{
    [JsonPropertyName("wa_id")]
    public string? WaId { get; set; }

    [JsonPropertyName("profile")]
    public WebhookProfile? Profile { get; set; }
}

public class WebhookProfile
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }
}

public class WebhookMessage
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("from")]
    public string? From { get; set; }

    /// <summary>Unix seconds, delivered as a string.</summary>
    [JsonPropertyName("timestamp")]
    public string? Timestamp { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("text")]
    public WebhookText? Text { get; set; }

    [JsonPropertyName("button")]
    public WebhookButton? Button { get; set; }

    [JsonPropertyName("interactive")]
    public WebhookInteractive? Interactive { get; set; }

    /// <summary>
    /// Best-effort human-readable rendering. Non-text types (image, audio, document, location…)
    /// have no body, so the type is surfaced in brackets rather than showing a blank row.
    /// </summary>
    public string ToDisplayText() => Type switch
    {
        "text" => Text?.Body ?? string.Empty,
        "button" => Button?.Text ?? "[button reply]",
        "interactive" => Interactive?.ButtonReply?.Title
                         ?? Interactive?.ListReply?.Title
                         ?? "[interactive reply]",
        null => string.Empty,
        _ => $"[{Type}]",
    };
}

public class WebhookText
{
    [JsonPropertyName("body")]
    public string? Body { get; set; }
}

public class WebhookButton
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }

    [JsonPropertyName("payload")]
    public string? Payload { get; set; }
}

public class WebhookInteractive
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("button_reply")]
    public WebhookReply? ButtonReply { get; set; }

    [JsonPropertyName("list_reply")]
    public WebhookReply? ListReply { get; set; }
}

public class WebhookReply
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }
}

public class WebhookStatus
{
    /// <summary>The <c>wamid.*</c> of the outbound message this status refers to.</summary>
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    /// <summary>sent | delivered | read | failed</summary>
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("timestamp")]
    public string? Timestamp { get; set; }

    [JsonPropertyName("recipient_id")]
    public string? RecipientId { get; set; }

    [JsonPropertyName("errors")]
    public List<WebhookStatusError>? Errors { get; set; }
}

public class WebhookStatusError
{
    [JsonPropertyName("code")]
    public int? Code { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }
}
