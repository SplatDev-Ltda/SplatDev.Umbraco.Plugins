using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using SplatDev.Messaging.ClickSend.Models;
using SplatDev.Messaging.Interfaces;

namespace SplatDev.Messaging.ClickSend;

public sealed class ClickSendService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly ClickSendOptions _options;
    private readonly ILogger<ClickSendService> _logger;

    public ClickSendService(
        HttpClient httpClient,
        ClickSendOptions options,
        ILogger<ClickSendService> logger)
    {
        _httpClient = httpClient;
        _options = options;
        _logger = logger;

        var credentials = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{options.Username}:{options.ApiKey}"));
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);
        _httpClient.BaseAddress = new Uri(options.BaseUrl);
    }

    public async Task<SmsSendResult> SendAsync(
        string to, string body, CancellationToken cancellationToken = default)
    {
        return await SendAsync(to, body, _options.From, cancellationToken);
    }

    public async Task<SmsSendResult> SendAsync(
        string to, string body, string? from, CancellationToken cancellationToken = default)
    {
        try
        {
            var source = !string.IsNullOrWhiteSpace(from) ? from : _options.From;
            if (string.IsNullOrWhiteSpace(source))
                return new SmsSendResult { Success = false, Error = "Sender (From) number is not configured." };

            var request = new ClickSendSmsRequest
            {
                Messages =
                [
                    new ClickSendSmsMessage
                    {
                        Source = "sdk",
                        From = source,
                        To = SanitizePhone(to),
                        Body = body,
                    },
                ],
            };

            var response = await _httpClient.PostAsJsonAsync(
                "/v3/sms/send", request, cancellationToken);

            var rawBody = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var result = JsonSerializer.Deserialize<ClickSendResponse>(rawBody);
                var messageId = result?.Data?.Messages?.FirstOrDefault()?.MessageId;
                _logger.LogInformation("ClickSend SMS sent to {To}, messageId={MessageId}", to, messageId);
                return new SmsSendResult
                {
                    Success = true,
                    MessageId = messageId,
                    StatusCode = (int)response.StatusCode,
                    RawResponse = rawBody,
                };
            }

            _logger.LogWarning("ClickSend SMS failed: HTTP {StatusCode} — {Body}", (int)response.StatusCode, rawBody);
            return new SmsSendResult
            {
                Success = false,
                Error = $"ClickSend API returned HTTP {(int)response.StatusCode}: {rawBody}",
                StatusCode = (int)response.StatusCode,
                RawResponse = rawBody,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ClickSend SMS send failed for recipient {To}", to);
            return new SmsSendResult { Success = false, Error = ex.Message };
        }
    }

    private static string SanitizePhone(string phone)
    {
        var digits = new StringBuilder(phone.Length);
        foreach (var ch in phone)
        {
            if (char.IsDigit(ch))
                digits.Append(ch);
        }
        return digits.ToString();
    }

    private sealed class ClickSendSmsRequest
    {
        [JsonPropertyName("messages")]
        public List<ClickSendSmsMessage> Messages { get; set; } = [];
    }

    private sealed class ClickSendSmsMessage
    {
        [JsonPropertyName("source")]
        public string Source { get; set; } = "sdk";

        [JsonPropertyName("from")]
        public string From { get; set; } = string.Empty;

        [JsonPropertyName("to")]
        public string To { get; set; } = string.Empty;

        [JsonPropertyName("body")]
        public string Body { get; set; } = string.Empty;
    }

    private sealed class ClickSendResponse
    {
        [JsonPropertyName("http_code")]
        public int HttpCode { get; set; }

        [JsonPropertyName("response_code")]
        public string? ResponseCode { get; set; }

        [JsonPropertyName("response_msg")]
        public string? ResponseMsg { get; set; }

        [JsonPropertyName("data")]
        public ClickSendData? Data { get; set; }
    }

    private sealed class ClickSendData
    {
        [JsonPropertyName("total_price")]
        public double TotalPrice { get; set; }

        [JsonPropertyName("total_count")]
        public int TotalCount { get; set; }

        [JsonPropertyName("queued_count")]
        public int QueuedCount { get; set; }

        [JsonPropertyName("messages")]
        public List<ClickSendMessageResult> Messages { get; set; } = [];
    }

    private sealed class ClickSendMessageResult
    {
        [JsonPropertyName("message_id")]
        public string? MessageId { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }
}
