using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Lgpd.Models;

namespace SplatDev.Umbraco.Plugins.Lgpd.Services;

public class LgpdService : ILgpdService
{
    private readonly LgpdDbContext _db;
    private readonly LgpdOptions _options;
    private readonly ILogger<LgpdService> _logger;

    public LgpdService(LgpdDbContext db, IOptions<LgpdOptions> options, ILogger<LgpdService> logger)
    {
        _db = db;
        _options = options.Value;
        _logger = logger;
    }

    // ── consentimento ────────────────────────────────────────────────────────

    public async Task<LgpdResult<Consentimento>> RegistrarConsentimento(Consentimento c)
    {
        if (string.IsNullOrWhiteSpace(c.SessionId))
            return LgpdResult<Consentimento>.Falha("Sessão não identificada.");

        if (string.IsNullOrWhiteSpace(c.Finalidade))
            return LgpdResult<Consentimento>.Falha(
                "Informe a finalidade. O art. 9º exige que o consentimento seja específico.");

        // Art. 11: consent for sensitive data must be specific and prominent, so it cannot
        // ride along inside a blanket "accept all". Refusing here is what stops a caller
        // recording sensitive consent from a single banner click.
        if (c.DadoSensivel && string.IsNullOrWhiteSpace(c.TextoApresentado))
            return LgpdResult<Consentimento>.Falha(
                "Consentimento para dado sensível exige o texto específico apresentado ao titular (art. 11).");

        // Art. 14 §1: a minor's consent must come from a parent or guardian. Without the
        // guardian on record the consent is not valid, so it is refused rather than stored
        // and quietly relied upon later.
        if (c.Menor && string.IsNullOrWhiteSpace(c.ResponsavelEmail))
            return LgpdResult<Consentimento>.Falha(
                "Tratamento de dados de menor exige o consentimento de ao menos um dos pais ou responsável (art. 14).");

        // Append, never update: art. 8 §1 puts the burden of proof on the controller, and
        // overwriting makes a withdrawal indistinguishable from never having consented.
        var registro = new Consentimento
        {
            SessionId = c.SessionId.Trim(),
            Email = c.Email?.Trim(),
            Finalidade = c.Finalidade.Trim(),
            Concedido = c.Concedido,
            DadoSensivel = c.DadoSensivel,
            Menor = c.Menor,
            ResponsavelEmail = c.ResponsavelEmail?.Trim(),
            TextoApresentado = c.TextoApresentado,
            DataHora = DateTime.UtcNow,
            EnderecoIp = c.EnderecoIp,
            UserAgent = c.UserAgent,
        };

        _db.Consentimentos.Add(registro);
        await _db.SaveChangesAsync();

        return LgpdResult<Consentimento>.Ok(registro,
            registro.Concedido ? "Consentimento registrado." : "Recusa registrada.");
    }

    public async Task<IReadOnlyList<Consentimento>> ConsentimentoAtual(string sessionId)
    {
        var todos = await _db.Consentimentos
            .Where(c => c.SessionId == sessionId)
            .OrderByDescending(c => c.DataHora).ThenByDescending(c => c.Id)
            .ToListAsync();

        // One row per purpose — the newest decision for each. A visitor who accepted
        // analytics and later refused marketing has two current answers, not one.
        return todos.GroupBy(c => c.Finalidade).Select(g => g.First()).ToList();
    }

    public async Task<IReadOnlyList<Consentimento>> HistoricoConsentimento(string sessionId) =>
        await _db.Consentimentos
            .Where(c => c.SessionId == sessionId)
            .OrderByDescending(c => c.DataHora).ThenByDescending(c => c.Id)
            .ToListAsync();

