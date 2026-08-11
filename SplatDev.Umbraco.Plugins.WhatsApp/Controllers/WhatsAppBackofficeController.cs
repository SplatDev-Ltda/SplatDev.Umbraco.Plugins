using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.WhatsApp.Models;
using SplatDev.Umbraco.Plugins.WhatsApp.Services;

using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Controllers;

/// <summary>
/// Backing API for the WhatsApp backoffice dashboard. Backoffice users only —
/// anonymous callers get 401 rather than a login redirect.
/// </summary>
[ApiController]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/whatsapp/api/v1")]
[Produces("application/json")]
public class WhatsAppBackofficeController : ControllerBase
{
    private readonly IWhatsAppClient _client;
    private readonly IWhatsAppStore _store;
    private readonly IDashboardPresence _presence;
    private readonly WhatsAppOptions _options;

    public WhatsAppBackofficeController(
        IWhatsAppClient client,
        IWhatsAppStore store,
        IDashboardPresence presence,
        IOptions<WhatsAppOptions> options)
    {
        _client = client;
        _store = store;
        _presence = presence;
        _options = options.Value;
    }

    /// <summary>
    /// Called periodically while the inbox is open, so an inbound message can tell
    /// whether anyone is watching before emailing an administrator.
    /// </summary>
    [HttpPost("heartbeat")]
    public IActionResult Heartbeat()
    {
        _presence.Heartbeat();
        return NoContent();
    }

    /// <summary>Configuration state, so the dashboard can guide setup instead of failing blankly.</summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken ct)
    {
        var phone = await _client.GetPhoneNumberStatusAsync(ct).ConfigureAwait(false);

        return Ok(new
        {
            configured = _options.IsConfigured,
            webhookConfigured = !string.IsNullOrWhiteSpace(_options.WebhookVerifyToken),
            signatureValidation = !string.IsNullOrWhiteSpace(_options.AppSecret),
            phoneNumberId = _options.PhoneNumberId,
            businessAccountId = _options.BusinessAccountId,
            windowHours = _options.CustomerServiceWindowHours,
            webhookPath = "/umbraco/whatsapp/webhook",
            notificationsEnabled = _options.NotificationsEnabled,
            notificationEmail = _options.NotificationEmail,
            dashboardIdleMinutes = _options.DashboardIdleMinutes,
            notificationCooldownMinutes = _options.NotificationCooldownMinutes,
            dashboardLastSeenUtc = _presence.LastSeenUtc,
            phone,
        });
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations([FromQuery] int take = 100, CancellationToken ct = default)
    {
        var conversations = await _store.GetConversationsAsync(take, ct).ConfigureAwait(false);
        return Ok(conversations);
    }

    [HttpGet("conversations/{id:int}/messages")]
    public async Task<IActionResult> GetMessages(int id, [FromQuery] int take = 200, CancellationToken ct = default)
    {
        var conversation = await _store.GetConversationAsync(id, ct).ConfigureAwait(false);
        if (conversation is null)
        {
            return NotFound();
        }

        var messages = await _store.GetMessagesAsync(id, take, ct).ConfigureAwait(false);

        return Ok(new { conversation, messages });
    }

    /// <summary>Clears the unread badge. Mutating, so it must not be a GET.</summary>
    [HttpPost("conversations/{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id, CancellationToken ct)
    {
        var conversation = await _store.GetConversationAsync(id, ct).ConfigureAwait(false);
        if (conversation is null)
        {
            return NotFound();
        }

        await _store.MarkReadAsync(id, ct).ConfigureAwait(false);
        return NoContent();
    }

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates(CancellationToken ct)
    {
        var templates = await _client.GetTemplatesAsync(ct).ConfigureAwait(false);
        return Ok(templates);
    }

    /// <summary>Sends a free-form text message. Only valid inside the 24-hour window.</summary>
    [HttpPost("send/text")]
    public async Task<IActionResult> SendText([FromBody] SendTextRequest request, CancellationToken ct)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.To))
        {
            return BadRequest(new { error = "A recipient number is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Body))
        {
            return BadRequest(new { error = "Message body is required." });
        }

        var waId = WhatsAppClient.NormalizeRecipient(request.To);
        var result = await _client.SendTextAsync(waId, request.Body, ct).ConfigureAwait(false);

        // Failures are recorded too — an operator needs to see that a send was attempted
        // and why it did not land, not just an empty thread.
        await _store.RecordOutboundAsync(
            waId,
            result.MessageId,
            "text",
            request.Body,
            templateName: null,
            status: result.Success ? "accepted" : "failed",
            errorMessage: result.Error,
            ct).ConfigureAwait(false);

        return result.Success
            ? Ok(new { messageId = result.MessageId })
            : BadRequest(new { error = result.Error, code = result.ErrorCode });
    }

    /// <summary>Sends an approved template. Valid outside the window and on first contact.</summary>
    [HttpPost("send/template")]
    public async Task<IActionResult> SendTemplate([FromBody] SendTemplateRequest request, CancellationToken ct)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.To))
        {
            return BadRequest(new { error = "A recipient number is required." });
        }

        if (string.IsNullOrWhiteSpace(request.TemplateName))
        {
            return BadRequest(new { error = "A template name is required." });
        }

        var waId = WhatsAppClient.NormalizeRecipient(request.To);
        var language = string.IsNullOrWhiteSpace(request.Language) ? "en_US" : request.Language;

        var result = await _client
            .SendTemplateAsync(waId, request.TemplateName, language, request.Variables, ct)
            .ConfigureAwait(false);

        var preview = request.Variables is { Count: > 0 }
            ? $"{request.TemplateName} ({string.Join(", ", request.Variables)})"
            : request.TemplateName;

        await _store.RecordOutboundAsync(
            waId,
            result.MessageId,
            "template",
            preview,
            request.TemplateName,
            status: result.Success ? "accepted" : "failed",
            errorMessage: result.Error,
            ct).ConfigureAwait(false);

        return result.Success
            ? Ok(new { messageId = result.MessageId })
            : BadRequest(new { error = result.Error, code = result.ErrorCode });
    }
    // ---- contacts ---------------------------------------------------------------
    // Operator-maintained names for numbers. Kept apart from conversations so a contact
    // can exist before anyone has messaged in, and so clearing a thread never loses a name.

