using System.Text.Json;

namespace SplatDev.Payments.Santander;

/// <summary>Comprovantes — listagem e consulta de comprovantes de pagamento.</summary>
public sealed class SantanderVouchersService(
    SantanderApiClient apiClient,
    SantanderApiOptions options)
{
    public Task<JsonDocument> ListarComprovantesAsync(
        DateOnly de, DateOnly ate, CancellationToken cancellationToken = default)
    {
        var query = $"?initialDate={de:yyyy-MM-dd}&finalDate={ate:yyyy-MM-dd}";
        var url = SantanderUrls.Compose(options, options.Vouchers, options.Vouchers.ListPath + query);
        return apiClient.GetAsync(url, cancellationToken);
    }

    public Task<JsonDocument> ObterComprovanteAsync(string id, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(id);
        var url = SantanderUrls.Compose(options, options.Vouchers, $"{options.Vouchers.ListPath}/{Uri.EscapeDataString(id)}");
        return apiClient.GetAsync(url, cancellationToken);
    }
}
