using System.Text.Json;

namespace SplatDev.Payments.Santander;

/// <summary>Open FX – Comércio Exterior (cotações e operações de câmbio).</summary>
public sealed class SantanderOpenFxService(
    SantanderApiClient apiClient,
    SantanderApiOptions options)
{
    public Task<JsonDocument> CotarAsync(JsonElement payload, CancellationToken cancellationToken = default)
    {
        var url = SantanderUrls.Compose(options, options.OpenFx, options.OpenFx.CreatePath);
        return apiClient.PostAsync(url, payload, cancellationToken);
    }

    public Task<JsonDocument> ConsultarOperacaoAsync(string id, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(id);
        var url = SantanderUrls.Compose(options, options.OpenFx, $"{options.OpenFx.CreatePath}/{Uri.EscapeDataString(id)}");
        return apiClient.GetAsync(url, cancellationToken);
    }
}
