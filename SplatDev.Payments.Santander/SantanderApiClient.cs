using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace SplatDev.Payments.Santander;

/// <summary>
/// Authenticated HTTP client for the Santander Open Banking APIs.
/// OAuth2 client_credentials over mTLS (the named "Santander" HttpClient carries the
/// ICP-Brasil certificate); every request gets Authorization: Bearer + X-Application-Key.
/// Tokens expire in ~900s and are cached with a safety margin.
/// </summary>
public sealed class SantanderApiClient(
    IHttpClientFactory httpClientFactory,
    SantanderApiOptions options,
    IHostEnvironment hostEnvironment,
    ILogger<SantanderApiClient> logger)
{
    public const string HttpClientName = "Santander";
    private const int TokenExpirySafetyMarginSeconds = 60;

    private readonly SemaphoreSlim _tokenLock = new(1, 1);
    private string? _cachedToken;
    private DateTime _tokenExpiresAtUtc = DateTime.MinValue;

    public Task<JsonDocument> GetAsync(string url, CancellationToken cancellationToken = default) =>
        SendAsync(HttpMethod.Get, url, (object?)null, cancellationToken);

    public Task<JsonDocument> PostAsync<TPayload>(string url, TPayload payload, CancellationToken cancellationToken = default) =>
        SendAsync(HttpMethod.Post, url, payload, cancellationToken);

    public Task<JsonDocument> PutAsync<TPayload>(string url, TPayload payload, CancellationToken cancellationToken = default) =>
        SendAsync(HttpMethod.Put, url, payload, cancellationToken);

    public Task<JsonDocument> PatchAsync<TPayload>(string url, TPayload payload, CancellationToken cancellationToken = default) =>
        SendAsync(HttpMethod.Patch, url, payload, cancellationToken);

    private async Task<JsonDocument> SendAsync<TPayload>(
        HttpMethod method, string url, TPayload? payload, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(url);

        if (ShouldUseDevelopmentMock())
        {
            logger.LogWarning("Santander development mock mode active. Returning mocked {Method} for {Url}.", method, url);
            return CreateMockResponse(method, url);
        }

        var token = await GetTokenAsync(cancellationToken);
        var client = httpClientFactory.CreateClient(HttpClientName);

        using var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.TryAddWithoutValidation("X-Application-Key", options.ClientId);
        if (payload is not null)
            request.Content = JsonContent.Create(payload);

        using var response = await client.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Santander API {Method} {Url} failed with {Status}: {Body}",
                method, url, (int)response.StatusCode, Truncate(body, 2000));
            throw new SantanderApiException((int)response.StatusCode, $"Santander API {method} {url} returned {(int)response.StatusCode}.", body);
        }

        return string.IsNullOrWhiteSpace(body) ? JsonDocument.Parse("{}") : JsonDocument.Parse(body);
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

            var client = httpClientFactory.CreateClient(HttpClientName);
            var tokenUrl = options.BaseUrl.TrimEnd('/') + options.TokenPath;

            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = options.ClientId,
                ["client_secret"] = options.ClientSecret,
            });

            using var response = await client.PostAsync(tokenUrl, content, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Santander token request failed with {Status}: {Body}",
                    (int)response.StatusCode, Truncate(body, 1000));
                throw new SantanderApiException((int)response.StatusCode, "Santander token request failed.", body);
            }

            using var doc = JsonDocument.Parse(body);
            var token = doc.RootElement.GetProperty("access_token").GetString()
                ?? throw new SantanderApiException(500, "Santander token response missing access_token.", body);
            var expiresIn = doc.RootElement.TryGetProperty("expires_in", out var exp) && exp.TryGetInt32(out var seconds)
                ? seconds
                : 900;

            _cachedToken = token;
            _tokenExpiresAtUtc = DateTime.UtcNow.AddSeconds(Math.Max(expiresIn - TokenExpirySafetyMarginSeconds, 30));
            return token;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    private bool ShouldUseDevelopmentMock() =>
        hostEnvironment.IsDevelopment() &&
        options.EnableDevelopmentMockWithoutCredentials &&
        string.IsNullOrWhiteSpace(options.ClientId);

    private static JsonDocument CreateMockResponse(HttpMethod method, string url)
    {
        var id = Guid.NewGuid().ToString("N");
        var lower = url.ToLowerInvariant();

        if (lower.Contains("balance"))
            return JsonDocument.Parse("{\"availableAmount\":123456.78,\"blockedAmount\":0.0,\"automaticallyInvestedAmount\":0.0,\"_mock\":true}");
        if (lower.Contains("statement"))
            return JsonDocument.Parse("{\"_content\":[{\"transactionDate\":\"2026-07-01\",\"amount\":-150.00,\"transactionName\":\"MOCK PAGAMENTO\"}],\"_mock\":true}");
        if (lower.Contains("cob") || lower.Contains("pix"))
            return JsonDocument.Parse("{\"txid\":\"mock" + id + "\",\"status\":\"ATIVA\",\"pixCopiaECola\":\"00020126MOCK" + id + "\",\"_mock\":true}");
        if (lower.Contains("bank_slip") || lower.Contains("workspace"))
            return JsonDocument.Parse("{\"id\":\"mock-" + id + "\",\"status\":\"ACTIVE\",\"_mock\":true}");

        return JsonDocument.Parse("{\"id\":\"mock-" + id + "\",\"method\":\"" + method.Method + "\",\"_mock\":true}");
    }

    private static string Truncate(string value, int max) =>
        value.Length <= max ? value : value[..max];
}

/// <summary>Raised when a Santander API call returns a non-success status; carries the response body.</summary>
public sealed class SantanderApiException(int statusCode, string message, string responseBody) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public string ResponseBody { get; } = responseBody;
}
