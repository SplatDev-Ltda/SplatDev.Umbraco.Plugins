using SplatDev.Umbraco.Plugins.Lgpd.Models;

namespace SplatDev.Umbraco.Plugins.Lgpd.Services;

public interface ILgpdService
{
    // ── consentimento ────────────────────────────────────────────────────────

    /// <summary>Records a consent decision, appending to the session's history.</summary>
    Task<LgpdResult<Consentimento>> RegistrarConsentimento(Consentimento consentimento);

    /// <summary>The current decision per purpose for a session.</summary>
    Task<IReadOnlyList<Consentimento>> ConsentimentoAtual(string sessionId);

    /// <summary>Everything recorded for a session — the proof required by art. 8 §1.</summary>
    Task<IReadOnlyList<Consentimento>> HistoricoConsentimento(string sessionId);

    /// <summary>Revokes consent for a purpose, by recording a refusal (art. 8 §5).</summary>
    Task<LgpdResult<Consentimento>> RevogarConsentimento(string sessionId, string finalidade, string? ip, string? userAgent);

    Task<int> PurgarConsentimentos(DateTime anteriorA);

    // ── requisições de titular ───────────────────────────────────────────────

    Task<LgpdResult<Requisicao>> AbrirRequisicao(Requisicao requisicao);

    Task<IReadOnlyList<Requisicao>> Requisicoes(string? status = null);

    /// <summary>Moves a request on. A refusal must carry a reason (art. 18 §4).</summary>
    Task<LgpdResult<Requisicao>> AtualizarRequisicao(int id, string status, string? justificativa);

    // ── registro de operações (art. 37) ──────────────────────────────────────

    Task<IReadOnlyList<OperacaoTratamento>> Operacoes(bool somenteAtivas = false);

    Task<LgpdResult<OperacaoTratamento>> SalvarOperacao(OperacaoTratamento operacao);

    Task<LgpdResult<OperacaoTratamento>> RemoverOperacao(int id);

    // ── painel ───────────────────────────────────────────────────────────────

    Task<PainelLgpd> Painel();
}

/// <summary>The outcome of a write, phrased for the person reading the screen.</summary>
public sealed class LgpdResult<T>
{
    public bool Sucesso { get; init; }
    public string Mensagem { get; init; } = string.Empty;
    public T? Valor { get; init; }

    public static LgpdResult<T> Ok(T valor, string mensagem = "") =>
        new() { Sucesso = true, Valor = valor, Mensagem = mensagem };

    public static LgpdResult<T> Falha(string mensagem) =>
        new() { Sucesso = false, Mensagem = mensagem };
}

/// <summary>What the dashboard leads with.</summary>
public sealed class PainelLgpd
{
    public int Sessoes { get; set; }
    public int ConsentimentosConcedidos { get; set; }
    public int ConsentimentosRecusados { get; set; }
    public int RegistrosMantidos { get; set; }
    public DateTime? RegistroMaisAntigo { get; set; }

    public int RequisicoesPendentes { get; set; }

    /// <summary>
    /// Requests past the art. 19 deadline.
    /// </summary>
    /// <remarks>
    /// The number that matters. Fifteen days is half the GDPR's month, and running over it
    /// is the most common way a Brazilian controller falls out of compliance without anyone
    /// noticing, so it is a headline figure rather than something to derive from a list.
    /// </remarks>
    public int RequisicoesVencidas { get; set; }

    public int RequisicoesVencendoEm3Dias { get; set; }

    public int OperacoesAtivas { get; set; }
    public int OperacoesComDadoSensivel { get; set; }

    /// <summary>True when the encarregado has not been configured — an art. 41 breach.</summary>
    public bool EncarregadoAusente { get; set; }
}
