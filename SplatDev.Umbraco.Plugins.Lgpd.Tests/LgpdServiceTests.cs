using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Lgpd.Models;
using SplatDev.Umbraco.Plugins.Lgpd.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Lgpd.Tests;

public class LgpdServiceTests
{
    private static LgpdService Build(LgpdOptions? options = null)
    {
        var db = new LgpdDbContext(new DbContextOptionsBuilder<LgpdDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

        return new LgpdService(db, Options.Create(options ?? new LgpdOptions
        {
            EncarregadoNome = "Ana Ribeiro",
            EncarregadoEmail = "dpo@exemplo.com.br",
        }), NullLogger<LgpdService>.Instance);
    }

    private static Consentimento C(string sessao, string finalidade, bool concedido) =>
        new() { SessionId = sessao, Finalidade = finalidade, Concedido = concedido };

    // ── art. 8 §1: consent must be provable ──────────────────────────────────

    [Fact]
    public async Task Revoking_consent_keeps_the_earlier_grant_on_record()
    {
        var svc = Build();
        await svc.RegistrarConsentimento(C("s1", "marketing", true));
        await svc.RevogarConsentimento("s1", "marketing", null, null);

        var historico = await svc.HistoricoConsentimento("s1");

        Assert.Equal(2, historico.Count);
        Assert.False(historico[0].Concedido);   // current
        Assert.True(historico[1].Concedido);    // the grant survives as proof
    }

    [Fact]
    public async Task Current_consent_is_tracked_per_purpose_not_per_session()
    {
        // A visitor can accept analytics and refuse marketing; one answer per session
        // would silently overwrite one of those decisions.
        var svc = Build();
        await svc.RegistrarConsentimento(C("s1", "analytics", true));
        await svc.RegistrarConsentimento(C("s1", "marketing", false));

        var atual = await svc.ConsentimentoAtual("s1");

        Assert.Equal(2, atual.Count);
        Assert.True(atual.Single(c => c.Finalidade == "analytics").Concedido);
        Assert.False(atual.Single(c => c.Finalidade == "marketing").Concedido);
    }

    [Fact]
    public async Task Consent_without_a_purpose_is_refused()
    {
        // Art. 9 requires consent to be specific.
        var r = await Build().RegistrarConsentimento(new Consentimento { SessionId = "s1" });
        Assert.False(r.Sucesso);
        Assert.Contains("finalidade", r.Mensagem);
    }

    // ── art. 11: sensitive data needs specific, prominent consent ────────────

    [Fact]
    public async Task Sensitive_data_consent_requires_the_text_that_was_shown()
    {
        var svc = Build();
        var c = C("s1", "saude", true);
        c.DadoSensivel = true;

        var r = await svc.RegistrarConsentimento(c);

        Assert.False(r.Sucesso);
        Assert.Contains("art. 11", r.Mensagem);
    }

    [Fact]
    public async Task Sensitive_data_consent_is_accepted_with_the_specific_wording()
    {
        var svc = Build();
        var c = C("s1", "saude", true);
        c.DadoSensivel = true;
        c.TextoApresentado = "Autorizo o tratamento dos meus dados de saúde para…";

        Assert.True((await svc.RegistrarConsentimento(c)).Sucesso);
    }

    // ── art. 14: a minor needs a guardian ────────────────────────────────────

    [Fact]
    public async Task A_minors_consent_without_a_guardian_is_refused()
    {
        var svc = Build();
        var c = C("s1", "cadastro", true);
        c.Menor = true;

        var r = await svc.RegistrarConsentimento(c);

        Assert.False(r.Sucesso);
        Assert.Contains("art. 14", r.Mensagem);
    }

    [Fact]
    public async Task A_minors_consent_with_a_guardian_is_accepted()
    {
        var svc = Build();
        var c = C("s1", "cadastro", true);
        c.Menor = true;
        c.ResponsavelEmail = "responsavel@exemplo.com.br";

        Assert.True((await svc.RegistrarConsentimento(c)).Sucesso);
    }

    // ── art. 19: fifteen days, not thirty ────────────────────────────────────

    [Fact]
    public async Task A_request_gets_the_fifteen_day_deadline_of_art_19()
    {
        var svc = Build();
        var r = await svc.AbrirRequisicao(new Requisicao
        {
            Email = "titular@exemplo.com.br", Direito = DireitoTitular.Acesso,
        });

        Assert.True(r.Sucesso);
        var dias = (r.Valor!.PrazoEm - r.Valor.RecebidaEm).TotalDays;
        Assert.InRange(dias, 14.9, 15.1);
    }

    [Fact]
    public async Task The_configured_period_is_honoured_and_frozen_onto_the_request()
    {
        // Stored rather than computed, so changing the setting later cannot move the
        // deadline on requests already in flight.
        var svc = Build(new LgpdOptions { PrazoRespostaDias = 10, EncarregadoNome = "x", EncarregadoEmail = "x@y.z" });
        var r = await svc.AbrirRequisicao(new Requisicao
        {
            Email = "a@b.com", Direito = DireitoTitular.Portabilidade,
        });

        Assert.InRange((r.Valor!.PrazoEm - r.Valor.RecebidaEm).TotalDays, 9.9, 10.1);
    }

    [Fact]
    public async Task An_invalid_right_is_refused()
    {
        var r = await Build().AbrirRequisicao(new Requisicao { Email = "a@b.com", Direito = "qualquer" });
        Assert.False(r.Sucesso);
        Assert.Contains("art. 18", r.Mensagem);
    }

    // ── art. 18 §4: a refusal must be reasoned ───────────────────────────────

    [Fact]
    public async Task Refusing_a_request_without_a_reason_is_rejected()
    {
        var svc = Build();
        var req = (await svc.AbrirRequisicao(new Requisicao
        {
            Email = "a@b.com", Direito = DireitoTitular.Acesso,
        })).Valor!;

        var r = await svc.AtualizarRequisicao(req.Id, StatusRequisicao.Recusada, null);

        Assert.False(r.Sucesso);
        Assert.Contains("§4", r.Mensagem);
    }

    [Fact]
    public async Task Refusing_with_a_reason_is_accepted_and_stamped()
    {
        var svc = Build();
        var req = (await svc.AbrirRequisicao(new Requisicao
        {
            Email = "a@b.com", Direito = DireitoTitular.Acesso,
        })).Valor!;

        var r = await svc.AtualizarRequisicao(req.Id, StatusRequisicao.Recusada, "Titular não identificado.");

        Assert.True(r.Sucesso);
        Assert.NotNull(r.Valor!.RespondidaEm);
        Assert.Equal("Titular não identificado.", r.Valor.Justificativa);
    }

    // ── art. 37: record of operations ────────────────────────────────────────

    [Fact]
    public async Task An_operation_with_an_invalid_legal_basis_is_refused()
    {
        var r = await Build().SalvarOperacao(new OperacaoTratamento
        {
            Nome = "Newsletter", Finalidade = "envio", BaseLegal = "porque_sim",
        });

        Assert.False(r.Sucesso);
        Assert.Contains("art. 7", r.Mensagem);
    }

    [Theory]
    [InlineData(BaseLegal.ProtecaoCredito)]
    [InlineData(BaseLegal.PoliticasPublicas)]
    [InlineData(BaseLegal.LegitimoInteresse)]
    public async Task Every_art_7_basis_is_accepted_including_the_ones_the_GDPR_lacks(string baseLegal)
    {
        var r = await Build().SalvarOperacao(new OperacaoTratamento
        {
            Nome = "Cadastro", Finalidade = "análise", BaseLegal = baseLegal,
        });

        Assert.True(r.Sucesso);
    }

    [Fact]
    public void Only_consent_is_revocable()
    {
        // Offering revocation against a legal obligation would promise something the
        // controller cannot honour.
        Assert.True(BaseLegal.IsRevogavel(BaseLegal.Consentimento));
        Assert.False(BaseLegal.IsRevogavel(BaseLegal.ObrigacaoLegal));
        Assert.False(BaseLegal.IsRevogavel(BaseLegal.ProtecaoCredito));
    }

    // ── painel ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task The_dashboard_counts_overdue_requests_separately()
    {
        var svc = Build(new LgpdOptions { PrazoRespostaDias = -1, EncarregadoNome = "a", EncarregadoEmail = "b@c.d" });
        await svc.AbrirRequisicao(new Requisicao { Email = "a@b.com", Direito = DireitoTitular.Acesso });

        var p = await svc.Painel();

        Assert.Equal(1, p.RequisicoesPendentes);
        Assert.Equal(1, p.RequisicoesVencidas);
    }

    [Fact]
    public async Task The_dashboard_flags_a_missing_encarregado()
    {
        // Art. 41 §1 is a publication obligation, so an unset DPO is a live breach rather
        // than a configuration nicety.
        var svc = Build(new LgpdOptions());
        Assert.True((await svc.Painel()).EncarregadoAusente);

        Assert.False((await Build().Painel()).EncarregadoAusente);
    }

    [Fact]
    public async Task A_session_that_changed_its_mind_is_counted_once()
    {
        var svc = Build();
        await svc.RegistrarConsentimento(C("s1", "marketing", true));
        await svc.RegistrarConsentimento(C("s1", "marketing", false));
        await svc.RegistrarConsentimento(C("s2", "marketing", true));

        var p = await svc.Painel();

        Assert.Equal(2, p.Sessoes);
        Assert.Equal(1, p.ConsentimentosConcedidos);
        Assert.Equal(1, p.ConsentimentosRecusados);
        Assert.Equal(3, p.RegistrosMantidos);
    }

    [Fact]
    public async Task Old_consent_records_can_be_purged()
    {
        var svc = Build();
        await svc.RegistrarConsentimento(C("s1", "marketing", true));

        Assert.Equal(0, await svc.PurgarConsentimentos(DateTime.UtcNow.AddDays(-1)));
        Assert.Equal(1, await svc.PurgarConsentimentos(DateTime.UtcNow.AddDays(1)));
    }
}
