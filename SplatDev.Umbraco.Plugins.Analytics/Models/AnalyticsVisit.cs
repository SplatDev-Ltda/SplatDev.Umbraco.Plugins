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
    /// The visitor's address. Stored whole by default, matching the v8 plugin; set
    /// <c>StoreFullIpAddress</c> to false to keep only the network part.
    /// </summary>
    [Required, MaxLength(45)]
    public string IpAddress { get; set; } = string.Empty;

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
