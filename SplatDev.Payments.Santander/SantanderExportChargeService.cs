using System.Text.Json;

namespace SplatDev.Payments.Santander;

/// <summary>Cobrança de Exportação — criação e consulta de cobranças de exportação.</summary>
public sealed class SantanderExportChargeService(
    SantanderApiClient apiClient,
    SantanderApiOptions options)
{
    public Task<JsonDocument> CriarCobrancaExportacaoAsync(JsonElement payload, CancellationToken cancellationToken = default)
    {
        var url = SantanderUrls.Compose(options, options.ExportCharge, options.ExportCharge.CreatePath);
        return apiClient.PostAsync(url, payload, cancellationToken);
    }

    public Task<JsonDocument> ConsultarAsync(string id, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(id);
        var url = SantanderUrls.Compose(options, options.ExportCharge, $"{options.ExportCharge.CreatePath}/{Uri.EscapeDataString(id)}");
        return apiClient.GetAsync(url, cancellationToken);
    }
}
