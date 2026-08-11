using System.Text.Json.Serialization;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Models;

/// <summary>Outcome of a send attempt. <see cref="Success"/> only means Meta accepted it.</summary>
public class SendResult
{
    public bool Success { get; set; }

    /// <summary>The <c>wamid.*</c> identifier, present when accepted.</summary>
    public string? MessageId { get; set; }

    /// <summary>Human-readable failure reason, unwrapped from the Graph error envelope.</summary>
    public string? Error { get; set; }

    /// <summary>Meta's numeric error code, useful for support tickets.</summary>
    public int? ErrorCode { get; set; }

    public static SendResult Ok(string messageId) => new() { Success = true, MessageId = messageId };

    public static SendResult Fail(string error, int? code = null) =>
        new() { Success = false, Error = error, ErrorCode = code };
}

/// <summary>An approved (or pending) message template on the WABA.</summary>
public class MessageTemplate
{
    public string Name { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    /// <summary>Body text as authored, with <c>{{1}}</c>-style placeholders left intact.</summary>
    public string? BodyText { get; set; }

    /// <summary>
    /// Number of positional variables in the body, derived from the body text. Drives how many
    /// input boxes the dashboard renders.
    /// </summary>
    public int VariableCount { get; set; }

    public bool IsUsable => string.Equals(Status, "APPROVED", StringComparison.OrdinalIgnoreCase);
}

/// <summary>Health and identity of the sending phone number.</summary>
public class PhoneNumberStatus
{
    public string? DisplayPhoneNumber { get; set; }

    public string? VerifiedName { get; set; }

    public string? QualityRating { get; set; }

    public string? PlatformType { get; set; }

    public string? CodeVerificationStatus { get; set; }

    /// <summary>Webhook override currently registered for this number, if any.</summary>
    public string? WebhookUrl { get; set; }
}

/// <summary>A conversation summary for the inbox list.</summary>
public class ConversationSummary
{
    public int Id { get; set; }

    public string WaId { get; set; } = string.Empty;

    public string? ProfileName { get; set; }

    public string? LastMessagePreview { get; set; }

    public DateTime? LastMessageUtc { get; set; }

    public DateTime? LastInboundUtc { get; set; }

    public int UnreadCount { get; set; }

    /// <summary>
    /// Whether a free-form reply is currently allowed. Outside the window only an approved
    /// template may be sent, so the dashboard disables the reply box.
    /// </summary>
    public bool WindowOpen { get; set; }

    /// <summary>Minutes left in the customer-service window; zero when closed.</summary>
    public int WindowMinutesRemaining { get; set; }
}

/// <summary>A single message in a thread.</summary>
public class MessageView
{
    public int Id { get; set; }

    public string? WhatsAppMessageId { get; set; }

    public bool Inbound { get; set; }

    public string MessageType { get; set; } = "text";

    public string? Body { get; set; }

    public string? TemplateName { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? ErrorMessage { get; set; }

    public DateTime TimestampUtc { get; set; }
}

// ── Graph API wire shapes ────────────────────────────────────────────────────
// Only the fields actually consumed are modelled; Meta adds fields freely and
// deserialization must not break when it does.

internal sealed class GraphErrorEnvelope
{
    [JsonPropertyName("error")]
    public GraphError? Error { get; set; }
}

internal sealed class GraphError
{
    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("code")]
    public int? Code { get; set; }

    [JsonPropertyName("error_user_msg")]
    public string? UserMessage { get; set; }
}

internal sealed class SendResponse
{
    [JsonPropertyName("messages")]
    public List<SentMessageRef>? Messages { get; set; }
}

internal sealed class SentMessageRef
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }
}

internal sealed class TemplateListResponse
{
    [JsonPropertyName("data")]
    public List<TemplateDto>? Data { get; set; }
}

internal sealed class TemplateDto
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("language")]
    public string? Language { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("category")]
    public string? Category { get; set; }

    [JsonPropertyName("components")]
    public List<TemplateComponentDto>? Components { get; set; }
}

internal sealed class TemplateComponentDto
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("text")]
    public string? Text { get; set; }
}

internal sealed class PhoneNumberDto
{
    [JsonPropertyName("display_phone_number")]
    public string? DisplayPhoneNumber { get; set; }

    [JsonPropertyName("verified_name")]
    public string? VerifiedName { get; set; }

    [JsonPropertyName("quality_rating")]
    public string? QualityRating { get; set; }

    [JsonPropertyName("platform_type")]
    public string? PlatformType { get; set; }

    [JsonPropertyName("code_verification_status")]
    public string? CodeVerificationStatus { get; set; }

    [JsonPropertyName("webhook_configuration")]
    public WebhookConfigurationDto? WebhookConfiguration { get; set; }
}

internal sealed class WebhookConfigurationDto
{
    [JsonPropertyName("application")]
    public string? Application { get; set; }
}
