using System.Text.Json;

namespace SplatDev.Payments.Santander;

/// <summary>Saldo e Extrato — consulta de saldo e extrato da conta corrente.</summary>
public sealed class SantanderBalanceStatementService(
    SantanderApiClient apiClient,
    SantanderApiOptions options)
{
    public Task<JsonDocument> ObterSaldoAsync(CancellationToken cancellationToken = default)
    {
        var path = options.BalanceStatement.BalancesPath.Replace("{bankId}", options.BankId);
        if (!string.IsNullOrWhiteSpace(options.AccountId))
            path += $"?accountId={Uri.EscapeDataString(options.AccountId)}";
        var url = SantanderUrls.Compose(options, options.BalanceStatement, path);
        return apiClient.GetAsync(url, cancellationToken);
    }

    public Task<JsonDocument> ObterExtratoAsync(
        DateOnly de, DateOnly ate, int pagina = 1, CancellationToken cancellationToken = default)
    {
        var path = options.BalanceStatement.StatementsPath.Replace("{bankId}", options.BankId);
        var query = $"?initialDate={de:yyyy-MM-dd}&finalDate={ate:yyyy-MM-dd}&_offset={pagina}";
        if (!string.IsNullOrWhiteSpace(options.AccountId))
            query += $"&accountId={Uri.EscapeDataString(options.AccountId)}";
        var url = SantanderUrls.Compose(options, options.BalanceStatement, path + query);
        return apiClient.GetAsync(url, cancellationToken);
    }
}
