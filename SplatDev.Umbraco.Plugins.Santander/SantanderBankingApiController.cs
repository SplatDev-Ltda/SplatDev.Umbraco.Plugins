using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Payments.Santander;

namespace SplatDev.Umbraco.Plugins.Santander;

/// <summary>
/// Backoffice/server-to-server surface for the Santander Open Banking suite.
/// Guarded by the X-RISIN-Api-Key header (Santander:ApiKey config) — banking endpoints must
/// never be anonymous. Returns 401 for every call while the key is unset.
/// </summary>
[ApiController]
[Route("umbraco/backoffice/santander-banking")]
public class SantanderBankingApiController(
    SantanderApiOptions options,
    SantanderPixQrCodeService pixService,
    SantanderBalanceStatementService balanceService,
    SantanderPaymentsService paymentsService,
    SantanderBoletoService boletoService,
    SantanderOpenFxService openFxService,
    SantanderExportChargeService exportChargeService,
    SantanderVouchersService vouchersService,
    SantanderPixAutomaticoService pixAutomaticoService,
    ILogger<SantanderBankingApiController> logger) : ControllerBase
{
    public const string ApiKeyHeader = "X-RISIN-Api-Key";

    // ── diagnostics ──────────────────────────────────────────────────────────

    [HttpGet("diagnostics")]
    public IActionResult Diagnostics()
    {
        if (Unauthorized(out var challenge)) return challenge;

        return Ok(new
        {
            environment = options.BaseUrl.Contains("sandbox", StringComparison.OrdinalIgnoreCase) ? "sandbox" : "production",
            baseUrl = options.BaseUrl,
            hasClientId = !string.IsNullOrWhiteSpace(options.ClientId),
            hasClientSecret = !string.IsNullOrWhiteSpace(options.ClientSecret),
            hasCertificate = !string.IsNullOrWhiteSpace(options.CertificatePath) || !string.IsNullOrWhiteSpace(options.CertificateBase64),
            hasPixKey = !string.IsNullOrWhiteSpace(options.PixKey),
            hasWorkspaceId = !string.IsNullOrWhiteSpace(options.WorkspaceId),
            products = new
            {
                pixQrCode = Describe(options.PixQrCode),
                balanceStatement = Describe(options.BalanceStatement),
                payments = Describe(options.Payments),
                boletos = Describe(options.Boletos),
                openFx = Describe(options.OpenFx),
                exportCharge = Describe(options.ExportCharge),
                vouchers = Describe(options.Vouchers),
                pixAutomatico = Describe(options.PixAutomatico),
            },
        });
    }

    // ── saldo e extrato ──────────────────────────────────────────────────────

    [HttpGet("balance")]
    public Task<IActionResult> Balance(CancellationToken ct) =>
        Execute(() => balanceService.ObterSaldoAsync(ct));

    [HttpGet("statement")]
    public Task<IActionResult> Statement(
        [FromQuery] DateOnly from, [FromQuery] DateOnly to, [FromQuery] int page = 1,
        CancellationToken ct = default) =>
        Execute(() => balanceService.ObterExtratoAsync(from, to, page, ct));

    // ── pix qr code (cobrança) ───────────────────────────────────────────────

    public sealed record CriarPixRequest(decimal Valor, string Descricao, string? Txid, int ExpiracaoSegundos = 3600);

    [HttpPost("pix/qrcode")]
    public async Task<IActionResult> CriarPixQrCode([FromBody] CriarPixRequest request, CancellationToken ct)
    {
        if (Unauthorized(out var challenge)) return challenge;
        try
        {
            var charge = await pixService.CriarCobrancaAsync(request.Valor, request.Descricao, request.Txid, request.ExpiracaoSegundos, ct);
            return Ok(new { charge.Txid, charge.Status, charge.PixCopiaECola, charge.Location });
        }
        catch (SantanderApiException ex)
        {
            return SantanderError(ex);
        }
    }

    [HttpGet("pix/qrcode/{txid}")]
    public Task<IActionResult> ConsultarPixQrCode(string txid, CancellationToken ct) =>
        Execute(() => pixService.ConsultarCobrancaAsync(txid, ct));

    // ── pagamento de contas ──────────────────────────────────────────────────

    [HttpPost("payments")]
    public Task<IActionResult> IniciarPagamento([FromBody] JsonElement payload, CancellationToken ct) =>
        Execute(() => paymentsService.IniciarPagamentoAsync(payload, ct));

    [HttpGet("payments/{id}")]
    public Task<IActionResult> ConsultarPagamento(string id, CancellationToken ct) =>
        Execute(() => paymentsService.ConsultarPagamentoAsync(id, ct));

    // ── boletos ──────────────────────────────────────────────────────────────

    [HttpGet("boletos/workspaces")]
    public Task<IActionResult> ListarWorkspaces(CancellationToken ct) =>
        Execute(() => boletoService.ListarWorkspacesAsync(ct));

    [HttpPost("boletos")]
    public Task<IActionResult> EmitirBoleto(
        [FromBody] JsonElement payload, [FromQuery] string? workspaceId, CancellationToken ct) =>
        Execute(() => boletoService.EmitirBoletoAsync(payload, workspaceId, ct));

    [HttpGet("boletos/{billId}")]
    public Task<IActionResult> ConsultarBoleto(
        string billId, [FromQuery] string? workspaceId, CancellationToken ct) =>
        Execute(() => boletoService.ConsultarBoletoAsync(billId, workspaceId, ct));

    // ── open fx ──────────────────────────────────────────────────────────────

    [HttpPost("fx/quotes")]
    public Task<IActionResult> CotarFx([FromBody] JsonElement payload, CancellationToken ct) =>
        Execute(() => openFxService.CotarAsync(payload, ct));

    [HttpGet("fx/{id}")]
    public Task<IActionResult> ConsultarFx(string id, CancellationToken ct) =>
        Execute(() => openFxService.ConsultarOperacaoAsync(id, ct));

    // ── cobrança de exportação ───────────────────────────────────────────────

    [HttpPost("export-charges")]
    public Task<IActionResult> CriarCobrancaExportacao([FromBody] JsonElement payload, CancellationToken ct) =>
        Execute(() => exportChargeService.CriarCobrancaExportacaoAsync(payload, ct));

    [HttpGet("export-charges/{id}")]
    public Task<IActionResult> ConsultarCobrancaExportacao(string id, CancellationToken ct) =>
        Execute(() => exportChargeService.ConsultarAsync(id, ct));

    // ── comprovantes ─────────────────────────────────────────────────────────

    [HttpGet("vouchers")]
    public Task<IActionResult> ListarComprovantes(
        [FromQuery] DateOnly from, [FromQuery] DateOnly to, CancellationToken ct = default) =>
        Execute(() => vouchersService.ListarComprovantesAsync(from, to, ct));

    [HttpGet("vouchers/{id}")]
    public Task<IActionResult> ObterComprovante(string id, CancellationToken ct) =>
        Execute(() => vouchersService.ObterComprovanteAsync(id, ct));

    // ── pix automático ───────────────────────────────────────────────────────

    [HttpPost("pix-automatico")]
    public Task<IActionResult> CriarRecorrencia([FromBody] JsonElement payload, CancellationToken ct) =>
        Execute(() => pixAutomaticoService.CriarRecorrenciaAsync(payload, ct));

    [HttpGet("pix-automatico/{idRec}")]
    public Task<IActionResult> ConsultarRecorrencia(string idRec, CancellationToken ct) =>
        Execute(() => pixAutomaticoService.ConsultarRecorrenciaAsync(idRec, ct));

    // ── plumbing ─────────────────────────────────────────────────────────────

    private async Task<IActionResult> Execute(Func<Task<JsonDocument>> action)
    {
        if (Unauthorized(out var challenge)) return challenge;
        try
        {
            using var doc = await action();
            return Content(doc.RootElement.GetRawText(), "application/json");
        }
        catch (SantanderApiException ex)
        {
            return SantanderError(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Santander banking endpoint failed.");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>API-key guard: 401 when Santander:ApiKey is unset or the header doesn't match.</summary>
    private bool Unauthorized(out IActionResult challenge)
    {
        var supplied = Request.Headers[ApiKeyHeader].ToString();
        if (string.IsNullOrWhiteSpace(options.ApiKey) || supplied != options.ApiKey)
        {
            challenge = StatusCode(401, new { error = "Missing or invalid API key." });
            return true;
        }
        challenge = null!;
        return false;
    }

    private IActionResult SantanderError(SantanderApiException ex)
    {
        logger.LogWarning("Santander API error {Status}: {Body}", ex.StatusCode, ex.ResponseBody);
        return StatusCode(ex.StatusCode is >= 400 and < 600 ? ex.StatusCode : 502,
            new { error = ex.Message, santanderResponse = TryParse(ex.ResponseBody) });
    }

    private static object? TryParse(string body)
    {
        try { return JsonSerializer.Deserialize<JsonElement>(body); }
        catch { return body; }
    }

    private static object Describe(SantanderProductOptions p) => new
    {
        baseUrl = string.IsNullOrWhiteSpace(p.BaseUrl) ? null : p.BaseUrl,
        basePath = p.BasePath,
    };
}