    public Task<LgpdResult<Consentimento>> RevogarConsentimento(
        string sessionId, string finalidade, string? ip, string? userAgent) =>
        // Revocation is a new record saying "no", not a deletion — art. 8 §5 gives the
        // right to revoke, and art. 8 §1 still requires the earlier consent to be provable.
        RegistrarConsentimento(new Consentimento
        {
            SessionId = sessionId,
            Finalidade = finalidade,
            Concedido = false,
            EnderecoIp = ip,
            UserAgent = userAgent,
        });

    public async Task<int> PurgarConsentimentos(DateTime anteriorA)
    {
        var antigos = await _db.Consentimentos.Where(c => c.DataHora < anteriorA).ToListAsync();
        if (antigos.Count == 0) return 0;

        _db.Consentimentos.RemoveRange(antigos);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Purged {Count} consent records older than {Cutoff:u}.", antigos.Count, anteriorA);
        return antigos.Count;
    }

    // ── requisições ──────────────────────────────────────────────────────────

    public async Task<LgpdResult<Requisicao>> AbrirRequisicao(Requisicao r)
    {
        if (string.IsNullOrWhiteSpace(r.Email))
            return LgpdResult<Requisicao>.Falha("Informe o e-mail do titular.");

        if (!DireitoTitular.All.Contains(r.Direito))
            return LgpdResult<Requisicao>.Falha("Direito inválido para o art. 18.");

        var registro = new Requisicao
        {
            Email = r.Email.Trim(),
            Nome = r.Nome?.Trim(),
            Direito = r.Direito,
            Detalhe = r.Detalhe,
            Status = StatusRequisicao.Pendente,
            RecebidaEm = DateTime.UtcNow,
            // Stored rather than computed, so changing the configured period later does not
            // silently move the deadline on requests already in flight.
            PrazoEm = DateTime.UtcNow.AddDays(_options.PrazoRespostaDias),
        };

        _db.Requisicoes.Add(registro);
        await _db.SaveChangesAsync();

        return LgpdResult<Requisicao>.Ok(registro,
            $"Requisição registrada. Prazo de resposta até {registro.PrazoEm:dd/MM/yyyy} (art. 19).");
    }

    public async Task<IReadOnlyList<Requisicao>> Requisicoes(string? status = null)
    {
        var q = _db.Requisicoes.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) q = q.Where(r => r.Status == status);

