namespace SplatDev.Umbraco.Plugins.Lgpd.Models;

/// <summary>
/// The legal bases for processing personal data under LGPD art. 7.
/// </summary>
/// <remarks>
/// Ten, where the GDPR has six. The extras are not cosmetic: <see cref="ProtecaoCredito"/>
/// and <see cref="PoliticasPublicas"/> have no GDPR equivalent, and Brazilian controllers
/// lean on them heavily. Stored as the Portuguese term because that is what appears in the
/// statute and in an ANPD inspection.
/// </remarks>
public static class BaseLegal
{
    public const string Consentimento = "consentimento";                 // art. 7, I
    public const string ObrigacaoLegal = "obrigacao_legal";              // art. 7, II
    public const string PoliticasPublicas = "politicas_publicas";        // art. 7, III
    public const string EstudoPesquisa = "estudo_pesquisa";              // art. 7, IV
    public const string ExecucaoContrato = "execucao_contrato";          // art. 7, V
    public const string ExercicioDireitos = "exercicio_direitos";        // art. 7, VI
    public const string ProtecaoVida = "protecao_vida";                  // art. 7, VII
    public const string TutelaSaude = "tutela_saude";                    // art. 7, VIII
    public const string LegitimoInteresse = "legitimo_interesse";        // art. 7, IX
    public const string ProtecaoCredito = "protecao_credito";            // art. 7, X

    public static readonly string[] All =
    [
        Consentimento, ObrigacaoLegal, PoliticasPublicas, EstudoPesquisa, ExecucaoContrato,
        ExercicioDireitos, ProtecaoVida, TutelaSaude, LegitimoInteresse, ProtecaoCredito,
    ];

    /// <summary>
    /// Bases a data subject can revoke.
    /// </summary>
    /// <remarks>
    /// Only consent is revocable (art. 8 §5). Offering revocation against a legal
    /// obligation would promise something the controller cannot honour, so the UI has to
    /// know the difference rather than showing one button for everything.
    /// </remarks>
    public static bool IsRevogavel(string baseLegal) => baseLegal == Consentimento;
}

/// <summary>
/// The data subject rights of LGPD art. 18.
/// </summary>
/// <remarks>
/// Nine, and more granular than the GDPR's. Notably art. 18 IV separates anonymisation,
/// blocking and deletion — three different outcomes the GDPR bundles into erasure — and
/// art. 18 VII is a right to know who the data was shared with, which has no direct GDPR
/// counterpart as a standalone right.
/// </remarks>
public static class DireitoTitular
{
    public const string Confirmacao = "confirmacao";           // art. 18, I
    public const string Acesso = "acesso";                     // art. 18, II
    public const string Correcao = "correcao";                 // art. 18, III
    public const string AnonimizacaoBloqueioEliminacao = "anonimizacao_bloqueio_eliminacao"; // IV
    public const string Portabilidade = "portabilidade";       // art. 18, V
    public const string EliminacaoConsentimento = "eliminacao_consentimento"; // art. 18, VI
    public const string InformacaoCompartilhamento = "informacao_compartilhamento"; // VII
    public const string InformacaoNaoConsentir = "informacao_nao_consentir"; // art. 18, VIII
    public const string Revogacao = "revogacao";               // art. 18, IX

    public static readonly string[] All =
    [
        Confirmacao, Acesso, Correcao, AnonimizacaoBloqueioEliminacao, Portabilidade,
        EliminacaoConsentimento, InformacaoCompartilhamento, InformacaoNaoConsentir, Revogacao,
    ];
}

public static class StatusRequisicao
{
    public const string Pendente = "pendente";
    public const string EmAndamento = "em_andamento";
    public const string Concluida = "concluida";
    public const string Recusada = "recusada";

    public static readonly string[] All = [Pendente, EmAndamento, Concluida, Recusada];
}
