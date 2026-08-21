using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.EmailNotifications.Models;
using SplatDev.Umbraco.Plugins.EmailNotifications.Services;

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Controllers;

[Route("umbraco/api/mailgun")]
public class MailgunWebhookController(
    EmailNotificationsDbContext db,
    MailgunMailProvider mailgunProvider,
    ILogger<MailgunWebhookController> logger) : ControllerBase
{
    private static readonly Dictionary<string, EmailEventType> EventTypeMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["delivered"] = EmailEventType.Delivered,
        ["opened"] = EmailEventType.Opened,
        ["clicked"] = EmailEventType.Clicked,
        ["bounced"] = EmailEventType.Bounced,
        ["failed"] = EmailEventType.Failed,
        ["unsubscribed"] = EmailEventType.Unsubscribed,
        ["complained"] = EmailEventType.SpamComplaint,
    };

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromForm] IFormCollection form, CancellationToken ct)
    {
        var timestamp = form["signature[timestamp]"].FirstOrDefault() ?? string.Empty;
        var token = form["signature[token]"].FirstOrDefault() ?? string.Empty;
        var signature = form["signature[signature]"].FirstOrDefault() ?? string.Empty;

        if (!mailgunProvider.VerifyWebhookSignature(timestamp, token, signature))
        {
            logger.LogWarning("Mailgun webhook signature verification failed.");
            return Unauthorized();
        }

        var eventName = form["event-data[event]"].FirstOrDefault() ?? string.Empty;
        var messageId = form["event-data[message][headers][message-id]"].FirstOrDefault()
            ?? form["event-data[message][headers][Message-Id]"].FirstOrDefault()
            ?? string.Empty;
        var recipient = form["event-data[recipient]"].FirstOrDefault() ?? string.Empty;
        var timestampUtc = DateTimeOffset.FromUnixTimeSeconds(
            long.TryParse(timestamp, out var ts) ? ts : DateTimeOffset.UtcNow.ToUnixTimeSeconds()).UtcDateTime;

        if (!EventTypeMap.TryGetValue(eventName, out var eventType))
        {
            logger.LogDebug("Unhandled Mailgun event type: {EventType}", eventName);
            return Ok();
        }

        var emailEvent = new EmailEvent
        {
            MessageId = messageId,
            RecipientEmail = recipient,
            EventType = eventType,
            OccurredAt = timestampUtc,
            ReceivedAt = DateTime.UtcNow,
            Url = form["event-data[url]"].FirstOrDefault(),
            ErrorCode = form["event-data[delivery-status][code]"].FirstOrDefault(),
            ErrorMessage = form["event-data[delivery-status][message]"].FirstOrDefault(),
        };

        db.EmailEvents.Add(emailEvent);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Stored Mailgun event {EventType} for {Recipient}", eventType, recipient);
        return Ok();
    }
}
