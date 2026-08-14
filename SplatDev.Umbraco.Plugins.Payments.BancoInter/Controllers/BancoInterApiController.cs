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
    BancoInterDbContext db) : ControllerBase
{
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

    [HttpPost]
    public async Task<IActionResult> WebhookPix([FromBody] JsonElement body, CancellationToken ct)
    {
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

    [HttpPost]
    public async Task<IActionResult> RegisterPixWebhook([FromBody] RegisterWebhookRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.PixKey) || string.IsNullOrWhiteSpace(request.WebhookUrl))
            return BadRequest("PixKey and WebhookUrl are required.");

        await pixService.RegisterWebhookAsync(request.PixKey, request.WebhookUrl, ct);
        return Ok(new { registered = true });
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

public record RegisterWebhookRequest(string PixKey, string WebhookUrl);