    [HttpGet("contacts")]
    public async Task<IActionResult> GetContacts([FromQuery] string? search, CancellationToken ct)
        => Ok(await _store.GetContactsAsync(search, 200, ct).ConfigureAwait(false));

    [HttpGet("contacts/by-wa-id/{waId}")]
    public async Task<IActionResult> GetContactByWaId(string waId, CancellationToken ct)
    {
        var contact = await _store.GetContactByWaIdAsync(waId, ct).ConfigureAwait(false);

        // 204 rather than 404: "this number has no contact yet" is the normal case for
        // every new conversation, and the dashboard should not treat it as an error.
        return contact is null ? NoContent() : Ok(contact);
    }

    /// <summary>Creates or updates the contact for a number.</summary>
    [HttpPost("contacts")]
    public async Task<IActionResult> UpsertContact(
        [FromBody] ContactUpsert input, CancellationToken ct)
    {
        if (input is null || string.IsNullOrWhiteSpace(input.WaId))
        {
            return BadRequest(new { error = "A WhatsApp number is required." });
        }

        var saved = await _store.UpsertContactAsync(input, ct).ConfigureAwait(false);
        return saved is null
            ? BadRequest(new { error = "That WhatsApp number contains no digits." })
            : Ok(saved);
    }

    [HttpDelete("contacts/{id:int}")]
    public async Task<IActionResult> DeleteContact(int id, CancellationToken ct)
        => await _store.DeleteContactAsync(id, ct).ConfigureAwait(false)
            ? NoContent()
            : NotFound();

}

public class SendTextRequest
{
    public string To { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;
}

public class SendTemplateRequest
{
    public string To { get; set; } = string.Empty;

    public string TemplateName { get; set; } = string.Empty;

    public string Language { get; set; } = "en_US";

    public List<string>? Variables { get; set; }
}
