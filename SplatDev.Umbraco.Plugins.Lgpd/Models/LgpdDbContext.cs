using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Lgpd.Models;

public class LgpdDbContext : DbContext
{
    public LgpdDbContext(DbContextOptions<LgpdDbContext> options) : base(options) { }

    public DbSet<Consentimento> Consentimentos => Set<Consentimento>();
    public DbSet<Requisicao> Requisicoes => Set<Requisicao>();
    public DbSet<OperacaoTratamento> Operacoes => Set<OperacaoTratamento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("lgpd");

        modelBuilder.Entity<Consentimento>(e =>
        {
            // Consent is queried by session (to find the current decision) and by email
            // (to answer a subject request that arrives by email rather than by session).
            e.HasIndex(c => new { c.SessionId, c.DataHora });
            e.HasIndex(c => c.Email);
        });

        modelBuilder.Entity<Requisicao>(e =>
        {
            // The dashboard leads with what is overdue, so the deadline is indexed with
            // the status rather than scanned.
            e.HasIndex(r => new { r.Status, r.PrazoEm });
            e.HasIndex(r => r.Email);
        });

        modelBuilder.Entity<OperacaoTratamento>(e => e.HasIndex(o => o.Ativa));
    }
}

/// <summary>
/// Configuration for the plugin, bound from the <c>Lgpd</c> section.
/// </summary>
public class LgpdOptions
{
    /// <summary>
    /// The <em>encarregado</em> (DPO) — art. 41.
    /// </summary>
    /// <remarks>
    /// Art. 41 §1 requires the controller to publish the encarregado's identity and contact
    /// details. That is a publication obligation, not an internal note, which is why the
    /// front-end component renders it and warns when it is unset.
    /// </remarks>
    public string EncarregadoNome { get; set; } = string.Empty;

    public string EncarregadoEmail { get; set; } = string.Empty;

    public string? EncarregadoTelefone { get; set; }

    /// <summary>Days allowed for a full response. Art. 19 II says fifteen.</summary>
    public int PrazoRespostaDias { get; set; } = 15;

    /// <summary>How long consent records are kept before they may be purged.</summary>
    public int RetencaoConsentimentoDias { get; set; } = 1825;
}
