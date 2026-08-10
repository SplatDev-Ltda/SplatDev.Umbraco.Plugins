using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.WhatsApp.Models;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <inheritdoc />
public class WhatsAppClient : IWhatsAppClient
{
    private static readonly Regex VariablePattern = new(@"\{\{(\d+)\}\}", RegexOptions.Compiled);

    private readonly HttpClient _http;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<WhatsAppClient> _logger;

    public WhatsAppClient(
        HttpClient http,
        IOptions<WhatsAppOptions> options,
        ILogger<WhatsAppClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public Task<SendResult> SendTextAsync(string to, string body, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(body))
        {
            return Task.FromResult(SendResult.Fail("Message body is empty."));
        }

        return PostMessageAsync(new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = NormalizeRecipient(to),
            type = "text",
            text = new { preview_url = false, body },
        }, ct);
    }

    public Task<SendResult> SendTemplateAsync(
        string to,
        string templateName,
        string languageCode,
        IReadOnlyList<string>? variables = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(templateName))
        {
            return Task.FromResult(SendResult.Fail("Template name is required."));
        }

        // Meta rejects an empty components array, so omit it entirely when the template
        // takes no variables.
        object template = variables is { Count: > 0 }
            ? new
            {
                name = templateName,
                language = new { code = languageCode },
                components = new[]
                {
                    new
                    {
                        type = "body",
                        parameters = variables
                            .Select(v => new { type = "text", text = v ?? string.Empty })
                            .ToArray(),
                    },
                },
            }
            : new
            {
                name = templateName,
                language = new { code = languageCode },
            };

        return PostMessageAsync(new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = NormalizeRecipient(to),
            type = "template",
            template,
        }, ct);
    }

    public async Task<IReadOnlyList<MessageTemplate>> GetTemplatesAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.BusinessAccountId))
        {
            _logger.LogWarning("Cannot list WhatsApp templates: BusinessAccountId is not configured.");
            return Array.Empty<MessageTemplate>();
        }

        var url = $"{_options.ApiRoot}/{_options.BusinessAccountId}/message_templates?limit=100";

        try
        {
            using var response = await _http.GetAsync(url, ct).ConfigureAwait(false);
            var json = await response.Content.ReadAsStringAsync(ct).ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "Listing WhatsApp templates failed ({Status}): {Error}",
                    (int)response.StatusCode,
                    DescribeError(json));
                return Array.Empty<MessageTemplate>();
            }

            var parsed = JsonSerializer.Deserialize<TemplateListResponse>(json);

            return parsed?.Data?.Select(ToTemplate).ToList() ?? new List<MessageTemplate>();
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogError(ex, "Listing WhatsApp templates failed.");
            return Array.Empty<MessageTemplate>();
        }
    }

    public async Task<PhoneNumberStatus?> GetPhoneNumberStatusAsync(CancellationToken ct = default)
    {
        if (!_options.IsConfigured)
        {
            return null;
        }

        var url = $"{_options.ApiRoot}/{_options.PhoneNumberId}" +
                  "?fields=display_phone_number,verified_name,quality_rating,platform_type," +
                  "code_verification_status,webhook_configuration";

        try
        {
            using var response = await _http.GetAsync(url, ct).ConfigureAwait(false);
            var json = await response.Content.ReadAsStringAsync(ct).ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "Fetching WhatsApp phone number status failed ({Status}): {Error}",
                    (int)response.StatusCode,
                    DescribeError(json));
                return null;
            }

            var dto = JsonSerializer.Deserialize<PhoneNumberDto>(json);
            if (dto is null)
            {
                return null;
            }

            return new PhoneNumberStatus
            {
                DisplayPhoneNumber = dto.DisplayPhoneNumber,
                VerifiedName = dto.VerifiedName,
                QualityRating = dto.QualityRating,
                PlatformType = dto.PlatformType,
                CodeVerificationStatus = dto.CodeVerificationStatus,
                WebhookUrl = dto.WebhookConfiguration?.Application,
            };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogError(ex, "Fetching WhatsApp phone number status failed.");
            return null;
        }
    }

    private async Task<SendResult> PostMessageAsync(object payload, CancellationToken ct)
    {
        if (!_options.IsConfigured)
        {
            return SendResult.Fail(
                "WhatsApp is not configured. Set SplatDev:WhatsApp:PhoneNumberId and AccessToken.");
        }

        var url = $"{_options.ApiRoot}/{_options.PhoneNumberId}/messages";

        try
        {
            using var response = await _http.PostAsJsonAsync(url, payload, ct).ConfigureAwait(false);
            var json = await response.Content.ReadAsStringAsync(ct).ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var (message, code) = ParseError(json);
                _logger.LogError(
                    "WhatsApp send failed ({Status}, code {Code}): {Error}",
                    (int)response.StatusCode,
                    code,
                    message);
                return SendResult.Fail(message, code);
            }

            var sent = JsonSerializer.Deserialize<SendResponse>(json);
            var id = sent?.Messages?.FirstOrDefault()?.Id;

            // A 200 with no message id shouldn't happen, but treating it as success would
            // store an untrackable row that no status webhook can ever update.
            return string.IsNullOrEmpty(id)
                ? SendResult.Fail("WhatsApp accepted the request but returned no message id.")
                : SendResult.Ok(id!);
        }
        catch (TaskCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogError(ex, "WhatsApp send failed.");
            return SendResult.Fail($"Could not reach the WhatsApp API: {ex.Message}");
        }
    }

    private static MessageTemplate ToTemplate(TemplateDto dto)
    {
        var body = dto.Components?
            .FirstOrDefault(c => string.Equals(c.Type, "BODY", StringComparison.OrdinalIgnoreCase))?
            .Text;

        return new MessageTemplate
        {
            Name = dto.Name ?? string.Empty,
            Language = dto.Language ?? string.Empty,
            Status = dto.Status ?? string.Empty,
            Category = dto.Category ?? string.Empty,
            BodyText = body,
            VariableCount = CountVariables(body),
        };
    }

    /// <summary>
    /// Counts positional placeholders in a template body. Uses the highest index rather than
    /// the match count, because a body may repeat {{1}} or skip a number.
    /// </summary>
    internal static int CountVariables(string? body)
    {
        if (string.IsNullOrEmpty(body))
        {
            return 0;
        }

        var highest = 0;
        foreach (Match match in VariablePattern.Matches(body))
        {
            if (int.TryParse(match.Groups[1].Value, out var index) && index > highest)
            {
                highest = index;
            }
        }

        return highest;
    }

    /// <summary>
    /// Strips formatting from a recipient number. The Cloud API wants digits only —
    /// a leading '+', spaces or dashes cause an opaque rejection.
    /// </summary>
    internal static string NormalizeRecipient(string to) =>
        new(( to ?? string.Empty).Where(char.IsDigit).ToArray());

    private static (string Message, int? Code) ParseError(string json)
    {
        try
        {
            var envelope = JsonSerializer.Deserialize<GraphErrorEnvelope>(json);
            var error = envelope?.Error;
            if (error is not null)
            {
                var text = error.UserMessage ?? error.Message ?? "Unknown WhatsApp API error.";
                return (text, error.Code);
            }
        }
        catch (JsonException)
        {
            // Fall through to the raw body — better than swallowing the failure.
        }

        return (Truncate(json), null);
    }

    private static string DescribeError(string json) => ParseError(json).Message;

    private static string Truncate(string value) =>
        string.IsNullOrEmpty(value) ? "Empty response." :
        value.Length <= 500 ? value : value[..500] + "…";
}
