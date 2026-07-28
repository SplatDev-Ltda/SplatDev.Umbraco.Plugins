using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SplatDev.Payments.Getnet;

public sealed class GetnetApiClient(
    IHttpClientFactory httpClientFactory,
    GetnetApiOptions options,
    IHostEnvironment hostEnvironment,
    ILogger<GetnetApiClient> logger)
{
    private readonly SemaphoreSlim _tokenLock = new(1, 1);
    private string? _cachedToken;
    private DateTime _tokenExpiresAtUtc = DateTime.MinValue;

    private static readonly object MockSync = new();
    private static readonly List<string> MockPayments = [];
    private const int MockItemsLimit = 250;

    public async Task<JsonDocument> PostAsync<TPayload>(
        string relativePath, TPayload payload, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(relativePath);

        if (ShouldUseDevelopmentMock())
        {
            logger.LogWarning("Getnet development mock mode active. Returning mocked POST for {Path}.", relativePath);
            return CreateMockPostResponse(relativePath, payload);
        }

        var client = await CreateAuthorizedClientAsync(cancellationToken);
        using var response = await client.PostAsJsonAsync(relativePath, payload, cancellationToken);
        return await ReadJsonOrThrowAsync(response, "POST", relativePath, cancellationToken);
    }

    public async Task<JsonDocument> GetAsync(
        string relativePath, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(relativePath);

        if (ShouldUseDevelopmentMock())
        {
            logger.LogWarning("Getnet development mock mode active. Returning mocked GET for {Path}.", relativePath);
            return CreateMockGetResponse();
        }

        var client = await CreateAuthorizedClientAsync(cancellationToken);
        using var response = await client.GetAsync(relativePath, cancellationToken);
        return await ReadJsonOrThrowAsync(response, "GET", relativePath, cancellationToken);
    }

    private async Task<HttpClient> CreateAuthorizedClientAsync(CancellationToken cancellationToken)
    {
        var token = await GetTokenAsync(cancellationToken);
        var client = httpClientFactory.CreateClient("Getnet");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (!string.IsNullOrWhiteSpace(options.SellerId))
            client.DefaultRequestHeaders.TryAddWithoutValidation("seller_id", options.SellerId);
        return client;
    }

    private bool ShouldUseDevelopmentMock() =>
        hostEnvironment.IsDevelopment() &&
        options.EnableDevelopmentMockWithoutCredentials &&
        string.IsNullOrWhiteSpace(options.ClientId);

    private JsonDocument CreateMockPostResponse<TPayload>(string relativePath, TPayload payload)
    {
        var id = Guid.NewGuid().ToString("N");
        var mockId = $"mock-{id}";
        var now = DateTime.UtcNow.ToString("O");
        var amount = ExtractAmountFromPayload(payload);
        var lower = relativePath.ToLowerInvariant();

        if (lower.Contains("pix"))
        {
            var entry = "{" +
                "\"payment_id\":\"" + mockId + "\"," +
                "\"status\":\"WAITING\"," +
                "\"amount\":" + amount + "," +
                "\"type\":\"PIX\"," +
                "\"created_at\":\"" + now + "\"" +
                "}";
            AddMockEntry(MockPayments, entry);

            var mockQrCode = "00020126580014br.gov.bcb.pix0136" + id + "5204000053039865802BR5913RISIN6009SAOPAULO6304";
            return JsonDocument.Parse("{" +
                "\"payment_id\":\"" + mockId + "\"," +
                "\"seller_id\":\"" + EscapeJson(options.SellerId) + "\"," +
                "\"amount\":" + amount + "," +
                "\"status\":\"WAITING\"," +
                "\"qrcode\":{" +
                    "\"pix_qrcode\":\"" + mockQrCode + "\"," +
                    "\"image_url\":\"https://localhost/mock/pix/" + mockId + ".png\"" +
                "}" +
            "}");
        }

        if (lower.Contains("boleto"))
        {
            var entry = "{" +
                "\"payment_id\":\"" + mockId + "\"," +
                "\"status\":\"WAITING\"," +
                "\"amount\":" + amount + "," +
                "\"type\":\"BOLETO\"," +
                "\"created_at\":\"" + now + "\"" +
                "}";
            AddMockEntry(MockPayments, entry);

            return JsonDocument.Parse("{" +
                "\"payment_id\":\"" + mockId + "\"," +
                "\"seller_id\":\"" + EscapeJson(options.SellerId) + "\"," +
                "\"amount\":" + amount + "," +
                "\"status\":\"WAITING\"," +
                "\"boleto\":{" +
                    "\"boleto_id\":\"" + mockId + "\"," +
                    "\"status\":\"WAITING\"," +
                    "\"bar_code\":\"34191790010104351004791020150008930800260000\"," +
                    "\"pdf\":{\"document\":\"https://localhost/mock/boleto/" + mockId + ".pdf\"}" +
                "}" +
            "}");
        }

        if (lower.Contains("payment-link"))
        {
            var entry = "{" +
                "\"payment_id\":\"" + mockId + "\"," +
                "\"status\":\"ACTIVE\"," +
                "\"amount\":" + amount + "," +
                "\"type\":\"LINK\"," +
                "\"created_at\":\"" + now + "\"" +
                "}";
            AddMockEntry(MockPayments, entry);

            return JsonDocument.Parse("{" +
                "\"payment_link_id\":\"" + mockId + "\"," +
                "\"payment_url\":\"https://localhost/mock/checkout/" + mockId + "\"," +
                "\"status\":\"ACTIVE\"" +
            "}");
        }

        return JsonDocument.Parse("{\"payment_id\":\"" + mockId + "\",\"status\":\"WAITING\"}");
    }

    private static JsonDocument CreateMockGetResponse()
    {
        lock (MockSync)
        {
            var json = "{\"payments\":[" + string.Join(",", MockPayments) + "],\"total\":" + MockPayments.Count + "}";
            return JsonDocument.Parse(json);
        }
    }

    private async Task<string> GetTokenAsync(CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(_cachedToken) && DateTime.UtcNow < _tokenExpiresAtUtc)
            return _cachedToken;

        await _tokenLock.WaitAsync(cancellationToken);
        try
        {
            if (!string.IsNullOrWhiteSpace(_cachedToken) && DateTime.UtcNow < _tokenExpiresAtUtc)
                return _cachedToken;

            if (string.IsNullOrWhiteSpace(options.ClientId))
                throw new InvalidOperationException("Getnet:ClientId is required.");
            if (string.IsNullOrWhiteSpace(options.ClientSecret))
                throw new InvalidOperationException("Getnet:ClientSecret is required.");

            var client = httpClientFactory.CreateClient("Getnet");
            var formValues = new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["scope"] = "oob",
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, options.TokenPath)
            {
                Content = new FormUrlEncodedContent(formValues),
            };

            var basicToken = Convert.ToBase64String(
                System.Text.Encoding.UTF8.GetBytes($"{options.ClientId}:{options.ClientSecret}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicToken);

            using var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException(
                    $"Getnet token request failed with HTTP {(int)response.StatusCode}. Response: {body}",
                    null, response.StatusCode);
            }

            var tokenResponse = await response.Content.ReadFromJsonAsync<TokenResponse>(
                cancellationToken: cancellationToken)
                ?? throw new InvalidOperationException("Getnet token response was empty.");

            if (string.IsNullOrWhiteSpace(tokenResponse.AccessToken))
                throw new InvalidOperationException("Getnet token response did not include access_token.");

            _cachedToken = tokenResponse.AccessToken;
            var expiresIn = Math.Max(60, tokenResponse.ExpiresIn);
            _tokenExpiresAtUtc = DateTime.UtcNow.AddSeconds(expiresIn - 30);
            return _cachedToken;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    private static async Task<JsonDocument> ReadJsonOrThrowAsync(
        HttpResponseMessage response,
        string method,
        string relativePath,
        CancellationToken cancellationToken)
    {
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                FormattableString.Invariant($"Getnet API {method} {relativePath} failed with HTTP {(int)response.StatusCode}. Response: {body}"),
                null, response.StatusCode);
        }

        if (string.IsNullOrWhiteSpace(body))
            return JsonDocument.Parse("{}");

        try
        {
            return JsonDocument.Parse(body);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException($"Getnet API returned invalid JSON for {method} {relativePath}.", ex);
        }
    }

    private static int ExtractAmountFromPayload<TPayload>(TPayload payload)
    {
        if (payload is null) return 10000;
        try
        {
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(payload));
            if (doc.RootElement.TryGetProperty("amount", out var amt) && amt.TryGetInt32(out var v))
                return v;
        }
        catch { /* best-effort in mock mode */ }
        return 10000;
    }

    private static void AddMockEntry(List<string> target, string json)
    {
        lock (MockSync)
        {
            target.Insert(0, json);
            if (target.Count > MockItemsLimit)
                target.RemoveRange(MockItemsLimit, target.Count - MockItemsLimit);
        }
    }

    private static string EscapeJson(string value) =>
        value.Replace("\\", "\\\\", StringComparison.Ordinal)
             .Replace("\"", "\\\"", StringComparison.Ordinal);

    private sealed class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; init; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; init; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; init; } = string.Empty;
    }
}
