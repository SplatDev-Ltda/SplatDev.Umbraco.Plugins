using System.Text.Json;

namespace SplatDev.Payments.Santander;

/// <summary>
/// Pix – Geração de QR Code (cobrança imediata, BACEN cob standard).
/// PUT {base}/cob/{txid} creates a charge; the response carries pixCopiaECola (QR payload).
/// </summary>
public sealed class SantanderPixQrCodeService(
    SantanderApiClient apiClient,
    SantanderApiOptions options,
    ILogger<SantanderPixQrCodeService> logger)
{
    public async Task<SantanderPixCharge> CriarCobrancaAsync(
        decimal valor, string descricao, string? txid = null, int expiracaoSegundos = 3600,
        CancellationToken cancellationToken = default)
    {
        txid ??= GerarTxid();
        var payload = new
        {
            calendario = new { expiracao = expiracaoSegundos },
            valor = new { original = valor.ToString("F2", System.Globalization.CultureInfo.InvariantCulture) },
            chave = options.PixKey,
            solicitacaoPagador = descricao,
        };

        var url = SantanderUrls.Compose(options, options.PixQrCode, $"/{txid}");
        using var doc = await apiClient.PutAsync(url, payload, cancellationToken);
        var root = doc.RootElement;

        logger.LogInformation("Santander Pix cobrança criada txid={Txid}.", txid);
        return new SantanderPixCharge(
            Txid: root.TryGetProperty("txid", out var t) ? t.GetString() ?? txid : txid,
            Status: root.TryGetProperty("status", out var s) ? s.GetString() ?? "" : "",
            PixCopiaECola: root.TryGetProperty("pixCopiaECola", out var p) ? p.GetString() : null,
            Location: root.TryGetProperty("location", out var l) ? l.GetString() : null,
            Raw: root.GetRawText());
    }

    public async Task<JsonDocument> ConsultarCobrancaAsync(string txid, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(txid);
        var url = SantanderUrls.Compose(options, options.PixQrCode, $"/{txid}");
        return await apiClient.GetAsync(url, cancellationToken);
    }

    /// <summary>BACEN txid: 26-35 alphanumeric chars. Uses SHA256 hash of full GUID for uniqueness.</summary>
    public static string GerarTxid()
    {
        var raw = Guid.NewGuid().ToString("N");
        var hash = System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(raw));
        return "RISIN" + Convert.ToHexString(hash)[..27];
    }
}

public sealed record SantanderPixCharge(string Txid, string Status, string? PixCopiaECola, string? Location, string Raw);
