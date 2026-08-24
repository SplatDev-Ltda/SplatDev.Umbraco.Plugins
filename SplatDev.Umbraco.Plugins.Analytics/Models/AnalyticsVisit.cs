using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Analytics.Models;

/// <summary>
/// One visit to one content node.
/// </summary>
/// <remarks>
/// The v8 plugin stored this in <c>SimpleAnalyticsVisits</c> through NPoco attributes.
/// This is the same information against an EF model and a table named for the package, so
/// the schema comes from the same place the queries do — Umbraco's Create.Table&lt;T&gt;
/// names a table after the entity while EF names it from [Table], and when those two
/// disagree the migration succeeds and leaves every read hitting something that does not
/// exist.
/// </remarks>
[Table("SplatDevAnalyticsVisits")]
public class AnalyticsVisit
{
    public int Id { get; set; }

    /// <summary>
    /// A stable, non-reversible id for the visitor: SHA-256 over the address, the user
    /// agent and a per-site salt, truncated. Unique and returning-visitor counts are based
    /// on this rather than on the address.
    /// </summary>
    /// <remarks>
    /// Hashing is what lets the plugin recognise a returning visitor without keeping
    /// anything that identifies one. The salt matters: without it, an address range is
    /// small enough to hash exhaustively and reverse.
    /// </remarks>
    [Required, MaxLength(64)]
    public string VisitorId { get; set; } = string.Empty;

    /// <summary>
    /// The visitor's address, stored only when the site asks for it. Empty by default —
    /// <see cref="VisitorId"/> covers what the dashboard needs, and a full address is
    /// personal data in most jurisdictions.
    /// </summary>
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    /// <summary>Where the visitor arrived from, when the browser says.</summary>
    [MaxLength(1024)]
    public string? Referrer { get; set; }

    /// <summary>Browser family from the user agent, e.g. Chrome.</summary>
    [MaxLength(64)]
    public string? Browser { get; set; }

    /// <summary>Operating system from the user agent, e.g. Windows.</summary>
    [MaxLength(64)]
    public string? OperatingSystem { get; set; }

    /// <summary>Desktop, Mobile or Tablet, from the user agent.</summary>
    [MaxLength(16)]
    public string? Device { get; set; }

    /// <summary>The Umbraco content node visited, or 0 for a page outside the tree.</summary>
    public int ContentNodeId { get; set; }

    [MaxLength(2048)]
    public string? EntryUrl { get; set; }

    [MaxLength(2048)]
    public string? ExitUrl { get; set; }

    /// <summary>What the browser reported about itself, as JSON.</summary>
    public string? BrowserInfo { get; set; }

    [MaxLength(256)]
    public string? UserAgent { get; set; }

    [MaxLength(32)]
    public string? Resolution { get; set; }

    public DateTime VisitStarted { get; set; } = DateTime.UtcNow;

    public DateTime? VisitFinished { get; set; }

    /// <summary>True when this address has seen this node before.</summary>
    public bool RecurringVisit { get; set; }

    /// <summary>
    /// Set when a request looks automated. Kept rather than discarded so the dashboard can
    /// exclude it and still show what was filtered — analytics that silently drops traffic
    /// is analytics nobody can check.
    /// </summary>
    public bool IsBot { get; set; }

    // Geo, populated only when a lookup is configured.
    [MaxLength(64)] public string? Country { get; set; }
    [MaxLength(8)]  public string? CountryCode { get; set; }
    [MaxLength(128)] public string? Region { get; set; }
    [MaxLength(128)] public string? City { get; set; }
}