        // Oldest deadline first: the overdue ones are the point of the screen.
        return await q.OrderBy(r => r.PrazoEm).ToListAsync();
    }

    public async Task<LgpdResult<Requisicao>> AtualizarRequisicao(int id, string status, string? justificativa)
    {
        if (!StatusRequisicao.All.Contains(status))
            return LgpdResult<Requisicao>.Falha("Status inválido.");

        var r = await _db.Requisicoes.FindAsync(id);
        if (r is null) return LgpdResult<Requisicao>.Falha("Requisição não encontrada.");

        // Art. 18 §4: a refusal has to be reasoned. Allowing a blank refusal would let the
        // controller close the request while leaving the obligation unmet.
        if (status == StatusRequisicao.Recusada && string.IsNullOrWhiteSpace(justificativa))
            return LgpdResult<Requisicao>.Falha(
                "A recusa exige justificativa fundamentada (art. 18, §4º).");

        r.Status = status;
        r.Justificativa = justificativa;

        if (status is StatusRequisicao.Concluida or StatusRequisicao.Recusada)
            r.RespondidaEm ??= DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return LgpdResult<Requisicao>.Ok(r, "Requisição atualizada.");
    }

    // ── registro de operações ────────────────────────────────────────────────

    public async Task<IReadOnlyList<OperacaoTratamento>> Operacoes(bool somenteAtivas = false)
    {
        var q = _db.Operacoes.AsQueryable();
        if (somenteAtivas) q = q.Where(o => o.Ativa);
        return await q.OrderBy(o => o.Nome).ToListAsync();
    }

    public async Task<LgpdResult<OperacaoTratamento>> SalvarOperacao(OperacaoTratamento o)
    {
        if (string.IsNullOrWhiteSpace(o.Nome))
            return LgpdResult<OperacaoTratamento>.Falha("Informe o nome da operação.");

        if (string.IsNullOrWhiteSpace(o.Finalidade))
            return LgpdResult<OperacaoTratamento>.Falha("Informe a finalidade do tratamento (art. 37).");

        if (!BaseLegal.All.Contains(o.BaseLegal))
            return LgpdResult<OperacaoTratamento>.Falha(
                "Base legal inválida. Use uma das dez hipóteses do art. 7º.");

        var existente = o.Id > 0 ? await _db.Operacoes.FindAsync(o.Id) : null;

        if (existente is null)
        {
            o.AtualizadaEm = DateTime.UtcNow;
            _db.Operacoes.Add(o);
            await _db.SaveChangesAsync();
            return LgpdResult<OperacaoTratamento>.Ok(o, $"Operação \"{o.Nome}\" registrada.");
        }

        existente.Nome = o.Nome.Trim();
        existente.Finalidade = o.Finalidade.Trim();
        existente.BaseLegal = o.BaseLegal;
        existente.CategoriasDados = o.CategoriasDados;
        existente.ContemDadoSensivel = o.ContemDadoSensivel;
        existente.Compartilhamento = o.Compartilhamento;
        existente.Retencao = o.Retencao;
        existente.Ativa = o.Ativa;
        existente.AtualizadaEm = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return LgpdResult<OperacaoTratamento>.Ok(existente, $"Operação \"{existente.Nome}\" atualizada.");
    }

    public async Task<LgpdResult<OperacaoTratamento>> RemoverOperacao(int id)
    {
        var o = await _db.Operacoes.FindAsync(id);
        if (o is null) return LgpdResult<OperacaoTratamento>.Falha("Operação não encontrada.");

        _db.Operacoes.Remove(o);
        await _db.SaveChangesAsync();
        return LgpdResult<OperacaoTratamento>.Ok(o, $"Operação \"{o.Nome}\" removida.");
    }

    // ── painel ───────────────────────────────────────────────────────────────

    public async Task<PainelLgpd> Painel()
    {
        var registros = await _db.Consentimentos
            .OrderByDescending(c => c.DataHora).ThenByDescending(c => c.Id)
            .ToListAsync();

        // Current decision per session+purpose, so someone who changed their mind three
        // times counts once rather than inflating the totals past the real audience.
        var atuais = registros
            .GroupBy(c => new { c.SessionId, c.Finalidade })
            .Select(g => g.First())
            .ToList();

        var agora = DateTime.UtcNow;
        var abertas = await _db.Requisicoes
            .Where(r => r.Status == StatusRequisicao.Pendente || r.Status == StatusRequisicao.EmAndamento)
            .ToListAsync();

        var operacoes = await _db.Operacoes.ToListAsync();

        return new PainelLgpd
        {
            Sessoes = atuais.Select(c => c.SessionId).Distinct().Count(),
            ConsentimentosConcedidos = atuais.Count(c => c.Concedido),
            ConsentimentosRecusados = atuais.Count(c => !c.Concedido),
            RegistrosMantidos = registros.Count,
            RegistroMaisAntigo = registros.Count == 0 ? null : registros[^1].DataHora,

            RequisicoesPendentes = abertas.Count,
            RequisicoesVencidas = abertas.Count(r => r.PrazoEm < agora),
            RequisicoesVencendoEm3Dias = abertas.Count(r => r.PrazoEm >= agora && r.PrazoEm <= agora.AddDays(3)),

            OperacoesAtivas = operacoes.Count(o => o.Ativa),
            OperacoesComDadoSensivel = operacoes.Count(o => o.Ativa && o.ContemDadoSensivel),

            EncarregadoAusente = string.IsNullOrWhiteSpace(_options.EncarregadoNome)
                              || string.IsNullOrWhiteSpace(_options.EncarregadoEmail),
        };
    }
}
