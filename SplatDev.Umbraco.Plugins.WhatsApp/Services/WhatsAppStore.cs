using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.WhatsApp.Entities;
using SplatDev.Umbraco.Plugins.WhatsApp.Migrations;
using SplatDev.Umbraco.Plugins.WhatsApp.Models;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <inheritdoc />
public class WhatsAppStore : IWhatsAppStore
{
    private readonly IDbContextFactory<WhatsAppDbContext> _factory;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<WhatsAppStore> _logger;

    public WhatsAppStore(
        IDbContextFactory<WhatsAppDbContext> factory,
        IOptions<WhatsAppOptions> options,
        ILogger<WhatsAppStore> logger)
    {
        _factory = factory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyList<ConversationSummary>> GetConversationsAsync(
        int take = 100, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var conversations = await db.Conversations
            .OrderByDescending(c => c.LastMessageUtc ?? c.CreatedUtc)
            .Take(Math.Clamp(take, 1, 500))
            .ToListAsync(ct)
            .ConfigureAwait(false);

        var ids = conversations.Select(c => c.Id).ToList();

        // Pull the newest message per conversation in one round trip rather than
        // querying inside the projection loop.
        var previews = await db.Messages
            .Where(m => ids.Contains(m.ConversationId))
            .GroupBy(m => m.ConversationId)
            .Select(g => new
            {
                ConversationId = g.Key,
                Body = g.OrderByDescending(m => m.TimestampUtc).Select(m => m.Body).FirstOrDefault(),
            })
            .ToDictionaryAsync(x => x.ConversationId, x => x.Body, ct)
            .ConfigureAwait(false);

        // Resolve operator-maintained names in the same pass. One query keyed by wa_id
        // rather than a lookup per row.
        var waIds = conversations.Select(c => c.WaId).ToList();
        var names = await db.Contacts
            .Where(x => waIds.Contains(x.WaId) && x.DisplayName != null && x.DisplayName != "")
            .ToDictionaryAsync(x => x.WaId, x => x.DisplayName, ct)
            .ConfigureAwait(false);

        var now = DateTime.UtcNow;
        return conversations
            .Select(c =>
            {
                var summary = ToSummary(c, previews.GetValueOrDefault(c.Id), now);
                summary.ContactName = names.GetValueOrDefault(c.WaId);
                return summary;
            })
            .ToList();
    }

    public async Task<ConversationSummary?> GetConversationAsync(int id, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            .ConfigureAwait(false);

        if (conversation is null)
        {
            return null;
        }

        var preview = await db.Messages
            .Where(m => m.ConversationId == id)
            .OrderByDescending(m => m.TimestampUtc)
            .Select(m => m.Body)
            .FirstOrDefaultAsync(ct)
            .ConfigureAwait(false);

        return ToSummary(conversation, preview, DateTime.UtcNow);
    }

    public async Task<IReadOnlyList<MessageView>> GetMessagesAsync(
        int conversationId, int take = 200, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        // Newest N, then flipped back to chronological order for display.
        var messages = await db.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.TimestampUtc)
            .Take(Math.Clamp(take, 1, 1000))
            .ToListAsync(ct)
            .ConfigureAwait(false);

        return messages
            .OrderBy(m => m.TimestampUtc)
            .Select(m => new MessageView
            {
                Id = m.Id,
                WhatsAppMessageId = m.WhatsAppMessageId,
                Inbound = m.Inbound,
                MessageType = m.MessageType,
                Body = m.Body,
                TemplateName = m.TemplateName,
                Status = m.Status,
                ErrorMessage = m.ErrorMessage,
                TimestampUtc = m.TimestampUtc,
            })
            .ToList();
    }

    public async Task<bool> RecordInboundAsync(
        string waId,
        string? profileName,
        WebhookMessage message,
        CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        if (!string.IsNullOrEmpty(message.Id))
        {
            var exists = await db.Messages
                .AnyAsync(m => m.WhatsAppMessageId == message.Id, ct)
                .ConfigureAwait(false);

            if (exists)
            {
                // Meta retries until it gets a 200, so duplicates are expected, not an error.
                _logger.LogDebug("Ignoring duplicate inbound WhatsApp message {MessageId}.", message.Id);
                return false;
            }
        }

        var timestamp = ParseTimestamp(message.Timestamp);
        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.WaId == waId, ct)
            .ConfigureAwait(false);

        if (conversation is null)
        {
            conversation = new WhatsAppConversation { WaId = waId, ProfileName = profileName };
            db.Conversations.Add(conversation);
            await db.SaveChangesAsync(ct).ConfigureAwait(false);
        }
        else if (!string.IsNullOrWhiteSpace(profileName) && conversation.ProfileName != profileName)
        {
            conversation.ProfileName = profileName;
        }

