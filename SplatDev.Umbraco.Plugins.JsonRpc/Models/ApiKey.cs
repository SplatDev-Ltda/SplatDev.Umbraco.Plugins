using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.JsonRpc.Models;

[Table("ApiKeys", Schema = "jsonrpc")]
public class ApiKey
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>SHA-256 hash of the raw API key value.</summary>
    [Required]
    [MaxLength(128)]
    public string KeyHash { get; set; } = string.Empty;

    /// <summary>Comma-separated list of allowed method prefixes, e.g. "content.*" or "content.get,content.search".</summary>
    [MaxLength(500)]
    public string Permissions { get; set; } = "*";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastUsedAt { get; set; }
}
