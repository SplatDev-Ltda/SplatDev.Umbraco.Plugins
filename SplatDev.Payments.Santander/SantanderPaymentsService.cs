using System.Text.Json;

namespace SplatDev.Payments.Santander;

/// <summary>Pagamento de Contas (transfers-pix) — inicia e consulta ordens de pagamento.</summary>
public sealed class SantanderPaymentsService(
    SantanderApiClient apiClient,
    SantanderApiOptions options,
    ILogger<SantanderPaymentsService> logger)
{
    public async Task<JsonDocument> IniciarPagamentoAsync(JsonElement payload, CancellationToken cancellationToken = default)
    {
        var url = SantanderUrls.Compose(options, options.Payments, options.Payments.CreatePath);
        var doc = await apiClient.PostAsync(url, payload, cancellationToken);
        logger.LogInformation("Santander pagamento iniciado.");
        return doc;
    }

    public Task<JsonDocument> ConsultarPagamentoAsync(string id, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(id);
        var url = SantanderUrls.Compose(options, options.Payments, $"{options.Payments.CreatePath}/{Uri.EscapeDataString(id)}");
        return apiClient.GetAsync(url, cancellationToken);
    }
}
