using SplatDev.Umbraco.Plugins.WhatsApp.Models;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <summary>Persistence and read models for conversations and messages.</summary>
public interface IWhatsAppStore
{
    Task<IReadOnlyList<ConversationSummary>> GetConversationsAsync(
        int take = 100, CancellationToken ct = default);

    Task<ConversationSummary?> GetConversationAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<MessageView>> GetMessagesAsync(
        int conversationId, int take = 200, CancellationToken ct = default);

    /// <summary>Records an inbound message, creating the conversation if it is new.</summary>
    /// <returns>False when the message was already stored (a Meta retry).</returns>
    Task<bool> RecordInboundAsync(
        string waId,
        string? profileName,
        WebhookMessage message,
        CancellationToken ct = default);

    /// <summary>Records a message the business sent.</summary>
    Task RecordOutboundAsync(
        string waId,
        string? whatsAppMessageId,
        string messageType,
        string? body,
        string? templateName,
        string status,
        string? errorMessage,
        CancellationToken ct = default);

    /// <summary>Applies a delivery-status webhook to the matching outbound message.</summary>
    Task ApplyStatusAsync(WebhookStatus status, CancellationToken ct = default);

    /// <summary>Clears the unread badge for a thread.</summary>
    Task MarkReadAsync(int conversationId, CancellationToken ct = default);

    Task<IReadOnlyList<ContactView>> GetContactsAsync(
        string? search = null, int take = 200, CancellationToken ct = default);

    Task<ContactView?> GetContactByWaIdAsync(string waId, CancellationToken ct = default);

    Task<ContactView?> UpsertContactAsync(ContactUpsert input, CancellationToken ct = default);

    Task<bool> DeleteContactAsync(int id, CancellationToken ct = default);

}
