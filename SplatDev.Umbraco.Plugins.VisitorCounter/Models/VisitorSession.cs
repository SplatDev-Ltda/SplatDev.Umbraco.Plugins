using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.VisitorCounter.Models;

[Table("VisitorCounter_Session")]
public class VisitorSession
{
    [Key]
    public int Id { get; set; }

    /// <summary>Cookie-based session identifier (or hashed IP fallback).</summary>
    [Required]
    [MaxLength(128)]
    public string SessionId { get; set; } = string.Empty;

    public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;

    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

    /// <summary>Number of pages visited in this session.</summary>
    public int PageCount { get; set; } = 1;

    /// <summary>True if this is the session's first ever visit to the site.</summary>
    public bool IsUnique { get; set; }
}
