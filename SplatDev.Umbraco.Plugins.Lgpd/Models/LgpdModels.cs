using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Lgpd.Models;

/// <summary>
/// One consent decision. Append-only.
/// </summary>
/// <remarks>
/// Art. 8 §1 puts the burden of proving consent on the controller, so a row is never
/// updated in place: the current decision is the newest row for a session, and the older
/// rows are the proof. Overwriting would leave a withdrawal looking identical to a visitor
/// who never consented at all.
/// </remarks>
[Table("Consentimentos", Schema = "lgpd")]
public class Consentimento
{
    [Key]
    public int Id { get; set; }

    /// <summary>Anonymous visitor session, or a member key once they sign in.</summary>
    [Required, MaxLength(200)]
    public string SessionId { get; set; } = string.Empty;

    /// <summary>Optional, once known. Lets a subject request cover the same person.</summary>
    [MaxLength(320)]
    public string? Email { get; set; }

    /// <summary>The purpose consented to — art. 9 requires it be specific.</summary>
    [Required, MaxLength(120)]
    public string Finalidade { get; set; } = string.Empty;

    public bool Concedido { get; set; }

    /// <summary>
    /// Whether this covers sensitive personal data (art. 5 II).
    /// </summary>
    /// <remarks>
    /// Art. 11 requires consent for sensitive data to be given "de forma específica e
    /// destacada" — specifically and prominently — so it cannot be bundled into a blanket
    /// accept. Recording the flag is what lets the dashboard show whether that was honoured.
    /// </remarks>
    public bool DadoSensivel { get; set; }

    /// <summary>
    /// Set when the subject is a child or adolescent (art. 14).
    /// </summary>
    /// <remarks>
    /// Art. 14 §1 requires consent from at least one parent or guardian, and the controller
    /// must keep public information about the kinds of data collected. A consent captured
    /// for a minor without this is not valid consent.
    /// </remarks>
    public bool Menor { get; set; }

    [MaxLength(320)]
    public string? ResponsavelEmail { get; set; }

    /// <summary>The exact wording shown, so what was agreed to is reconstructable.</summary>
    [MaxLength(2000)]
    public string? TextoApresentado { get; set; }

    public DateTime DataHora { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string? EnderecoIp { get; set; }

    [MaxLength(400)]
    public string? UserAgent { get; set; }
}

/// <summary>A data subject request under art. 18.</summary>
[Table("Requisicoes", Schema = "lgpd")]
public class Requisicao
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Nome { get; set; }

    /// <summary>One of <see cref="DireitoTitular"/>.</summary>
    [Required, MaxLength(60)]
    public string Direito { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Detalhe { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = StatusRequisicao.Pendente;

    public DateTime RecebidaEm { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When a full response is due.
    /// </summary>
    /// <remarks>
    /// Art. 19 II gives fifteen days for a complete response — half the GDPR's month, and
    /// the single most common way a Brazilian controller falls out of compliance without
    /// noticing. Stored rather than computed so the clock survives a change to the setting.
    /// </remarks>
    public DateTime PrazoEm { get; set; }

    public DateTime? RespondidaEm { get; set; }

    /// <summary>Required when refusing — art. 18 §4 obliges the controller to give reasons.</summary>
    [MaxLength(2000)]
    public string? Justificativa { get; set; }
}

/// <summary>
/// An entry in the record of processing operations (art. 37).
/// </summary>
/// <remarks>
/// The LGPD equivalent of a ROPA. Every controller must keep one, and it is the first
/// thing the ANPD asks for; without it the rest of the compliance story has nothing to
/// hang on.
/// </remarks>
[Table("Operacoes", Schema = "lgpd")]
public class OperacaoTratamento
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string Finalidade { get; set; } = string.Empty;

    /// <summary>One of <see cref="BaseLegal"/>.</summary>
    [Required, MaxLength(60)]
    public string BaseLegal { get; set; } = string.Empty;

    /// <summary>Categories of data, e.g. "nome, e-mail, CPF".</summary>
    [MaxLength(1000)]
    public string? CategoriasDados { get; set; }

    public bool ContemDadoSensivel { get; set; }

    /// <summary>Who it is shared with — the answer to an art. 18 VII request.</summary>
    [MaxLength(1000)]
    public string? Compartilhamento { get; set; }

    /// <summary>Retention period, in plain words.</summary>
    [MaxLength(200)]
    public string? Retencao { get; set; }

    public bool Ativa { get; set; } = true;

    public DateTime AtualizadaEm { get; set; } = DateTime.UtcNow;
}
