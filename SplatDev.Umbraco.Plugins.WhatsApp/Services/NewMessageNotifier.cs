using System.Net;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.WhatsApp.Models;

using Umbraco.Cms.Core.Mail;
using Umbraco.Cms.Core.Models.Email;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <inheritdoc />
public class NewMessageNotifier : INewMessageNotifier
{
    private readonly IEmailSender _email;
    private readonly IDashboardPresence _presence;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<NewMessageNotifier> _logger;

    // Process-wide so a burst of inbound messages produces one email, not twenty.
    private static long _lastNotifiedTicks;

    public NewMessageNotifier(
        IEmailSender email,
        IDashboardPresence presence,
        IOptions<WhatsAppOptions> options,
        ILogger<NewMessageNotifier> logger)
    {
        _email = email;
        _presence = presence;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<bool> NotifyIfUnattendedAsync(
        string waId, string? profileName, string? preview, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.NotificationEmail))
        {
            return false;
        }

        // Someone is already looking at the inbox — emailing them would be noise.
        if (_presence.IsSomeoneWatching())
        {
            _logger.LogDebug("Inbound WhatsApp message not emailed: the dashboard is open.");
            return false;
        }

        if (!TryEnterCooldown())
        {
            _logger.LogDebug(
                "Inbound WhatsApp message not emailed: within the {Minutes}-minute cooldown.",
                _options.NotificationCooldownMinutes);
            return false;
        }

        var from = string.IsNullOrWhiteSpace(_options.NotificationFromEmail)
            ? null
            : _options.NotificationFromEmail;

        var sender = profileName is { Length: > 0 } ? $"{profileName} ({Format(waId)})" : Format(waId);
        var subject = $"New WhatsApp message from {sender}";

        var message = new EmailMessage(
            from,
            new[] { _options.NotificationEmail },
            cc: null,
            bcc: null,
            replyTo: null,
            subject,
            BuildBody(sender, preview),
            isBodyHtml: true,
            attachments: null);

        try
        {
            // "WhatsApp" email type keeps this out of Umbraco's transactional templates.
            await _email.SendAsync(message, "WhatsApp").ConfigureAwait(false);

            _logger.LogInformation(
                "Emailed {Recipient} about an unattended WhatsApp message.", _options.NotificationEmail);
            return true;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // A mail failure must never fail the webhook — Meta would just retry the
            // delivery and we would store the message twice.
            _logger.LogError(ex, "Could not email the WhatsApp new-message notification.");

            // Release the cooldown so the next message gets another chance.
            Interlocked.Exchange(ref _lastNotifiedTicks, 0);
            return false;
        }
    }

    /// <summary>
    /// Claims the cooldown slot atomically, so two concurrent webhook deliveries cannot
    /// both decide to send.
    /// </summary>
    private bool TryEnterCooldown()
    {
        var cooldown = TimeSpan.FromMinutes(Math.Max(0, _options.NotificationCooldownMinutes));
        var now = DateTime.UtcNow;

        while (true)
        {
            var previous = Interlocked.Read(ref _lastNotifiedTicks);

            if (previous != 0)
            {
                var last = new DateTime(previous, DateTimeKind.Utc);
                if (now - last < cooldown)
                {
                    return false;
                }
            }

            if (Interlocked.CompareExchange(ref _lastNotifiedTicks, now.Ticks, previous) == previous)
            {
                return true;
            }
        }
    }

    private string BuildBody(string sender, string? preview)
    {
        var url = string.IsNullOrWhiteSpace(_options.BackofficeUrl)
            ? null
            : $"{_options.BackofficeUrl.TrimEnd('/')}/umbraco/section/whatsapp";

        var safeSender = WebUtility.HtmlEncode(sender);
        var safePreview = WebUtility.HtmlEncode(
            string.IsNullOrWhiteSpace(preview) ? "(no text content)" : preview);

        var link = url is null
            ? "<p style=\"margin:0 0 16px\">Open the <strong>WhatsApp</strong> section in the Umbraco backoffice to reply.</p>"
            : $"<p style=\"margin:0 0 24px\"><a href=\"{WebUtility.HtmlEncode(url)}\" " +
              "style=\"display:inline-block;background:#25d366;color:#0b141a;text-decoration:none;" +
              "padding:10px 18px;border-radius:6px;font-weight:600\">Open the inbox</a></p>";

        return $"""
            <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                        font-size:15px;line-height:1.55;color:#111b21;max-width:560px">
              <p style="margin:0 0 16px">You have a new WhatsApp message from <strong>{safeSender}</strong>.</p>
              <blockquote style="margin:0 0 24px;padding:12px 16px;background:#f5f6f6;
                                 border-left:3px solid #25d366;border-radius:4px;white-space:pre-wrap">{safePreview}</blockquote>
              {link}
              <p style="margin:0;font-size:13px;color:#667781">
                You are getting this because nobody had the WhatsApp dashboard open when the message
                arrived. Further messages will not email you again for
                {_options.NotificationCooldownMinutes} minute(s).
              </p>
            </div>
            """;
    }

    private static string Format(string waId) => waId.StartsWith('+') ? waId : $"+{waId}";
}