        conversation.LastInboundUtc = timestamp;
        conversation.LastMessageUtc = timestamp;
        conversation.UnreadCount += 1;

        db.Messages.Add(new WhatsAppMessage
        {
            ConversationId = conversation.Id,
            WhatsAppMessageId = message.Id,
            Inbound = true,
            MessageType = message.Type ?? "text",
            Body = message.ToDisplayText(),
            Status = "received",
            TimestampUtc = timestamp,
        });

        try
        {
            await db.SaveChangesAsync(ct).ConfigureAwait(false);
        }
        catch (DbUpdateException ex)
        {
            // Concurrent deliveries of the same wamid race past the check above and land
            // on the unique index. That is still a duplicate, not a failure.
            _logger.LogDebug(ex, "Inbound WhatsApp message {MessageId} already stored.", message.Id);
            return false;
        }

        return true;
    }

    public async Task RecordOutboundAsync(
        string waId,
        string? whatsAppMessageId,
        string messageType,
        string? body,
        string? templateName,
        string status,
        string? errorMessage,
        CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var now = DateTime.UtcNow;
        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.WaId == waId, ct)
            .ConfigureAwait(false);

        if (conversation is null)
        {
            conversation = new WhatsAppConversation { WaId = waId };
            db.Conversations.Add(conversation);
            await db.SaveChangesAsync(ct).ConfigureAwait(false);
        }

        // Outbound activity must not extend the customer-service window — only an inbound
        // message does that — so LastInboundUtc is deliberately left untouched here.
        conversation.LastMessageUtc = now;

        db.Messages.Add(new WhatsAppMessage
        {
            ConversationId = conversation.Id,
            WhatsAppMessageId = whatsAppMessageId,
            Inbound = false,
            MessageType = messageType,
            Body = body,
            TemplateName = templateName,
            Status = status,
            ErrorMessage = errorMessage,
            TimestampUtc = now,
        });

        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task ApplyStatusAsync(WebhookStatus status, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(status.Id) || string.IsNullOrEmpty(status.Status))
        {
            return;
        }

        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var message = await db.Messages
            .FirstOrDefaultAsync(m => m.WhatsAppMessageId == status.Id, ct)
            .ConfigureAwait(false);

        if (message is null)
        {
            _logger.LogDebug("Status webhook for unknown message {MessageId}.", status.Id);
            return;
        }

        // Statuses can arrive out of order; never walk a message backwards from read to sent.
        if (Rank(status.Status) < Rank(message.Status))
        {
            return;
        }

        message.Status = status.Status!;

        var error = status.Errors?.FirstOrDefault();
        if (error is not null)
        {
            message.ErrorMessage = error.Message ?? error.Title;
        }

        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task MarkReadAsync(int conversationId, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId, ct)
            .ConfigureAwait(false);

        if (conversation is null || conversation.UnreadCount == 0)
        {
            return;
        }

        conversation.UnreadCount = 0;
        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    private ConversationSummary ToSummary(WhatsAppConversation c, string? preview, DateTime now)
    {
        var remaining = WindowMinutesRemaining(c.LastInboundUtc, now, _options.CustomerServiceWindowHours);

        return new ConversationSummary
        {
            Id = c.Id,
            WaId = c.WaId,
            ProfileName = c.ProfileName,
            LastMessagePreview = preview,
            LastMessageUtc = c.LastMessageUtc,
            LastInboundUtc = c.LastInboundUtc,
            UnreadCount = c.UnreadCount,
            WindowOpen = remaining > 0,
            WindowMinutesRemaining = remaining,
        };
    }

    /// <summary>
    /// Minutes left before the customer-service window closes. Zero when the user has never
    /// messaged in, or when the window has already expired.
    /// </summary>
    internal static int WindowMinutesRemaining(DateTime? lastInboundUtc, DateTime nowUtc, int windowHours)
    {
        if (lastInboundUtc is null)
        {
            return 0;
        }

        var closesAt = lastInboundUtc.Value.AddHours(windowHours);
        var remaining = closesAt - nowUtc;

        return remaining <= TimeSpan.Zero ? 0 : (int)Math.Ceiling(remaining.TotalMinutes);
    }

    /// <summary>Orders status values so a late-arriving earlier status cannot overwrite a later one.</summary>
    private static int Rank(string? status) => status?.ToLowerInvariant() switch
    {
        "accepted" => 0,
        "sent" => 1,
        "delivered" => 2,
        "read" => 3,
        // Failure is terminal and must always win, whenever it arrives.
        "failed" => 4,
        _ => 0,
    };

    private static DateTime ParseTimestamp(string? unixSeconds) =>
        long.TryParse(unixSeconds, out var seconds)
            ? DateTimeOffset.FromUnixTimeSeconds(seconds).UtcDateTime
            : DateTime.UtcNow;

    public async Task<IReadOnlyList<ContactView>> GetContactsAsync(
        string? search = null, int take = 200, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var query = db.Contacts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(c =>
                (c.DisplayName != null && EF.Functions.Like(c.DisplayName, $"%{term}%")) ||
                (c.Company != null && EF.Functions.Like(c.Company, $"%{term}%")) ||
                (c.Email != null && EF.Functions.Like(c.Email, $"%{term}%")) ||
                EF.Functions.Like(c.WaId, $"%{term}%"));
        }

        var contacts = await query
            .OrderBy(c => c.DisplayName ?? c.WaId)
            .Take(Math.Clamp(take, 1, 500))
            .ToListAsync(ct)
            .ConfigureAwait(false);

        // Link each contact to its conversation, when one exists, so the UI can jump to it.
        var waIds = contacts.Select(c => c.WaId).ToList();
        var conversationIds = await db.Conversations
            .Where(c => waIds.Contains(c.WaId))
            .ToDictionaryAsync(c => c.WaId, c => c.Id, ct)
            .ConfigureAwait(false);

        return contacts.Select(c => ToContactView(c, conversationIds.GetValueOrDefault(c.WaId))).ToList();
    }

    public async Task<ContactView?> GetContactByWaIdAsync(string waId, CancellationToken ct = default)
    {
        var normalized = NormaliseWaId(waId);
        if (normalized.Length == 0)
        {
            return null;
        }

        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var contact = await db.Contacts
            .FirstOrDefaultAsync(c => c.WaId == normalized, ct)
            .ConfigureAwait(false);

        if (contact is null)
        {
            return null;
        }

        var conversationId = await db.Conversations
            .Where(c => c.WaId == normalized)
            .Select(c => (int?)c.Id)
            .FirstOrDefaultAsync(ct)
            .ConfigureAwait(false);

        return ToContactView(contact, conversationId);
    }

    /// <summary>
    /// Creates or updates the contact for a number. Upsert rather than separate create and
    /// update, because the caller is usually naming a conversation and neither knows nor
    /// cares whether a row already exists.
    /// </summary>
    public async Task<ContactView?> UpsertContactAsync(ContactUpsert input, CancellationToken ct = default)
    {
        var normalized = NormaliseWaId(input.WaId);
        if (normalized.Length == 0)
        {
            return null;
        }

        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var now = DateTime.UtcNow;
        var contact = await db.Contacts
            .FirstOrDefaultAsync(c => c.WaId == normalized, ct)
            .ConfigureAwait(false);

        if (contact is null)
        {
            contact = new WhatsAppContact { WaId = normalized, CreatedUtc = now };
            db.Contacts.Add(contact);
        }

        contact.DisplayName = Trim(input.DisplayName, 256);
        contact.Company = Trim(input.Company, 256);
        contact.Email = Trim(input.Email, 320);
        contact.Notes = Trim(input.Notes, 4000);
        contact.UpdatedUtc = now;

        await db.SaveChangesAsync(ct).ConfigureAwait(false);

        var conversationId = await db.Conversations
            .Where(c => c.WaId == normalized)
            .Select(c => (int?)c.Id)
            .FirstOrDefaultAsync(ct)
            .ConfigureAwait(false);

        return ToContactView(contact, conversationId);
    }

    public async Task<bool> DeleteContactAsync(int id, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var contact = await db.Contacts.FirstOrDefaultAsync(c => c.Id == id, ct).ConfigureAwait(false);
        if (contact is null)
        {
            return false;
        }

        // Deletes the name only. Conversations and messages are untouched, so removing a
        // contact never destroys history.
        db.Contacts.Remove(contact);
        await db.SaveChangesAsync(ct).ConfigureAwait(false);
        return true;
    }

    private static ContactView ToContactView(WhatsAppContact c, int? conversationId) => new()
    {
        Id = c.Id,
        WaId = c.WaId,
        DisplayName = c.DisplayName,
        Company = c.Company,
        Email = c.Email,
        Notes = c.Notes,
        CreatedUtc = c.CreatedUtc,
        UpdatedUtc = c.UpdatedUtc,
        ConversationId = conversationId,
    };

    /// <summary>
    /// wa_id is E.164 digits with no leading '+'. Operators paste numbers with spaces,
    /// brackets and a plus, so strip to digits before it becomes a lookup key — otherwise
    /// "+55 15 9..." and "55159..." would be two different contacts.
    /// </summary>
    private static string NormaliseWaId(string? waId) =>
        new string((waId ?? string.Empty).Where(char.IsDigit).ToArray());

    private static string? Trim(string? value, int max)
    {
        var trimmed = value?.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            return null;
        }

        return trimmed.Length <= max ? trimmed : trimmed[..max];
    }

}
