using System.Text.Json;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.WhatsApp.Models;
using SplatDev.Umbraco.Plugins.WhatsApp.Services;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Controllers;

/// <summary>
/// Public endpoint Meta calls with inbound messages and delivery statuses.
/// </summary>
/// <remarks>
/// Anonymous by necessity — Meta cannot authenticate. Authenticity comes from the
/// <c>X-Hub-Signature-256</c> header instead, which is why configuring
/// <see cref="WhatsAppOptions.AppSecret"/> matters in production.
/// </remarks>
[ApiController]
[AllowAnonymous]
[Route("umbraco/whatsapp/webhook")]
public class WhatsAppWebhookController : ControllerBase
{
    private readonly IWhatsAppStore _store;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<WhatsAppWebhookController> _logger;

    public WhatsAppWebhookController(
        IWhatsAppStore store,
        IOptions<WhatsAppOptions> options,
        ILogger<WhatsAppWebhookController> logger)
    {
        _store = store;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Meta's verification handshake. Called once when the callback URL is registered:
    /// echo back <c>hub.challenge</c> as plain text if the verify token matches.
    /// </summary>
    [HttpGet]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? verifyToken,
        [FromQuery(Name = "hub.challenge")] string? challenge)
    {
        if (string.IsNullOrWhiteSpace(_options.WebhookVerifyToken))
        {
            _logger.LogWarning("WhatsApp webhook verification attempted but no verify token is configured.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable);
        }

        if (!string.Equals(mode, "subscribe", StringComparison.Ordinal) ||
            !string.Equals(verifyToken, _options.WebhookVerifyToken, StringComparison.Ordinal))
        {
            _logger.LogWarning("Rejected WhatsApp webhook verification: token mismatch.");
            return Forbid();
        }

        // Meta requires the raw challenge value, not JSON.
        return Content(challenge ?? string.Empty, "text/plain");
    }

    /// <summary>Receives message and status notifications.</summary>
    [HttpPost]
    public async Task<IActionResult> Receive(CancellationToken ct)
    {
        // The signature is computed over the exact bytes Meta sent, so read the raw body.
        // Re-serializing a bound model would change whitespace and invalidate the hash.
        using var reader = new MemoryStream();
        await Request.Body.CopyToAsync(reader, ct).ConfigureAwait(false);
        var body = reader.ToArray();

        if (!string.IsNullOrWhiteSpace(_options.AppSecret))
        {
            var signature = Request.Headers["X-Hub-Signature-256"].FirstOrDefault();

            if (!WebhookSignatureValidator.IsValid(signature, body, _options.AppSecret))
            {
                _logger.LogWarning("Rejected WhatsApp webhook: invalid X-Hub-Signature-256.");
                return Unauthorized();
            }
        }
        else
        {
            _logger.LogWarning(
                "Accepting an unverified WhatsApp webhook — SplatDev:WhatsApp:AppSecret is not set. " +
                "Configure it before going to production.");
        }

        WebhookPayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<WebhookPayload>(body);
        }
        catch (JsonException ex)
        {
            // Returning 400 would make Meta retry a payload that can never parse.
            _logger.LogError(ex, "Could not parse WhatsApp webhook payload.");
            return Ok();
        }

        if (payload?.Entry is null)
        {
            return Ok();
        }

        try
        {
            await ProcessAsync(payload, ct).ConfigureAwait(false);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            // Meta retries on any non-200. Since the payload parsed, a storage failure would
            // be retried forever, so log it and acknowledge.
            _logger.LogError(ex, "Failed to process a WhatsApp webhook delivery.");
        }

        return Ok();
    }

    private async Task ProcessAsync(WebhookPayload payload, CancellationToken ct)
    {
        foreach (var entry in payload.Entry ?? new List<WebhookEntry>())
        {
            foreach (var change in entry.Changes ?? new List<WebhookChange>())
            {
                var value = change.Value;
                if (value is null)
                {
                    continue;
                }

                foreach (var message in value.Messages ?? new List<WebhookMessage>())
                {
                    var waId = message.From;
                    if (string.IsNullOrWhiteSpace(waId))
                    {
                        continue;
                    }

                    // The profile name lives in a parallel contacts array, matched by wa_id.
                    var profileName = value.Contacts?
                        .FirstOrDefault(c => c.WaId == waId)?
                        .Profile?.Name;

                    await _store.RecordInboundAsync(waId!, profileName, message, ct).ConfigureAwait(false);
                }

                foreach (var status in value.Statuses ?? new List<WebhookStatus>())
                {
                    await _store.ApplyStatusAsync(status, ct).ConfigureAwait(false);
                }
            }
        }
    }
}
