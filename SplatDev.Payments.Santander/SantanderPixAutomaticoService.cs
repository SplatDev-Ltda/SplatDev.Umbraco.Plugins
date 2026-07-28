using System.Text.Json;
using System.Text.Json.Nodes;

namespace SplatDev.Payments.Santander;

/// <summary>
/// Pix Automático — recorrências (BACEN rec standard).
/// Creating a recurrence is a two-step flow (confirmed against sandbox 2026-07-03):
///   1. POST {BasePath}{LocationPath} ("/locrec") → mints a location, returns { id, location, criacao }.
///   2. POST {BasePath}{CreatePath}   ("/rec")    → creates the rec; its "loc" field is the integer id above.
/// If the caller already supplies an integer "loc", the location step is skipped.
/// </summary>
public sealed class SantanderPixAutomaticoService(
    SantanderApiClient apiClient,
    SantanderApiOptions options)
{
    private SantanderProductOptions Product => options.PixAutomatico;

    private string RecUrl(string path = "") =>
        SantanderUrls.Compose(options, Product, Product.CreatePath + path);

    private string LocationUrl() =>
        SantanderUrls.Compose(options, Product, Product.LocationPath);

    /// <summary>Mints a recurrence location (locrec) and returns its integer id.</summary>
    public async Task<int> CriarLocationAsync(CancellationToken cancellationToken = default)
    {
        using var response = await apiClient.PostAsync(LocationUrl(), new { tipoRec = "REC" }, cancellationToken);
        return response.RootElement.GetProperty("id").GetInt32();
    }

    /// <summary>
    /// Creates a Pix Automático recurrence. When the payload has no integer "loc", a location is
    /// minted first (locrec) and injected — so callers can send the business fields only.
    /// </summary>
    public async Task<JsonDocument> CriarRecorrenciaAsync(JsonElement payload, CancellationToken cancellationToken = default)
    {
        var node = JsonNode.Parse(payload.GetRawText())!.AsObject();

        var hasIntegerLoc = node.TryGetPropertyValue("loc", out var loc)
            && loc is JsonValue value && value.TryGetValue(out int _);
        if (!hasIntegerLoc)
            node["loc"] = await CriarLocationAsync(cancellationToken);

        return await apiClient.PostAsync(RecUrl(), node, cancellationToken);
    }

    public Task<JsonDocument> ConsultarRecorrenciaAsync(string idRec, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(idRec);
        return apiClient.GetAsync(RecUrl($"/{Uri.EscapeDataString(idRec)}"), cancellationToken);
    }
}
