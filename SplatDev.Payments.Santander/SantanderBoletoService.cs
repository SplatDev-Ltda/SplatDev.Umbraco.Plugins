using System.Text.Json;

namespace SplatDev.Payments.Santander;

/// <summary>
/// Emissão de Boletos (Cobrança) — workspaces + bank_slips.
/// Path confirmed against sandbox: GET /collection_bill_management/v2/workspaces → 200.
/// </summary>
public sealed class SantanderBoletoService(
    SantanderApiClient apiClient,
    SantanderApiOptions options,
    ILogger<SantanderBoletoService> logger)
{
    public Task<JsonDocument> ListarWorkspacesAsync(CancellationToken cancellationToken = default)
    {
        var url = SantanderUrls.Compose(options, options.Boletos, options.Boletos.WorkspacesPath);
        return apiClient.GetAsync(url, cancellationToken);
    }

    public async Task<JsonDocument> EmitirBoletoAsync(
        JsonElement payload, string? workspaceId = null, CancellationToken cancellationToken = default)
    {
        workspaceId ??= await ResolveWorkspaceIdAsync(cancellationToken);
        var path = options.Boletos.CreatePath.Replace("{workspaceId}", Uri.EscapeDataString(workspaceId));
        var url = SantanderUrls.Compose(options, options.Boletos, path);
        var doc = await apiClient.PostAsync(url, payload, cancellationToken);
        logger.LogInformation("Santander boleto emitido no workspace {WorkspaceId}.", workspaceId);
        return doc;
    }

    public async Task<JsonDocument> ConsultarBoletoAsync(
        string billId, string? workspaceId = null, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(billId);
        workspaceId ??= await ResolveWorkspaceIdAsync(cancellationToken);
        var path = options.Boletos.CreatePath.Replace("{workspaceId}", Uri.EscapeDataString(workspaceId))
                   + $"/{Uri.EscapeDataString(billId)}";
        var url = SantanderUrls.Compose(options, options.Boletos, path);
        return await apiClient.GetAsync(url, cancellationToken);
    }

    /// <summary>Uses the configured WorkspaceId, or discovers the first ACTIVE workspace from the API.</summary>
    public async Task<string> ResolveWorkspaceIdAsync(CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(options.WorkspaceId))
            return options.WorkspaceId;

        using var doc = await ListarWorkspacesAsync(cancellationToken);
        if (doc.RootElement.TryGetProperty("content", out var content) && content.ValueKind == JsonValueKind.Array)
        {
            foreach (var ws in content.EnumerateArray())
            {
                var status = ws.TryGetProperty("status", out var s) ? s.GetString() : null;
                var id = ws.TryGetProperty("id", out var i) ? i.GetString() : null;
                if (!string.IsNullOrWhiteSpace(id) && string.Equals(status, "ACTIVE", StringComparison.OrdinalIgnoreCase))
                    return id;
            }
        }

        throw new SantanderApiException(404, "No ACTIVE Santander workspace found; set Santander:WorkspaceId.", doc.RootElement.GetRawText());
    }
}
