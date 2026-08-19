using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Lgpd.Models;
using SplatDev.Umbraco.Plugins.Lgpd.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.Lgpd.Controllers;

/// <summary>
/// LGPD consent, data subject requests and the record of processing operations.
/// </summary>
/// <remarks>
/// Authorized by default. Only the four actions a visitor genuinely performs before there
/// is any session — recording a decision, revoking it, reading their own consent, and
/// lodging an art. 18 request — are exempted, and each is marked individually so the
/// exemption is a visible decision rather than an omission.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/lgpd/[action]")]
public class LgpdApiController : ControllerBase
{
    private readonly ILgpdService _service;
    private readonly LgpdOptions _options;

    public LgpdApiController(ILgpdService service, IOptions<LgpdOptions> options)
    {
        _service = service;
        _options = options.Value;
    }

    // ── público ──────────────────────────────────────────────────────────────

    /// <summary>Records a visitor's decision. Anonymous by necessity — there is no session yet.</summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> RegistrarConsentimento([FromBody] Consentimento consentimento)
    {
        // Never trust the client for these: they are the evidence.
        consentimento.EnderecoIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        consentimento.UserAgent = HttpContext.Request.Headers.UserAgent.ToString();

        var r = await _service.RegistrarConsentimento(consentimento);
        return r.Sucesso ? Ok(r) : BadRequest(r);
    }

    /// <summary>Revokes consent for one purpose (art. 8 §5).</summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> RevogarConsentimento([FromQuery] string sessionId, [FromQuery] string finalidade)
    {
        if (string.IsNullOrWhiteSpace(sessionId) || string.IsNullOrWhiteSpace(finalidade))
            return BadRequest(new { mensagem = "Informe a sessão e a finalidade." });

        var r = await _service.RevogarConsentimento(
            sessionId, finalidade,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            HttpContext.Request.Headers.UserAgent.ToString());

        return r.Sucesso ? Ok(r) : BadRequest(r);
    }

    /// <summary>A visitor reading their own current consent, to render the banner state.</summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> MeuConsentimento([FromQuery] string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            return BadRequest(new { mensagem = "Informe a sessão." });

        return Ok(await _service.ConsentimentoAtual(sessionId));
    }

    /// <summary>Lodging an art. 18 request. The person doing this is by definition not signed in.</summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> AbrirRequisicao([FromBody] Requisicao requisicao)
    {
        var r = await _service.AbrirRequisicao(requisicao);
        return r.Sucesso ? Ok(r) : BadRequest(r);
    }

    /// <summary>
    /// The encarregado's published contact details (art. 41 §1).
    /// </summary>
    /// <remarks>
    /// Anonymous on purpose: art. 41 §1 requires these to be <em>publicly</em> disclosed, so
    /// gating them behind a login would defeat the obligation this endpoint exists to meet.
    /// </remarks>
    [AllowAnonymous]
    [HttpGet]
    public IActionResult Encarregado() => Ok(new
    {
        nome = _options.EncarregadoNome,
        email = _options.EncarregadoEmail,
        telefone = _options.EncarregadoTelefone,
        configurado = !string.IsNullOrWhiteSpace(_options.EncarregadoNome)
                   && !string.IsNullOrWhiteSpace(_options.EncarregadoEmail),
    });

    /// <summary>
    /// The active processing operations, which art. 9 requires be available to the subject.
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> OperacoesPublicas()
    {
        var operacoes = await _service.Operacoes(somenteAtivas: true);

        // Deliberately partial: the public view answers "what do you do with my data and
        // who sees it", without exposing internal retention notes verbatim.
        return Ok(operacoes.Select(o => new
        {
            o.Nome, o.Finalidade, o.BaseLegal, o.CategoriasDados,
            o.ContemDadoSensivel, o.Compartilhamento,
        }));
    }

    // ── backoffice ───────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> Painel() => Ok(await _service.Painel());

    [HttpGet]
    public async Task<IActionResult> Historico([FromQuery] string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            return BadRequest(new { mensagem = "Informe a sessão." });

        return Ok(await _service.HistoricoConsentimento(sessionId));
    }

    [HttpGet]
    public async Task<IActionResult> Requisicoes([FromQuery] string? status = null)
        => Ok(await _service.Requisicoes(status));

    [HttpPost]
    public async Task<IActionResult> AtualizarRequisicao([FromBody] AtualizarRequisicaoBody body)
    {
        var r = await _service.AtualizarRequisicao(body.Id, body.Status, body.Justificativa);
        return r.Sucesso ? Ok(r) : BadRequest(r);
    }

    [HttpGet]
    public async Task<IActionResult> Operacoes() => Ok(await _service.Operacoes());

    [HttpPost]
    public async Task<IActionResult> SalvarOperacao([FromBody] OperacaoTratamento operacao)
    {
        var r = await _service.SalvarOperacao(operacao);
        return r.Sucesso ? Ok(r) : BadRequest(r);
    }

    [HttpDelete]
    public async Task<IActionResult> RemoverOperacao([FromQuery] int id)
    {
        var r = await _service.RemoverOperacao(id);
        return r.Sucesso ? Ok(r) : BadRequest(r);
    }

    [HttpPost]
    public async Task<IActionResult> PurgarConsentimentos([FromQuery] int anterioresADias)
    {
        if (anterioresADias < 1)
            return BadRequest(new { mensagem = "Informe um período de retenção de ao menos um dia." });

        var removidos = await _service.PurgarConsentimentos(DateTime.UtcNow.AddDays(-anterioresADias));

        return Ok(new
        {
            removidos,
            mensagem = removidos == 0
                ? $"Nenhum registro anterior a {anterioresADias} dias."
                : $"{removidos} registro(s) de consentimento removido(s).",
        });
    }

    /// <summary>The valid values, so the UI never invents a legal basis or a right.</summary>
    [HttpGet]
    public IActionResult Vocabulario() => Ok(new
    {
        basesLegais = BaseLegal.All,
        direitos = DireitoTitular.All,
        status = StatusRequisicao.All,
        prazoRespostaDias = _options.PrazoRespostaDias,
    });
}

public record AtualizarRequisicaoBody(int Id, string Status, string? Justificativa);
