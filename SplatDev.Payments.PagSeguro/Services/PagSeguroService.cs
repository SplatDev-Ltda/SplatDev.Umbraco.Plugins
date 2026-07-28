namespace SplatDev.Payments.PagSeguro.Services
{
    using System;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Net.Http.Json;
    using System.Security.Cryptography;
    using System.Text;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Extensions.Options;
    using SplatDev.Payments.PagSeguro.Models;

    public class PagSeguroService
    {
        private readonly HttpClient _http;
        private readonly PagSeguroOptions _options;
        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            PropertyNameCaseInsensitive = true
        };

        public PagSeguroService(HttpClient http, IOptions<PagSeguroOptions> options)
        {
            _http = http;
            _options = options.Value;
            _http.BaseAddress = new Uri(_options.BaseUrl);
            _http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _options.Token);
            _http.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
        }

        public async Task<PagSeguroOrderResponse> CreateOrderAsync(PagSeguroOrderRequest request)
        {
            var response = await _http.PostAsJsonAsync("/orders", request, JsonOpts);
            response.EnsureSuccessStatusCode();
            return (await response.Content.ReadFromJsonAsync<PagSeguroOrderResponse>(JsonOpts))!;
        }

        public async Task<PagSeguroOrderResponse> GetOrderAsync(string orderId)
        {
            var response = await _http.GetAsync($"/orders/{orderId}");
            response.EnsureSuccessStatusCode();
            return (await response.Content.ReadFromJsonAsync<PagSeguroOrderResponse>(JsonOpts))!;
        }

        public async Task<PagSeguroChargeResponse> CaptureChargeAsync(string chargeId, PagSeguroAmount? amount = null)
        {
            var payload = amount is not null
                ? JsonContent.Create(new { amount }, options: JsonOpts)
                : null;
            var response = await _http.PostAsync($"/charges/{chargeId}/capture", payload);
            response.EnsureSuccessStatusCode();
            return (await response.Content.ReadFromJsonAsync<PagSeguroChargeResponse>(JsonOpts))!;
        }

        public async Task<PagSeguroChargeResponse> RefundChargeAsync(string chargeId, PagSeguroAmount? amount = null)
        {
            var payload = amount is not null
                ? JsonContent.Create(new { amount }, options: JsonOpts)
                : null;
            var response = await _http.PostAsync($"/charges/{chargeId}/cancel", payload);
            response.EnsureSuccessStatusCode();
            return (await response.Content.ReadFromJsonAsync<PagSeguroChargeResponse>(JsonOpts))!;
        }

        public async Task<bool> VerifyWebhookSignatureAsync(string rawBody, string signatureHeader)
        {
            if (string.IsNullOrEmpty(_options.WebhookSecret))
                return false;

            var computed = ComputeHmacSha256(rawBody, _options.WebhookSecret);
            return string.Equals(computed, signatureHeader, StringComparison.OrdinalIgnoreCase);
        }

        public static string ComputeHmacSha256(string payload, string secret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }
}
