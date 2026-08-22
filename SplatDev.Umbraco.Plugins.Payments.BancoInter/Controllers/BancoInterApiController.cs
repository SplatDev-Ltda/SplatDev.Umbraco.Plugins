using Microsoft.Extensions.Configuration;
using System.Text;
using System.Security.Cryptography;
using System.Text.Json;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SplatDev.Payments.BancoInter.Models;
using SplatDev.Umbraco.Plugins.Payments.BancoInter.Models;
using SplatDev.Umbraco.Plugins.Payments.BancoInter.Services;
using Umbraco.Cms.Web.Common.Controllers;

namespace SplatDev.Umbraco.Plugins.Payments.BancoInter.Controllers;

/// <remarks>
/// Previously anonymous. CreatePixCharge and IssueBoleto created live payment instruments, and GetBalance read the account balance, for any caller who knew the URL.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/bancointersandbox/[action]")]
public class BancoInterApiController(
    IBancoInterPixService pixService,
    IBancoInterBoletoService boletoService,
    IBancoInterBankingService bankingService,
    BancoInterDbContext db,
    IConfiguration configuration) : ControllerBase
{
    /// <summary>
    /// Compares the secret a webhook caller presented against the configured one.
    /// </summary>
    /// <remarks>
    /// Fails closed: with no secret configured there is no webhook surface at all, rather
    /// than an open endpoint that will mark any charge as settled. Returns 404 to a bad
    /// caller so the endpoint's existence is not confirmed, and compares in fixed time so
    /// the secret cannot be recovered a character at a time.
    /// </remarks>
    private bool WebhookSecretMatches(string? presented)
    {
        var configured = configuration["BancoInter:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(configured) || string.IsNullOrWhiteSpace(presented))
            return false;

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(configured),
            Encoding.UTF8.GetBytes(presented));
    }

    [HttpPost]
    public async Task<IActionResult> CreatePixCharge([FromBody] CreatePixChargeRequest request, CancellationToken ct)
    {
        if (request.Amount <= 0)
            return BadRequest("Amount must be greater than zero.");

        if (string.IsNullOrWhiteSpace(request.PixKey))
            return BadRequest("PixKey is required.");

        var charge = new InterPixChargeRequest
        {
            Chave = request.PixKey,
            Valor = new InterValor { Original = request.Amount.ToString("F2") },
            Calendario = new InterCalendario { Expiracao = request.ExpirySeconds ?? 3600 },
            SolicitacaoPagador = request.Description
        };

        if (!string.IsNullOrWhiteSpace(request.PayerName))
        {
            charge.Devedor = new InterDevedor
            {
                Nome = request.PayerName,
                Cpf = request.PayerCpf,
                Cnpj = request.PayerCnpj
            };
        }

        var result = await pixService.CreateImmediateChargeAsync(charge, request.Txid, ct);

        var transaction = new BancoInterTransaction
        {
            Type = "PIX_CHARGE",
            ExternalRef = request.ExternalRef,
            Txid = result.Txid,
            Amount = request.Amount,
            Status = result.Status,
            PixCopiaECola = result.PixCopiaECola
        };
        db.Transactions.Add(transaction);
        await db.SaveChangesAsync(ct);

        return Ok(new
        {
            result.Txid,
            result.Status,
            result.PixCopiaECola,
            Location = result.Loc?.Location
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetPixCharge(string txid, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(txid))
            return BadRequest("txid is required.");

        var result = await pixService.GetImmediateChargeAsync(txid, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> IssueBoleto([FromBody] IssueBoletoRequest request, CancellationToken ct)
    {
        if (request.Amount <= 0)
            return BadRequest("Amount must be greater than zero.");

        var boletoRequest = new InterBoletoRequest
        {
            SeuNumero = request.ExternalRef,
            ValorNominal = request.Amount,
            DataVencimento = request.DueDate,
            Pagador = new InterPagador
            {
                CpfCnpj = request.PayerCpfCnpj,
                TipoPessoa = request.PayerCpfCnpj.Length <= 11 ? "FISICA" : "JURIDICA",
                Nome = request.PayerName,
                Endereco = request.PayerAddress,
                Cidade = request.PayerCity,
                Uf = request.PayerUf,
                Cep = request.PayerCep,
                Email = request.PayerEmail
            }
        };

        var result = await boletoService.IssueBoletoAsync(boletoRequest, ct);

        var transaction = new BancoInterTransaction
        {
            Type = "BOLETO",
            ExternalRef = request.ExternalRef,
            NossoNumero = result.NossoNumero,
            Amount = request.Amount,
            Status = result.Situacao,
            BoletoLinhaDigitavel = result.LinhaDigitavel
        };
        db.Transactions.Add(transaction);
        await db.SaveChangesAsync(ct);

        return Ok(new
        {
            result.NossoNumero,
            result.LinhaDigitavel,
            result.CodigoBarras,
            result.Situacao,
            QrCode = result.QrCode?.Qrcode
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetBoletoPdf(string nossoNumero, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(nossoNumero))
            return BadRequest("nossoNumero is required.");

        var pdf = await boletoService.ExportBoletoPdfAsync(nossoNumero, ct);
        return File(pdf, "application/pdf", $"boleto-{nossoNumero}.pdf");
    }

    /// <summary>How this plugin is configured, without revealing any of it.</summary>
    /// <remarks>
    /// Sandbox versus production is the single most consequential setting here — the same
    /// button either issues a test charge or a real one — so the dashboard states it
    /// rather than leaving the operator to infer it from configuration they cannot see.
    /// </remarks>
    [HttpGet]
    public IActionResult GetStatus()
    {
        var sandbox = !bool.TryParse(configuration["BancoInter:Sandbox"], out var sb) || sb;

        return Ok(new
        {
            sandbox,
            hasClientId = !string.IsNullOrWhiteSpace(configuration["BancoInter:ClientId"]),
            hasClientSecret = !string.IsNullOrWhiteSpace(configuration["BancoInter:ClientSecret"]),
            hasCertificate = !string.IsNullOrWhiteSpace(configuration["BancoInter:CertificatePath"]),
            hasWebhookSecret = !string.IsNullOrWhiteSpace(configuration["BancoInter:WebhookSecret"]),
        });
    }

    /// <summary>Charges and boletos this site has created, newest first.</summary>
    /// <remarks>
    /// The plugin recorded every charge and boleto in its own table from the start and
    /// offered no way to read them back, so the dashboard had nothing to show even once
    /// it started making requests.
    /// </remarks>
    [HttpGet]
    public async Task<IActionResult> GetTransactions(CancellationToken ct)
    {
        var rows = await db.Transactions
            .OrderByDescending(t => t.CreatedAt)
            .Take(200)
            .ToListAsync(ct);

        return Ok(rows);
    }

    [HttpGet]
    public async Task<IActionResult> GetBalance(CancellationToken ct)
    {
        var balance = await bankingService.GetBalanceAsync(ct);
        return Ok(balance);
    }

    [HttpGet]
    public async Task<IActionResult> GetStatement(string startDate, string endDate, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(startDate) || string.IsNullOrWhiteSpace(endDate))
            return BadRequest("startDate and endDate are required (yyyy-MM-dd).");

        var statement = await bankingService.GetStatementAsync(startDate, endDate, ct);
        return Ok(statement);
    }

    /// <summary>Receives Pix settlement callbacks from Banco Inter.</summary>
    /// <remarks>
    /// Anonymous by necessity — the caller is Inter's server, which cannot hold a
    /// backoffice session — and gated on BancoInter:WebhookSecret instead. Register the
    /// callback URL with the secret on it, which RegisterPixWebhook does for you.
    /// </remarks>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> WebhookPix(
        [FromQuery] string? secret,
        [FromBody] JsonElement body,
        CancellationToken ct)
    {
        if (!WebhookSecretMatches(secret))
            return NotFound();

        // Deserialize and process the incoming Pix webhook event
        var payload = JsonSerializer.Deserialize<InterPixWebhookPayload>(body.GetRawText(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (payload?.Pix == null)
            return Ok();

        foreach (var evt in payload.Pix)
        {
            var transaction = await db.Transactions
                .FirstOrDefaultAsync(t => t.Txid == evt.Txid, ct);

            if (transaction != null)
            {
                transaction.Status = "RECEBIDO";
                transaction.EndToEndId = evt.EndToEndId;
                transaction.UpdatedAt = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(ct);
        return Ok();
    }

    /// <summary>Tells Banco Inter where to send Pix settlement callbacks.</summary>
    /// <remarks>
    /// The URL is built here when the caller does not supply one, so the shared secret
    /// never has to be pasted into a form or held in the browser. A caller-supplied URL
    /// still has the secret appended if it is missing — registering one without it would
    /// simply produce callbacks this site rejects.
    /// </remarks>
    [HttpPost]
    public async Task<IActionResult> RegisterPixWebhook([FromBody] RegisterWebhookRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.PixKey))
            return BadRequest("PixKey is required.");

        var secret = configuration["BancoInter:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            return BadRequest(
                "Set BancoInter:WebhookSecret before registering a webhook. Without it this "
                + "site rejects every callback, and settlement notifications never arrive.");
        }

        var url = request.WebhookUrl;
        if (string.IsNullOrWhiteSpace(url))
        {
            url = $"{Request.Scheme}://{Request.Host}"
                  + Url.Action(nameof(WebhookPix))
                  + $"?secret={Uri.EscapeDataString(secret)}";
        }
        else if (!url.Contains("secret=", StringComparison.OrdinalIgnoreCase))
        {
            url += (url.Contains('?') ? "&" : "?") + $"secret={Uri.EscapeDataString(secret)}";
        }

        await pixService.RegisterWebhookAsync(request.PixKey, url, ct);

        // The URL carries the secret, so it is not echoed back to the caller.
        return Ok(new { registered = true, pixKey = request.PixKey });
    }
}

public record CreatePixChargeRequest(
    decimal Amount,
    string PixKey,
    string? Txid = null,
    string? Description = null,
    string? ExternalRef = null,
    string? PayerName = null,
    string? PayerCpf = null,
    string? PayerCnpj = null,
    int? ExpirySeconds = null);

public record IssueBoletoRequest(
    decimal Amount,
    string DueDate,
    string ExternalRef,
    string PayerCpfCnpj,
    string PayerName,
    string PayerAddress,
    string PayerCity,
    string PayerUf,
    string PayerCep,
    string? PayerEmail = null);

/// <param name="WebhookUrl">
/// Optional. Left empty, the controller builds the callback URL for this site and
/// appends the configured secret, so the secret never travels through the browser.
/// </param>
public record RegisterWebhookRequest(string PixKey, string? WebhookUrl = null);
